
'use server';
import dbConnect from '@/lib/dbConnect';
import FooterLinkModel, { type IFooterLink } from '@/models/FooterLinkModel';
import type { FooterLink, CreateFooterLinkData, FooterLinkColumn } from '@/types';

function docToFooterLink(doc: IFooterLink | any): FooterLink {
  if (!doc) {
    console.error("[Service:FooterLink] docToFooterLink received a null or undefined document.");
    throw new Error('Internal server error: FooterLink document is invalid.');
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:FooterLink] docToFooterLink: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process FooterLink data.');
  }
  
  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-footerlink-id'),
    label: plainDoc.label,
    href: plainDoc.href,
    column: plainDoc.column,
    order: plainDoc.order || 0,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getAllFooterLinks(): Promise<FooterLink[]> {
  try {
    await dbConnect();
    const linksDocs = await FooterLinkModel.find({}).sort({ column: 1, order: 1, createdAt: 1 }).lean();
    return linksDocs.map(docToFooterLink);
  } catch (error: any) {
    console.error('[Service:FooterLink] Error in getAllFooterLinks:', error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to fetch all footer links. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getFooterLinksByColumn(column: FooterLinkColumn): Promise<FooterLink[]> {
  try {
    await dbConnect();
    const linksDocs = await FooterLinkModel.find({ column }).sort({ order: 1, createdAt: 1 }).lean();
    return linksDocs.map(docToFooterLink);
  } catch (error: any) {
    console.error(`[Service:FooterLink] Error in getFooterLinksByColumn for column ${column}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to fetch footer links for column ${column}. Original: ${error.message}. Check server logs for details.`);
  }
}


export async function getFooterLinkById(id: string): Promise<FooterLink | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn(`[Service:FooterLink] Invalid footer link ID format for getFooterLinkById: ${id}`);
      return null;
    }
    const linkDoc = await FooterLinkModel.findById(id).lean();
    if (!linkDoc) return null;
    return docToFooterLink(linkDoc);
  } catch (error: any) {
    console.error(`[Service:FooterLink] Error in getFooterLinkById for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to fetch footer link by ID. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function addFooterLink(data: CreateFooterLinkData): Promise<FooterLink> {
  try {
    await dbConnect();
    const newLinkDoc = new FooterLinkModel(data);
    const savedLink = await newLinkDoc.save();
    return docToFooterLink(savedLink);
  } catch (error: any) {
    console.error('[Service:FooterLink] Error in addFooterLink:', error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to add footer link. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateFooterLink(id: string, updates: Partial<CreateFooterLinkData>): Promise<FooterLink | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format for updating footer link.');
    }
    const linkDoc = await FooterLinkModel.findById(id);
    if (!linkDoc) {
      throw new Error(`Footer link with ID ${id} not found for update.`);
    }

    Object.assign(linkDoc, updates);
    // Mongoose automatically handles updatedAt due to timestamps: true in schema
    const savedDoc = await linkDoc.save();
    return docToFooterLink(savedDoc);
  } catch (error: any) {
    console.error(`[Service:FooterLink] Error in updateFooterLink for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update footer link. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteFooterLink(id: string): Promise<{ success: boolean }> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format for deleting footer link.');
    }
    const result = await FooterLinkModel.findByIdAndDelete(id);
    if (!result) {
      throw new Error(`Footer link with ID ${id} not found for deletion.`);
    }
    return { success: true };
  } catch (error: any) {
    console.error(`[Service:FooterLink] Error in deleteFooterLink for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to delete footer link. Original: ${error.message}. Check server logs for details.`);
  }
}
