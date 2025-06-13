
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, HelpCircle } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { addFAQItem, type CreateFAQItemData } from '@/services/faqService';

const faqFormSchema = z.object({
  question: z.string().min(10, { message: "Question must be at least 10 characters." }).max(250, {message: "Question too long."}),
  answer: z.string().min(20, { message: "Answer must be at least 20 characters." }).max(2000, {message: "Answer too long."}),
});

type FAQFormValues = z.infer<typeof faqFormSchema>;

export default function AddNewFAQPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FAQFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
  });

  async function onSubmit(data: FAQFormValues) {
    setIsLoading(true);
    
    const newFAQData: CreateFAQItemData = data; 

    try {
      const createdFAQ = await addFAQItem(newFAQData);
      toast({
          title: "FAQ Added",
          description: `FAQ "${createdFAQ.question}" has been added successfully.`,
      });
      form.reset();
      router.push('/admin/dashboard/faq'); 
    } catch (error) {
       toast({
        title: "Error Adding FAQ",
        description: (error as Error).message || "An unexpected error occurred. Please try again.",
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
          Back to FAQs
        </Button>
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
            <HelpCircle className="mr-3 h-6 w-6 text-primary"/>Add New FAQ
        </h1>
        <p className="text-muted-foreground">Enter the question and answer. This FAQ will be published immediately.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>FAQ Details</CardTitle>
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
                  </FormItem>
              )}/>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button type="submit" className="button-primary" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving FAQ...</>) : (<><Save className="mr-2 h-4 w-4" /> Save FAQ</>)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FadeIn>
  );
}
