
'use server';
import dbConnect from '@/lib/dbConnect';
import ServiceModel, { type IService } from '@/models/ServiceModel';
import type { Service, CreateServiceData } from '@/types';

function docToService(doc: IService | any): Service {
  if (!doc) {
    console.error("[Service:Service] docToService received a null or undefined document.");
    throw new Error('Internal server error: Service document is invalid.');
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:Service] docToService: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process service data.');
  }
  
  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-service-id'),
    title: plainDoc.title || 'Untitled Service',
    description: plainDoc.description || 'No description available.',
    longDescription: plainDoc.longDescription || '',
    iconName: plainDoc.iconName || 'Code', // Default icon
    features: Array.isArray(plainDoc.features) ? plainDoc.features.map(String) : [],
    process: Array.isArray(plainDoc.process) ? plainDoc.process.map((p: any) => ({ step: p.step || '', description: p.description || '' })) : [],
    status: plainDoc.status || "Draft",
    lastUpdated: plainDoc.lastUpdated ? new Date(plainDoc.lastUpdated).toISOString() : undefined, // Ensure this is populated
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getServices(): Promise<Service[]> {
  try {
    await dbConnect();
    const servicesDocs = await ServiceModel.find({}).sort({ createdAt: -1 }).lean();
    return servicesDocs.map(docToService);
  } catch (error: any) {
    console.error('[Service:Service] Error in getServices:', error);
    throw new Error(`Failed to fetch services. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getServiceById(id: string): Promise<Service | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn(`[Service:Service] Invalid service ID format for getServiceById: ${id}`);
      return null;
    }
    const serviceDoc = await ServiceModel.findById(id).lean();
    if (!serviceDoc) return null;
    return docToService(serviceDoc);
  } catch (error: any) {
    console.error(`[Service:Service] Error in getServiceById for ID ${id}:`, error);
    throw new Error(`Failed to fetch service by ID. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function addService(serviceData: CreateServiceData): Promise<Service> {
  try {
    await dbConnect();
    const newServiceDoc = new ServiceModel({
      ...serviceData,
      iconName: serviceData.iconName || 'Code',
      lastUpdated: new Date(), // Set lastUpdated on creation
    });
    const savedService = await newServiceDoc.save();
    return docToService(savedService);
  } catch (error: any) {
    console.error('[Service:Service] Error in addService:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to add service. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateService(id: string, updates: Partial<CreateServiceData>): Promise<Service | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format for updating service.');
    }
    // Mongoose 'timestamps: true' handles updatedAt, and pre-save hook handles lastUpdated
    const updatedServiceDoc = await ServiceModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updatedServiceDoc) {
        console.warn(`[Service:Service] Service with ID ${id} not found for update.`);
        throw new Error(`Service with ID ${id} not found for update.`);
    }
    return docToService(updatedServiceDoc);
  } catch (error: any) {
    console.error(`[Service:Service] Error in updateService for ID ${id}:`, error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update service. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteService(id: string): Promise<{ success: boolean, message?: string, error?: string }> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return { success: false, error: 'Invalid ID format for deleting service.' };
    }
    const result = await ServiceModel.findByIdAndDelete(id);
    if (!result) {
        console.warn(`[Service:Service] Service with ID ${id} not found for deletion.`);
        return { success: false, error: `Service with ID ${id} not found for deletion.` };
    }
    return { success: true, message: "Service deleted successfully."};
  } catch (error: any) {
    console.error(`[Service:Service] Error in deleteService for ID ${id}:`, error);
    throw new Error(`Failed to delete service. Original: ${error.message}. Check server logs for details.`);
  }
}
