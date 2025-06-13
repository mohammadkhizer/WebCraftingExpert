
"use client"; 

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Loader2, Quote, Star, EyeOff, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FadeIn } from '@/components/motion/fade-in';
import { useToast } from "@/hooks/use-toast";
import type { Testimonial } from '@/types';
import { getAllTestimonials, deleteTestimonial } from '@/services/testimonialService';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { AdminTablePageSkeleton } from '@/components/admin/AdminTablePageSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchTestimonials = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllTestimonials();
      setTestimonials(data);
    } catch (error: any) {
      console.error("Failed to fetch testimonials:", error);
      toast({ title: "Error Loading Testimonials", description: error.message || "Failed to load testimonials.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleDeleteTestimonial = async (testimonialId: string, authorName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the testimonial by "${authorName}"?`);
    if (confirmed) {
      try {
        await deleteTestimonial(testimonialId);
        setTestimonials(prev => prev.filter(item => item.id !== testimonialId));
        toast({
          title: "Testimonial Deleted",
          description: `Testimonial by "${authorName}" has been removed.`,
        });
      } catch (error: any) {
         toast({
          title: "Error Deleting Testimonial",
          description: error.message || `Failed to delete testimonial by "${authorName}".`,
          variant: "destructive",
        });
      }
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-muted-foreground text-xs">N/A</span>;
    return (
      <span className="inline-flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`}
          />
        ))}
      </span>
    );
  };


  if (isLoading) {
    return (
        <AdminTablePageSkeleton
            pageTitleText="Manage Testimonials"
            pageDescriptionText="Add, edit, or remove client testimonials."
            TitleIcon={Quote}
            mainButtonText="Add New Testimonial"
            cardTitleText="All Testimonials"
            cardDescriptionText="List of all client testimonials."
            columnCount={6} // Avatar, Author, Role, Text, Rating, Visibility
        />
    );
  }

  return (
    <FadeIn>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center">
                <Quote className="mr-3 h-6 w-6 text-primary"/> Manage Testimonials
            </h1>
            <p className="text-muted-foreground">Add, edit, or remove client testimonials.</p>
        </div>
        <Link href="/admin/dashboard/testimonials/new" className="w-full sm:w-auto">
            <Button className="button-primary w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Testimonial
            </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Testimonials</CardTitle>
          <CardDescription>List of all client testimonials. Visible testimonials will appear on the homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Avatar</TableHead>
                  <TableHead className="min-w-[150px]">Author</TableHead>
                  <TableHead className="min-w-[150px]">Role</TableHead>
                  <TableHead className="min-w-[250px]">Testimonial (Snippet)</TableHead>
                  <TableHead className="min-w-[100px]">Rating</TableHead>
                  <TableHead className="min-w-[100px]">Visibility</TableHead>
                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.length === 0 && !isLoading && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No testimonials found. Add your first testimonial!</TableCell></TableRow>
                )}
                {testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>
                      <Image
                        src={testimonial.imageUrl || 'https://placehold.co/40x40.png'}
                        alt={testimonial.authorName || 'Author image'}
                        width={40}
                        height={40}
                        data-ai-hint={testimonial.dataAiHint || 'person portrait'}
                        className="rounded-full object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{testimonial.authorName}</TableCell>
                    <TableCell>{testimonial.authorRole}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                        {testimonial.testimonialText.length > 100 ? `${testimonial.testimonialText.substring(0, 100)}...` : testimonial.testimonialText}
                    </TableCell>
                    <TableCell>{renderStars(testimonial.rating)}</TableCell>
                    <TableCell>
                      <Badge variant={testimonial.isVisible ? 'default' : 'outline'}>
                        {testimonial.isVisible ? <Eye className="mr-1 h-3 w-3" /> : <EyeOff className="mr-1 h-3 w-3" />}
                        {testimonial.isVisible ? 'Visible' : 'Hidden'}
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/testimonials/edit/${testimonial.id}`)}>
                               <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTestimonial(testimonial.id, testimonial.authorName)} 
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
    </div>
    </FadeIn>
  );
}
