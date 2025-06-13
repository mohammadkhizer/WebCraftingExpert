
"use client"; 

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Loader2, Bot } from 'lucide-react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FadeIn } from '@/components/motion/fade-in';
import { useToast } from "@/hooks/use-toast";
import type { ChatbotRule } from '@/types';
import { getChatbotRules, deleteChatbotRule } from '@/services/chatbotRuleService';
import { useRouter } from 'next/navigation';
import { AdminTablePageSkeleton } from '@/components/admin/AdminTablePageSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function AdminChatbotRulesPage() {
  const [rules, setRules] = useState<ChatbotRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getChatbotRules();
      setRules(data);
    } catch (error: any) {
      console.error("Failed to fetch chatbot rules:", error);
      toast({ title: "Error Loading Rules", description: error.message || "Failed to load chatbot rules.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleDeleteRule = async (ruleId: string) => {
    const ruleToDelete = rules.find(r => r.id === ruleId);
    const ruleKeywords = ruleToDelete ? ruleToDelete.keywords.slice(0,3).join(', ') + (ruleToDelete.keywords.length > 3 ? '...' : '') : 'the selected rule';
    const confirmed = window.confirm(`Are you sure you want to delete the rule for keywords: "${ruleKeywords}"?`);
    if (confirmed) {
      try {
        await deleteChatbotRule(ruleId);
        setRules(prevRules => prevRules.filter(rule => rule.id !== ruleId));
        toast({
          title: "Chatbot Rule Deleted",
          description: `Rule for "${ruleKeywords}" has been removed.`,
        });
      } catch (error: any) {
         toast({
          title: "Error Deleting Rule",
          description: error.message || `Failed to delete rule for "${ruleKeywords}".`,
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
        <AdminTablePageSkeleton
            pageTitleText="Manage Chatbot Rules"
            pageDescriptionText="Define keywords and responses for the website chatbot."
            TitleIcon={Bot}
            mainButtonText="Add New Rule"
            cardTitleText="All Chatbot Rules"
            cardDescriptionText="List of all chatbot rules, sorted by priority."
            columnCount={3} // Keywords, Response, Priority
        />
    );
  }

  return (
    <FadeIn>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center">
                <Bot className="mr-3 h-6 w-6 text-primary"/> Manage Chatbot Rules
            </h1>
            <p className="text-muted-foreground">Define keywords and responses for the website chatbot.</p>
        </div>
        <Link href="/admin/dashboard/chatbot/new" className="w-full sm:w-auto">
            <Button className="button-primary w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Rule
            </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Chatbot Rules</CardTitle>
          <CardDescription>List of all chatbot rules, sorted by priority (lower number = higher priority).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Keywords (comma-separated)</TableHead>
                  <TableHead className="min-w-[300px]">Response (Snippet)</TableHead>
                  <TableHead className="min-w-[80px]">Priority</TableHead>
                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.length === 0 && !isLoading && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No chatbot rules found. Add your first rule!</TableCell></TableRow>
                )}
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-wrap gap-1">
                        {rule.keywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                        {rule.response.length > 100 ? `${rule.response.substring(0, 100)}...` : rule.response}
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
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
                            <DropdownMenuItem onClick={() => router.push(`/admin/dashboard/chatbot/edit/${rule.id}`)}>
                               <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteRule(rule.id)} 
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
