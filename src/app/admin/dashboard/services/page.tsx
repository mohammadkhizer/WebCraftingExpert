
"use client"; 

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Eye, Loader2, type LucideIcon, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FadeIn } from '@/components/motion/fade-in';
import { useToast } from "@/hooks/use-toast";
import type { Service } from '@/types';
import { getServices, deleteService } from '@/services/serviceService';
import { getIconComponent } from '@/lib/iconUtils'; 
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { AdminTablePageSkeleton } from '@/components/admin/AdminTablePageSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';


export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getServices();
      setServices(data);
    } catch (error: any) {
      console.error("Failed to fetch services:", error);
      toast({ title: "Error Loading Services", description: error.message || "Failed to load services.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleDeleteService = async (serviceId: string, serviceName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the service "${serviceName}"?`);
    if (confirmed) {
      try {
        await deleteService(serviceId);
        setServices(prevServices => prevServices.filter(service => service.id !== serviceId));
        toast({
          title: "Service Deleted",
          description: `Service "${serviceName}" has been removed.`,
        });
      } catch (error: any) {
        toast({
          title: "Error Deleting Service",
          description: error.message || `Failed to delete service "${serviceName}".`,
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
        <AdminTablePageSkeleton
            pageTitleText="Manage Services"
            pageDescriptionText="Add, edit, or remove service offerings."
            TitleIcon={Briefcase}
            mainButtonText="Add New Service"
            cardTitleText="All Services"
            cardDescriptionText="A list of all services offered by ByteBrusters."
            columnCount={3}
        />
    );
  }

  return (
    <FadeIn>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center">
                <Briefcase className="mr-3 h-6 w-6 text-primary" />
                Manage Services
            </h1>
            <p className="text-muted-foreground">Add, edit, or remove service offerings.</p>
        </div>
        <Link href="/admin/dashboard/services/new" className="w-full sm:w-auto">
            <Button className="button-primary w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Service
            </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
          <CardDescription>A list of all services offered by ByteBrusters.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 min-w-[50px]">Icon</TableHead>
                  <TableHead className="min-w-[200px]">Service Name</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[150px]">Last Updated</TableHead>
                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.length === 0 && !isLoading && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No services found. Add your first service!</TableCell></TableRow>
                )}
                {services.map((service) => {
                  const IconComponent = service.iconName ? getIconComponent(service.iconName) : null;
                  return (
                  <TableRow key={service.id}>
                    <TableCell>{IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}</TableCell>
                    <TableCell className="font-medium">{service.title}</TableCell>
                    <TableCell>
                      <Badge variant={service.status === 'Active' ? 'default' : 'outline'} className="capitalize">
                          {service.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{service.lastUpdated ? format(new Date(service.lastUpdated), 'PP p') : 'N/A'}</TableCell>
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/services/edit/${service.id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/services/${service.id}`)}>
                              <Eye className="mr-2 h-4 w-4" /> View Public
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteService(service.id, service.title)} 
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
    </FadeIn>
  );
}
