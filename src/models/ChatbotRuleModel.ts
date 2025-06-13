
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { ChatbotRule as ChatbotRuleType } from '@/types';

export interface IChatbotRule extends Omit<ChatbotRuleType, 'id' | 'createdAt' | 'updatedAt'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ChatbotRuleSchema: Schema = new Schema({
  keywords: {
    type: [String],
    required: true,
    // Convert keywords to lowercase before saving
    set: (keywords: string[]) => keywords.map(k => k.toLowerCase().trim()).filter(k => k),
  },
  response: {
    type: String,
    required: true,
    trim: true,
  },
  priority: {
    type: Number,
    default: 10, // Higher number means lower priority, default to a mid-range
  },
}, { timestamps: true });

ChatbotRuleSchema.index({ keywords: 1 }); // Index for faster keyword searching

const ChatbotRuleModel = (models.ChatbotRule as Model<IChatbotRule>) || mongoose.model<IChatbotRule>('ChatbotRule', ChatbotRuleSchema);

export default ChatbotRuleModel;
