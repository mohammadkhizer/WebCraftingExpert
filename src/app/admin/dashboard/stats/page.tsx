
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Loader2, BarChart3, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FadeIn } from '@/components/motion/fade-in';
import { useToast } from "@/hooks/use-toast";
import type { StatItem } from '@/types';
import { getStatItems, deleteStatItem } from '@/services/statItemService';
import { getIconComponent } from '@/lib/iconUtils';
import { useRouter } from 'next/navigation';
import { AdminTablePageSkeleton } from '@/components/admin/AdminTablePageSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getStatItems();
      setStats(data);
    } catch (error: any) {
      console.error("Failed to fetch stats:", error);
      toast({ title: "Error Loading Stats", description: error.message || "Failed to load stats.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDeleteStat = async (statId: string, statTitle: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the stat: "${statTitle}"?`);
    if (confirmed) {
      try {
        await deleteStatItem(statId);
        setStats(prevStats => prevStats.filter(stat => stat.id !== statId));
        toast({
          title: "Stat Item Deleted",
          description: `Stat "${statTitle}" has been removed.`,
        });
      } catch (error: any) {
         toast({
          title: "Error Deleting Stat Item",
          description: error.message || `Failed to delete stat "${statTitle}".`,
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
        <AdminTablePageSkeleton
            pageTitleText="Manage Stats"
            pageDescriptionText="Add, edit, or remove statistical items displayed on your website."
            TitleIcon={BarChart3}
            mainButtonText="Add New Stat"
            cardTitleText="All Stat Items"
            cardDescriptionText="List of statistical items. Sorted by sort order, then creation date."
            columnCount={4}
        />
    );
  }

  return (
    <FadeIn>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center">
                <BarChart3 className="mr-3 h-6 w-6 text-primary"/> Manage Stats
            </h1>
            <p className="text-muted-foreground">Add, edit, or remove statistical items displayed on your website.</p>
        </div>
        <Link href="/admin/dashboard/stats/new" className="w-full sm:w-auto">
            <Button className="button-primary w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Stat
            </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Stat Items</CardTitle>
          <CardDescription>List of statistical items. Sorted by sort order, then creation date.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Icon</TableHead>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead className="min-w-[150px]">Value</TableHead>
                  <TableHead className="min-w-[80px]">Sort Order</TableHead>
                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.length === 0 && !isLoading && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No stats found. Add your first stat item!</TableCell></TableRow>
                )}
                {stats.map((stat) => {
                  const IconComponent = stat.iconName ? getIconComponent(stat.iconName) : null;
                  return (
                  <TableRow key={stat.id}>
                    <TableCell>{IconComponent ? <IconComponent className="h-5 w-5 text-muted-foreground" /> : 'N/A'}</TableCell>
                    <TableCell className="font-medium">{stat.title}</TableCell>
                    <TableCell>{stat.value}</TableCell>
                    <TableCell>{stat.sortOrder}</TableCell>
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/stats/edit/${stat.id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteStat(stat.id, stat.title)}
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
