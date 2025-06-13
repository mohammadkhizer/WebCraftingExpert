
"use client"; // Add this directive

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, SearchX } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,80px)-var(--footer-height,200px))] text-center px-4 section-padding bg-gradient-to-br from-background via-muted/10 to-background overflow-hidden">
      <style jsx global>{`
        :root {
          --header-height: 80px; /* Approximate height of your navbar */
          --footer-height: 200px; /* Approximate height of your footer */
        }
      `}</style>
      <FadeIn>
        <div className="max-w-lg mx-auto">
          <SearchX className="h-24 w-24 md:h-32 md:w-32 text-primary/70 mx-auto mb-8" />

          <h1 className="text-8xl md:text-9xl lg:text-[10rem] font-extrabold tracking-tighter mb-4">
            <span className="gradient-text leading-none">404</span>
          </h1>

          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6">
            Lost in Cyberspace?
          </h2>

          <p className="text-lg text-muted-foreground mb-10 text-balance">
            It seems the page you're looking for has ventured into the unknown.
            Don't worry, we can guide you back.
          </p>

          <Link href="/">
            <Button size="lg" className="button-primary text-lg px-8 py-4 shadow-lg hover:shadow-primary/40 transition-all duration-300">
              <Home className="mr-2 h-5 w-5" />
              Return to Homepage
            </Button>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
