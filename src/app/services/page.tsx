
import type { Metadata } from 'next';
import type { Service } from '@/types';
import { ServiceCard } from '@/components/services/service-card';
import { FadeIn } from '@/components/motion/fade-in';
import { getServices } from '@/services/serviceService';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Our Services', // RootLayout template will append "| ByteBrusters"
};

const ServicesPageSkeleton = () => (
  <div className="container mx-auto section-padding">
    <FadeIn>
      <section className="text-center mb-16">
        <Skeleton className="h-12 w-1/2 md:w-1/3 mx-auto mb-4" />
        <Skeleton className="h-6 w-3/4 md:w-2/3 mx-auto" />
      </section>
    </FadeIn>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(3)].map((_, index) => (
        <Card key={index} className="text-center h-full">
          <CardHeader><div className="mx-auto bg-muted rounded-full p-4 w-20 h-20 mb-4 flex items-center justify-center"><Skeleton className="h-10 w-10 rounded-full"/></div><Skeleton className="h-6 w-3/4 mx-auto" /></CardHeader>
          <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6 mt-2" /></CardContent>
          <CardFooter className="justify-center"><Skeleton className="h-10 w-32" /></CardFooter>
        </Card>
      ))}
    </div>
    <FadeIn delay={200}>
      <section className="mt-24 text-center bg-muted/50 p-12 rounded-lg">
          <Skeleton className="h-10 w-1/2 md:w-2/3 mx-auto mb-4" />
          <Skeleton className="h-5 w-3/4 md:w-1/2 mx-auto mb-8" />
          <Skeleton className="h-12 w-48 mx-auto" />
      </section>
    </FadeIn>
  </div>
);


export default async function ServicesPage() {
  let services: Service[] = [];

  try {
    const fetchedServices = await getServices();
    services = fetchedServices.filter(s => s.status === 'Active');
  } catch (error) {
    console.error("Failed to fetch services for Services Page:", error);
  }

  if (services.length === 0) {
    return <ServicesPageSkeleton />;
  }

  return (
    <div className="container mx-auto section-padding">
      <FadeIn>
        <section className="text-center mb-16">
          <h1 className="section-title inline-block">Our Services</h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto text-balance">
            At WebCraftingExperts, we offer a comprehensive suite of IT services designed to propel your business forward. Explore how we can help you achieve your technological goals.
          </p>
        </section>
      </FadeIn>

      {services.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <FadeIn key={service.id} delay={index * 100}>
              <ServiceCard service={service} />
            </FadeIn>
          ))}
        </div>
      ) : (
         <FadeIn>
          <p className="text-center text-muted-foreground text-lg py-12">No services to display at the moment. Check back soon!</p>
        </FadeIn>
      )}

      <FadeIn delay={services.length * 100 + 200}>
        <section className="mt-24 text-center bg-muted/50 p-12 rounded-lg">
            <h2 className="text-3xl font-semibold mb-4"><span className="gradient-text">Ready to Elevate Your Business?</span></h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
                Let's discuss how our expertise can be tailored to your unique challenges and opportunities.
            </p>
            <Link href="/contact">
                <Button size="lg" className="button-primary">
                    Request a Consultation <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </Link>
        </section>
      </FadeIn>
    </div>
  );
}
