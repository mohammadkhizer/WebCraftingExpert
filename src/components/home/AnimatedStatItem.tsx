
"use client";

import { useState, useEffect, useRef } from 'react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { FadeIn } from '@/components/motion/fade-in';
import { getIconComponent } from '@/lib/iconUtils';
import type { LucideIcon } from 'lucide-react';

interface AnimatedStatItemProps {
  valueString: string;
  title: string;
  iconName: string;
  delay?: number; // FadeIn delay
}

export function AnimatedStatItem({ valueString, title, iconName, delay = 0 }: AnimatedStatItemProps) {
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const itemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasBeenInView(true);
          observer.unobserve(entry.target); // Ensure animation triggers only once
        }
      },
      {
        threshold: 0.1, // Start animation when 10% of the item is visible
      }
    );

    const currentItemRef = itemRef.current;
    if (currentItemRef) {
      observer.observe(currentItemRef);
    }

    return () => {
      if (currentItemRef) {
        observer.unobserve(currentItemRef);
      }
    };
  }, []);

  const { animatedValue, suffix } = useAnimatedCounter(valueString, 2000, hasBeenInView);
  const ActualIcon = getIconComponent(iconName);

  return (
    <FadeIn delay={delay}>
      <div ref={itemRef} className="flex flex-col items-center text-center p-4 transition-transform duration-300 hover:scale-105">
        <div className="mb-3 rounded-full bg-primary/10 p-4 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          {ActualIcon && <ActualIcon className="h-10 w-10 md:h-12 md:w-12" />}
        </div>
        <p className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
          {animatedValue}{suffix}
        </p>
        <p className="mt-1 text-base md:text-lg font-medium text-muted-foreground">{title}</p>
      </div>
    </FadeIn>
  );
}
