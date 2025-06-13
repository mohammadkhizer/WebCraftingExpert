
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, Quote, Image as ImageIcon, Star, Eye } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { getTestimonialById, updateTestimonial, type CreateTestimonialData } from '@/services/testimonialService';
import type { Testimonial } from '@/types';

const testimonialFormSchema = z.object({
  authorName: z.string().min(2, { message: "Author name must be at least 2 characters." }).max(100, {message: "Author name too long."}),
  authorRole: z.string().min(2, { message: "Author role must be at least 2 characters." }).max(100, {message: "Author role too long."}),
  testimonialText: z.string().min(20, { message: "Testimonial must be at least 20 characters." }).max(1000, {message: "Testimonial too long."}),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
  dataAiHint: z.string().max(50, {message: "AI Hint too long"}).optional().or(z.literal('')),
  rating: z.coerce.number().int().min(0).max(5).optional(), // 0 for no rating, 1-5 for actual rating
  isVisible: z.boolean().default(false),
});

type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;

export default function EditTestimonialPage() {
  const router = useRouter();
  const params = useParams();
  const testimonialId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [testimonialItem, setTestimonialItem] = useState<Testimonial | null>(null);

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      authorName: "",
      authorRole: "",
      testimonialText: "",
      imageUrl: "",
      dataAiHint: "person portrait",
      rating: 0,
      isVisible: false,
    },
  });

  const fetchTestimonialData = useCallback(async () => {
    if (!testimonialId) return;
    setIsFetching(true);
    try {
      const data = await getTestimonialById(testimonialId);
      if (data) {
        setTestimonialItem(data);
        form.reset({
            authorName: data.authorName || "",
            authorRole: data.authorRole || "",
            testimonialText: data.testimonialText || "",
            imageUrl: data.imageUrl || "",
            dataAiHint: data.dataAiHint || "person portrait",
            rating: data.rating || 0,
            isVisible: data.isVisible || false,
        });
      } else {
        toast({ title: "Error", description: "Testimonial not found.", variant: "destructive" });
        router.push('/admin/dashboard/testimonials');
      }
    } catch (error: any) {
      toast({ title: "Error fetching testimonial", description: error.message || "Failed to fetch testimonial.", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  }, [testimonialId, form, toast, router]);

  useEffect(() => {
    fetchTestimonialData();
  }, [fetchTestimonialData]);

  async function onSubmit(data: TestimonialFormValues) {
    if (!testimonialItem) return;
    setIsLoading(true);
    
    const updateData: Partial<CreateTestimonialData> = {
        ...data,
        rating: data.rating === 0 ? undefined : data.rating,
        imageUrl: data.imageUrl || undefined, // Allow unsetting image
        dataAiHint: data.dataAiHint || undefined,
    };

    try {
      const updatedTestimonial = await updateTestimonial(testimonialItem.id, updateData);
      toast({
          title: "Testimonial Updated",
          description: `Testimonial by "${updatedTestimonial?.authorName}" has been updated successfully.`,
      });
      router.push('/admin/dashboard/testimonials'); 
    } catch (error: any) {
       toast({
        title: "Error Updating Testimonial",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!testimonialItem && !isFetching) {
     return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Testimonial not found or could not be loaded.</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="mb-6">
         <Button variant="outline" onClick={() => router.back()} className="mb-4 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Testimonials
        </Button>
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
            <Quote className="mr-3 h-6 w-6 text-primary"/>Edit Testimonial
        </h1>
        <p className="text-muted-foreground">Update details for the testimonial by {testimonialItem?.authorName}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Testimonial Details</CardTitle>
               <CardDescription>Editing testimonial by: {testimonialItem?.authorName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="authorName" render={({ field }) => (
                        <FormItem><FormLabel>Author's Name</FormLabel><FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="authorRole" render={({ field }) => (
                        <FormItem><FormLabel>Author's Role/Company</FormLabel><FormControl><Input placeholder="e.g., CEO, Example Inc." {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="testimonialText" render={({ field }) => (
                    <FormItem><FormLabel>Testimonial Text</FormLabel><FormControl><Textarea placeholder="Enter the client's feedback..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem><FormLabel>Author's Image URL (Optional)</FormLabel><FormControl><div className="flex items-center space-x-2"><ImageIcon className="h-5 w-5 text-muted-foreground" /><Input placeholder="https://placehold.co/100x100.png" {...field} /></div></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="dataAiHint" render={({ field }) => (
                        <FormItem><FormLabel>Image AI Hint (Optional)</FormLabel><FormControl><Input placeholder="e.g., person portrait (max 2 words)" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="rating" render={({ field }) => (
                    <FormItem><FormLabel>Rating (Optional)</FormLabel>
                        <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-muted-foreground" />
                        <Select onValueChange={value => field.onChange(parseInt(value,10))} value={field.value?.toString() || "0"}>
                        <FormControl><SelectTrigger><SelectValue placeholder="No rating" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="0">No Rating</SelectItem>
                            <SelectItem value="1">1 Star</SelectItem>
                            <SelectItem value="2">2 Stars</SelectItem>
                            <SelectItem value="3">3 Stars</SelectItem>
                            <SelectItem value="4">4 Stars</SelectItem>
                            <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                        </Select>
                        </div>
                    <FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="isVisible" render={({ field }) => (
                    <FormItem className="flex flex-col justify-center pt-2">
                        <FormLabel className="mb-2 flex items-center"><Eye className="mr-2 h-5 w-5 text-muted-foreground" /> Publicly Visible</FormLabel>
                        <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground pt-1">If checked, this testimonial will appear on the public website.</p>
                    </FormItem>
                    )}/>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button type="submit" className="button-primary" disabled={isLoading || isFetching}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>) : (<><Save className="mr-2 h-4 w-4" /> Update Testimonial</>)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FadeIn>
  );
}
