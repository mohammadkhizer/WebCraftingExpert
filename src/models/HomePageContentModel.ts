
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { HomePageContent as HomePageContentType } from '@/types';

export interface IHomePageContent extends Omit<HomePageContentType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const HomePageContentSchema: Schema = new Schema({
  heroTitle: { type: String, required: true },
  heroSubtitle: { type: String, required: true },
  whyByteBrustersTitle: { type: String, required: true },
  whyByteBrustersParagraph: { type: String, required: true },
  whyByteBrustersImageUrl: { type: String, required: true },
  whyByteBrustersImageAiHint: { type: String },
  finalCtaTitle: { type: String, required: true },
  finalCtaSubtitle: { type: String, required: true },
}, { timestamps: true });

const HomePageContentModel = (models.HomePageContent as Model<IHomePageContent>) || mongoose.model<IHomePageContent>('HomePageContent', HomePageContentSchema);

export default HomePageContentModel;
