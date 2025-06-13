
'use server';
import dbConnect from '@/lib/dbConnect';
import FAQItemModel, { type IFAQItem } from '@/models/FAQItemModel';
import type { FAQItem, CreateFAQItemData } from '@/types';

function docToFAQItem(doc: IFAQItem | any): FAQItem {
  if (!doc) {
    console.error("[Service:FAQ] docToFAQItem received a null or undefined document.");
    throw new Error('Internal server error: FAQ item document is invalid.');
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:FAQ] docToFAQItem: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process FAQ item data.');
  }
  
  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-faq-id'),
    question: plainDoc.question,
    answer: plainDoc.answer,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getFAQItems(): Promise<FAQItem[]> {
  try {
    await dbConnect();
    const faqDocs = await FAQItemModel.find({}).sort({ createdAt: -1 }).lean();
    return faqDocs.map(docToFAQItem);
  } catch (error: any) {
    console.error('[Service:FAQ] Error in getFAQItems:', error);
    throw new Error(`Failed to fetch FAQ items. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getFAQItemById(id: string): Promise<FAQItem | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn(`[Service:FAQ] Invalid FAQ item ID format for getFAQItemById: ${id}`);
      return null;
    }
    const faqDoc = await FAQItemModel.findById(id).lean();
    if (!faqDoc) return null;
    return docToFAQItem(faqDoc);
  } catch (error: any) {
    console.error(`[Service:FAQ] Error in getFAQItemById for ID ${id}:`, error);
    throw new Error(`Failed to fetch FAQ item by ID. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function addFAQItem(data: CreateFAQItemData): Promise<FAQItem> {
  try {
    await dbConnect();
    const newFAQDoc = new FAQItemModel(data);
    const savedFAQ = await newFAQDoc.save();
    return docToFAQItem(savedFAQ);
  } catch (error: any) {
    console.error('[Service:FAQ] Error in addFAQItem:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to add FAQ item. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateFAQItem(id: string, updates: Partial<CreateFAQItemData>): Promise<FAQItem | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format for updating FAQ item.');
    }

    const faqDoc = await FAQItemModel.findById(id);
    if (!faqDoc) {
      console.warn(`[Service:FAQ] FAQ item with ID ${id} not found for update.`);
      throw new Error(`FAQ item with ID ${id} not found for update.`);
    }

    if (updates.question !== undefined) faqDoc.question = updates.question;
    if (updates.answer !== undefined) faqDoc.answer = updates.answer;
    // Mongoose automatically handles updatedAt due to timestamps: true in schema

    const savedDoc = await faqDoc.save();
    return docToFAQItem(savedDoc);

  } catch (error: any) {
    console.error(`[Service:FAQ] Error in updateFAQItem for ID ${id}:`, error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update FAQ item. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteFAQItem(id: string): Promise<{ success: boolean, message?: string, error?: string }> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
       return { success: false, error: 'Invalid ID format for deleting FAQ item.' };
    }
    const result = await FAQItemModel.findByIdAndDelete(id);
    if (!result) {
        console.warn(`[Service:FAQ] FAQ item with ID ${id} not found for deletion.`);
        return { success: false, error: `FAQ item with ID ${id} not found for deletion.` };
    }
    return { success: true, message: "FAQ item deleted successfully."};
  } catch (error: any) {
    console.error(`[Service:FAQ] Error in deleteFAQItem for ID ${id}:`, error);
    throw new Error(`Failed to delete FAQ item. Original: ${error.message}. Check server logs for details.`);
  }
}
