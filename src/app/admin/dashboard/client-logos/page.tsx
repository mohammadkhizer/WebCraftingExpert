
"use client"; 

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Loader2, Building } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FadeIn } from '@/components/motion/fade-in';
import { useToast } from "@/hooks/use-toast";
import type { ClientLogo } from '@/types';
import { getClientLogos, deleteClientLogo } from '@/services/clientLogoService';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { AdminTablePageSkeleton } from '@/components/admin/AdminTablePageSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminClientLogosPage() {
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchLogos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getClientLogos();
      setClientLogos(data);
    } catch (error: any) {
      console.error("Failed to fetch client logos:", error);
      toast({ title: "Error Loading Client Logos", description: error.message || "Failed to load client logos.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLogos();
  }, [fetchLogos]);

  const handleDeleteLogo = async (logoId: string, logoName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the client logo: "${logoName}"?`);
    if (confirmed) {
      try {
        await deleteClientLogo(logoId);
        setClientLogos(prevLogos => prevLogos.filter(logo => logo.id !== logoId));
        toast({
          title: "Client Logo Deleted",
          description: `Logo for "${logoName}" has been removed.`,
        });
      } catch (error: any) {
         toast({
          title: "Error Deleting Logo",
          description: error.message || `Failed to delete logo "${logoName}".`,
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
        <AdminTablePageSkeleton
            pageTitleText="Manage Client Logos"
            pageDescriptionText="Add, edit, or remove client/partner logos."
            TitleIcon={Building}
            mainButtonText="Add New Logo"
            cardTitleText="All Client Logos"
            cardDescriptionText="List of client and partner logos displayed on your website."
            columnCount={4} // Logo, Name, Website URL, Sort Order
        />
    );
  }

  return (
    <FadeIn>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center">
                <Building className="mr-3 h-6 w-6 text-primary"/> Manage Client Logos
            </h1>
            <p className="text-muted-foreground">Add, edit, or remove client/partner logos.</p>
        </div>
        <Link href="/admin/dashboard/client-logos/new" className="w-full sm:w-auto">
            <Button className="button-primary w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Logo
            </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Client Logos</CardTitle>
          <CardDescription>List of client and partner logos displayed on your website.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Logo</TableHead>
                  <TableHead className="min-w-[200px]">Company Name</TableHead>
                  <TableHead className="min-w-[200px]">Website URL</TableHead>
                  <TableHead className="min-w-[100px]">Sort Order</TableHead>
                  <TableHead className="min-w-[150px]">Last Updated</TableHead>
                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientLogos.length === 0 && !isLoading && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No client logos found. Add your first logo!</TableCell></TableRow>
                )}
                {clientLogos.map((logo) => (
                  <TableRow key={logo.id}>
                    <TableCell>
                      <Image
                        src={logo.logoUrl || 'https://placehold.co/50x50.png'} 
                        alt={logo.name || 'Company Logo'}
                        width={50}
                        height={50}
                        className="rounded-md object-contain h-12 w-auto"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{logo.name}</TableCell>
                    <TableCell>
                        <a href={logo.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block max-w-xs">
                            {logo.websiteUrl}
                        </a>
                    </TableCell>
                    <TableCell>{logo.sortOrder}</TableCell>
                    <TableCell>{logo.updatedAt ? format(new Date(logo.updatedAt), 'PP p') : (logo.createdAt ? format(new Date(logo.createdAt), 'PP p') : 'N/A')}</TableCell>
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/client-logos/edit/${logo.id}`)}>
                               <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteLogo(logo.id, logo.name)} 
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
