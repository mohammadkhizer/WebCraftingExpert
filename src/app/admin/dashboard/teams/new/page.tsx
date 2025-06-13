
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
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Linkedin, Twitter, Github, FileText, Info, Users, Briefcase, Star } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { addTeamMember, type CreateTeamMemberData } from '@/services/teamService';

const teamMemberFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  role: z.string().min(3, { message: "Role must be at least 3 characters." }),
  bio: z.string().min(10, { message: "Short bio must be at least 10 characters." }).max(500, { message: "Short bio too long" }),
  description: z.string().max(2000, { message: "Detailed description too long."}).optional().or(z.literal('')),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }).optional().or(z.literal('')),
  dataAiHint: z.string().max(50, {message: "AI Hint too long (e.g. 'man portrait')"}).optional().or(z.literal('')),
  skills: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(s => s) : []),
  qualifications: z.string().optional().transform(val => val ? val.split(',').map(q => q.trim()).filter(q => q) : []),
  projectsInvolved: z.string().optional().transform(val => val ? val.split(',').map(p => p.trim()).filter(p => p) : []),
  pastWork: z.string().optional().transform(val => val ? val.split(',').map(w => w.trim()).filter(w => w) : []),
  linkedinUrl: z.string().url({ message: "Invalid LinkedIn URL."}).optional().or(z.literal('')),
  twitterUrl: z.string().url({ message: "Invalid Twitter URL."}).optional().or(z.literal('')),
  githubUrl: z.string().url({ message: "Invalid GitHub URL."}).optional().or(z.literal('')),
  instagramUrl: z.string().url({ message: "Invalid Instagram URL."}).optional().or(z.literal('')),
  cvUrl: z.string().url({ message: "Invalid CV URL."}).optional().or(z.literal('')),
});

type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;

export default function AddNewTeamMemberPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: "",
      role: "",
      bio: "",
      description: "",
      imageUrl: "",
      dataAiHint: "person avatar",
      skills: [],
      qualifications: [],
      projectsInvolved: [],
      pastWork: [],
      linkedinUrl: "",
      twitterUrl: "",
      githubUrl: "",
      instagramUrl: "",
      cvUrl: "",
    },
  });

  async function onSubmit(data: TeamMemberFormValues) {
    setIsLoading(true);
    
    const newMemberData: CreateTeamMemberData = {
        name: data.name,
        role: data.role,
        bio: data.bio,
        description: data.description || "",
        imageUrl: data.imageUrl || `https://placehold.co/400x400.png?text=${encodeURIComponent(data.name.charAt(0))}`,
        dataAiHint: data.dataAiHint || 'person avatar',
        skills: data.skills || [],
        qualifications: data.qualifications || [],
        projectsInvolved: data.projectsInvolved || [],
        pastWork: data.pastWork || [],
        socials: {
            linkedin: data.linkedinUrl || undefined,
            twitter: data.twitterUrl || undefined,
            github: data.githubUrl || undefined,
            instagram: data.instagramUrl || undefined,
            cvUrl: data.cvUrl || undefined,
        }
    };

    try {
      const createdMember = await addTeamMember(newMemberData);
      toast({
          title: "Team Member Added",
          description: `Member "${createdMember.name}" has been added successfully.`,
      });
      form.reset();
      router.push('/admin/dashboard/teams'); 
    } catch (error: any) {
      toast({
        title: "Error Adding Member",
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
          Back to Teams
        </Button>
        <h1 className="text-2xl font-semibold text-foreground flex items-center">
          <Users className="mr-3 h-6 w-6 text-primary" /> Add New Team Member
        </h1>
        <p className="text-muted-foreground">Enter the details for the new team member.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g., Alex Smith" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem><FormLabel>Role / Position</FormLabel><FormControl><Input placeholder="e.g., Senior Developer" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
              <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem><FormLabel>Short Bio (for cards)</FormLabel><FormControl><Textarea placeholder="Brief introduction (max 500 chars)..." className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Detailed Description (for detail page, Optional)</FormLabel><FormControl><Textarea placeholder="In-depth profile, achievements, etc. (max 2000 chars)..." className="min-h-[150px]" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Avatar Image URL (Optional)</FormLabel><FormControl><div className="flex items-center space-x-2"><ImageIcon className="h-5 w-5 text-muted-foreground" /><Input placeholder="https://placehold.co/400x400.png" {...field} /></div></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="dataAiHint" render={({ field }) => (
                    <FormItem><FormLabel>Image AI Hint (Optional)</FormLabel><FormControl><Input placeholder="e.g., man software (max 2 words)" {...field} /></FormControl><FormMessage /><p className="text-xs text-muted-foreground pt-1">Keywords for avatar placeholder (e.g. "woman designer").</p></FormItem>
                )}/>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Professional Details (Optional)</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="skills" render={({ field }) => (
                <FormItem><FormLabel>Skills (comma-separated)</FormLabel><FormControl><Input placeholder="e.g., React, Node.js, Project Management" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="qualifications" render={({ field }) => (
                <FormItem><FormLabel>Qualifications (comma-separated)</FormLabel><FormControl><Input placeholder="e.g., B.Sc. Computer Science, AWS Certified Developer" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="projectsInvolved" render={({ field }) => (
                <FormItem><FormLabel>Projects Involved (comma-separated names/briefs)</FormLabel><FormControl><Input placeholder="e.g., Project Alpha, Client Beta Integration" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="pastWork" render={({ field }) => (
                <FormItem><FormLabel>Past Work Experience (comma-separated descriptions)</FormLabel><FormControl><Input placeholder="e.g., Lead Dev at TechCorp, Software Engineer at Innovate Ltd" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Social & CV Links (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Linkedin className="mr-2 h-4 w-4 text-muted-foreground"/>LinkedIn URL</FormLabel>
                    <FormControl><Input placeholder="https://linkedin.com/in/username" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="twitterUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Twitter className="mr-2 h-4 w-4 text-muted-foreground"/>Twitter (X) URL</FormLabel>
                    <FormControl><Input placeholder="https://x.com/username" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="githubUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Github className="mr-2 h-4 w-4 text-muted-foreground"/>GitHub URL</FormLabel>
                    <FormControl><Input placeholder="https://github.com/username" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Info className="mr-2 h-4 w-4 text-muted-foreground"/>Instagram URL</FormLabel> 
                    <FormControl><Input placeholder="https://instagram.com/username" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="cvUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><FileText className="mr-2 h-4 w-4 text-muted-foreground"/>CV Link (PDF URL)</FormLabel>
                    <FormControl><Input placeholder="https://example.com/cv.pdf" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
            </CardContent>
          </Card>
          <CardFooter className="flex justify-end border-t pt-6">
              <Button type="submit" className="button-primary" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : (<><Save className="mr-2 h-4 w-4" /> Save Team Member</>)}
              </Button>
            </CardFooter>
        </form>
      </Form>
    </FadeIn>
  );
}
