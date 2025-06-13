
import { Code2, Facebook, Twitter, Linkedin, Github, Instagram, Mail, Phone, ArrowRight, ShieldCheck, MessageCircleQuestion, Bot } from 'lucide-react';
import Link from 'next/link';
import { getSiteSettings } from '@/services/siteSettingsService';
import { getFooterLinksByColumn } from '@/services/footerLinkService';
import type { SiteSettings, FooterLink } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const FooterSkeleton = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-16 text-left">
        {/* Column 1: Brand Skeleton */}
        <div>
          <div className="flex items-center mb-4">
            <Skeleton className="h-10 w-10 rounded-full mr-2" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-4/5 mb-2" /> {/* Tagline placeholder */}
        </div>

        {/* Column 2: Quick Links Skeleton */}
        <div>
          <Skeleton className="h-5 w-24 mb-6" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={`qls-${i}`} className="h-4 w-20" />)}
          </div>
        </div>

        {/* Column 3: Get In Touch / Socials Skeleton */}
        <div>
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="flex items-center mb-3">
            <Skeleton className="h-5 w-5 mr-3 rounded-sm" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex items-center mb-3">
             <Skeleton className="h-5 w-5 mr-3 rounded-sm" />
             <Skeleton className="h-4 w-32" />
          </div>
           <div className="flex space-x-4 mt-4">
            {[...Array(5)].map((_, i) => <Skeleton key={`socials-${i}`} className="h-8 w-8 rounded-md" />)}
          </div>
        </div>

        {/* Column 4: Resources Links Skeleton */}
        <div>
          <Skeleton className="h-5 w-28 mb-6" />
           <div className="space-y-3">
             {[...Array(3)].map((_, i) => <Skeleton key={`rls-${i}`} className="h-4 w-28" />)}
           </div>
        </div>
      </div>
      <div className="border-t border-border/20 py-8 text-center">
        <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
        <Skeleton className="h-3 w-1/3 mx-auto" />
      </div>
    </div>
  );
};


export default async function Footer() {
  let settings: SiteSettings | null = null;
  let quickLinks: FooterLink[] = [];
  let resourcesLinks: FooterLink[] = [];

  try {
    const [siteSettingsData, fetchedQuickLinks, fetchedResourcesLinks] = await Promise.all([
      getSiteSettings(),
      getFooterLinksByColumn('quick-links'),
      getFooterLinksByColumn('resources')
    ]);
    settings = siteSettingsData;
    quickLinks = fetchedQuickLinks;
    resourcesLinks = fetchedResourcesLinks;
  } catch (error: any) {
    console.error("[Footer] Failed to fetch footer data:", error.name, error.message);
    // Fallback to defaults if settings fetch fails
    settings = {
      id: 'default-settings',
      siteTitle: 'WebCraftingExperts',
      siteDescription: '',
      contactEmail: 'bytebrusters1115@gmail.com',
      footerPhoneNumber: '+91 9510865561',
      footerTagline: 'Crafting digital excellence.',
      footerCopyright: `© ${new Date().getFullYear()} WebCraftingExperts. All rights reserved.`,
      developerCreditText: 'Managed and Developed By Shaikh Mohammed Khizer.',
      footerQuickLinksTitle: 'Quick Links',
      footerGetInTouchTitle: 'Get In Touch',
      footerResourcesTitle: 'Resources',
      socials: {},
    };
  }

  if (!settings) {
      return (
        <footer className="bg-muted text-muted-foreground">
            <FooterSkeleton />
        </footer>
      )
  }

  const {
    siteTitle,
    footerTagline,
    footerCopyright,
    developerCreditText,
    contactEmail,
    footerPhoneNumber,
    socials,
    footerQuickLinksTitle,
    footerGetInTouchTitle,
    footerResourcesTitle,
  } = settings;

  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-16 text-left">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-foreground hover:text-primary transition-colors">
              <Code2 className="h-8 w-8 text-primary" />
              <span>{siteTitle}</span>
            </Link>
            {footerTagline && <p className="text-sm">{footerTagline}</p>}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{footerQuickLinksTitle || "Quick Links"}</h3>
            <ul className="space-y-2">
              
              {quickLinks.map(link => ( // Dynamically managed links
                <li key={link.id}>
                  <Link href={link.href} className="text-sm hover:text-primary transition-colors flex items-center group">
                    <ArrowRight aria-hidden="true" className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Get In Touch & Socials */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{footerGetInTouchTitle || "Get In Touch"}</h3>
            <ul className="space-y-2">
              {contactEmail && (
                <li>
                  <a href={`mailto:${contactEmail}`} className="text-sm hover:text-primary transition-colors flex items-center group">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    {contactEmail}
                  </a>
                </li>
              )}
              {footerPhoneNumber && (
                <li>
                    <a href={`tel:${footerPhoneNumber.replace(/\s/g, '')}`} className="text-sm hover:text-primary transition-colors flex items-center group">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors"/>
                        {footerPhoneNumber}
                    </a>
                </li>
              )}
            </ul>
            {(socials?.facebookUrl || socials?.twitterUrl || socials?.linkedinUrl || socials?.githubUrl || socials?.instagramUrl) && (
                 <div className="flex space-x-4 mt-6">
                    {socials?.facebookUrl && socials.facebookUrl !== '#' && (
                        <Link href={socials.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-300" aria-label="Facebook">
                        <Facebook size={24} />
                        </Link>
                    )}
                    {socials?.twitterUrl && socials.twitterUrl !== '#' && (
                        <Link href={socials.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-300" aria-label="Twitter">
                        <Twitter size={24} />
                        </Link>
                    )}
                    {socials?.linkedinUrl && socials.linkedinUrl !== '#' && (
                        <Link href={socials.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-300" aria-label="LinkedIn">
                        <Linkedin size={24} />
                        </Link>
                    )}
                    {socials?.githubUrl && socials.githubUrl !== '#' && (
                        <Link href={socials.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-300" aria-label="GitHub">
                        <Github size={24} />
                        </Link>
                    )}
                    {socials?.instagramUrl && socials.instagramUrl !== '#' && (
                        <Link href={socials.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-300" aria-label="Instagram">
                        <Instagram size={24} />
                        </Link>
                    )}
                 </div>
            )}
             {(!socials?.facebookUrl || socials.facebookUrl === '#') &&
              (!socials?.twitterUrl || socials.twitterUrl === '#') &&
              (!socials?.linkedinUrl || socials.linkedinUrl === '#') &&
              (!socials?.githubUrl || socials.githubUrl === '#') &&
              (!socials?.instagramUrl || socials.instagramUrl === '#') && (
                <p className="text-xs mt-4 text-muted-foreground">Social media links coming soon. Configure them in Admin &gt; Settings.</p>
            )}
          </div>

          {/* Column 4: Resources */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{footerResourcesTitle || "Resources"}</h3>
            <ul className="space-y-2">
              
              {resourcesLinks.map(link => ( // Dynamically managed links
                <li key={link.id}>
                  <Link href={link.href} className="text-sm hover:text-primary transition-colors flex items-center group">
                    <ArrowRight aria-hidden="true" className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 py-8 text-center">
          {footerCopyright && <p className="text-sm mb-1">{footerCopyright}</p>}
          {developerCreditText && (<p className="text-xs">{developerCreditText}</p>)}
        </div>
      </div>
    </footer>
  );
}
