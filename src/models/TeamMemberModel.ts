
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { TeamMember as TeamMemberType, TeamMemberSocials } from '@/types';

export interface ITeamMember extends Omit<TeamMemberType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSocialsSchema: Schema = new Schema({
  linkedin: { type: String },
  twitter: { type: String },
  github: { type: String },
  instagram: { type: String },
  cvUrl: { type: String },
}, { _id: false });

const TeamMemberSchema: Schema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  imageUrl: { type: String, required: true },
  dataAiHint: { type: String },
  bio: { type: String, required: true }, // Short bio for cards
  description: { type: String }, // Detailed description for detail page
  skills: { type: [String], default: [] },
  qualifications: { type: [String], default: [] },
  projectsInvolved: { type: [String], default: [] },
  pastWork: { type: [String], default: [] },
  socials: { type: TeamMemberSocialsSchema },
}, { timestamps: true });

const TeamMemberModel = (models.TeamMember as Model<ITeamMember>) || mongoose.model<ITeamMember>('TeamMember', TeamMemberSchema);

export default TeamMemberModel;
