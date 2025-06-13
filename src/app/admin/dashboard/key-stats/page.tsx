
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, TrendingUp } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { getKeyStats, updateKeyStats } from '@/services/siteKeyStatsService';
import type { SiteKeyStats, UpdateSiteKeyStatsData } from '@/types';

const keyStatsFormSchema = z.object({
  satisfiedClients: z.string().min(1, "Satisfied clients value is required.").max(20, "Too long"),
  projectsCompleted: z.string().min(1, "Projects completed value is required.").max(20, "Too long"),
  yearsOfExperience: z.string().min(1, "Years of experience value is required.").max(20, "Too long"),
});

type KeyStatsFormValues = z.infer<typeof keyStatsFormSchema>;

export default function ManageKeyStatsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<KeyStatsFormValues>({
    resolver: zodResolver(keyStatsFormSchema),
    defaultValues: {
      satisfiedClients: '0+',
      projectsCompleted: '0+',
      yearsOfExperience: '0+',
    },
  });

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const stats = await getKeyStats();
        form.reset({
          satisfiedClients: stats.satisfiedClients,
          projectsCompleted: stats.projectsCompleted,
          yearsOfExperience: stats.yearsOfExperience,
        });
      } catch (error: any) {
        toast({
          title: "Error Loading Stats",
          description: error.message || "Failed to load key stats.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [form, toast]);

  async function onSubmit(data: KeyStatsFormValues) {
    setIsSaving(true);
    try {
      const updateData: UpdateSiteKeyStatsData = data;
      await updateKeyStats(updateData);
      toast({
        title: "Key Stats Updated",
        description: "Your key statistics have been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error Saving Stats",
        description: error.message || "Failed to save key stats.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6 mb-8">
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
          <TrendingUp className="mr-3 h-6 w-6 text-primary" /> Manage Key Statistics
        </h1>
        <p className="text-muted-foreground">
          Edit the values displayed in the statistics section on your Home page (e.g., "50+", "100K").
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Statistic Values</CardTitle>
              <CardDescription>These values appear on your public-facing website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="satisfiedClients" render={({ field }) => (
                <FormItem>
                  <FormLabel>Satisfied Clients Value</FormLabel>
                  <FormControl><Input placeholder="e.g., 50+" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="projectsCompleted" render={({ field }) => (
                <FormItem>
                  <FormLabel>Projects Completed Value</FormLabel>
                  <FormControl><Input placeholder="e.g., 100+" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="yearsOfExperience" render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience Value</FormLabel>
                  <FormControl><Input placeholder="e.g., 5+" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="button-primary" disabled={isSaving || isLoading}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Key Stats
            </Button>
          </div>
        </form>
      </Form>
    </FadeIn>
  );
}
