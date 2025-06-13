
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, Building, Link as LinkIcon, Image as ImageIconLucide } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { addClientLogo, type CreateClientLogoData } from '@/services/clientLogoService';

const clientLogoFormSchema = z.object({
  name: z.string().min(2, { message: "Company name must be at least 2 characters." }).max(100, {message: "Company name too long."}),
  logoUrl: z.string().url({ message: "Please enter a valid URL for the logo image." }),
  websiteUrl: z.string().url({ message: "Please enter a valid website URL for the company." }),
  sortOrder: z.coerce.number().int().optional().default(0),
});

type ClientLogoFormValues = z.infer<typeof clientLogoFormSchema>;

export default function AddNewClientLogoPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ClientLogoFormValues>({
    resolver: zodResolver(clientLogoFormSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      websiteUrl: "",
      sortOrder: 0,
    },
  });

  async function onSubmit(data: ClientLogoFormValues) {
    setIsLoading(true);
    
    const newLogoData: CreateClientLogoData = data; 

    try {
      const createdLogo = await addClientLogo(newLogoData);
      toast({
          title: "Client Logo Added",
          description: `Logo for "${createdLogo.name}" has been added successfully.`,
      });
      form.reset();
      router.push('/admin/dashboard/client-logos'); 
    } catch (error: any) {
       toast({
        title: "Error Adding Logo",
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
          Back to Client Logos
        </Button>
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
            <Building className="mr-3 h-6 w-6 text-primary"/>Add New Client Logo
        </h1>
        <p className="text-muted-foreground">Enter details for the new client or partner logo.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Client Logo Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="e.g., Example Corp" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="logoUrl" render={({ field }) => (
                  <FormItem><FormLabel>Logo Image URL</FormLabel><FormControl><div className="flex items-center space-x-2"><ImageIconLucide className="h-5 w-5 text-muted-foreground" /><Input placeholder="https://example.com/logo.png" {...field} /></div></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="websiteUrl" render={({ field }) => (
                  <FormItem><FormLabel>Company Website URL (Logo Link)</FormLabel><FormControl><div className="flex items-center space-x-2"><LinkIcon className="h-5 w-5 text-muted-foreground" /><Input placeholder="https://example.com" {...field} /></div></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="sortOrder" render={({ field }) => (
                  <FormItem><FormLabel>Sort Order (Optional)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 10 (lower numbers appear first)" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground pt-1">Controls the display order on the public site.</p>
                  </FormItem>
              )}/>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button type="submit" className="button-primary" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving Logo...</>) : (<><Save className="mr-2 h-4 w-4" /> Save Client Logo</>)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FadeIn>
  );
}
