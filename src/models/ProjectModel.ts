
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { Project as ProjectType } from '@/types'; // Use ProjectType to avoid naming conflict

export interface IProject extends Omit<ProjectType, 'id' | 'date' | 'createdAt' | 'updatedAt'>, Document {
  date?: Date; // Mongoose handles Date type
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String },
  imageUrl: { type: String, required: true },
  dataAiHint: { type: String },
  tags: { type: [String], default: [] },
  liveUrl: { type: String },
  repoUrl: { type: String },
  client: { type: String },
  date: { type: Date },
  technologies: { type: [String], default: [] },
  status: { type: String, enum: ["Planning", "In Progress", "Completed", "On Hold"], default: "Planning" },
  developerName: { type: String, required: true }, // Added developer name
}, { timestamps: true });

// Prevent model overwrite in Next.js HMR
const ProjectModel = (models.Project as Model<IProject>) || mongoose.model<IProject>('Project', ProjectSchema);

export default ProjectModel;
