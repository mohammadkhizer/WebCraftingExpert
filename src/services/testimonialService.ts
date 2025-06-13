
'use server';
import dbConnect from '@/lib/dbConnect';
import TestimonialModel, { type ITestimonial } from '@/models/TestimonialModel';
import type { Testimonial, CreateTestimonialData } from '@/types';

function docToTestimonial(doc: ITestimonial | any): Testimonial {
  if (!doc) {
    console.error("[Service:Testimonial] docToTestimonial received a null or undefined document.");
    // This should ideally not happen if queries are constructed well or if creating new.
    // Throwing an error might be better in a production app if a doc is unexpectedly null.
    return { 
        id: 'error-id', 
        authorName: 'Error', 
        authorRole: 'Error', 
        testimonialText: 'Error loading testimonial', 
        isVisible: false, 
        imageUrl: 'https://placehold.co/100x100.png',
        dataAiHint: 'error',
    };
  }
  const plainDoc = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };
  
  if (!plainDoc || typeof plainDoc !== 'object' || !plainDoc._id) {
    console.error('[Service:Testimonial] docToTestimonial: plainDoc is not a valid object or missing _id after toObject/spread.', plainDoc);
    throw new Error('Internal server error: Failed to process testimonial data.');
  }

  return {
    id: plainDoc._id.toString(),
    authorName: plainDoc.authorName,
    authorRole: plainDoc.authorRole,
    testimonialText: plainDoc.testimonialText,
    imageUrl: plainDoc.imageUrl || undefined,
    dataAiHint: plainDoc.dataAiHint || 'person portrait',
    rating: plainDoc.rating || undefined,
    isVisible: plainDoc.isVisible || false,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  try {
    await dbConnect();
    const testimonialDocs = await TestimonialModel.find({}).sort({ createdAt: -1 }).lean();
    return testimonialDocs.map(docToTestimonial);
  } catch (error: any) {
    console.error('[Service:Testimonial] Error in getAllTestimonials:', error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to fetch all testimonials. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getVisibleTestimonials(): Promise<Testimonial[]> {
  try {
    await dbConnect();
    const testimonialDocs = await TestimonialModel.find({ isVisible: true }).sort({ createdAt: -1 }).limit(5).lean(); // Limit to e.g. 5 for homepage
    return testimonialDocs.map(docToTestimonial);
  } catch (error: any) {
    console.error('[Service:Testimonial] Error in getVisibleTestimonials:', error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to fetch visible testimonials. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn(`[Service:Testimonial] Invalid testimonial ID format for getTestimonialById: ${id}`);
      return null;
    }
    const testimonialDoc = await TestimonialModel.findById(id).lean();
    if (!testimonialDoc) return null;
    return docToTestimonial(testimonialDoc);
  } catch (error: any) {
    console.error(`[Service:Testimonial] Error in getTestimonialById for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to fetch testimonial by ID. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function addTestimonial(data: CreateTestimonialData): Promise<Testimonial> {
  try {
    await dbConnect();
    const newTestimonialDoc = new TestimonialModel({
        ...data,
        imageUrl: data.imageUrl || `https://placehold.co/100x100.png?text=${data.authorName.charAt(0)}`,
        dataAiHint: data.dataAiHint || 'person portrait',
        isVisible: data.isVisible === undefined ? false : data.isVisible, // Default to false if not provided
    });
    const savedTestimonial = await newTestimonialDoc.save();
    return docToTestimonial(savedTestimonial);
  } catch (error: any) {
    console.error('[Service:Testimonial] Error in addTestimonial:', error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to add testimonial. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateTestimonial(id: string, updates: Partial<CreateTestimonialData>): Promise<Testimonial | null> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format for updating testimonial.');
    }
    const testimonialDoc = await TestimonialModel.findById(id);
    if (!testimonialDoc) {
      throw new Error(`Testimonial with ID ${id} not found for update.`);
    }
    
    // Apply updates
    Object.assign(testimonialDoc, updates);
    if(updates.imageUrl === "") testimonialDoc.imageUrl = undefined; // Allow unsetting image
    if(updates.dataAiHint === "") testimonialDoc.dataAiHint = undefined;
    if(updates.rating === null || updates.rating === undefined || updates.rating === 0) testimonialDoc.rating = undefined;


    const savedDoc = await testimonialDoc.save();
    return docToTestimonial(savedDoc);
  } catch (error: any) {
    console.error(`[Service:Testimonial] Error in updateTestimonial for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
     if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update testimonial. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function deleteTestimonial(id: string): Promise<{ success: boolean }> {
  try {
    await dbConnect();
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('Invalid ID format for deleting testimonial.');
    }
    const result = await TestimonialModel.findByIdAndDelete(id);
    if (!result) {
      throw new Error(`Testimonial with ID ${id} not found for deletion.`);
    }
    return { success: true };
  } catch (error: any) {
    console.error(`[Service:Testimonial] Error in deleteTestimonial for ID ${id}:`, error.name, error.message, error.stack, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(`Failed to delete testimonial. Original: ${error.message}. Check server logs for details.`);
  }
}

