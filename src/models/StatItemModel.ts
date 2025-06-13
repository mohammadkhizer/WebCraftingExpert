
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { StatItem as StatItemType } from '@/types';

export interface IStatItem extends Omit<StatItemType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const StatItemSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true }, // e.g., "50+", "99%"
  iconName: { type: String, trim: true }, // Optional Lucide icon name
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

const StatItemModel = (models.StatItem as Model<IStatItem>) || mongoose.model<IStatItem>('StatItem', StatItemSchema);

export default StatItemModel;
