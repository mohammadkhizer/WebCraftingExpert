
"use client";

import type { ReactNode } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarMenuBadge,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Briefcase, Users as TeamIconLucide, Settings, LogOut, FileText, PanelLeft, KeyRound, HelpCircle, MessageSquareText, FileQuestion, Home, Info, BarChart3, MessageSquare, Link as LinkIconLucide, Users as UsersIcon, ShieldCheck, TrendingUp, Quote, Building } from 'lucide-react';
import { getContactMessages } from '@/services/contactService';
import { countAllFeedbacks } from '@/services/feedbackService';
import { countNewServiceInquiries } from '@/services/serviceInquiryService';
import { useToast } from "@/hooks/use-toast";
import { AdminLayoutSkeleton } from '@/components/admin/AdminLayoutSkeleton';

type NavLinkItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  notificationType?: 'messages' | 'feedback' | 'inquiries';
};

const overviewLinks: NavLinkItem[] = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
];

const contentManagementLinks: NavLinkItem[] = [
  { href: '/admin/dashboard/home-content', label: 'Home Page Content', icon: Home },
  { href: '/admin/dashboard/about-content', label: 'About Page Content', icon: Info },
  { href: '/admin/dashboard/services', label: 'Services', icon: Briefcase },
  { href: '/admin/dashboard/projects', label: 'Projects', icon: FileText },
  { href: '/admin/dashboard/teams', label: 'Teams', icon: TeamIconLucide },
  { href: '/admin/dashboard/faq', label: 'Manage FAQs', icon: HelpCircle },
  { href: '/admin/dashboard/testimonials', label: 'Testimonials', icon: Quote },
  { href: '/admin/dashboard/client-logos', label: 'Client Logos', icon: Building },
];

const siteConfigLinks: NavLinkItem[] = [
  { href: '/admin/dashboard/settings', label: 'Site Settings', icon: Settings },
  { href: '/admin/dashboard/footer-links', label: 'Footer Links', icon: LinkIconLucide },
  { href: '/admin/dashboard/key-stats', label: 'Edit Key Stats', icon: TrendingUp },
  { href: '/admin/dashboard/stats', label: 'Manage Stats', icon: BarChart3 },
  { href: '/admin/dashboard/terms-and-conditions', label: 'Terms & Conditions', icon: ShieldCheck },
];

const userEngagementLinks: NavLinkItem[] = [
  { href: '/admin/dashboard/contact', label: 'Contact Info', icon: MessageSquare, notificationType: 'messages' as const },
  { href: '/admin/dashboard/inquiries', label: 'Service Inquiries', icon: FileQuestion, notificationType: 'inquiries' as const },
  { href: '/admin/dashboard/feedback', label: 'View Feedback', icon: MessageSquareText, notificationType: 'feedback' as const },
];

const adminSecurityLinks: NavLinkItem[] = [
  { href: '/admin/dashboard/users', label: 'Manage Users', icon: UsersIcon },
  { href: '/admin/reset-password', label: 'Reset Password', icon: KeyRound },
];

