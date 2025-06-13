
"use client";

import { Skeleton } from '@/components/ui/skeleton';
import { AdminTablePageSkeleton } from '@/components/admin/AdminTablePageSkeleton';

export function AdminLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Static Skeleton for Sidebar (icon-only like view) */}
      <div className="hidden md:flex flex-col w-[var(--sidebar-width-icon)] bg-sidebar text-sidebar-foreground p-2 pt-6 border-r">
        <div className="p-2 mb-4"> {/* Matches header height + padding roughly */}
          <Skeleton className="h-7 w-7 mx-auto rounded-md" /> {/* Logo/Panel placeholder */}
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => ( // Simulate a few sidebar icons
            <Skeleton key={i} className="h-8 w-8 mx-auto rounded-md" />
          ))}
        </div>
      </div>

      {/* Main Content Area Skeleton */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 md:px-8 shadow-sm">
          <Skeleton className="h-7 w-7 rounded-md" /> {/* SidebarTrigger placeholder */}
          <Skeleton className="h-6 w-48 rounded-md" /> {/* Page Title placeholder */}
        </header>

        {/* Page Content Skeleton (using a generic table skeleton for content area) */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto w-full">
          <AdminTablePageSkeleton 
            rowCount={5} 
            columnCount={4}
            pageTitleText="" // No title needed from this component here
            pageDescriptionText=""
            mainButtonText=""
            cardTitleText=""
            cardDescriptionText=""
          />
        </main>
      </div>
    </div>
  );
}
