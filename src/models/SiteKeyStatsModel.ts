
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { SiteKeyStats as SiteKeyStatsType, KeyStatsData } from '@/types'; // Use SiteKeyStatsType alias

// Interface for the document in MongoDB, extending KeyStatsData for fields
export interface ISiteKeyStats extends KeyStatsData, Document {
  createdAt: Date;
  updatedAt: Date;
}

const SiteKeyStatsSchema: Schema = new Schema({
  satisfiedClients: { type: String, required: true, default: '50+' },
  projectsCompleted: { type: String, required: true, default: '100+' },
  yearsOfExperience: { type: String, required: true, default: '5+' },
}, { timestamps: true });

const SiteKeyStatsModel = (models.SiteKeyStats as Model<ISiteKeyStats>) || mongoose.model<ISiteKeyStats>('SiteKeyStats', SiteKeyStatsSchema);

export default SiteKeyStatsModel;
