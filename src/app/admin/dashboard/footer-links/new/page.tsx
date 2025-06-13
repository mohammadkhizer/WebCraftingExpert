
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, Link as LinkIconLucide } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { addFooterLink, type CreateFooterLinkData } from '@/services/footerLinkService';
import type { FooterLinkColumn } from '@/types';

const footerLinkColumns: FooterLinkColumn[] = ['quick-links', 'resources'];

const footerLinkFormSchema = z.object({
  label: z.string().min(2, { message: "Label must be at least 2 characters." }).max(50, {message: "Label too long."}),
  href: z.string().url({ message: "Please enter a valid URL." }).or(z.string().startsWith('/', {message: "Internal links must start with /"})),
  column: z.enum(footerLinkColumns as [FooterLinkColumn, ...FooterLinkColumn[]], { required_error: "Please select a column." }),
  order: z.coerce.number().int().optional().default(0),
});

type FooterLinkFormValues = z.infer<typeof footerLinkFormSchema>;

export default function AddNewFooterLinkPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FooterLinkFormValues>({
    resolver: zodResolver(footerLinkFormSchema),
    defaultValues: {
      label: "",
      href: "",
      column: "quick-links",
      order: 0,
    },
  });

  async function onSubmit(data: FooterLinkFormValues) {
    setIsLoading(true);
    
    const newLinkData: CreateFooterLinkData = data; 

    try {
      const createdLink = await addFooterLink(newLinkData);
      toast({
          title: "Footer Link Added",
          description: `Link "${createdLink.label}" has been added successfully.`,
      });
      form.reset();
      router.push('/admin/dashboard/footer-links'); 
    } catch (error: any) {
       toast({
        title: "Error Adding Link",
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
          Back to Footer Links
        </Button>
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
            <LinkIconLucide className="mr-3 h-6 w-6 text-primary"/>Add New Footer Link
        </h1>
        <p className="text-muted-foreground">Enter details for the new link to appear in the website footer.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Footer Link Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="label" render={({ field }) => (
                  <FormItem><FormLabel>Label (Link Text)</FormLabel><FormControl><Input placeholder="e.g., Home or Privacy Policy" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="href" render={({ field }) => (
                  <FormItem><FormLabel>URL (Link Destination)</FormLabel><FormControl><Input placeholder="e.g., / or /privacy-policy or https://example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="column" render={({ field }) => (
                  <FormItem><FormLabel>Footer Column</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {footerLinkColumns.map(col => (
                                <SelectItem key={col} value={col} className="capitalize">{col.replace('-', ' ')}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="order" render={({ field }) => (
                  <FormItem><FormLabel>Sort Order (Optional)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 10 (lower numbers appear first)" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )}/>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button type="submit" className="button-primary" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving Link...</>) : (<><Save className="mr-2 h-4 w-4" /> Save Footer Link</>)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FadeIn>
  );
}
