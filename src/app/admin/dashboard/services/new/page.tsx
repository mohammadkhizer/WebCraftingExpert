
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, Palette } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { addService, type CreateServiceData } from '@/services/serviceService';
import { availableIcons, getIconComponent } from '@/lib/iconUtils'; 

const serviceFormSchema = z.object({
  title: z.string().min(3, { message: "Service name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Short description must be at least 10 characters." }).max(200, {message: "Short description too long."}),
  longDescription: z.string().min(20, { message: "Detailed description must be at least 20 characters." }).max(2000, {message: "Detailed description too long."}).optional().or(z.literal('')),
  iconName: z.enum(availableIcons as [string, ...string[]], { required_error: "Please select an icon." }),
  status: z.enum(["Active", "Draft"], { required_error: "Please select a status." }),
  features: z.string().optional().transform(val => val ? val.split(',').map(f => f.trim()).filter(f => f) : []), 
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

export default function AddNewServicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      longDescription: "",
      iconName: availableIcons.length > 0 ? availableIcons[0] : "Code", 
      status: "Draft",
      features: [],
    },
  });

  async function onSubmit(data: ServiceFormValues) {
    setIsLoading(true);
    
    const newServiceData: CreateServiceData = {
      title: data.title,
      description: data.description,
      longDescription: data.longDescription || "",
      iconName: data.iconName,
      status: data.status,
      features: data.features || [],
    };

    try {
      const createdService = await addService(newServiceData);
      toast({
          title: "Service Added",
          description: `Service "${createdService.title}" has been added successfully.`,
      });
      form.reset();
      router.push('/admin/dashboard/services');
    } catch (error) {
       toast({
        title: "Error Adding Service",
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
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Services
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Add New Service</h1>
        <p className="text-muted-foreground">Fill in the details for the new service offering.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
              <CardDescription>Provide information about the new service.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Service Name</FormLabel><FormControl><Input placeholder="e.g., Custom Web Development" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Short Description (for cards)</FormLabel><FormControl><Textarea placeholder="Brief summary of the service..." className="min-h-[80px]" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="longDescription" render={({ field }) => (
                  <FormItem><FormLabel>Detailed Description (for service page, Optional)</FormLabel><FormControl><Textarea placeholder="In-depth explanation of the service, its benefits, etc." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="iconName" render={({ field }) => (
                  <FormItem><FormLabel>Icon</FormLabel>
                    <div className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-muted-foreground" />
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select an icon" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {availableIcons.map(iconKey => {
                            const IconComponent = getIconComponent(iconKey);
                            return <SelectItem key={iconKey} value={iconKey}><span className="flex items-center gap-2">{IconComponent && <IconComponent className="h-4 w-4"/>} {iconKey}</span></SelectItem>
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  <FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="features" render={({ field }) => (
                <FormItem><FormLabel>Key Features (comma-separated, Optional)</FormLabel><FormControl><Input placeholder="e.g., Feature 1, Feature 2, Feature 3" {...field} onChange={e => field.onChange(e.target.value)} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl><SelectContent>
                        <SelectItem value="Active">Active</SelectItem><SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent></Select><FormMessage /></FormItem>
              )}/>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" className="button-primary" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : (<><Save className="mr-2 h-4 w-4" /> Save Service</>)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FadeIn>
  );
}
    

    