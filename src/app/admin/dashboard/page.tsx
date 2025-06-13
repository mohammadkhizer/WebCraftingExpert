
"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Users as TeamIconLucide, BadgeAlert, Loader2, UserCircle, FileText, MessageSquareText, TrendingUp, FileQuestion, PlusCircle, MessageSquare, Settings, HelpCircle, Link as LinkIconLucide, BarChart3, Home, Info, Users as UsersIcon, ShieldCheck, Quote, Building } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

import { getServices } from '@/services/serviceService';
import { getProjects } from '@/services/projectService';
import { getContactMessages } from '@/services/contactService';
import { getTeamMembers } from '@/services/teamService';
import { countAllFeedbacks } from '@/services/feedbackService';
import { countNewServiceInquiries } from '@/services/serviceInquiryService';
import type { ContactMessage } from '@/types';

interface Stat {
  title: string;
  value: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
  highlight?: boolean;
  valueColor?: string;
  description?: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        getServices(),
        getProjects(),
        getContactMessages(),
        getTeamMembers(),
        countAllFeedbacks(),
        countNewServiceInquiries(),
      ]);

      const servicesData = results[0].status === 'fulfilled' ? results[0].value : [];
      const projectsData = results[1].status === 'fulfilled' ? results[1].value : [];
      const messagesData = results[2].status === 'fulfilled' ? results[2].value as ContactMessage[] : [];
      const teamData = results[3].status === 'fulfilled' ? results[3].value : [];
      const feedbackCount = results[4].status === 'fulfilled' ? results[4].value : 0;
      const inquiriesCount = results[5].status === 'fulfilled' ? results[5].value : 0;

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const dataType = ['services', 'projects', 'messages', 'team members', 'feedback', 'inquiries'][index];
          console.error(`Failed to load ${dataType} for dashboard:`, (result.reason as Error).message);
           toast({
              title: `Error Loading ${dataType}`,
              description: `Could not load ${dataType} for the dashboard. ${(result.reason as Error).message}`,
              variant: "destructive",
          });
        }
      });

      const totalServices = servicesData.length;
      const totalProjects = projectsData.length;
      const newMessagesCount = messagesData.filter(msg => msg.status === 'New').length;
      const totalTeamMembers = teamData.length;

      setStats([
        { title: 'Total Services', value: totalServices.toString(), icon: Briefcase, href: '/admin/dashboard/services', color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
        { title: 'Total Projects', value: totalProjects.toString(), icon: FileText, href: '/admin/dashboard/projects', color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30 dark:text-green-400' },
        { title: 'Team Members', value: totalTeamMembers.toString(), icon: UserCircle, href: '/admin/dashboard/teams', color: 'text-indigo-500', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400' },
        { title: 'Contact Messages', value: `${newMessagesCount} New`, icon: MessageSquare, href: '/admin/dashboard/contact', color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400', highlight: newMessagesCount > 0, valueColor: newMessagesCount > 0 ? 'text-destructive' : 'text-foreground' },
        { title: 'Total Feedback', value: feedbackCount.toString(), icon: MessageSquareText, href: '/admin/dashboard/feedback', color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400', highlight: feedbackCount > 0 },
        { title: 'New Inquiries', value: inquiriesCount.toString(), icon: FileQuestion, href: '/admin/dashboard/inquiries', color: 'text-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400', highlight: inquiriesCount > 0, valueColor: inquiriesCount > 0 ? 'text-destructive' : 'text-foreground' },
      ]);
    } catch (error: any) {
      console.error("Failed to load dashboard data due to an unexpected error:", error.message);
      toast({
          title: "Dashboard Error",
          description: "An unexpected error occurred while loading dashboard data.",
          variant: "destructive",
      });
      setStats([]); // Ensure stats is an empty array on error to prevent issues with .map
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's a summary of your ByteBrusters's activities.</p>
        </div>
      </FadeIn>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {stats.map((stat, index) => (
          <FadeIn key={stat.title} delay={index * 100}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                    {stat.highlight && stat.title === 'Contact Messages'
                      ? <BadgeAlert className={`h-5 w-5 ${stat.color}`} />
                      : <stat.icon className={`h-5 w-5 ${stat.color}`} />}
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.valueColor || 'text-foreground'}`}>{stat.value}</div>
                <Link href={stat.href} className="text-xs text-primary hover:underline">
                  View Details
                </Link>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>

      <div className="grid lg:grid-cols-1 gap-6">
        <FadeIn delay={(stats.length + 2) * 100}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Perform common tasks quickly.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="w-full justify-start text-left hover:bg-accent/50">
                <Link href="/admin/dashboard/services/new">
                  <PlusCircle className="mr-2 h-4 w-4 text-primary" /> Add New Service
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-left hover:bg-accent/50">
                <Link href="/admin/dashboard/projects/new">
                  <PlusCircle className="mr-2 h-4 w-4 text-primary" /> Add New Project
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-left hover:bg-accent/50">
                <Link href="/admin/dashboard/teams/new">
                  <PlusCircle className="mr-2 h-4 w-4 text-primary" /> Add New Team Member
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-left hover:bg-accent/50">
                <Link href="/admin/dashboard/faq/new">
                  <PlusCircle className="mr-2 h-4 w-4 text-primary" /> Add New FAQ
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-left hover:bg-accent/50">
                 <Link href="/admin/dashboard/stats/new">
                  <PlusCircle className="mr-2 h-4 w-4 text-primary" /> Add New Stat Item
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-left hover:bg-accent/50">
                <Link href="/admin/dashboard/footer-links/new">
                  <PlusCircle className="mr-2 h-4 w-4 text-primary" /> Add New Footer Link
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-left hover:bg-accent/50">
                <Link href="/admin/dashboard/testimonials/new">
                  <PlusCircle className="mr-2 h-4 w-4 text-primary" /> Add New Testimonial
                </Link>
              </Button>
               <Button asChild variant="outline" className="w-full justify-start text-left hover:bg-accent/50">
                <Link href="/admin/dashboard/client-logos/new">
                  <PlusCircle className="mr-2 h-4 w-4 text-primary" /> Add New Client Logo
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-left hover:bg-accent/50">
                 <Link href="/admin/dashboard/contact">
                    <MessageSquare className="mr-2 h-4 w-4 text-primary"/> View Messages
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-left hover:bg-accent/50">
                 <Link href="/admin/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4 text-primary"/> Site Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
