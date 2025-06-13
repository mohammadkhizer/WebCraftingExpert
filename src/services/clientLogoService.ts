
'use server';
import dbConnect from '@/lib/dbConnect';
import ClientLogoModel, { type IClientLogo } from '@/models/ClientLogoModel';
import type { ClientLogo, CreateClientLogoData } from '@/types';

function docToClientLogo(doc: IClientLogo | any): ClientLogo {
  if (!doc) {
    console.error("[Service:ClientLogo] docToClientLogo received a null or undefined document.");
    throw new Error('Internal server error: ClientLogo document is invalid.');
  }
  const plainDoc = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object' || !plainDoc._id) {
    console.error('[Service:ClientLogo] docToClientLogo: plainDoc is not a valid object or missing _id after toObject/spread.', plainDoc);
    throw new Error('Internal server error: Failed to process ClientLogo data.');
  }
  
  return {
    id: plainDoc._id.toString(),
    name: plainDoc.name,
    logoUrl: plainDoc.logoUrl,
    websiteUrl: plainDoc.websiteUrl,
    sortOrder: plainDoc.sortOrder,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getClientLogos(): Promise<ClientLogo[]> {
  try {
    await dbConnect();
    const logosDocs = await ClientLogoModel.find({}).sort({ sortOrder: 1, createdAt: -1 }).lean();
    return logosDocs.map(docToClientLogo);
  } catch (error: any) {
    console.error('[Service:ClientLogo] Error in getClientLogos:', error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to fetch client logos. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getClientLogoById(id: string): Promise<ClientLogo | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn(`[Service:ClientLogo] Invalid client logo ID format for getClientLogoById: ${id}`);
      return null;
    }
    const logoDoc = await ClientLogoModel.findById(id).lean();
    if (!logoDoc) return null;
    return docToClientLogo(logoDoc);
  } catch (error: any) {
    console.error(`[Service:ClientLogo] Error in getClientLogoById for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to fetch client logo by ID. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function addClientLogo(data: CreateClientLogoData): Promise<ClientLogo> {
  try {
    await dbConnect();
    const newLogoDoc = new ClientLogoModel(data);
    const savedLogo = await newLogoDoc.save();
    return docToClientLogo(savedLogo);
  } catch (error: any)
{
    console.error('[Service:ClientLogo] Error in addClientLogo:', error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to add client logo. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateClientLogo(id: string, updates: Partial<CreateClientLogoData>): Promise<ClientLogo | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format for updating client logo.');
    }
    const logoDoc = await ClientLogoModel.findById(id);
    if (!logoDoc) {
      throw new Error(`Client logo with ID ${id} not found for update.`);
    }

    Object.assign(logoDoc, updates);
    const savedDoc = await logoDoc.save();
    return docToClientLogo(savedDoc);
  } catch (error: any) {
    console.error(`[Service:ClientLogo] Error in updateClientLogo for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update client logo. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteClientLogo(id: string): Promise<{ success: boolean }> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format for deleting client logo.');
    }
    const result = await ClientLogoModel.findByIdAndDelete(id);
    if (!result) {
      throw new Error(`Client logo with ID ${id} not found for deletion.`);
    }
    return { success: true };
  } catch (error: any) {
    console.error(`[Service:ClientLogo] Error in deleteClientLogo for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to delete client logo. Original: ${error.message}. Check server logs for details.`);
  }
}
