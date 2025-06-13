
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, BarChart3, Palette } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { getStatItemById, updateStatItem, type CreateStatItemData } from '@/services/statItemService';
import type { StatItem } from '@/types';
import { availableIcons, getIconComponent } from '@/lib/iconUtils';

const NO_ICON_VALUE = "---NO_ICON_SELECTED---";

const statItemFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(100, {message: "Title too long."}),
  value: z.string().min(1, { message: "Value is required." }).max(50, {message: "Value too long."}),
  iconName: z.string().optional(),
  sortOrder: z.coerce.number().int().optional().default(0),
});

type StatItemFormValues = z.infer<typeof statItemFormSchema>;

export default function EditStatItemPage() {
  const router = useRouter();
  const params = useParams();
  const statId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [statItem, setStatItem] = useState<StatItem | null>(null);

  const form = useForm<StatItemFormValues>({
    resolver: zodResolver(statItemFormSchema),
    defaultValues: {
      title: "",
      value: "",
      iconName: undefined, // Use undefined for no initial selection
      sortOrder: 0,
    },
  });

  const fetchStatData = useCallback(async () => {
    if (!statId) return;
    setIsFetching(true);
    try {
      const data = await getStatItemById(statId);
      if (data) {
        setStatItem(data);
        form.reset({
            title: data.title || "",
            value: data.value || "",
            iconName: data.iconName || undefined, // Handle undefined from DB
            sortOrder: data.sortOrder || 0,
        });
      } else {
        toast({ title: "Error", description: "Stat item not found.", variant: "destructive" });
        router.push('/admin/dashboard/stats');
      }
    } catch (error) {
      toast({ title: "Error fetching stat item", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  }, [statId, form, toast, router]);

  useEffect(() => {
    fetchStatData();
  }, [fetchStatData]);

  async function onSubmit(data: StatItemFormValues) {
    if (!statItem) return;
    setIsLoading(true);
    
    const updateData: Partial<CreateStatItemData> = {
      title: data.title,
      value: data.value,
      iconName: data.iconName === NO_ICON_VALUE ? undefined : data.iconName,
      sortOrder: data.sortOrder,
    };

    try {
      const updatedStat = await updateStatItem(statItem.id, updateData);
      toast({
          title: "Stat Item Updated",
          description: `Stat "${updatedStat?.title}" has been updated successfully.`,
      });
      router.push('/admin/dashboard/stats'); 
    } catch (error) {
       toast({
        title: "Error Updating Stat Item",
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

  if (!statItem && !isFetching) {
     return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Stat item not found or could not be loaded.</p>
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
          Back to Stats
        </Button>
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
            <BarChart3 className="mr-3 h-6 w-6 text-primary"/>Edit Stat Item
        </h1>
        <p className="text-muted-foreground">Update details for the stat: {statItem?.title}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Stat Item Details</CardTitle>
               <CardDescription>Editing stat item: {statItem?.title}</CardDescription>
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
              <Button type="submit" className="button-primary" disabled={isLoading || isFetching}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating Stat...</>) : (<><Save className="mr-2 h-4 w-4" /> Update Stat Item</>)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FadeIn>
  );
}
