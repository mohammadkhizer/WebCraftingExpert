
'use server';
import dbConnect from '@/lib/dbConnect';
import SiteKeyStatsModel, { type ISiteKeyStats } from '@/models/SiteKeyStatsModel';
import type { SiteKeyStats, UpdateSiteKeyStatsData, KeyStatsData } from '@/types';

const DEFAULT_KEY_STATS_DATA: UpdateSiteKeyStatsData = {
  satisfiedClients: "50+",
  projectsCompleted: "100+", // Changed default to 100+
  yearsOfExperience: "5+",    // Changed default to 5+
};

function docToSiteKeyStats(doc: ISiteKeyStats | any): SiteKeyStats {
  if (!doc) {
    console.warn('[Service:SiteKeyStats] docToSiteKeyStats received null or undefined doc. Returning default structure.');
    // If doc is null (e.g., no document found and upsert hasn't run yet),
    // we construct a default-like structure but without a real ID from DB.
    return { 
      ...DEFAULT_KEY_STATS_DATA, 
      id: 'default-fallback-id', 
      // createdAt and updatedAt would be undefined here as it's not from DB.
    };
  }
  const plainDoc = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object' || !plainDoc._id) {
    console.error('[Service:SiteKeyStats] docToSiteKeyStats: plainDoc is not a valid object or missing _id after toObject/spread.', plainDoc);
    // Fallback for critical error during processing an otherwise non-null doc
    throw new Error('Internal server error: Failed to process key stats data.');
  }
  
  return {
    id: plainDoc._id.toString(),
    satisfiedClients: plainDoc.satisfiedClients || DEFAULT_KEY_STATS_DATA.satisfiedClients,
    projectsCompleted: plainDoc.projectsCompleted || DEFAULT_KEY_STATS_DATA.projectsCompleted,
    yearsOfExperience: plainDoc.yearsOfExperience || DEFAULT_KEY_STATS_DATA.yearsOfExperience,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getKeyStats(): Promise<SiteKeyStats> {
  try {
    await dbConnect();
    let statsDoc = await SiteKeyStatsModel.findOne({}).lean();
    if (!statsDoc) {
      console.log('[Service:SiteKeyStats] No key stats found, attempting to create and return default stats.');
      // Attempt to create the default document if none exists.
      // Note: This is an upsert-like behavior if the collection is empty on first call.
      // If you want to strictly return null/default without DB write on get, this needs adjustment.
      const newStats = new SiteKeyStatsModel(DEFAULT_KEY_STATS_DATA);
      const savedStats = await newStats.save();
      statsDoc = savedStats.toObject({ virtuals: true, getters: true }); // Convert saved doc to plain object
    }
    return docToSiteKeyStats(statsDoc);
  } catch (error: any) {
    console.error('[Service:SiteKeyStats] Error in getKeyStats:', error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to fetch key stats. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateKeyStats(data: UpdateSiteKeyStatsData): Promise<SiteKeyStats> {
  try {
    await dbConnect();
    const updateData = { ...data }; 
    const updatedStatsDoc = await SiteKeyStatsModel.findOneAndUpdate({}, updateData, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    
    if (!updatedStatsDoc) {
      console.error('[Service:SiteKeyStats] Failed to update or create Key Stats document during update.');
      // This case should ideally be covered by upsert: true, but as a fallback:
      throw new Error('Database operation failed: No document was updated or created for Key Stats.');
    }
    return docToSiteKeyStats(updatedStatsDoc);
  } catch (error: any) {
    console.error('[Service:SiteKeyStats] Error in updateKeyStats:', error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update key stats. Original: ${error.message}. Check server logs for details.`);
  }
}
