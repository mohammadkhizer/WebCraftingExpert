
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Info as InfoIcon } from 'lucide-react'; 
import { FadeIn } from '@/components/motion/fade-in';
import { getAboutPageContent, updateAboutPageContent, type UpdateAboutPageContentData } from '@/services/aboutPageContentService';
import type { AboutPageContent } from '@/types';

const aboutContentFormSchema = z.object({
  introTitle: z.string().min(1, "Intro title is required."),
  introSubtitle: z.string().min(1, "Intro subtitle is required."),
  missionTitle: z.string().min(1, "Mission title is required."),
  missionParagraph: z.string().min(1, "Mission paragraph is required."),
  missionImageUrl: z.string().url({ message: "Please enter a valid image URL for Mission." }),
  missionImageAiHint: z.string().max(50, {message: "AI Hint too long"}).optional().or(z.literal('')),
  visionTitle: z.string().min(1, "Vision title is required."),
  visionParagraph: z.string().min(1, "Vision paragraph is required."),
  visionImageUrl: z.string().url({ message: "Please enter a valid image URL for Vision." }),
  visionImageAiHint: z.string().max(50, {message: "AI Hint too long"}).optional().or(z.literal('')),
  coreValuesTitle: z.string().min(1, "Core Values title is required."),
  // teamSectionTitle: z.string().min(1, "Team section title is required."), // Removed
  // teamSectionSubtitle: z.string().min(1, "Team section subtitle is required."), // Removed
});

type AboutContentFormValues = z.infer<typeof aboutContentFormSchema>;

export default function ManageAboutPageContent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AboutContentFormValues>({
    resolver: zodResolver(aboutContentFormSchema),
    defaultValues: {
      introTitle: '',
      introSubtitle: '',
      missionTitle: '',
      missionParagraph: '',
      missionImageUrl: 'https://placehold.co/600x400.png',
      missionImageAiHint: '',
      visionTitle: '',
      visionParagraph: '',
      visionImageUrl: 'https://placehold.co/600x400.png',
      visionImageAiHint: '',
      coreValuesTitle: '',
      // teamSectionTitle: '', // Removed
      // teamSectionSubtitle: '', // Removed
    },
  });

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      try {
        const content = await getAboutPageContent();
        form.reset({
          introTitle: content.introTitle,
          introSubtitle: content.introSubtitle,
          missionTitle: content.missionTitle,
          missionParagraph: content.missionParagraph,
          missionImageUrl: content.missionImageUrl,
          missionImageAiHint: content.missionImageAiHint || "",
          visionTitle: content.visionTitle,
          visionParagraph: content.visionParagraph,
          visionImageUrl: content.visionImageUrl,
          visionImageAiHint: content.visionImageAiHint || "",
          coreValuesTitle: content.coreValuesTitle,
          // teamSectionTitle: content.teamSectionTitle, // Removed
          // teamSectionSubtitle: content.teamSectionSubtitle, // Removed
        });
      } catch (error) {
        toast({
          title: "Error Loading Content",
          description: (error as Error).message || "Failed to load about page content.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchContent();
  }, [form, toast]);

  async function onSubmit(data: AboutContentFormValues) {
    setIsSaving(true);
    try {
      // Ensure we cast to UpdateAboutPageContentData before sending
      const updateData: UpdateAboutPageContentData = data;
      await updateAboutPageContent(updateData);
      toast({
        title: "About Page Content Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error Saving Content",
        description: (error as Error).message || "Failed to save about page content.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6 mb-8">
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
          <InfoIcon className="mr-3 h-6 w-6 text-primary" /> Manage About Page Content
        </h1>
        <p className="text-muted-foreground">
          Edit the text and image URLs displayed on your public About Us page.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Introductory Section</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="introTitle" render={({ field }) => (
                <FormItem><FormLabel>Intro Title</FormLabel><FormControl><Input placeholder="e.g., About ByteBrusters" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="introSubtitle" render={({ field }) => (
                <FormItem><FormLabel>Intro Subtitle/Paragraph</FormLabel><FormControl><Textarea placeholder="Brief introduction about the company..." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Mission Section</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="missionTitle" render={({ field }) => (
                <FormItem><FormLabel>Mission Title</FormLabel><FormControl><Input placeholder="e.g., Our Mission" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="missionParagraph" render={({ field }) => (
                <FormItem><FormLabel>Mission Paragraph</FormLabel><FormControl><Textarea placeholder="Describe your company's mission..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="missionImageUrl" render={({ field }) => (
                <FormItem><FormLabel>Mission Image URL</FormLabel><FormControl><Input type="url" placeholder="https://placehold.co/600x400.png" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="missionImageAiHint" render={({ field }) => (
                <FormItem><FormLabel>Mission Image AI Hint (Optional)</FormLabel><FormControl><Input placeholder="e.g., mission target (max 2 words)" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Vision Section</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="visionTitle" render={({ field }) => (
                <FormItem><FormLabel>Vision Title</FormLabel><FormControl><Input placeholder="e.g., Our Vision" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="visionParagraph" render={({ field }) => (
                <FormItem><FormLabel>Vision Paragraph</FormLabel><FormControl><Textarea placeholder="Describe your company's vision..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="visionImageUrl" render={({ field }) => (
                <FormItem><FormLabel>Vision Image URL</FormLabel><FormControl><Input type="url" placeholder="https://placehold.co/600x400.png" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="visionImageAiHint" render={({ field }) => (
                <FormItem><FormLabel>Vision Image AI Hint (Optional)</FormLabel><FormControl><Input placeholder="e.g., vision lightbulb (max 2 words)" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Core Values Section</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="coreValuesTitle" render={({ field }) => (
                <FormItem><FormLabel>Core Values Section Title</FormLabel><FormControl><Input placeholder="e.g., Our Core Values" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <p className="text-sm text-muted-foreground">Note: Individual core values (Innovation, Integrity, etc.) are managed directly in the About page component code for now.</p>
            </CardContent>
          </Card>

           <Card>
            <CardHeader><CardTitle>Team Section</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              {/* teamSectionTitle and teamSectionSubtitle fields removed */}
              <p className="text-sm text-muted-foreground">Note: The Team section display has been removed from the public About Us page. Team members are managed in the "Teams" section of the dashboard and displayed on a separate "Team" page.</p>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="button-primary" disabled={isSaving || isLoading}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save About Page Content
            </Button>
          </div>
        </form>
      </Form>
    </FadeIn>
  );
}
