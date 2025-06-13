
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { FAQItem as FAQItemType } from '@/types';

export interface IFAQItem extends Omit<FAQItemType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const FAQItemSchema: Schema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }, // Answer is now required
}, { timestamps: true });

const FAQItemModel = (models.FAQItem as Model<IFAQItem>) || mongoose.model<IFAQItem>('FAQItem', FAQItemSchema);

export default FAQItemModel;
