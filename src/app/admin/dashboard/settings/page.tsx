
"use client";

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, Mail, Settings as SettingsIcon, Home, Info, MessageSquare, Phone, Link as LinkIcon } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { useToast } from "@/hooks/use-toast";
import { getSiteSettings, updateSiteSettings } from '@/services/siteSettingsService';
import type { SiteSettings } from '@/types';

type SiteSettingsFormData = Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt'>;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettingsFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedSettings = await getSiteSettings();
      const { id, createdAt, updatedAt, ...formData } = fetchedSettings;
      setSettings(formData);
    } catch (error) {
      console.error("Error loading site settings:", error);
      toast({ title: "Error Loading Site Settings", description: (error as Error).message || "Failed to load site settings.", variant: "destructive" });
      // Provide default structure on error to prevent crashes
      setSettings({
        siteTitle: 'ByteBrusters',
        siteDescription: '',
        adminEmail: '',
        contactEmail: '',
        footerPhoneNumber: '',
        footerTagline: '',
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
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => {
      if (!prev) return null; 
      if (name.startsWith("socials.")) {
        const socialKey = name.split(".")[1] as keyof SiteSettingsFormData['socials'];
        return {
          ...prev,
          socials: {
            ...prev.socials,
            [socialKey]: value,
          },
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSaveChanges = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const updated = await updateSiteSettings(settings);
      const { id, createdAt, updatedAt, ...formData } = updated; // Destructure to get plain form data
      setSettings(formData);
      toast({ title: "Site Settings Updated", description: "Your changes have been saved." });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({ title: "Error Saving Settings", description: (error as Error).message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return <p className="text-center text-muted-foreground p-8">Site settings are currently unavailable. Please try again later.</p>;
  }

  return (
    <FadeIn>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center">
            <SettingsIcon className="mr-3 h-6 w-6 text-primary"/>
            Site Settings
          </h1>
          <p className="text-muted-foreground">Manage general website settings, SEO, footer content, and social links.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Home className="mr-2 h-5 w-5 text-primary/80"/> General Information & SEO</CardTitle>
            <CardDescription>Basic information about your website that can affect SEO and public display.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="siteTitle">Site Title / Name</Label>
              <Input id="siteTitle" name="siteTitle" value={settings.siteTitle || ''} onChange={handleInputChange} className="mt-1" placeholder="e.g., ByteBrusters Inc." disabled={isSaving} />
            </div>
            <div>
              <Label htmlFor="siteDescription">Site Meta Description (for SEO)</Label>
              <Textarea
                id="siteDescription"
                name="siteDescription"
                value={settings.siteDescription || ''}
                onChange={handleInputChange}
                className="mt-1 min-h-[100px]"
                placeholder="A brief description of your site for search engines (approx. 150-160 characters)."
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Mail className="mr-2 h-5 w-5 text-primary/80"/> Email Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="adminEmail">Admin Email (for password reset OTPs)</Label>
              <Input id="adminEmail" name="adminEmail" type="email" value={settings.adminEmail || ''} onChange={handleInputChange} className="mt-1" placeholder="e.g., admin@bytebrusters.com" disabled={isSaving} />
              <p className="text-xs text-muted-foreground pt-1">Used for simulated OTPs on the password reset page.</p>
            </div>
            <div>
              <Label htmlFor="contactEmail">Public Contact Email (for site footer/general inquiries)</Label>
              <Input id="contactEmail" name="contactEmail" type="email" value={settings.contactEmail || ''} onChange={handleInputChange} className="mt-1" placeholder="e.g., info@bytebrusters.com" disabled={isSaving} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Info className="mr-2 h-5 w-5 text-primary/80"/> Footer Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid sm:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="footerPhoneNumber">Footer Phone Number (Optional)</Label>
                    <Input id="footerPhoneNumber" name="footerPhoneNumber" value={settings.footerPhoneNumber || ''} onChange={handleInputChange} className="mt-1" placeholder="e.g., +91 12345 67890" disabled={isSaving} />
                </div>
                <div>
                    <Label htmlFor="footerTagline">Footer Tagline (Optional)</Label>
                    <Input id="footerTagline" name="footerTagline" value={settings.footerTagline || ''} onChange={handleInputChange} className="mt-1" placeholder="e.g., Crafting digital excellence." disabled={isSaving} />
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="footerCopyright">Footer Copyright Text</Label>
                    <Input id="footerCopyright" name="footerCopyright" value={settings.footerCopyright || ''} onChange={handleInputChange} className="mt-1" placeholder={`e.g., © ${new Date().getFullYear()} ByteBrusters. All rights reserved.`} disabled={isSaving} />
                </div>
                <div>
                    <Label htmlFor="developerCreditText">Developer Credit Text (Optional)</Label>
                    <Input id="developerCreditText" name="developerCreditText" value={settings.developerCreditText || ''} onChange={handleInputChange} className="mt-1" placeholder="e.g., Developed by ByteBrusters Team" disabled={isSaving} />
                </div>
            </div>
            <h4 className="text-md font-medium pt-4 flex items-center"><LinkIcon className="mr-2 h-4 w-4 text-muted-foreground"/>Footer Column Titles</h4>
            <div className="grid sm:grid-cols-3 gap-6">
                <div>
                    <Label htmlFor="footerQuickLinksTitle">"Quick Links" Title</Label>
                    <Input id="footerQuickLinksTitle" name="footerQuickLinksTitle" value={settings.footerQuickLinksTitle || ''} onChange={handleInputChange} className="mt-1" placeholder="e.g., Quick Links" disabled={isSaving} />
                </div>
                <div>
                    <Label htmlFor="footerGetInTouchTitle">"Get In Touch" Title</Label>
                    <Input id="footerGetInTouchTitle" name="footerGetInTouchTitle" value={settings.footerGetInTouchTitle || ''} onChange={handleInputChange} className="mt-1" placeholder="e.g., Get In Touch" disabled={isSaving} />
                </div>
                <div>
                    <Label htmlFor="footerResourcesTitle">"Resources" Title</Label>
                    <Input id="footerResourcesTitle" name="footerResourcesTitle" value={settings.footerResourcesTitle || ''} onChange={handleInputChange} className="mt-1" placeholder="e.g., Resources" disabled={isSaving} />
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary/80"/> Social Media Links</CardTitle>
            <CardDescription>Links to your agency's social media profiles displayed in the website footer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="socials.facebookUrl">Facebook URL</Label>
                  <Input id="socials.facebookUrl" name="socials.facebookUrl" value={settings.socials?.facebookUrl || ''} onChange={handleInputChange} className="mt-1" placeholder="https://facebook.com/yourpage" disabled={isSaving} />
                </div>
                <div>
                  <Label htmlFor="socials.twitterUrl">Twitter (X) URL</Label>
                  <Input id="socials.twitterUrl" name="socials.twitterUrl" value={settings.socials?.twitterUrl || ''} onChange={handleInputChange} className="mt-1" placeholder="https://x.com/yourhandle" disabled={isSaving} />
                </div>
            </div>
             <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="socials.linkedinUrl">LinkedIn URL</Label>
                  <Input id="socials.linkedinUrl" name="socials.linkedinUrl" value={settings.socials?.linkedinUrl || ''} onChange={handleInputChange} className="mt-1" placeholder="https://linkedin.com/company/yourcompany" disabled={isSaving} />
                </div>
                <div>
                  <Label htmlFor="socials.githubUrl">GitHub URL (Optional)</Label>
                  <Input id="socials.githubUrl" name="socials.githubUrl" value={settings.socials?.githubUrl || ''} onChange={handleInputChange} className="mt-1" placeholder="https://github.com/yourprofile" disabled={isSaving} />
                </div>
            </div>
            <div>
              <Label htmlFor="socials.instagramUrl">Instagram URL</Label>
              <Input id="socials.instagramUrl" name="socials.instagramUrl" value={settings.socials?.instagramUrl || ''} onChange={handleInputChange} className="mt-1" placeholder="https://instagram.com/yourprofile" disabled={isSaving} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSaveChanges} className="button-primary" disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save All Settings
          </Button>
        </div>
      </div>
    </FadeIn>
  );
}