type NotificationType = 'messages' | 'feedback' | 'inquiries';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [notificationCounts, setNotificationCounts] = useState({
    messages: 0,
    feedback: 0,
    inquiries: 0,
  });

  const fetchNotificationCounts = useCallback(async () => {
    if (!isLoggedIn) {
      setNotificationCounts({ messages: 0, feedback: 0, inquiries: 0 });
      return;
    }
    try {
      const [messagesResult, feedbackResult, inquiriesResult] = await Promise.allSettled([
        getContactMessages().then(msgs => msgs.filter(msg => msg.status === 'New').length),
        countAllFeedbacks(),
        countNewServiceInquiries()
      ]);

      setNotificationCounts(prev => ({
        messages: messagesResult.status === 'fulfilled' ? messagesResult.value : prev.messages,
        feedback: feedbackResult.status === 'fulfilled' ? feedbackResult.value : prev.feedback,
        inquiries: inquiriesResult.status === 'fulfilled' ? inquiriesResult.value : prev.inquiries,
      }));

    } catch (error: any) {
      console.error("[AdminLayout] Failed to fetch notification counts:", error.name, error.message);
       toast({
          title: "Error fetching notifications",
          description: error.message || "Could not load some notification counts.",
          variant: "destructive",
       });
    }
  }, [isLoggedIn, toast]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotificationCounts();
    }
  }, [pathname, isLoggedIn, fetchNotificationCounts]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLoggedIn) {
        fetchNotificationCounts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isLoggedIn, fetchNotificationCounts]);

  useEffect(() => {
    if (authLoading) {
      setIsRedirecting(false);
      return;
    }

    let targetPath: string | null = null;
    const onAuthPage = pathname === '/admin/login' || pathname === '/admin/reset-password';

    if (isLoggedIn) {
      if (pathname === '/admin/login') { 
        targetPath = '/admin/dashboard';
      }
    } else { 
      if (!onAuthPage) {
        targetPath = '/admin/login';
      }
    }

    if (targetPath && targetPath !== pathname) {
      setIsRedirecting(true);
      router.push(targetPath);
    } else {
      setIsRedirecting(false);
    }

    if (isLoggedIn && !onAuthPage) {
      document.title = 'Admin | ByteBrusters';
    } else if (pathname === '/admin/login') {
      document.title = 'Admin Login | ByteBrusters';
    } else if (pathname === '/admin/reset-password') {
      document.title = 'Reset Admin Password | ByteBrusters';
    }

  }, [isLoggedIn, authLoading, pathname, router]);


  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const navLinkIsActive = (linkHref: string, currentPathname: string) => {
    if (linkHref === '/admin/dashboard' && currentPathname === '/admin/dashboard') {
      return true;
    }
    if (linkHref !== '/admin/dashboard' && currentPathname.startsWith(linkHref)) {
        return true;
    }
    return false;
  };

 const getCurrentPageLabel = () => {
    const segments = pathname.split('/').filter(Boolean);
    let currentLabel = "Admin Panel";

    const onAuthPage = pathname === '/admin/login' || pathname === '/admin/reset-password';
    if (onAuthPage) {
        if (pathname === '/admin/login') return "Admin Login";
        if (pathname === '/admin/reset-password') return "Reset Admin Password";
    }


    if (segments.includes('dashboard')) {
        const mainSectionIndex = segments.indexOf('dashboard') + 1;
        let mainSection = segments[mainSectionIndex];
        const action = segments[mainSectionIndex + 1];
        const entityId = segments[mainSectionIndex + 2];

        const allNavLinks = [
          ...overviewLinks,
          ...contentManagementLinks,
          ...siteConfigLinks,
          ...userEngagementLinks,
          ...adminSecurityLinks,
        ];
        
        const specialPathMappings: Record<string, string> = {
            'home-content': 'home-content',
            'about-content': 'about-content',
            'key-stats': 'key-stats',
            'footer-links': 'footer-links',
            'terms-and-conditions': 'terms-and-conditions',
            'client-logos': 'client-logos',
        };

        if (specialPathMappings[mainSection]) {
            // mainSection is already correct
        } else if (mainSection === 'terms' && segments[mainSectionIndex + 1] === 'and' && segments[mainSectionIndex + 2] === 'conditions') {
            mainSection = 'terms-and-conditions'; 
        }


        const link = allNavLinks.find(l => {
            const linkPathEnd = l.href.substring(l.href.lastIndexOf('/') + 1);
            return linkPathEnd === mainSection;
        });

        if (link) {
            currentLabel = link.label;
            let entityName = link.label;

            const singularExceptions: Record<string, string> = {
                'Site Settings': 'Settings',
                'Terms & Conditions': 'Terms & Conditions',
                'Contact Info': 'Contact Info & Messages',
                'Manage FAQs': 'FAQ',
                'View Feedback': 'Feedback',
                'Service Inquiries': 'Service Inquiry',
                'Home Page Content': 'Home Page Content',
                'About Page Content': 'About Page Content',
                'Edit Key Stats': 'Key Statistics',
                'Manage Stats': 'Stat Item',
                'Footer Links': 'Footer Link',
                'Manage Users': 'User',
                'Testimonials': 'Testimonial',
                'Client Logos': 'Client Logo',
            };
            
            if (singularExceptions[entityName]) {
                entityName = singularExceptions[entityName];
            } else if (entityName.endsWith('s') && !entityName.endsWith('ss') && entityName !== 'Teams' && entityName !== 'Services' && entityName !== 'Projects') { 
                entityName = entityName.slice(0, -1);
            }


            if (action === 'new') {
                currentLabel = `Add New ${entityName}`;
            } else if (action === 'edit' && entityId) {
                 currentLabel = `Edit ${entityName}`;
            }
        } else if (!mainSection) { 
             currentLabel = "Overview";
        }
    }
    return currentLabel;
  };

  const currentPageTitle = getCurrentPageLabel();

  if (authLoading || isRedirecting) {
    return <AdminLayoutSkeleton />;
  }

  const onPublicAuthPage = pathname === '/admin/login' || pathname === '/admin/reset-password';

  if ((isLoggedIn && !onPublicAuthPage) || (!isLoggedIn && onPublicAuthPage)) {
      return (
        <SidebarProvider defaultOpen>
          <div className="flex min-h-screen bg-muted/40">
            {!onPublicAuthPage && (
              <Sidebar collapsible="icon" className="border-r">
                <SidebarHeader className="p-4 flex items-center justify-between">
                  <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold text-lg text-sidebar-primary">
                      <PanelLeft className="h-7 w-7" />
                      <span className="group-data-[collapsible=icon]:hidden">ByteBrusters</span>
                    </Link>
                </SidebarHeader>
                <SidebarContent className="p-2 pt-6">
                  <SidebarMenu>{overviewLinks.map(renderLinkItem)}</SidebarMenu>
                  <SidebarSeparator />
                  <SidebarMenu>{contentManagementLinks.map(renderLinkItem)}</SidebarMenu>
                  <SidebarSeparator />
                  <SidebarMenu>{siteConfigLinks.map(renderLinkItem)}</SidebarMenu>
                  <SidebarSeparator />
                  <SidebarMenu>{userEngagementLinks.map(renderLinkItem)}</SidebarMenu>
                  <SidebarSeparator />
                  <SidebarMenu>{adminSecurityLinks.map(renderLinkItem)}</SidebarMenu>
                </SidebarContent>
                <SidebarFooter className="p-4 border-t">
                  <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
                    <LogOut className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                  </Button>
                </SidebarFooter>
              </Sidebar>
            )}

            <SidebarInset className={`flex-1 flex flex-col bg-background ${onPublicAuthPage ? '' : 'md:peer-data-[variant!=inset]:pl-[var(--sidebar-width-icon)] peer-data-[state=expanded]:md:peer-data-[variant!=inset]:pl-[var(--sidebar-width)]'}`}>
             {!onPublicAuthPage && (
                <header className="sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-4 border-b bg-background px-4 sm:px-6 md:px-8 shadow-sm">
                  <SidebarTrigger/>
                  <h1 className="flex-1 text-lg sm:text-xl font-semibold text-foreground flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                    <span className="truncate">{currentPageTitle}</span>
                    {notificationCounts.messages > 0 && !pathname.startsWith('/admin/dashboard/contact') && (
                      <span className="text-xs font-medium bg-yellow-400 text-yellow-950 dark:bg-yellow-500 dark:text-yellow-950 border border-yellow-600 dark:border-yellow-700 px-2 py-0.5 rounded-full animate-pulse">
                        {notificationCounts.messages} New Message{notificationCounts.messages > 1 ? 's' : ''}
                      </span>
                    )}
                     {notificationCounts.feedback > 0 && !pathname.startsWith('/admin/dashboard/feedback') && (
                      <span className="text-xs font-medium bg-yellow-400 text-yellow-950 dark:bg-yellow-500 dark:text-yellow-950 border border-yellow-600 dark:border-yellow-700 px-2 py-0.5 rounded-full animate-pulse">
                        {notificationCounts.feedback} New Feedback
                      </span>
                    )}
                    {notificationCounts.inquiries > 0 && !pathname.startsWith('/admin/dashboard/inquiries') && (
                      <span className="text-xs font-medium bg-yellow-400 text-yellow-950 dark:bg-yellow-500 dark:text-yellow-950 border border-yellow-600 dark:border-yellow-700 px-2 py-0.5 rounded-full animate-pulse">
                        {notificationCounts.inquiries} New Inquir{notificationCounts.inquiries > 1 ? 'ies' : 'y'}
                      </span>
                    )}
                  </h1>
                </header>
              )}
              <main className={`flex-1 p-4 sm:p-6 md:p-8 overflow-auto w-full`}>
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      );
  }

  return <AdminLayoutSkeleton />;

  function renderLinkItem(link: NavLinkItem) {
    let countToShow = 0;
    const notificationType = link.notificationType as NotificationType | undefined;
    if (notificationType) {
      if (notificationType === 'messages' && notificationCounts.messages > 0) countToShow = notificationCounts.messages;
      else if (notificationType === 'feedback' && notificationCounts.feedback > 0) countToShow = notificationCounts.feedback;
      else if (notificationType === 'inquiries' && notificationCounts.inquiries > 0) countToShow = notificationCounts.inquiries;
    }
    const badgeColorClasses = "bg-yellow-400 text-yellow-950 dark:bg-yellow-500 dark:text-yellow-950 border border-yellow-600 dark:border-yellow-700";

    return (
      <SidebarMenuItem key={link.href}>
        <Link href={link.href} legacyBehavior passHref>
          <SidebarMenuButton
            isActive={navLinkIsActive(link.href, pathname)}
            tooltip={{ children: link.label, side: "right", className: "ml-2" }}
          >
            <link.icon />
            <span className="flex-grow group-data-[collapsible=icon]:hidden">{link.label}</span>
            {countToShow > 0 && (
              <SidebarMenuBadge className={badgeColorClasses}>
                {countToShow}
              </SidebarMenuBadge>
            )}
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    );
  }
}
