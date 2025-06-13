
'use server';
import dbConnect from '@/lib/dbConnect';
import ServiceInquiryModel, { type IServiceInquiry } from '@/models/ServiceInquiryModel';
import type { ServiceInquiry, CreateServiceInquiryData, ServiceInquiryStatus } from '@/types';
import ServiceModel from '@/models/ServiceModel'; // For validating serviceId

function docToServiceInquiry(doc: IServiceInquiry | any): ServiceInquiry {
  if (!doc) {
    console.error("[Service:ServiceInquiry] docToServiceInquiry received a null or undefined document.");
    throw new Error('Internal server error: Service inquiry document is invalid.');
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:ServiceInquiry] docToServiceInquiry: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process service inquiry data.');
  }
  
  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-inquiry-id'),
    serviceId: plainDoc.serviceId ? plainDoc.serviceId.toString() : '',
    serviceName: plainDoc.serviceName,
    name: plainDoc.name,
    email: plainDoc.email,
    phone: plainDoc.phone || "",
    message: plainDoc.message,
    status: plainDoc.status as ServiceInquiryStatus,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function submitServiceInquiry(data: CreateServiceInquiryData): Promise<ServiceInquiry> {
  try {
    await dbConnect();
    const serviceExists = await ServiceModel.findById(data.serviceId).lean();
    if (!serviceExists) {
      throw new Error(`Service with ID ${data.serviceId} not found. Cannot submit inquiry.`);
    }

    const newInquiry = new ServiceInquiryModel({
      ...data,
      status: 'New',
    });
    const savedInquiry = await newInquiry.save();
    return docToServiceInquiry(savedInquiry);
  } catch (error: any) {
    console.error('[Service:ServiceInquiry] Error in submitServiceInquiry:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to submit service inquiry. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getServiceInquiries(): Promise<ServiceInquiry[]> {
  try {
    await dbConnect();
    const inquiries = await ServiceInquiryModel.find({}).sort({ createdAt: -1 }).lean();
    return inquiries.map(docToServiceInquiry);
  } catch (error: any) {
    console.error('[Service:ServiceInquiry] Error in getServiceInquiries:', error);
    throw new Error(`Failed to fetch service inquiries. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function countNewServiceInquiries(): Promise<number> {
  try {
    await dbConnect();
    const count = await ServiceInquiryModel.countDocuments({ status: 'New' });
    return count;
  } catch (error: any) {
    console.error('[Service:ServiceInquiry] Error in countNewServiceInquiries:', error);
    throw new Error(`Failed to count new service inquiries. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateServiceInquiryStatus(id: string, status: ServiceInquiryStatus): Promise<ServiceInquiry | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format for updating inquiry status.');
    }
    const updatedInquiry = await ServiceInquiryModel.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!updatedInquiry) {
      console.warn(`[Service:ServiceInquiry] Inquiry with ID ${id} not found for status update.`);
      throw new Error(`Inquiry with ID ${id} not found for status update.`);
    }
    return docToServiceInquiry(updatedInquiry);
  } catch (error: any) {
    console.error(`[Service:ServiceInquiry] Error in updateServiceInquiryStatus for ID ${id}:`, error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update inquiry status. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteServiceInquiry(id: string): Promise<{ success: boolean, message?: string, error?: string }> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return { success: false, error: 'Invalid ID format for deleting service inquiry.' };
    }
    const result = await ServiceInquiryModel.findByIdAndDelete(id);
     if (!result) {
        console.warn(`[Service:ServiceInquiry] Service inquiry with ID ${id} not found for deletion.`);
        return { success: false, error: `Service inquiry with ID ${id} not found for deletion.` };
    }
    return { success: true, message: "Service inquiry deleted successfully."};
  } catch (error: any) {
    console.error(`[Service:ServiceInquiry] Error in deleteServiceInquiry for ID ${id}:`, error);
    throw new Error(`Failed to delete service inquiry. Original: ${error.message}. Check server logs for details.`);
  }
}
