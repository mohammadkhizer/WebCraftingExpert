
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { AboutPageContent as AboutPageContentType } from '@/types';

export interface IAboutPageContent extends Omit<AboutPageContentType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const AboutPageContentSchema: Schema = new Schema({
  introTitle: { type: String, required: true },
  introSubtitle: { type: String, required: true },
  missionTitle: { type: String, required: true },
  missionParagraph: { type: String, required: true },
  missionImageUrl: { type: String, required: true },
  missionImageAiHint: { type: String },
  visionTitle: { type: String, required: true },
  visionParagraph: { type: String, required: true },
  visionImageUrl: { type: String, required: true },
  visionImageAiHint: { type: String },
  coreValuesTitle: { type: String, required: true },
  // teamSectionTitle: { type: String, required: true }, // Removed
  // teamSectionSubtitle: { type: String, required: true }, // Removed
}, { timestamps: true });

const AboutPageContentModel = (models.AboutPageContent as Model<IAboutPageContent>) || mongoose.model<IAboutPageContent>('AboutPageContent', AboutPageContentSchema);

export default AboutPageContentModel;
