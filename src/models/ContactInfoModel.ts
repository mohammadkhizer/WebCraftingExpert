
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { ContactInfo as ContactInfoType } from '@/types';

// Assuming there will be only one contact info document, or we'll always fetch/update the first one.
export interface IContactInfo extends Omit<ContactInfoType, 'id' | 'createdAt' | 'updatedAt'>, Document {
    createdAt: Date;
    updatedAt: Date;
}

const ContactInfoSchema: Schema = new Schema({
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
}, { timestamps: true });

const ContactInfoModel = (models.ContactInfo as Model<IContactInfo>) || mongoose.model<IContactInfo>('ContactInfo', ContactInfoSchema);

export default ContactInfoModel;
