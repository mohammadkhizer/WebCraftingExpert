
'use server';
import dbConnect from '@/lib/dbConnect';
import HomePageContentModel, { type IHomePageContent } from '@/models/HomePageContentModel';
import type { HomePageContent, UpdateHomePageContentData } from '@/types';

const DEFAULT_HOME_CONTENT_DATA: UpdateHomePageContentData = {
  heroTitle: 'Innovative <span class="gradient-text">IT Solutions</span> for a Digital Future',
  heroSubtitle: "ByteBrusters empowers businesses with cutting-edge technology, from custom web and mobile applications to intelligent AI integrations. Let's build something amazing together.",
  whyByteBrustersTitle: 'Why ByteBrusters?',
  whyByteBrustersParagraph: "At ByteBrusters, we're not just developers; we're innovators and problem solvers dedicated to your success. We combine technical expertise with a client-centric approach.",
  whyByteBrustersImageUrl: 'https://placehold.co/600x600.png',
  whyByteBrustersImageAiHint: 'team collaboration',
  finalCtaTitle: '<span class="gradient-text">Ready to Start Your Project?</span>',
  finalCtaSubtitle: "We're excited to learn about your ideas and help bring them to life. Let's collaborate and build something exceptional.",
};

function docToHomePageContent(doc: IHomePageContent | any): HomePageContent {
  if (!doc) {
    console.warn('[Service:HomePageContent] docToHomePageContent received null or undefined doc. Returning default structure.');
    return { ...DEFAULT_HOME_CONTENT_DATA, id: 'default-fallback-id' };
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:HomePageContent] docToHomePageContent: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process home page content data.');
  }
  
  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-fallback-id'),
    heroTitle: plainDoc.heroTitle || DEFAULT_HOME_CONTENT_DATA.heroTitle,
    heroSubtitle: plainDoc.heroSubtitle || DEFAULT_HOME_CONTENT_DATA.heroSubtitle,
    whyByteBrustersTitle: plainDoc.whyByteBrustersTitle || DEFAULT_HOME_CONTENT_DATA.whyByteBrustersTitle,
    whyByteBrustersParagraph: plainDoc.whyByteBrustersParagraph || DEFAULT_HOME_CONTENT_DATA.whyByteBrustersParagraph,
    whyByteBrustersImageUrl: plainDoc.whyByteBrustersImageUrl || DEFAULT_HOME_CONTENT_DATA.whyByteBrustersImageUrl,
    whyByteBrustersImageAiHint: plainDoc.whyByteBrustersImageAiHint || "",
    finalCtaTitle: plainDoc.finalCtaTitle || DEFAULT_HOME_CONTENT_DATA.finalCtaTitle,
    finalCtaSubtitle: plainDoc.finalCtaSubtitle || DEFAULT_HOME_CONTENT_DATA.finalCtaSubtitle,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getHomePageContent(): Promise<HomePageContent> {
  try {
    await dbConnect();
    let contentDoc = await HomePageContentModel.findOne({}).lean();
    if (!contentDoc) {
      console.log('[Service:HomePageContent] No home page content found, creating and returning default content.');
      const newContent = new HomePageContentModel(DEFAULT_HOME_CONTENT_DATA);
      contentDoc = await newContent.save();
      contentDoc = contentDoc.toObject({ virtuals: true, getters: true });
    }
    return docToHomePageContent(contentDoc);
  } catch (error: any) {
    console.error('[Service:HomePageContent] Error in getHomePageContent:', error);
    throw new Error(`Failed to fetch Home Page content. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateHomePageContent(data: UpdateHomePageContentData): Promise<HomePageContent> {
  try {
    await dbConnect();
    const updateData = { ...data }; // updatedAt handled by Mongoose
    const updatedContentDoc = await HomePageContentModel.findOneAndUpdate({}, updateData, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    if (!updatedContentDoc) {
      console.error('[Service:HomePageContent] Failed to update or create Home Page content document during update.');
      throw new Error('Database operation failed: No document was updated or created for Home Page content.');
    }
    return docToHomePageContent(updatedContentDoc);
  } catch (error: any) {
    console.error('[Service:HomePageContent] Error in updateHomePageContent:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update Home Page content. Original: ${error.message}. Check server logs for details.`);
  }
}
