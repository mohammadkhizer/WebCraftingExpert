
"use client"; 

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Loader2, Link as LinkIconLucide } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FadeIn } from '@/components/motion/fade-in';
import { useToast } from "@/hooks/use-toast";
import type { FooterLink } from '@/types';
import { getAllFooterLinks, deleteFooterLink } from '@/services/footerLinkService';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { AdminTablePageSkeleton } from '@/components/admin/AdminTablePageSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminFooterLinksPage() {
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllFooterLinks();
      setFooterLinks(data);
    } catch (error: any) {
      console.error("Failed to fetch footer links:", error);
      toast({ title: "Error Loading Links", description: error.message || "Failed to load footer links.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleDeleteLink = async (linkId: string, linkLabel: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the footer link: "${linkLabel}"?`);
    if (confirmed) {
      try {
        await deleteFooterLink(linkId);
        setFooterLinks(prevLinks => prevLinks.filter(link => link.id !== linkId));
        toast({
          title: "Footer Link Deleted",
          description: `Link "${linkLabel}" has been removed.`,
        });
      } catch (error: any) {
         toast({
          title: "Error Deleting Link",
          description: error.message || `Failed to delete link "${linkLabel}".`,
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
        <AdminTablePageSkeleton
            pageTitleText="Manage Footer Links"
            pageDescriptionText="Add, edit, or remove links displayed in your website's footer."
            TitleIcon={LinkIconLucide}
            mainButtonText="Add New Footer Link"
            cardTitleText="All Footer Links"
            cardDescriptionText="List of links for the 'Quick Links' and 'Resources' sections of the footer."
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
                <LinkIconLucide className="mr-3 h-6 w-6 text-primary"/> Manage Footer Links
            </h1>
            <p className="text-muted-foreground">Add, edit, or remove links displayed in your website's footer.</p>
        </div>
        <Link href="/admin/dashboard/footer-links/new" className="w-full sm:w-auto">
            <Button className="button-primary w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Footer Link
            </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Footer Links</CardTitle>
          <CardDescription>List of links for the 'Quick Links' and 'Resources' sections of the footer.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Label</TableHead>
                  <TableHead className="min-w-[200px]">URL (Href)</TableHead>
                  <TableHead className="min-w-[120px]">Column</TableHead>
                  <TableHead className="min-w-[80px]">Order</TableHead>
                  <TableHead className="min-w-[150px]">Last Updated</TableHead>
                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {footerLinks.length === 0 && !isLoading && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No footer links found. Add your first link!</TableCell></TableRow>
                )}
                {footerLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.label}</TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-xs"><a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.href}</a></TableCell>
                    <TableCell>
                        <Badge variant={link.column === 'quick-links' ? 'secondary' : 'outline'} className="capitalize">
                            {link.column.replace('-', ' ')}
                        </Badge>
                    </TableCell>
                    <TableCell>{link.order}</TableCell>
                    <TableCell>{link.updatedAt ? format(new Date(link.updatedAt), 'PP p') : (link.createdAt ? format(new Date(link.createdAt), 'PP p') : 'N/A')}</TableCell>
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/footer-links/edit/${link.id}`)}>
                               <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteLink(link.id, link.label)} 
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
