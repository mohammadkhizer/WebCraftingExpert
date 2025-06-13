
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
import { ArrowLeft, Loader2, Save, Bot } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { addChatbotRule, type CreateChatbotRuleData } from '@/services/chatbotRuleService';

const chatbotRuleFormSchema = z.object({
  keywords: z.string()
    .min(1, { message: "Keywords are required." })
    .max(500, { message: "Keywords string too long." })
    .transform(val => val.split(',').map(kw => kw.trim().toLowerCase()).filter(kw => kw)),
  response: z.string().min(5, { message: "Response must be at least 5 characters." }).max(2000, {message: "Response too long."}),
  priority: z.coerce.number().int().min(1, "Priority must be at least 1.").max(100, "Priority cannot exceed 100.").default(10),
});

type ChatbotRuleFormValues = z.infer<typeof chatbotRuleFormSchema>;

export default function AddNewChatbotRulePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChatbotRuleFormValues>({
    resolver: zodResolver(chatbotRuleFormSchema),
    defaultValues: {
      keywords: [], // Will be string from input, transformed to array
      response: "",
      priority: 10,
    },
  });

  async function onSubmit(data: ChatbotRuleFormValues) {
    setIsLoading(true);
    
    const newRuleData: CreateChatbotRuleData = {
      keywords: data.keywords,
      response: data.response,
      priority: data.priority,
    };

    try {
      const createdRule = await addChatbotRule(newRuleData);
      toast({
          title: "Chatbot Rule Added",
          description: `Rule for keywords "${createdRule.keywords.join(', ')}" has been added.`,
      });
      form.reset({ keywords: [], response: "", priority: 10 }); // Reset with empty array for keywords
      router.push('/admin/dashboard/chatbot'); 
    } catch (error: any) {
       toast({
        title: "Error Adding Rule",
        description: error.message || "An unexpected error occurred.",
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
          Back to Chatbot Rules
        </Button>
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
            <Bot className="mr-3 h-6 w-6 text-primary"/> Add New Chatbot Rule
        </h1>
        <p className="text-muted-foreground">Define keywords and a corresponding response for the chatbot.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Rule Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="keywords"
                render={({ field: { onChange, value, ...restField } }) => ( // Destructure onChange and value
                  <FormItem>
                    <FormLabel>Keywords (comma-separated)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., pricing, contact, services" 
                        onChange={e => onChange(e.target.value)} // Pass string value directly to Zod transform
                        value={Array.isArray(value) ? value.join(', ') : value || ''} // Handle array or string for display
                        {...restField} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground pt-1">Enter keywords that trigger this rule. Case-insensitive.</p>
                  </FormItem>
              )}/>
              <FormField control={form.control} name="response" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response</FormLabel>
                    <FormControl><Textarea placeholder="The chatbot's answer for these keywords..." className="min-h-[120px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )}/>
              <FormField control={form.control} name="priority" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g., 10 (lower number = higher priority)" 
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value, 10) || 10)} 
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground pt-1">Rules with lower priority numbers are checked first (1-100).</p>
                  </FormItem>
              )}/>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button type="submit" className="button-primary" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving Rule...</>) : (<><Save className="mr-2 h-4 w-4" /> Save Rule</>)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FadeIn>
  );
}
