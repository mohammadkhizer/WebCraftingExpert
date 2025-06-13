
'use server';
import dbConnect from '@/lib/dbConnect';
import TermsAndConditionsModel, { type ITermsAndConditions } from '@/models/TermsAndConditionsModel';
import type { TermsAndConditions } from '@/types';

const DEFAULT_TERMS_CONTENT = `
<h2>1. Welcome to ByteBrusters!</h2>
<p>These terms and conditions outline the rules and regulations for the use of ByteBrusters's Website, located at [Your Website URL].</p>
<p>By accessing this website we assume you accept these terms and conditions. Do not continue to use ByteBrusters if you do not agree to take all of the terms and conditions stated on this page.</p>
<p><em>Please replace this placeholder text with your actual Terms and Conditions. You can edit this from the admin panel.</em></p>
<h2>2. Cookies</h2>
<p>We employ the use of cookies. By accessing ByteBrusters, you agreed to use cookies in agreement with the ByteBrusters's Privacy Policy.</p>
<h2>3. License</h2>
<p>Unless otherwise stated, ByteBrusters and/or its licensors own the intellectual property rights for all material on ByteBrusters. All intellectual property rights are reserved. You may access this from ByteBrusters for your own personal use subjected to restrictions set in these terms and conditions.</p>
<p>You must not:</p>
<ul>
    <li>Republish material from ByteBrusters</li>
    <li>Sell, rent or sub-license material from ByteBrusters</li>
    <li>Reproduce, duplicate or copy material from ByteBrusters</li>
    <li>Redistribute content from ByteBrusters</li>
</ul>
<h2>4. Placeholder Content</h2>
<p>This is placeholder content. Ensure you update this with legally sound terms and conditions relevant to your services and jurisdiction.</p>
<p>Consult with a legal professional to draft appropriate terms for your business.</p>
`;

function docToTermsAndConditions(doc: ITermsAndConditions | any): TermsAndConditions {
  if (!doc) {
    console.warn('[Service:TermsAndConditions] docToTermsAndConditions received null or undefined doc. Returning default structure.');
    // Construct the default content with a placeholder URL or an empty string if NEXT_PUBLIC_BASE_URL is not set
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'yourwebsite.com';
    const processedDefaultContent = DEFAULT_TERMS_CONTENT.replace("[Your Website URL]", baseUrl);
    return { content: processedDefaultContent, id: 'default-fallback-id' };
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:TermsAndConditions] docToTermsAndConditions: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process terms and conditions data.');
  }
  
  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-fallback-id'),
    content: plainDoc.content || DEFAULT_TERMS_CONTENT,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
  };
}


export async function getTermsAndConditions(): Promise<TermsAndConditions> {
  try {
    await dbConnect();
    let termsDoc = await TermsAndConditionsModel.findOne({}).lean();
    if (!termsDoc) {
      console.log('[Service:TermsAndConditions] No Terms and Conditions found, creating and returning default content.');
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'yourwebsite.com';
      const newTerms = new TermsAndConditionsModel({ content: DEFAULT_TERMS_CONTENT.replace("[Your Website URL]", baseUrl) });
      termsDoc = await newTerms.save();
      termsDoc = termsDoc.toObject({ virtuals: true, getters: true });
    }
    return docToTermsAndConditions(termsDoc);
  } catch (error: any) {
    console.error('[Service:TermsAndConditions] Error in getTermsAndConditions:', error);
    throw new Error(`Failed to fetch Terms & Conditions. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateTermsAndConditions(content: string): Promise<TermsAndConditions> {
  try {
    await dbConnect();
    // updatedAt will be handled by Mongoose timestamps: true
    const updatedTermsDoc = await TermsAndConditionsModel.findOneAndUpdate(
      {},
      { content },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    if (!updatedTermsDoc) {
      console.error('[Service:TermsAndConditions] Failed to update or create Terms & Conditions document during update.');
      throw new Error('Database operation failed: No document was updated or created for Terms & Conditions.');
    }
    return docToTermsAndConditions(updatedTermsDoc);
  } catch (error: any) {
    console.error('[Service:TermsAndConditions] Error in updateTermsAndConditions:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update Terms & Conditions. Original: ${error.message}. Check server logs for details.`);
  }
}
