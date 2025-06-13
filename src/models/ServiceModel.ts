
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { Service as ServiceType } from '@/types';

export interface IService extends Omit<ServiceType, 'id' | 'icon' | 'lastUpdated' | 'createdAt' | 'updatedAt'>, Document {
  lastUpdated?: Date; // Mongoose handles Date type
  createdAt: Date;
  updatedAt: Date;
}

const ProcessStepSchema: Schema = new Schema({
  step: { type: String, required: true },
  description: { type: String, required: true },
}, { _id: false });

const ServiceSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String },
  iconName: { type: String, required: true }, // Store icon name as string
  features: { type: [String], default: [] },
  process: { type: [ProcessStepSchema], default: [] },
  status: { type: String, enum: ["Active", "Draft"], default: "Draft" },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

ServiceSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const ServiceModel = (models.Service as Model<IService>) || mongoose.model<IService>('Service', ServiceSchema);

export default ServiceModel;
