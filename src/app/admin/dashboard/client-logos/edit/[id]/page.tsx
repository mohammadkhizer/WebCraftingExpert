
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { getClientLogoById, updateClientLogo, type CreateClientLogoData } from '@/services/clientLogoService';
import type { ClientLogo } from '@/types';

const clientLogoFormSchema = z.object({
  name: z.string().min(2, { message: "Company name must be at least 2 characters." }).max(100, {message: "Company name too long."}),
  logoUrl: z.string().url({ message: "Please enter a valid URL for the logo image." }),
  websiteUrl: z.string().url({ message: "Please enter a valid website URL for the company." }),
  sortOrder: z.coerce.number().int().optional().default(0),
});

type ClientLogoFormValues = z.infer<typeof clientLogoFormSchema>;

export default function EditClientLogoPage() {
  const router = useRouter();
  const params = useParams();
  const logoId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [clientLogo, setClientLogo] = useState<ClientLogo | null>(null);

  const form = useForm<ClientLogoFormValues>({
    resolver: zodResolver(clientLogoFormSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      websiteUrl: "",
      sortOrder: 0,
    },
  });

  const fetchLogoData = useCallback(async () => {
    if (!logoId) return;
    setIsFetching(true);
    try {
      const data = await getClientLogoById(logoId);
      if (data) {
        setClientLogo(data);
        form.reset({
            name: data.name || "",
            logoUrl: data.logoUrl || "",
            websiteUrl: data.websiteUrl || "",
            sortOrder: data.sortOrder || 0,
        });
      } else {
        toast({ title: "Error", description: "Client logo not found.", variant: "destructive" });
        router.push('/admin/dashboard/client-logos');
      }
    } catch (error: any) {
      toast({ title: "Error Fetching Logo", description: error.message || "Failed to fetch client logo.", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  }, [logoId, form, toast, router]);

  useEffect(() => {
    fetchLogoData();
  }, [fetchLogoData]);

  async function onSubmit(data: ClientLogoFormValues) {
    if (!clientLogo) return;
    setIsLoading(true);
    
    const updateData: Partial<CreateClientLogoData> = data;

    try {
      const updatedLogo = await updateClientLogo(clientLogo.id, updateData);
      toast({
          title: "Client Logo Updated",
          description: `Logo for "${updatedLogo?.name}" has been updated successfully.`,
      });
      router.push('/admin/dashboard/client-logos'); 
    } catch (error: any) {
       toast({
        title: "Error Updating Logo",
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

  if (!clientLogo && !isFetching) {
     return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Client logo not found or could not be loaded.</p>
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
          Back to Client Logos
        </Button>
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
            <Building className="mr-3 h-6 w-6 text-primary"/>Edit Client Logo
        </h1>
        <p className="text-muted-foreground">Update details for the logo: {clientLogo?.name}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Client Logo Details</CardTitle>
               <CardDescription>Editing logo for: {clientLogo?.name}</CardDescription>
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
              <Button type="submit" className="button-primary" disabled={isLoading || isFetching}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating Logo...</>) : (<><Save className="mr-2 h-4 w-4" /> Update Client Logo</>)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FadeIn>
  );
}
