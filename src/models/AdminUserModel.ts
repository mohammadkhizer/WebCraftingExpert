
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { AdminUser as AdminUserType } from '@/types';

export interface IAdminUser extends Omit<AdminUserType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminUserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

AdminUserSchema.pre<IAdminUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    // Ensure 'err' is cast to Error if it's not already
    return next(err instanceof Error ? err : new Error(String(err)));
  }
});

AdminUserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error("[AdminUserModel] Error comparing password:", error);
    return false;
  }
};

const AdminUserModel = (models.AdminUser as Model<IAdminUser>) || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);

export default AdminUserModel;
