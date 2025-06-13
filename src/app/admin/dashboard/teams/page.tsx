
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Eye, Loader2, Users as UsersIcon } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { useToast } from "@/hooks/use-toast";
import type { TeamMember } from '@/types';
import { getTeamMembers, deleteTeamMember } from '@/services/teamService';
import { useRouter } from 'next/navigation';
import { AdminTablePageSkeleton } from '@/components/admin/AdminTablePageSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function AdminTeamsPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchTeams = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTeamMembers();
      setTeamMembers(data);
    } catch (error: any) {
      console.error("Failed to fetch team members:", error);
      toast({ title: "Error Loading Team Members", description: error.message || "Failed to load team members.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleDeleteTeamMember = async (memberId: string, memberName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the team member "${memberName}"?`);
    if (confirmed) {
      try {
        await deleteTeamMember(memberId);
        setTeamMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
        toast({
          title: "Team Member Deleted",
          description: `Team member "${memberName}" has been removed.`,
        });
      } catch (error: any) {
        toast({
          title: "Error Deleting Member",
          description: (error as Error).message || `Failed to delete "${memberName}".`,
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
        <AdminTablePageSkeleton
            pageTitleText="Manage Team Members"
            pageDescriptionText="Add, edit, or remove team members."
            TitleIcon={UsersIcon}
            mainButtonText="Add New Member"
            cardTitleText="All Team Members"
            cardDescriptionText="A list of all team members of WebCraftingExperts."
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
                <UsersIcon className="mr-3 h-6 w-6 text-primary" />
                Manage Team Members
            </h1>
            <p className="text-muted-foreground">Add, edit, or remove team members.</p>
          </div>
          <Link href="/admin/dashboard/teams/new" className="w-full sm:w-auto">
            <Button className="button-primary w-full sm:w-auto">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Member
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Team Members</CardTitle>
            <CardDescription>A list of all team members of WebCraftingExperts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] min-w-[80px]">Avatar</TableHead>
                    <TableHead className="min-w-[200px]">Name</TableHead>
                    <TableHead className="min-w-[200px]">Role</TableHead>
                    <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.length === 0 && !isLoading && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No team members found. Add your first member!</TableCell></TableRow>
                  )}
                  {teamMembers.map((member) => {
                    let finalSrc = member.imageUrl;
                    if (member.imageUrl && (member.imageUrl.includes("/_next/image?url=") || member.imageUrl.includes("localhost/_next/image?url="))) {
                        try {
                          const urlObj = new URL(member.imageUrl, member.imageUrl.startsWith("/") ? (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000") : undefined);
                          const originalUrlEncoded = urlObj.searchParams.get("url");
                          if (originalUrlEncoded) {
                            finalSrc = decodeURIComponent(originalUrlEncoded);
                          }
                        } catch (e) {
                          console.warn("Failed to parse optimized image URL for admin team list, using original value:", member.imageUrl, e);
                        }
                    }
                    return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Image
                          src={finalSrc || 'https://placehold.co/40x40.png'}
                          alt={`Avatar of ${member.name}`}
                          width={40}
                          height={40}
                          data-ai-hint={member.dataAiHint || 'person avatar'}
                          className="rounded-full object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.role}</TableCell>
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/teams/edit/${member.id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {/* "View Public" link removed */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteTeamMember(member.id, member.name)}
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
