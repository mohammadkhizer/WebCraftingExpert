
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save, Image as ImageIcon, User } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { getProjectById, updateProject } from '@/services/projectService';
import type { Project, CreateProjectData } from '@/types';

const projectFormSchema = z.object({
  title: z.string().min(3, { message: "Project name must be at least 3 characters." }),
  client: z.string().optional().or(z.literal('')),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(1000, { message: "Description must not exceed 1000 characters."}),
  longDescription: z.string().max(5000, { message: "Long description too long"}).optional().or(z.literal('')),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
  dataAiHint: z.string().max(50, {message: "AI Hint too long"}).optional().or(z.literal('')),
  developerName: z.string().min(2, { message: "Developer name must be at least 2 characters." }),
  status: z.enum(["Planning", "In Progress", "Completed", "On Hold"], { required_error: "Please select a status." }),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
  technologies: z.string().optional().transform(val => val ? val.split(',').map(tech => tech.trim()).filter(tech => tech) : []),
  liveUrl: z.string().url({ message: "Invalid live URL."}).optional().or(z.literal('')),
  repoUrl: z.string().url({ message: "Invalid repository URL."}).optional().or(z.literal('')),
  date: z.string().refine(val => !val || !isNaN(Date.parse(val)) || /^\d{4}-\d{2}-\d{2}$/.test(val), { message: "Invalid date format. Use YYYY-MM-DD or leave empty." }).optional().or(z.literal('')),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [project, setProject] = useState<Project | null>(null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      client: "",
      description: "",
      longDescription: "",
      imageUrl: "",
      dataAiHint: "",
      developerName: "", // Default to empty, will be filled by fetched data or remains as required.
      status: "Planning",
      tags: [],
      technologies: [],
      liveUrl: "",
      repoUrl: "",
      date: "",
    },
  });

  const fetchProjectData = useCallback(async () => {
    if (!projectId) return;
    setIsFetching(true);
    try {
      const data = await getProjectById(projectId);
      if (data) {
        setProject(data);
        // Ensure optional string fields are reset with "" instead of undefined
        form.reset({
          title: data.title || "",
          client: data.client || "",
          description: data.description || "",
          longDescription: data.longDescription || "",
          imageUrl: data.imageUrl || "",
          dataAiHint: data.dataAiHint || "",
          developerName: data.developerName || "",
          status: data.status || "Planning",
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
          technologies: Array.isArray(data.technologies) ? data.technologies.join(', ') : '',
          liveUrl: data.liveUrl || "",
          repoUrl: data.repoUrl || "",
          date: data.date ? data.date.split('T')[0] : "",
        });
      } else {
        toast({ title: "Error", description: "Project not found.", variant: "destructive" });
        router.push('/admin/dashboard/projects');
      }
    } catch (error) {
      toast({ title: "Error fetching project", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  }, [projectId, form, toast, router]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  async function onSubmit(data: ProjectFormValues) {
    if (!project) return;
    setIsLoading(true);

    const updateData: Partial<CreateProjectData> = {
        ...data,
        // Zod transform already handles conversion of tags and technologies to array
    };

    try {
      const updatedProject = await updateProject(project.id, updateData);
      toast({
          title: "Project Updated",
          description: `Project "${updatedProject?.title}" has been updated successfully.`,
      });
      router.push('/admin/dashboard/projects');
    } catch (error) {
       toast({
        title: "Error Updating Project",
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

  if (!project && !isFetching) {
     return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Project not found or could not be loaded.</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }


  return (
    <FadeIn>
      <div className="mb-6">
         <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Edit Project</h1>
        <p className="text-muted-foreground">Update the details for the project: {project?.title}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>Modify the project details below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Project Title</FormLabel><FormControl><Input placeholder="e.g., Enterprise E-commerce Platform" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="client" render={({ field }) => (
                    <FormItem><FormLabel>Client Name (Optional)</FormLabel><FormControl><Input placeholder="e.g., Retail Corp" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="developerName" render={({ field }) => (
                  <FormItem><FormLabel>Developer Name</FormLabel><FormControl><div className="flex items-center space-x-2"><User className="h-5 w-5 text-muted-foreground" /><Input placeholder="e.g., Jane Doe" {...field} /></div></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Short Description (for cards)</FormLabel><FormControl><Textarea placeholder="Brief summary of the project..." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="longDescription" render={({ field }) => (
                  <FormItem><FormLabel>Detailed Description (for project page, Optional)</FormLabel><FormControl><Textarea placeholder="In-depth description of the project, goals, features, outcomes..." className="min-h-[150px]" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select project status" /></SelectTrigger></FormControl><SelectContent>
                        <SelectItem value="Planning">Planning</SelectItem><SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem><SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent></Select><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem><FormLabel>Image URL (Optional)</FormLabel><FormControl><div className="flex items-center space-x-2"><ImageIcon className="h-5 w-5 text-muted-foreground" /><Input placeholder="https://placehold.co/600x400.png" {...field} /></div></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="dataAiHint" render={({ field }) => (
                  <FormItem><FormLabel>Image AI Hint (Optional)</FormLabel><FormControl><Input placeholder="e.g., website e-commerce (max 2 words)" {...field} /></FormControl><FormMessage /><p className="text-xs text-muted-foreground pt-1">One or two keywords for image generation.</p></FormItem>
              )}/>
              <FormField control={form.control} name="tags" render={({ field }) => (
                  <FormItem><FormLabel>Tags (comma-separated, Optional)</FormLabel><FormControl><Input placeholder="e.g., E-commerce, Web Dev, React" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="technologies" render={({ field }) => (
                <FormItem><FormLabel>Technologies Used (comma-separated, Optional)</FormLabel><FormControl><Input placeholder="e.g., Next.js, Tailwind, Stripe" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="liveUrl" render={({ field }) => (
                <FormItem><FormLabel>Live Site URL (Optional)</FormLabel><FormControl><Input placeholder="https://example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="repoUrl" render={({ field }) => (
                <FormItem><FormLabel>Code Repository URL (Optional)</FormLabel><FormControl><Input placeholder="https://github.com/user/repo" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem><FormLabel>Completion Date (YYYY-MM-DD, Optional)</FormLabel><FormControl><Input placeholder="e.g., 2023-10-26" {...field} type="date" /></FormControl><FormMessage /></FormItem>
              )}/>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" className="button-primary" disabled={isLoading || isFetching}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating Project...</>) : (<><Save className="mr-2 h-4 w-4" /> Update Project</>)}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FadeIn>
  );
}

    