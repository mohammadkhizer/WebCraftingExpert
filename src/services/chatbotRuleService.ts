
'use server';
import dbConnect from '@/lib/dbConnect';
import ChatbotRuleModel, { type IChatbotRule } from '@/models/ChatbotRuleModel';
import type { ChatbotRule, CreateChatbotRuleData } from '@/types';

function docToChatbotRule(doc: IChatbotRule | any): ChatbotRule {
  if (!doc) {
    console.error("[Service:ChatbotRule] docToChatbotRule received a null or undefined document.");
    throw new Error('Internal server error: Chatbot rule document is invalid.');
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };
  
  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:ChatbotRule] docToChatbotRule: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process chatbot rule data.');
  }

  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-chatbotrule-id'),
    keywords: Array.isArray(plainDoc.keywords) ? plainDoc.keywords : [],
    response: plainDoc.response,
    priority: plainDoc.priority || 10,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getChatbotRules(): Promise<ChatbotRule[]> {
  try {
    await dbConnect();
    const rulesDocs = await ChatbotRuleModel.find({}).sort({ priority: 1, createdAt: -1 }).lean(); // Sort by priority (ascending), then by creation
    return rulesDocs.map(docToChatbotRule);
  } catch (error: any) {
    console.error('[Service:ChatbotRule] Error in getChatbotRules:', error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to fetch chatbot rules. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getChatbotRuleById(id: string): Promise<ChatbotRule | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn(`[Service:ChatbotRule] Invalid chatbot rule ID format for getChatbotRuleById: ${id}`);
      return null;
    }
    const ruleDoc = await ChatbotRuleModel.findById(id).lean();
    if (!ruleDoc) return null;
    return docToChatbotRule(ruleDoc);
  } catch (error: any) {
    console.error(`[Service:ChatbotRule] Error in getChatbotRuleById for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to fetch chatbot rule by ID. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function addChatbotRule(data: CreateChatbotRuleData): Promise<ChatbotRule> {
  try {
    await dbConnect();
    const newRuleDoc = new ChatbotRuleModel(data);
    const savedRule = await newRuleDoc.save();
    return docToChatbotRule(savedRule);
  } catch (error: any) {
    console.error('[Service:ChatbotRule] Error in addChatbotRule:', error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to add chatbot rule. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateChatbotRule(id: string, updates: Partial<CreateChatbotRuleData>): Promise<ChatbotRule | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format for updating chatbot rule.');
    }
    const ruleDoc = await ChatbotRuleModel.findById(id);
    if (!ruleDoc) {
      throw new Error(`Chatbot rule with ID ${id} not found for update.`);
    }

    Object.assign(ruleDoc, updates);
    const savedDoc = await ruleDoc.save();
    return docToChatbotRule(savedDoc);
  } catch (error: any) {
    console.error(`[Service:ChatbotRule] Error in updateChatbotRule for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update chatbot rule. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteChatbotRule(id: string): Promise<{ success: boolean }> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format for deleting chatbot rule.');
    }
    const result = await ChatbotRuleModel.findByIdAndDelete(id);
    if (!result) {
      throw new Error(`Chatbot rule with ID ${id} not found for deletion.`);
    }
    return { success: true };
  } catch (error: any) {
    console.error(`[Service:ChatbotRule] Error in deleteChatbotRule for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to delete chatbot rule. Original: ${error.message}. Check server logs for details.`);
  }
}
