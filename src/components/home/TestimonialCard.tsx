
"use client";

import type { Testimonial } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Star, Quote as QuoteIcon } from 'lucide-react';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const { authorName, authorRole, testimonialText, imageUrl, rating, dataAiHint } = testimonial;

  const renderStars = (rating?: number) => {
    if (!rating || rating < 1 || rating > 5) return null;
    return (
      <div className="flex justify-center mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm shadow-lg h-full flex flex-col text-center p-6 rounded-xl border border-border/50">
      <CardHeader className="pt-2 pb-4 items-center">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={`Photo of ${authorName}`}
            width={80}
            height={80}
            data-ai-hint={dataAiHint || "person portrait"}
            className="rounded-full object-cover mb-4 shadow-md mx-auto"
          />
        )}
        {!imageUrl && (
             <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 shadow-md">
                <QuoteIcon className="w-10 h-10 text-muted-foreground" />
            </div>
        )}
        <h3 className="text-lg font-semibold text-card-foreground">{authorName}</h3>
        <p className="text-xs text-primary font-medium">{authorRole}</p>
      </CardHeader>
      <CardContent className="flex-grow">
        {rating && renderStars(rating)}
        <p className="text-sm text-muted-foreground italic leading-relaxed text-balance">
          <QuoteIcon className="inline-block h-4 w-4 text-primary/50 mr-1 -mt-1 transform scale-x-[-1]" />
          {testimonialText}
          <QuoteIcon className="inline-block h-4 w-4 text-primary/50 ml-1 -mt-1" />
        </p>
      </CardContent>
    </Card>
  );
}
