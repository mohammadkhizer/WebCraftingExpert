
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { FooterLink as FooterLinkType, FooterLinkColumn } from '@/types';

export interface IFooterLink extends Omit<FooterLinkType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const footerLinkColumnEnum: FooterLinkColumn[] = ['quick-links', 'resources'];

const FooterLinkSchema: Schema = new Schema({
  label: { type: String, required: true, trim: true },
  href: { type: String, required: true, trim: true },
  column: { type: String, enum: footerLinkColumnEnum, required: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const FooterLinkModel = (models.FooterLink as Model<IFooterLink>) || mongoose.model<IFooterLink>('FooterLink', FooterLinkSchema);

export default FooterLinkModel;
