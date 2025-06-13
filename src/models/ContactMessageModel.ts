
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { ContactMessage as ContactMessageType } from '@/types';

export interface IContactMessage extends Omit<ContactMessageType, 'id' | 'date' | 'createdAt' | 'updatedAt'>, Document {
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  messageBody: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['New', 'Read', 'Replied'], default: 'New' },
}, { timestamps: true });

const ContactMessageModel = (models.ContactMessage as Model<IContactMessage>) || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

export default ContactMessageModel;
