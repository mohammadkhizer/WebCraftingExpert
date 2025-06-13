
'use server';
import dbConnect from '@/lib/dbConnect';
import SiteSettingsModel, { type ISiteSettings } from '@/models/SiteSettingsModel';
import type { SiteSettings } from '@/types';

const DEFAULT_SITE_SETTINGS_DATA: Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  siteTitle: 'ByteBrusters',
  siteDescription: 'Innovative IT solutions to boost your business. Web development, mobile apps, and AI integration by ByteBrusters.',
  adminEmail: 'admin@example.com',
  contactEmail: 'info@bytebrusters.com',
  footerPhoneNumber: '+91 9510865651',
  footerTagline: 'Crafting digital excellence, one line of code at a time.',
  footerCopyright: `© ${new Date().getFullYear()} ByteBrusters. All rights reserved.`,
  developerCreditText: 'Managed and Developed By Shaikh Mohammed Khizer.',
  footerQuickLinksTitle: 'Quick Links',
  footerGetInTouchTitle: 'Get In Touch',
  footerResourcesTitle: 'Resources',
  socials: {
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    githubUrl: '',
    instagramUrl: '',
  },
};

function docToSiteSettings(doc: ISiteSettings | any): SiteSettings {
  if (!doc) {
    console.warn('[Service:SiteSettings] docToSiteSettings received null or undefined doc. Returning default structure.');
    return { ...DEFAULT_SITE_SETTINGS_DATA, id: 'default-fallback-id' };
  }
  const plainDoc = doc && typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true, getters: true }) : { ...doc };

  if (!plainDoc || typeof plainDoc !== 'object') {
    console.error('[Service:SiteSettings] docToSiteSettings: plainDoc is not a valid object after toObject/spread.');
    throw new Error('Internal server error: Failed to process site settings data.');
  }
  
  return {
    id: plainDoc._id ? plainDoc._id.toString() : (plainDoc.id || 'default-fallback-id'),
    siteTitle: plainDoc.siteTitle || DEFAULT_SITE_SETTINGS_DATA.siteTitle,
    siteDescription: plainDoc.siteDescription || DEFAULT_SITE_SETTINGS_DATA.siteDescription,
    adminEmail: plainDoc.adminEmail || '',
    contactEmail: plainDoc.contactEmail || DEFAULT_SITE_SETTINGS_DATA.contactEmail,
    footerPhoneNumber: plainDoc.footerPhoneNumber || '',
    footerTagline: plainDoc.footerTagline || '',
    footerCopyright: plainDoc.footerCopyright || DEFAULT_SITE_SETTINGS_DATA.footerCopyright,
    developerCreditText: plainDoc.developerCreditText || '',
    footerQuickLinksTitle: plainDoc.footerQuickLinksTitle || 'Quick Links',
    footerGetInTouchTitle: plainDoc.footerGetInTouchTitle || 'Get In Touch',
    footerResourcesTitle: plainDoc.footerResourcesTitle || 'Resources',
    socials: {
      facebookUrl: plainDoc.socials?.facebookUrl || '',
      twitterUrl: plainDoc.socials?.twitterUrl || '',
      linkedinUrl: plainDoc.socials?.linkedinUrl || '',
      githubUrl: plainDoc.socials?.githubUrl || '',
      instagramUrl: plainDoc.socials?.instagramUrl || '',
    },
    createdAt: plainDoc.createdAt ? new Date(plainDoc.createdAt).toISOString() : undefined,
    updatedAt: plainDoc.updatedAt ? new Date(plainDoc.updatedAt).toISOString() : undefined,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    await dbConnect();
    let settingsDoc = await SiteSettingsModel.findOne({}).lean();
    if (!settingsDoc) {
      console.log('[Service:SiteSettings] No site settings found, creating and returning default settings.');
      const newSettings = new SiteSettingsModel(DEFAULT_SITE_SETTINGS_DATA);
      settingsDoc = await newSettings.save();
      settingsDoc = settingsDoc.toObject({ virtuals: true, getters: true });
    }
    return docToSiteSettings(settingsDoc);
  } catch (error: any) {
    console.error('[Service:SiteSettings] Error in getSiteSettings:', error);
    throw new Error(`Failed to fetch site settings. Original: ${error.message}. Check server logs for details.`);
  }
}

export async function updateSiteSettings(newSettings: Partial<Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SiteSettings> {
  try {
    await dbConnect();
    const updateData = { ...newSettings }; // updatedAt handled by Mongoose
    const updatedSettingsDoc = await SiteSettingsModel.findOneAndUpdate({}, updateData, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
     if (!updatedSettingsDoc) {
        console.error('[Service:SiteSettings] Failed to update or create Site Settings document during update.');
        throw new Error('Database operation failed: No document was updated or created for Site Settings.');
    }
    return docToSiteSettings(updatedSettingsDoc);
  } catch (error: any) {
    console.error('[Service:SiteSettings] Error in updateSiteSettings:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map((e: any) => e.message).join(', ');
      throw new Error(`Validation Error: ${messages}. Please check your input.`);
    }
    throw new Error(`Failed to update site settings. Original: ${error.message}. Check server logs for details.`);
  }
}
