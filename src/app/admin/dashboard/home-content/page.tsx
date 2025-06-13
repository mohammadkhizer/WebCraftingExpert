
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Home } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { getHomePageContent, updateHomePageContent, type UpdateHomePageContentData } from '@/services/homePageContentService';
import type { HomePageContent } from '@/types';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from 'lucide-react';

const homeContentFormSchema = z.object({
  heroTitle: z.string().min(1, "Hero title is required."),
  heroSubtitle: z.string().min(1, "Hero subtitle is required."),
  whyByteBrustersTitle: z.string().min(1, "Why ByteBrusters title is required."),
  whyByteBrustersParagraph: z.string().min(1, "Why ByteBrusters paragraph is required."),
  whyByteBrustersImageUrl: z.string().url({ message: "Please enter a valid image URL." }),
  whyByteBrustersImageAiHint: z.string().max(50, {message: "AI Hint too long"}).optional().or(z.literal('')),
  finalCtaTitle: z.string().min(1, "Final CTA title is required."),
  finalCtaSubtitle: z.string().min(1, "Final CTA subtitle is required."),
});

type HomeContentFormValues = z.infer<typeof homeContentFormSchema>;

export default function ManageHomePageContent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<HomeContentFormValues>({
    resolver: zodResolver(homeContentFormSchema),
    defaultValues: {
      heroTitle: '',
      heroSubtitle: '',
      whyByteBrustersTitle: '',
      whyByteBrustersParagraph: '',
      whyByteBrustersImageUrl: 'https://placehold.co/600x600.png',
      whyByteBrustersImageAiHint: '',
      finalCtaTitle: '',
      finalCtaSubtitle: '',
    },
  });

  useEffect(() => {
    async function fetchContent() {
      setIsLoading(true);
      try {
        const content = await getHomePageContent();
        form.reset({
          heroTitle: content.heroTitle,
          heroSubtitle: content.heroSubtitle,
          whyByteBrustersTitle: content.whyByteBrustersTitle,
          whyByteBrustersParagraph: content.whyByteBrustersParagraph,
          whyByteBrustersImageUrl: content.whyByteBrustersImageUrl,
          whyByteBrustersImageAiHint: content.whyByteBrustersImageAiHint || "",
          finalCtaTitle: content.finalCtaTitle,
          finalCtaSubtitle: content.finalCtaSubtitle,
        });
      } catch (error) {
        toast({
          title: "Error Loading Content",
          description: (error as Error).message || "Failed to load home page content.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchContent();
  }, [form, toast]);

  async function onSubmit(data: HomeContentFormValues) {
    setIsSaving(true);
    try {
      await updateHomePageContent(data);
      toast({
        title: "Home Page Content Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error Saving Content",
        description: (error as Error).message || "Failed to save home page content.",
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
          <Home className="mr-3 h-6 w-6 text-primary" /> Manage Home Page Content
        </h1>
        <p className="text-muted-foreground">
          Edit the text and image URLs displayed on your public home page.
        </p>
         <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>HTML in Titles/Subtitles</AlertTitle>
            <AlertDescription>
                For fields like Hero Title and Final CTA Title, you can use simple HTML (e.g., <code>&lt;span class="gradient-text"&gt;Your Text&lt;/span&gt;</code>) to apply special styling. Be cautious and ensure HTML is valid.
            </AlertDescription>
        </Alert>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Content for the main banner on your home page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="heroTitle" render={({ field }) => (
                <FormItem><FormLabel>Hero Title</FormLabel><FormControl><Input placeholder="Enter hero title" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="heroSubtitle" render={({ field }) => (
                <FormItem><FormLabel>Hero Subtitle</FormLabel><FormControl><Textarea placeholder="Enter hero subtitle" className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>"Why ByteBrusters?" Section</CardTitle>
              <CardDescription>Content for the section explaining your agency's value.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="whyByteBrustersTitle" render={({ field }) => (
                <FormItem><FormLabel>Section Title</FormLabel><FormControl><Input placeholder="e.g., Why ByteBrusters?" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="whyByteBrustersParagraph" render={({ field }) => (
                <FormItem><FormLabel>Introductory Paragraph</FormLabel><FormControl><Textarea placeholder="Enter introductory paragraph" className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="whyByteBrustersImageUrl" render={({ field }) => (
                <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input type="url" placeholder="https://placehold.co/600x600.png" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="whyByteBrustersImageAiHint" render={({ field }) => (
                <FormItem><FormLabel>Image AI Hint (Optional)</FormLabel><FormControl><Input placeholder="e.g., team collaboration (max 2 words)" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Final Call to Action (CTA) Section</CardTitle>
              <CardDescription>Content for the concluding CTA block on your home page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="finalCtaTitle" render={({ field }) => (
                <FormItem><FormLabel>CTA Title</FormLabel><FormControl><Input placeholder="Enter CTA title" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="finalCtaSubtitle" render={({ field }) => (
                <FormItem><FormLabel>CTA Subtitle</FormLabel><FormControl><Textarea placeholder="Enter CTA subtitle" className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="button-primary" disabled={isSaving || isLoading}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Home Page Content
            </Button>
          </div>
        </form>
      </Form>
    </FadeIn>
  );
}
