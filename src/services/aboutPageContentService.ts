
'use server';
import dbConnect from '@/lib/dbConnect';
import AboutPageContentModel, { type IAboutPageContent } from '@/models/AboutPageContentModel';
import type { AboutPageContent, UpdateAboutPageContentData } from '@/types';

const DEFAULT_ABOUT_CONTENT_DATA: Omit<AboutPageContent, 'id' | 'createdAt' | 'updatedAt'> = {
  introTitle: 'About ByteBrusters',
  introSubtitle: "We are a passionate team of tech enthusiasts dedicated to crafting exceptional digital experiences and robust IT solutions that drive growth and innovation for our clients.",
  missionTitle: 'Our Mission',
  missionParagraph: "To empower businesses with transformative technology solutions that enhance efficiency, foster innovation, and create lasting value. We strive to be a trusted partner, guiding our clients through the complexities of the digital landscape.",
  missionImageUrl: 'https://placehold.co/600x400.png',
  missionImageAiHint: 'mission target',
  visionTitle: 'Our Vision',
  visionParagraph: "To be a leading force in the IT industry, recognized for our innovative solutions, commitment to client success, and a culture of continuous learning and improvement. We envision a future where technology seamlessly integrates with business to unlock unprecedented potential.",
  visionImageUrl: 'https://placehold.co/600x400.png',
  visionImageAiHint: 'vision lightbulb',
  coreValuesTitle: 'Our Core Values',
};

function docToAboutPageContent(doc: IAboutPageContent | any): AboutPageContent {
  if (!doc) {
    console.warn('[Service:AboutPageContent] docToAboutPageContent received null or undefined doc. Returning default structure.');
    return { ...DEFAULT_ABOUT_CONTENT_DATA, id: 'default-fallback-id' };
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };
  
  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:AboutPageContent] docToAboutPageContent: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process about page content data.');
  }
  
  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-fallback-id'),
    introTitle: plainDoc.introTitle || DEFAULT_ABOUT_CONTENT_DATA.introTitle,
    introSubtitle: plainDoc.introSubtitle || DEFAULT_ABOUT_CONTENT_DATA.introSubtitle,
    missionTitle: plainDoc.missionTitle || DEFAULT_ABOUT_CONTENT_DATA.missionTitle,
    missionParagraph: plainDoc.missionParagraph || DEFAULT_ABOUT_CONTENT_DATA.missionParagraph,
    missionImageUrl: plainDoc.missionImageUrl || DEFAULT_ABOUT_CONTENT_DATA.missionImageUrl,
    missionImageAiHint: plainDoc.missionImageAiHint || "",
    visionTitle: plainDoc.visionTitle || DEFAULT_ABOUT_CONTENT_DATA.visionTitle,
    visionParagraph: plainDoc.visionParagraph || DEFAULT_ABOUT_CONTENT_DATA.visionParagraph,
    visionImageUrl: plainDoc.visionImageUrl || DEFAULT_ABOUT_CONTENT_DATA.visionImageUrl,
    visionImageAiHint: plainDoc.visionImageAiHint || "",
    coreValuesTitle: plainDoc.coreValuesTitle || DEFAULT_ABOUT_CONTENT_DATA.coreValuesTitle,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getAboutPageContent(): Promise<AboutPageContent> {
  try {
    await dbConnect();
    let contentDoc = await AboutPageContentModel.findOne({}).lean();
    if (!contentDoc) {
      console.log('[Service:AboutPageContent] No about page content found, creating and returning default content.');
      const newContent = new AboutPageContentModel(DEFAULT_ABOUT_CONTENT_DATA);
      contentDoc = await newContent.save();
      // After saving, convert to plain object to ensure consistency before passing to docToAboutPageContent
      contentDoc = contentDoc.toObject({ virtuals: true, getters: true });
    }
    return docToAboutPageContent(contentDoc);
  } catch (error: any) {
    console.error('[Service:AboutPageContent] Error in getAboutPageContent:', error);
    throw new Error(`Failed to fetch About Page content. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateAboutPageContent(data: UpdateAboutPageContentData): Promise<AboutPageContent> {
  try {
    await dbConnect();
    const updateData = { ...data }; // updatedAt will be handled by Mongoose timestamps:true

    const updatedContentDoc = await AboutPageContentModel.findOneAndUpdate({}, updateData, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    if (!updatedContentDoc) {
      console.error('[Service:AboutPageContent] Failed to update or create About Page content document during update.');
      throw new Error('Database operation failed: No document was updated or created for About Page content.');
    }
    return docToAboutPageContent(updatedContentDoc);
  } catch (error: any) {
    console.error('[Service:AboutPageContent] Error in updateAboutPageContent:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update About Page content. Original: ${error.message}. Check server logs for details.`);
  }
}
