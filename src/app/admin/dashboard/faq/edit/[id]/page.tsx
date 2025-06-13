
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, HelpCircle } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { getFAQItemById, updateFAQItem, type CreateFAQItemData } from '@/services/faqService';
import type { FAQItem } from '@/types';

const faqFormSchema = z.object({
  question: z.string().min(10, { message: "Question must be at least 10 characters." }).max(250, {message: "Question too long."}),
  answer: z.string().min(20, { message: "Answer must be at least 20 characters." }).max(2000, {message: "Answer too long."}),
});

type FAQFormValues = z.infer<typeof faqFormSchema>;

export default function EditFAQPage() {
  const router = useRouter();
  const params = useParams();
  const faqId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [faqItem, setFaqItem] = useState<FAQItem | null>(null);

  const form = useForm<FAQFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  const fetchFAQData = useCallback(async () => {
    if (!faqId) return;
    setIsFetching(true);
    try {
      const data = await getFAQItemById(faqId);
      if (data) {
        setFaqItem(data);
        form.reset({
          question: data.question,
          answer: data.answer || "",
        });
      } else {
        toast({ title: "Error", description: "FAQ not found.", variant: "destructive" });
        router.push('/admin/dashboard/faq');
      }
    } catch (error) {
      toast({ title: "Error fetching FAQ", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  }, [faqId, form, toast, router]);

  useEffect(() => {
    fetchFAQData();
  }, [fetchFAQData]);

  async function onSubmit(data: FAQFormValues) {
    if (!faqItem) return;
    setIsLoading(true);
    
    const updateData: Partial<CreateFAQItemData> = {
      question: data.question, 
      answer: data.answer,
    };

    try {
      const updatedFAQ = await updateFAQItem(faqItem.id, updateData);
      toast({
          title: "FAQ Updated",
          description: `FAQ "${updatedFAQ?.question}" has been updated.`,
      });
      router.push('/admin/dashboard/faq'); 
    } catch (error) {
       toast({
        title: "Error Updating FAQ",
        description: (error as Error).message || "An unexpected error occurred. Please try again.",
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

  if (!faqItem && !isFetching) {
     return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">FAQ not found or could not be loaded.</p>
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
          Back to FAQs
        </Button>
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
            <HelpCircle className="mr-3 h-6 w-6 text-primary"/> Edit FAQ
        </h1>
        <p className="text-muted-foreground">
          Update the question or answer for this FAQ.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>FAQ Details</CardTitle>
               <CardDescription>
                Editing FAQ: {faqItem.question.substring(0,50)}...
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <FormField control={form.control} name="question" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl><Input placeholder="e.g., What is your return policy?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="answer" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer</FormLabel>
                    <FormControl><Textarea placeholder="Provide a detailed answer..." className="min-h-[150px]" {...field} /></FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground pt-1">The answer must be at least 20 characters long.</p>
                  </FormItem>
              )}/>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button type="submit" className="button-primary" disabled={isLoading || isFetching}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : (<><Save className="mr-2 h-4 w-4" /> Save Changes</>)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FadeIn>
  );
}
