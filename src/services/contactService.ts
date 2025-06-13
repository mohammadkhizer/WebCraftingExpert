
'use server';
import dbConnect from '@/lib/dbConnect';
import ContactMessageModel, { type IContactMessage } from '@/models/ContactMessageModel';
import ContactInfoModel, { type IContactInfo } from '@/models/ContactInfoModel';
import type { ContactMessage, ContactInfo, NewContactMessageData } from '@/types';

const DEFAULT_CONTACT_INFO_DATA: Omit<ContactInfo, 'id' | 'createdAt' | 'updatedAt'> = {
  email: 'info@bytebrusters.com',
  phone: '+1 (234) 567-8900',
  address: '123 Tech Avenue, Silicon Valley, CA 94000, USA',
};

function docToContactMessage(doc: IContactMessage | any): ContactMessage {
  if (!doc) {
    console.error("[Service:Contact] docToContactMessage received a null or undefined document.");
    throw new Error('Internal server error: Contact message document is invalid.');
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:Contact] docToContactMessage: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process contact message data.');
  }
  
  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-message-id'),
    name: plainDoc.name,
    email: plainDoc.email,
    subject: plainDoc.subject,
    messageBody: plainDoc.messageBody,
    date: new Date(plainDoc.date).toISOString(),
    status: plainDoc.status,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

function docToContactInfo(doc: IContactInfo | any): ContactInfo {
  if (!doc) {
     console.warn('[Service:Contact] docToContactInfo received null or undefined doc. Returning default structure.');
    return { ...DEFAULT_CONTACT_INFO_DATA, id: 'default-contactinfo-id' };
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:Contact] docToContactInfo: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process contact info data.');
  }

  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-contactinfo-id'),
    email: plainDoc.email || DEFAULT_CONTACT_INFO_DATA.email,
    phone: plainDoc.phone || DEFAULT_CONTACT_INFO_DATA.phone,
    address: plainDoc.address || DEFAULT_CONTACT_INFO_DATA.address,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    await dbConnect();
    const messagesDocs = await ContactMessageModel.find({}).sort({ date: -1 }).lean();
    return messagesDocs.map(docToContactMessage);
  } catch (error: any) {
    console.error('[Service:Contact] Error in getContactMessages:', error);
    throw new Error(`Failed to fetch contact messages. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateMessageStatus(id: string, status: ContactMessage['status']): Promise<ContactMessage> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid ID format for updating message status.');
    }
    // Use findByIdAndUpdate to ensure updatedAt is handled by Mongoose timestamps
    const updatedMessageDoc = await ContactMessageModel.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!updatedMessageDoc) {
      throw new Error(`Contact message with ID ${id} not found for status update.`);
    }
    return docToContactMessage(updatedMessageDoc);
  } catch (error: any) {
    console.error(`[Service:Contact] Error in updateMessageStatus for ID ${id}:`, error);
     if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update message status. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteContactMessage(id: string): Promise<{ success: boolean, message?: string, error?: string }> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return { success: false, error: 'Invalid ID format for deleting contact message.' };
    }
    const result = await ContactMessageModel.findByIdAndDelete(id);
    if (!result) {
        console.warn(`[Service:Contact] Contact message with ID ${id} not found for deletion.`);
        return { success: false, error: `Message with ID ${id} not found for deletion.` };
    }
    return { success: true, message: 'Message deleted successfully.' };
  } catch (error: any) {
    console.error(`[Service:Contact] Error in deleteContactMessage for ID ${id}:`, error);
    throw new Error(`Failed to delete contact message. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteManyContactMessages(ids: string[]): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  if (!ids || ids.length === 0) {
    return { success: false, deletedCount: 0, error: "No message IDs provided for deletion." };
  }
  try {
    await dbConnect();
    for (const id of ids) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error(`Invalid contact message ID format in batch delete: ${id}.`);
      }
    }
    const result = await ContactMessageModel.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0 && ids.length > 0) {
        console.warn('[Service:Contact] deleteManyContactMessages: No messages found matching the provided IDs for deletion.');
    }
    return { success: true, deletedCount: result.deletedCount || 0 };
  } catch (error: any) {
    console.error('[Service:Contact] Error in deleteManyContactMessages:', error);
    throw new Error(`Failed to delete messages. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function submitContactFormMessage(data: NewContactMessageData): Promise<ContactMessage> {
  try {
    await dbConnect();
    const newMessageDoc = new ContactMessageModel({
      ...data,
      date: new Date(), // Ensure date is set on server
      status: 'New',
    });
    const savedMessage = await newMessageDoc.save();
    return docToContactMessage(savedMessage);
  } catch (error: any) {
    console.error('[Service:Contact] Error in submitContactFormMessage:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to submit contact message. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getContactInfo(): Promise<ContactInfo> {
  try {
    await dbConnect();
    let infoDoc = await ContactInfoModel.findOne({}).lean();
    if (!infoDoc) {
      console.log('[Service:Contact] No contact info found, creating and returning default contact info.');
      const newInfo = new ContactInfoModel(DEFAULT_CONTACT_INFO_DATA);
      infoDoc = await newInfo.save();
      infoDoc = infoDoc.toObject({ virtuals: true, getters: true });
    }
    return docToContactInfo(infoDoc);
  } catch (error: any) {
    console.error('[Service:Contact] Error in getContactInfo:', error);
    throw new Error(`Failed to fetch contact info. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateContactInfo(newInfo: Partial<Omit<ContactInfo, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ContactInfo> {
  try {
    await dbConnect();
    const updateData = { ...newInfo }; // updatedAt handled by Mongoose
    const updatedInfoDoc = await ContactInfoModel.findOneAndUpdate({}, updateData, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    if (!updatedInfoDoc) {
      console.error('[Service:Contact] Failed to update or create Contact Info document during update.');
      throw new Error('Database operation failed: No document was updated or created for Contact Info.');
    }
    return docToContactInfo(updatedInfoDoc);
  } catch (error: any) {
    console.error('[Service:Contact] Error in updateContactInfo:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update contact info. Original: ${error.message}. Check server logs for details.`);
  }
}
