
"use client";

// This page is no longer used. Admin creation is handled within the dashboard.
// You can safely delete this file.

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminSignupPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted p-4 md:p-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Redirecting to login...</p>
      <p className="text-xs text-muted-foreground mt-2">The admin signup page has been moved. Admins are now created from the dashboard.</p>
    </div>
  );
}
