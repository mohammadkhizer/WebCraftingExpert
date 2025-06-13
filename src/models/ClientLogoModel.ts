
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { ClientLogo as ClientLogoType } from '@/types';

export interface IClientLogo extends Omit<ClientLogoType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ClientLogoSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  logoUrl: { type: String, required: true, trim: true },
  websiteUrl: { type: String, required: true, trim: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

ClientLogoSchema.index({ sortOrder: 1, createdAt: 1 });

const ClientLogoModel = (models.ClientLogo as Model<IClientLogo>) || mongoose.model<IClientLogo>('ClientLogo', ClientLogoSchema);

export default ClientLogoModel;
