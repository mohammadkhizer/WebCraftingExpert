
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { SiteSettings as SiteSettingsType } from '@/types';

export interface ISiteSettings extends Omit<SiteSettingsType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const SocialsSchema: Schema = new Schema({
  facebookUrl: { type: String },
  twitterUrl: { type: String },
  linkedinUrl: { type: String },
  githubUrl: { type: String },
  instagramUrl: { type: String },
}, { _id: false });

const SiteSettingsSchema: Schema = new Schema({
  siteTitle: { type: String, required: true },
  siteDescription: { type: String, required: true },
  adminEmail: { type: String }, 
  contactEmail: { type: String, required: true },
  footerPhoneNumber: { type: String },
  footerTagline: { type: String },
  footerCopyright: { type: String, required: true },
  developerCreditText: { type: String },
  footerQuickLinksTitle: { type: String },
  footerGetInTouchTitle: { type: String },
  footerResourcesTitle: { type: String },
  socials: { type: SocialsSchema },
}, { timestamps: true });

// Ensure there's only one settings document, or fetch the first one.
const SiteSettingsModel = (models.SiteSettings as Model<ISiteSettings>) || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

export default SiteSettingsModel;
