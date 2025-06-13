
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { Feedback as FeedbackType } from '@/types';

export interface IFeedback extends Omit<FeedbackType, 'id' | 'createdAt'>, Document {
  createdAt: Date;
}

const FeedbackSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  message: { type: String, required: true, trim: true },
}, { timestamps: true });

const FeedbackModel = (models.Feedback as Model<IFeedback>) || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default FeedbackModel;
