
import type { Metadata } from 'next';
import { FadeIn } from '@/components/motion/fade-in';
import { ShieldAlert } from 'lucide-react';
import { getTermsAndConditions } from '@/services/termsAndConditionsService';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const terms = await getTermsAndConditions();
    const description = terms.content ? terms.content.substring(0, 160).replace(/<[^>]*>?/gm, '') + '...' : 'Read the terms and conditions for using ByteBrusters services and website.';
    return {
      title: 'Terms and Conditions',
      description: description,
      openGraph: {
        title: 'Terms and Conditions',
        description: 'Understand the terms of service for ByteBrusters.',
        ...(terms.updatedAt && { modifiedTime: terms.updatedAt }),
      },
      twitter: {
        title: 'Terms and Conditions',
        description: 'Understand the terms of service for ByteBrusters.',
      }
    };
  } catch (error) {
    console.error("Failed to generate metadata for T&C:", error);
    return {
      title: 'Terms and Conditions',
      description: 'Read the terms and conditions for using ByteBrusters services and website.',
    }
  }
}

const TermsPageSkeleton = () => (
  <div className="container mx-auto section-padding">
    <FadeIn>
      <header className="text-center mb-16">
        <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
        <Skeleton className="h-12 w-3/4 md:w-1/2 mx-auto mb-4" />
        <Skeleton className="h-5 w-1/4 mx-auto" />
      </header>
    </FadeIn>
    <FadeIn delay={100}>
      <article className="prose prose-lg max-w-none dark:prose-invert">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-5/6 mb-4" />
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-3/4 mb-4" />
         <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-5 w-5/6 mb-2" />
        <Skeleton className="h-5 w-full mb-4" />
      </article>
    </FadeIn>
  </div>
);

const DEFAULT_ERROR_CONTENT = "<p>Could not load Terms and Conditions at this moment. Please try again later.</p>";

export default async function TermsAndConditionsPage() {
  let termsContent: string | null = null;
  let lastUpdated: string | undefined = undefined;

  try {
    const terms = await getTermsAndConditions();
    termsContent = terms.content;
    lastUpdated = terms.updatedAt;
  } catch (error) {
    console.error("Error fetching T&C for page render:", error);
  }

  if (!termsContent || termsContent === DEFAULT_ERROR_CONTENT) {
    return <TermsPageSkeleton />;
  }

  return (
    <div className="container mx-auto section-padding">
      <FadeIn>
        <header className="text-center mb-16">
          <ShieldAlert className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="section-title inline-block !mb-4">Terms and Conditions</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Last Updated: {lastUpdated ? format(new Date(lastUpdated), 'dd MMMM, yyyy') : new Date().toLocaleDateString()}
          </p>
        </header>
      </FadeIn>

      <FadeIn delay={100}>
        <article 
          className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-a:text-primary hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: termsContent }}
        />
      </FadeIn>
    </div>
  );
}
