
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Eye, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FadeIn } from '@/components/motion/fade-in';
import { useToast } from "@/hooks/use-toast";
import type { Project } from '@/types';
import { getProjects, deleteProject, deleteManyProjects } from '@/services/projectService';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminTablePageSkeleton } from '@/components/admin/AdminTablePageSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';


export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null); // For single delete
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error: any) {
      console.error("Failed to fetch projects:", error);
      toast({ title: "Error Loading Projects", description: error.message || "Failed to load projects.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSelectProject = (projectId: string, checked: boolean) => {
    setSelectedProjectIds(prevSelected =>
      checked
        ? [...prevSelected, projectId]
        : prevSelected.filter(id => id !== projectId)
    );
  };

  const handleSelectAllProjects = (checked: boolean) => {
    if (checked) {
      setSelectedProjectIds(projects.map(p => p.id));
    } else {
      setSelectedProjectIds([]);
    }
  };
  
  const isAllProjectsSelected = projects.length > 0 && selectedProjectIds.length === projects.length;

  const openSingleDeleteDialog = (id: string) => {
    setProjectToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmSingleDelete = async () => {
    if (!projectToDelete) return;
    const project = projects.find(p => p.id === projectToDelete);
    if (!project) return;

    try {
      await deleteProject(projectToDelete);
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectToDelete));
      setSelectedProjectIds(prev => prev.filter(id => id !== projectToDelete)); // Also update selection
      toast({
        title: "Project Deleted",
        description: `Project "${project.title}" has been removed.`,
      });
    } catch (error: any) {
       toast({
        title: "Error Deleting Project",
        description: error.message || `Failed to delete project "${project.title}".`,
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };
  
  const openBatchDeleteDialog = () => {
    if (selectedProjectIds.length === 0) {
      toast({ title: "No Projects Selected", description: "Please select projects to delete.", variant: "destructive" });
      return;
    }
    setIsBatchDeleteDialogOpen(true);
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedProjectIds.length === 0) return;
    try {
      const result = await deleteManyProjects(selectedProjectIds);
      if (result.success) {
        setProjects(prevProjects => prevProjects.filter(p => !selectedProjectIds.includes(p.id)));
        toast({
          title: "Projects Deleted",
          description: `${result.deletedCount} project(s) have been removed.`,
        });
        setSelectedProjectIds([]);
      } else {
        throw new Error(result.error || "Failed to delete selected projects.");
      }
    } catch (error: any) {
       toast({
        title: "Error Deleting Projects",
        description: error.message || "Failed to delete selected projects.",
        variant: "destructive",
      });
    } finally {
      setIsBatchDeleteDialogOpen(false);
    }
  };


  if (isLoading) {
    return (
        <AdminTablePageSkeleton
            pageTitleText="Manage Projects"
            pageDescriptionText="Add, edit, or showcase your agency's projects."
            TitleIcon={FileText}
            mainButtonText="Add New Project"
            cardTitleText="All Projects"
            cardDescriptionText="A list of all projects undertaken by ByteBrusters."
            columnCount={5}
        />
    );
  }

  return (
    <FadeIn>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center">
                <FileText className="mr-3 h-6 w-6 text-primary" />
                Manage Projects
            </h1>
            <p className="text-muted-foreground">Add, edit, or showcase your agency's projects.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {selectedProjectIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={openBatchDeleteDialog}
              className="w-full sm:w-auto"
            >
              <Trash2 className="mr-2 h-5 w-5" /> Delete Selected ({selectedProjectIds.length})
            </Button>
          )}
          <Link href="/admin/dashboard/projects/new" className="w-full sm:w-auto">
              <Button className="button-primary w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New Project
              </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>A list of all projects undertaken by ByteBrusters.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                     <Checkbox
                        checked={isAllProjectsSelected}
                        onCheckedChange={(value) => handleSelectAllProjects(!!value)}
                        aria-label="Select all projects"
                        disabled={projects.length === 0}
                      />
                  </TableHead>
                  <TableHead className="w-[80px] min-w-[80px]">Image</TableHead>
                  <TableHead className="min-w-[200px]">Project Name</TableHead>
                  <TableHead className="min-w-[150px]">Developer</TableHead>
                  <TableHead className="min-w-[150px]">Client</TableHead>
                  <TableHead className="min-w-[120px]">Status</TableHead>
                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 && !isLoading && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No projects found. Add your first project!</TableCell></TableRow>
                )}
                {projects.map((project) => (
                  <TableRow key={project.id} data-state={selectedProjectIds.includes(project.id) ? "selected" : ""}>
                    <TableCell>
                       <Checkbox
                          checked={selectedProjectIds.includes(project.id)}
                          onCheckedChange={(value) => handleSelectProject(project.id, !!value)}
                          aria-label={`Select project ${project.title}`}
                        />
                    </TableCell>
                    <TableCell>
                      <Image
                          src={project.imageUrl || 'https://placehold.co/40x40.png'}
                          alt={project.title || 'Project image'}
                          width={40}
                          height={40}
                          data-ai-hint={project.dataAiHint || 'logo abstract'}
                          className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>{project.developerName}</TableCell>
                    <TableCell>{project.client || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={
                          project.status === 'Completed' ? 'default' :
                          project.status === 'In Progress' ? 'secondary' :
                          project.status === 'Planning' ? 'outline' :
                          project.status === 'On Hold' ? 'destructive' :
                          'outline'
                      } className="capitalize">
                          {project.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/projects/edit/${project.id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> View Public
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openSingleDeleteDialog(project.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              "{projects.find(p => p.id === projectToDelete)?.title || 'selected project'}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSingleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Delete Confirmation Dialog */}
      <AlertDialog open={isBatchDeleteDialogOpen} onOpenChange={setIsBatchDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Projects?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedProjectIds.length} project(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBatchDelete} className="bg-destructive hover:bg-destructive/90">
              Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
    </FadeIn>
  );
}
