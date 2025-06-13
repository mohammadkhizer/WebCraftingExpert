
import mongoose, { Schema, Document, models, Model, Types } from 'mongoose';
import type { ServiceInquiry as ServiceInquiryType, ServiceInquiryStatus } from '@/types';

export interface IServiceInquiry extends Omit<ServiceInquiryType, 'id' | 'serviceId' | 'createdAt' | 'updatedAt'>, Document {
  serviceId: Types.ObjectId; // Store as ObjectId for referencing
  createdAt: Date;
  updatedAt: Date;
}

const serviceInquiryStatusEnum: ServiceInquiryStatus[] = ['New', 'Pending', 'Contacted', 'Resolved', 'Closed'];

const ServiceInquirySchema: Schema = new Schema({
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  serviceName: { type: String, required: true }, // Denormalized for easier display
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: serviceInquiryStatusEnum, default: 'New' },
}, { timestamps: true });

const ServiceInquiryModel = (models.ServiceInquiry as Model<IServiceInquiry>) || mongoose.model<IServiceInquiry>('ServiceInquiry', ServiceInquirySchema);

export default ServiceInquiryModel;
