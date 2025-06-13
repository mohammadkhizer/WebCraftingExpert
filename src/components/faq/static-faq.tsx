
"use client";

import type { FAQItem } from '@/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from 'lucide-react';

interface StaticFAQProps {
  items: FAQItem[];
}

export function StaticFAQ({ items }: StaticFAQProps) {
  if (!items || items.length === 0) {
    return (
        <div className="bg-card p-8 rounded-lg shadow-xl text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-3 text-card-foreground">No Questions Yet</h2>
            <p className="text-muted-foreground">
                We're working on compiling our FAQs. Please check back later!
            </p>
        </div>
    );
  }

  return (
    <div className="bg-card p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-semibold mb-6 text-card-foreground flex items-center">
        <HelpCircle className="h-8 w-8 mr-3 text-primary" />
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="w-full">
        {items.map((item) => (
          <AccordionItem value={item.id} key={item.id} className="border-b-border/50 last:border-b-0">
            <AccordionTrigger className="text-lg text-left hover:no-underline text-card-foreground">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base pt-2">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
