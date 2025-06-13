
"use client";

import { useRef, useEffect, useState }
from 'react';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FadeInProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number; // Optional delay in ms
  threshold?: number; // Intersection observer threshold
  triggerOnce?: boolean; // Whether to trigger animation only once
}

export function FadeIn({ children, className, delay = 0, threshold = 0.1, triggerOnce = true, ...props }: FadeInProps) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Apply delay if specified
            if (delay > 0) {
              setTimeout(() => setIsInView(true), delay);
            } else {
              setIsInView(true);
            }
            if (triggerOnce) {
              observer.unobserve(currentRef);
            }
          } else {
            if (!triggerOnce) {
              setIsInView(false); // Reset if not triggering once and element goes out of view
            }
          }
        });
      },
      { threshold }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [delay, threshold, triggerOnce]);

  return (
    <div
      ref={ref}
      className={cn('animate-fade-in', { 'in-view': isInView }, className)}
      {...props}
    >
      {children}
    </div>
  );
}
