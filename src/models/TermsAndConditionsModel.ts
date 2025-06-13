
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { TermsAndConditions as TermsAndConditionsType } from '@/types';

export interface ITermsAndConditions extends Omit<TermsAndConditionsType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const TermsAndConditionsSchema: Schema = new Schema({
  content: { type: String, required: true, default: '<p>Please add your terms and conditions here.</p>' },
}, { timestamps: true }); // `updatedAt` will be automatically managed by Mongoose

const TermsAndConditionsModel = (models.TermsAndConditions as Model<ITermsAndConditions>) || mongoose.model<ITermsAndConditions>('TermsAndConditions', TermsAndConditionsSchema);

export default TermsAndConditionsModel;
