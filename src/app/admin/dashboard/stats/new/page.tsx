
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
import { ArrowLeft, Loader2, Save, BarChart3, Palette } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { addStatItem, type CreateStatItemData } from '@/services/statItemService';
import { availableIcons, getIconComponent } from '@/lib/iconUtils';

const NO_ICON_VALUE = "---NO_ICON_SELECTED---";

const statItemFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100, {message: "Title too long."}),
  value: z.string().min(1, { message: "Value is required." }).max(50, {message: "Value too long."}),
  iconName: z.string().optional(),
  sortOrder: z.coerce.number().int().optional().default(0),
});

type StatItemFormValues = z.infer<typeof statItemFormSchema>;

export default function AddNewStatItemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StatItemFormValues>({
    resolver: zodResolver(statItemFormSchema),
    defaultValues: {
      title: "",
      value: "",
      iconName: undefined, // Use undefined for no initial selection
      sortOrder: 0,
    },
  });

  async function onSubmit(data: StatItemFormValues) {
    setIsLoading(true);
    
    const newStatData: CreateStatItemData = {
      title: data.title,
      value: data.value,
      iconName: data.iconName === NO_ICON_VALUE ? undefined : data.iconName,
      sortOrder: data.sortOrder,
    };

    try {
      const createdStat = await addStatItem(newStatData);
      toast({
          title: "Stat Item Added",
          description: `Stat "${createdStat.title}" has been added successfully.`,
      });
      form.reset();
      router.push('/admin/dashboard/stats'); 
    } catch (error) {
       toast({
        title: "Error Adding Stat Item",
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
          Back to Stats
        </Button>
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
            <BarChart3 className="mr-3 h-6 w-6 text-primary"/>Add New Stat Item
        </h1>
        <p className="text-muted-foreground">Enter details for the new statistical item.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Stat Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Completed Projects" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="value" render={({ field }) => (
                  <FormItem><FormLabel>Value</FormLabel><FormControl><Input placeholder="e.g., 50+ or 99%" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="iconName" render={({ field }) => (
                  <FormItem><FormLabel>Icon (Optional from Lucide)</FormLabel>
                    <div className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-muted-foreground" />
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select an icon (e.g., CheckSquare)" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value={NO_ICON_VALUE}>No Icon</SelectItem>
                          {availableIcons.map(iconKey => {
                            const IconComponent = getIconComponent(iconKey);
                            return <SelectItem key={iconKey} value={iconKey}><span className="flex items-center gap-2">{IconComponent && <IconComponent className="h-4 w-4"/>} {iconKey}</span></SelectItem>
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  <FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="sortOrder" render={({ field }) => (
                  <FormItem><FormLabel>Sort Order (Optional)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 10 (lower numbers appear first)" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl>
                    <FormMessage />
                  </FormItem>
              )}/>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
              <Button type="submit" className="button-primary" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving Stat...</>) : (<><Save className="mr-2 h-4 w-4" /> Save Stat Item</>)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FadeIn>
  );
}
