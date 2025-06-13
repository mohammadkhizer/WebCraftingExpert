
'use server';
import dbConnect from '@/lib/dbConnect';
import StatItemModel, { type IStatItem } from '@/models/StatItemModel';
import type { StatItem, CreateStatItemData } from '@/types';

function docToStatItem(doc: IStatItem | any): StatItem {
  if (!doc) {
    console.error("[Service:StatItem] docToStatItem received a null or undefined document.");
    throw new Error('Internal server error: Stat item document is invalid.');
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:StatItem] docToStatItem: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process stat item data.');
  }
  
  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-statitem-id'),
    title: plainDoc.title,
    value: plainDoc.value,
    iconName: plainDoc.iconName || undefined,
    sortOrder: plainDoc.sortOrder || 0,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getStatItems(): Promise<StatItem[]> {
  try {
    await dbConnect();
    const statDocs = await StatItemModel.find({}).sort({ sortOrder: 1, createdAt: 1 }).lean();
    return statDocs.map(docToStatItem);
  } catch (error: any) {
    console.error('[Service:StatItem] Error in getStatItems:', error);
    throw new Error(`Failed to fetch stat items. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getStatItemById(id: string): Promise<StatItem | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn(`[Service:StatItem] Invalid stat item ID format for getStatItemById: ${id}`);
      return null;
    }
    const statDoc = await StatItemModel.findById(id).lean();
    if (!statDoc) return null;
    return docToStatItem(statDoc);
  } catch (error: any) {
    console.error(`[Service:StatItem] Error in getStatItemById for ID ${id}:`, error);
    throw new Error(`Failed to fetch stat item by ID. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function addStatItem(data: CreateStatItemData): Promise<StatItem> {
  try {
    await dbConnect();
    const newStatDoc = new StatItemModel(data);
    const savedStat = await newStatDoc.save();
    return docToStatItem(savedStat);
  } catch (error: any) {
    console.error('[Service:StatItem] Error in addStatItem:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to add stat item. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateStatItem(id: string, updates: Partial<CreateStatItemData>): Promise<StatItem | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format for updating stat item.');
    }
    // updatedAt handled by Mongoose timestamps
    const updatedStatDoc = await StatItemModel.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updatedStatDoc) {
        console.warn(`[Service:StatItem] Stat item with ID ${id} not found for update.`);
        throw new Error(`Stat item with ID ${id} not found for update.`);
    }
    return docToStatItem(updatedStatDoc);
  } catch (error: any) {
    console.error(`[Service:StatItem] Error in updateStatItem for ID ${id}:`, error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update stat item. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteStatItem(id: string): Promise<{ success: boolean, message?: string, error?: string }> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return { success: false, error: 'Invalid ID format for deleting stat item.' };
    }
    const result = await StatItemModel.findByIdAndDelete(id);
    if (!result) {
        console.warn(`[Service:StatItem] Stat item with ID ${id} not found for deletion.`);
        return { success: false, error: `Stat item with ID ${id} not found for deletion.` };
    }
    return { success: true, message: "Stat item deleted successfully."};
  } catch (error: any) {
    console.error(`[Service:StatItem] Error in deleteStatItem for ID ${id}:`, error);
    throw new Error(`Failed to delete stat item. Original: ${error.message}. Check server logs for details.`);
  }
}
