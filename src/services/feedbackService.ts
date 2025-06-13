
'use server';
import dbConnect from '@/lib/dbConnect';
import FeedbackModel, { type IFeedback } from '@/models/FeedbackModel';
import type { Feedback, CreateFeedbackData } from '@/types';

function docToFeedback(doc: IFeedback | any): Feedback {
  if (!doc) {
    console.error("[Service:Feedback] docToFeedback received a null or undefined document.");
    throw new Error('Internal server error: Feedback document is invalid.');
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:Feedback] docToFeedback: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process feedback data.');
  }
  
  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-feedback-id'),
    name: plainDoc.name,
    email: plainDoc.email,
    rating: plainDoc.rating,
    message: plainDoc.message,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
  };
}

export async function submitFeedback(data: CreateFeedbackData): Promise<Feedback> {
  try {
    await dbConnect();
    const newFeedback = new FeedbackModel(data);
    const savedFeedback = await newFeedback.save();
    return docToFeedback(savedFeedback);
  } catch (error: any) {
    console.error('[Service:Feedback] Error in submitFeedback:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to submit feedback. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getFeedbacks(): Promise<Feedback[]> {
  try {
    await dbConnect();
    const feedbacks = await FeedbackModel.find({}).sort({ createdAt: -1 }).lean();
    return feedbacks.map(docToFeedback);
  } catch (error: any) {
    console.error('[Service:Feedback] Error in getFeedbacks:', error);
    throw new Error(`Failed to fetch feedback. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function countAllFeedbacks(): Promise<number> {
  try {
    await dbConnect();
    const count = await FeedbackModel.countDocuments({});
    return count;
  } catch (error: any) {
    console.error('[Service:Feedback] Error in countAllFeedbacks:', error);
    throw new Error(`Failed to count feedback. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteFeedback(id: string): Promise<{ success: boolean, message?: string, error?: string }> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return { success: false, error: 'Invalid ID format for deleting feedback.' };
    }
    const result = await FeedbackModel.findByIdAndDelete(id);
    if (!result) {
        console.warn(`[Service:Feedback] Feedback with ID ${id} not found for deletion.`);
        return { success: false, error: `Feedback with ID ${id} not found for deletion.` };
    }
    return { success: true, message: "Feedback deleted successfully."};
  } catch (error: any) {
    console.error(`[Service:Feedback] Error in deleteFeedback for ID ${id}:`, error);
    throw new Error(`Failed to delete feedback. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteManyFeedbacks(ids: string[]): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  if (!ids || ids.length === 0) {
    return { success: false, deletedCount: 0, error: "No feedback IDs provided for deletion." };
  }
  try {
    await dbConnect();
    for (const id of ids) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error(`Invalid feedback ID format in batch delete: ${id}.`);
      }
    }
    const result = await FeedbackModel.deleteMany({ _id: { $in: ids } });
    if (result.deletedCount === 0 && ids.length > 0) {
        console.warn('[Service:Feedback] deleteManyFeedbacks: No feedback items found matching the provided IDs for deletion.');
    }
    return { success: true, deletedCount: result.deletedCount || 0 };
  } catch (error: any) {
    console.error('[Service:Feedback] Error in deleteManyFeedbacks:', error);
    throw new Error(`Failed to delete feedback items. Original: ${error.message}. Check server logs for details.`);
  }
}
