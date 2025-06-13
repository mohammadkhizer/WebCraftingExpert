
import type { Metadata } from 'next';
import { FadeIn } from '@/components/motion/fade-in';
import { StaticFAQ } from '@/components/faq/static-faq';
import { getFAQItems } from '@/services/faqService';
import type { FAQItem } from '@/types';
import { HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: "Find answers to common questions about ByteBrusters's services, processes, and policies. Get the information you need quickly and easily.",
  openGraph: {
    title: 'ByteBrusters FAQs - Your Questions Answered',
    description: "Explore our comprehensive list of frequently asked questions to learn more about ByteBrusters and how we can help you achieve your tech goals.",
  },
  twitter: {
    title: 'ByteBrusters FAQs - Your Questions Answered',
    description: "Explore our comprehensive list of frequently asked questions.",
  }
};

const FAQPageSkeleton = () => (
  <div className="container mx-auto section-padding">
    <FadeIn>
      <section className="text-center mb-16">
        <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
        <Skeleton className="h-12 w-1/2 md:w-1/3 mx-auto mb-4" />
        <Skeleton className="h-6 w-3/4 md:w-2/3 mx-auto" />
      </section>
    </FadeIn>
    <FadeIn delay={100}>
      <div className="bg-card p-8 rounded-lg shadow-xl">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      </div>
    </FadeIn>
    <FadeIn delay={200}>
        <section className="mt-24 text-center bg-muted/50 p-12 rounded-lg">
            <Skeleton className="h-10 w-1/2 md:w-2/3 mx-auto mb-4" />
            <Skeleton className="h-5 w-3/4 md:w-1/2 mx-auto mb-8" />
            <Skeleton className="h-12 w-36 mx-auto" />
        </section>
      </FadeIn>
  </div>
);


export default async function FAQPage() {
  let faqItems: FAQItem[] = [];

  try {
    faqItems = await getFAQItems(); 
  } catch (error) {
    console.error("Failed to load FAQs for FAQ page:", error);
  }

  if (faqItems.length === 0) {
    return <FAQPageSkeleton />;
  }

  return (
    <div className="container mx-auto section-padding">
      <FadeIn>
        <section className="text-center mb-16">
           <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="section-title inline-block">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto text-balance">
            Have questions? We've got answers. Explore our FAQs to find the information you need.
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={100}>
        <StaticFAQ items={faqItems} />
      </FadeIn>

      <FadeIn delay={200}>
        <section className="mt-24 text-center bg-muted/50 p-12 rounded-lg">
            <h2 className="text-3xl font-semibold mb-4">Still have questions?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto text-balance">
                If you don't see your question answered here, feel free to contact us directly for assistance.
            </p>
            <div className="flex justify-center items-center gap-4">
                <Link href="/contact">
                    <Button size="lg" className="button-primary w-full sm:w-auto">
                        Contact Us <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </section>
      </FadeIn>
    </div>
  );
}
