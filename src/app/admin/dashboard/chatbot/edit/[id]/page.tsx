
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
import { ArrowLeft, Loader2, Save, Bot } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { getChatbotRuleById, updateChatbotRule, type CreateChatbotRuleData } from '@/services/chatbotRuleService';
import type { ChatbotRule } from '@/types';

const chatbotRuleFormSchema = z.object({
  keywords: z.string()
    .min(1, { message: "Keywords are required." })
    .max(500, { message: "Keywords string too long." })
    .transform(val => val.split(',').map(kw => kw.trim().toLowerCase()).filter(kw => kw)),
  response: z.string().min(5, { message: "Response must be at least 5 characters." }).max(2000, {message: "Response too long."}),
  priority: z.coerce.number().int().min(1, "Priority must be at least 1.").max(100, "Priority cannot exceed 100.").default(10),
});

type ChatbotRuleFormValues = z.infer<typeof chatbotRuleFormSchema>;

export default function EditChatbotRulePage() {
  const router = useRouter();
  const params = useParams();
  const ruleId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [ruleItem, setRuleItem] = useState<ChatbotRule | null>(null);

  const form = useForm<ChatbotRuleFormValues>({
    resolver: zodResolver(chatbotRuleFormSchema),
    defaultValues: {
      keywords: [],
      response: "",
      priority: 10,
    },
  });

  const fetchRuleData = useCallback(async () => {
    if (!ruleId) return;
    setIsFetching(true);
    try {
      const data = await getChatbotRuleById(ruleId);
      if (data) {
        setRuleItem(data);
        form.reset({
            keywords: data.keywords.join(', '), // Convert array to comma-separated string for form
            response: data.response || "",
            priority: data.priority || 10,
        });
      } else {
        toast({ title: "Error", description: "Chatbot rule not found.", variant: "destructive" });
        router.push('/admin/dashboard/chatbot');
      }
    } catch (error: any) {
      toast({ title: "Error fetching rule", description: error.message || "Failed to fetch chatbot rule.", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  }, [ruleId, form, toast, router]);

  useEffect(() => {
    fetchRuleData();
  }, [fetchRuleData]);

  async function onSubmit(data: ChatbotRuleFormValues) {
    if (!ruleItem) return;
    setIsLoading(true);
    
    const updateData: Partial<CreateChatbotRuleData> = {
      keywords: data.keywords, // Zod transform ensures this is an array
      response: data.response,
      priority: data.priority,
    };

    try {
      const updatedRule = await updateChatbotRule(ruleItem.id, updateData);
      toast({
          title: "Chatbot Rule Updated",
          description: `Rule for keywords "${updatedRule?.keywords.join(', ')}" has been updated.`,
      });
      router.push('/admin/dashboard/chatbot'); 
    } catch (error: any) {
       toast({
        title: "Error Updating Rule",
        description: error.message || "An unexpected error occurred.",
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

  if (!ruleItem && !isFetching) {
     return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Chatbot rule not found or could not be loaded.</p>
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
          Back to Chatbot Rules
        </Button>
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
            <Bot className="mr-3 h-6 w-6 text-primary"/> Edit Chatbot Rule
        </h1>
        <p className="text-muted-foreground">Update details for this chatbot rule.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Rule Details</CardTitle>
              <CardDescription>Editing rule for keywords: {ruleItem?.keywords.join(', ')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="keywords"
                render={({ field: { onChange, value, ...restField } }) => (
                  <FormItem>
                    <FormLabel>Keywords (comma-separated)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., pricing, contact, services" 
                        onChange={e => onChange(e.target.value)} 
                        value={Array.isArray(value) ? value.join(', ') : value || ''}
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
              <Button type="submit" className="button-primary" disabled={isLoading || isFetching}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating Rule...</>) : (<><Save className="mr-2 h-4 w-4" /> Update Rule</>)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FadeIn>
  );
}
