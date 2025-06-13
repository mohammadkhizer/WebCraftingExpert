
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { Testimonial as TestimonialType } from '@/types';

export interface ITestimonial extends Omit<TestimonialType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema: Schema = new Schema({
  authorName: { type: String, required: true, trim: true },
  authorRole: { type: String, required: true, trim: true },
  testimonialText: { type: String, required: true, trim: true },
  imageUrl: { type: String, trim: true },
  dataAiHint: { type: String, trim: true, default: "person portrait" },
  rating: { type: Number, min: 1, max: 5 },
  isVisible: { type: Boolean, default: false },
}, { timestamps: true });

const TestimonialModel = (models.Testimonial as Model<ITestimonial>) || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

export default TestimonialModel;
