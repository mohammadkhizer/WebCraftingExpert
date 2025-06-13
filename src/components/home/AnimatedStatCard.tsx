
"use client";

import type { LucideIcon } from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { FadeIn } from '@/components/motion/fade-in';

interface AnimatedStatItemProps {
  valueString: string;
  title: string;
  Icon: LucideIcon;
  delay?: number;
}

export function AnimatedStatItem({ valueString, title, Icon, delay = 0 }: AnimatedStatItemProps) {
  const { animatedValue, suffix } = useAnimatedCounter(valueString, 2000);

  return (
    <FadeIn delay={delay}>
      <div className="flex flex-col items-center text-center p-4 transition-transform duration-300 hover:scale-105">
        <div className="mb-3 rounded-full bg-primary/10 p-4 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-10 w-10 md:h-12 md:w-12" />
        </div>
        <p className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
          {animatedValue}{suffix}
        </p>
        <p className="mt-1 text-base md:text-lg font-medium text-muted-foreground">{title}</p>
      </div>
    </FadeIn>
  );
}
