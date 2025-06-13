
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { addTestimonial, type CreateTestimonialData } from '@/services/testimonialService';

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

export default function AddNewTestimonialPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: {
      authorName: "",
      authorRole: "",
      testimonialText: "",
      imageUrl: "",
      dataAiHint: "person portrait",
      rating: 0, // Default to no rating
      isVisible: false,
    },
  });

  async function onSubmit(data: TestimonialFormValues) {
    setIsLoading(true);
    
    const newTestimonialData: CreateTestimonialData = {
      ...data,
      rating: data.rating === 0 ? undefined : data.rating, // Convert 0 to undefined for DB
      imageUrl: data.imageUrl || `https://placehold.co/100x100.png?text=${encodeURIComponent(data.authorName.charAt(0))}`,
      dataAiHint: data.dataAiHint || 'person portrait',
    };

    try {
      const createdTestimonial = await addTestimonial(newTestimonialData);
      toast({
          title: "Testimonial Added",
          description: `Testimonial by "${createdTestimonial.authorName}" has been added successfully.`,
      });
      form.reset();
      router.push('/admin/dashboard/testimonials'); 
    } catch (error: any) {
       toast({
        title: "Error Adding Testimonial",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FadeIn>
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Testimonials
        </Button>
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
            <Quote className="mr-3 h-6 w-6 text-primary"/>Add New Testimonial
        </h1>
        <p className="text-muted-foreground">Enter the details for the new client testimonial.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Testimonial Details</CardTitle>
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
              <Button type="submit" className="button-primary" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : (<><Save className="mr-2 h-4 w-4" /> Save Testimonial</>)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FadeIn>
  );
}
