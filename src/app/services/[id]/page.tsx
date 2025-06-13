
import type { Metadata } from 'next';
import type { Service } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FadeIn } from '@/components/motion/fade-in';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getServiceById, getServices } from '@/services/serviceService';
import { getIconComponent } from '@/lib/iconUtils';
import { CheckCircle, ArrowLeft, ArrowRight, type LucideIcon, FileQuestion, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ServiceInquiryForm } from '@/components/services/ServiceInquiryForm';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const service = await getServiceById(params.id);
    if (!service) {
      return {
        title: 'Service Not Found',
      };
    }
    return {
      title: service.title, 
      description: service.description, 
      openGraph: {
        title: service.title,
        description: service.description,
      },
       twitter: {
         title: service.title,
        description: service.description,
      }
    };
  } catch (error) {
    console.error(`Failed to generate metadata for service ${params.id}:`, error);
    return {
      title: 'Error Loading Service',
      description: 'There was an error loading information for this service.',
    };
  }
}


const ServiceDetailPageSkeleton = () => (
  <div className="bg-background text-foreground">
    <FadeIn>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-6 w-40 mb-6" />
      </div>
    </FadeIn>
    <FadeIn delay={100}>
      <header className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full mx-auto mb-6" />
          <Skeleton className="h-10 w-3/4 md:w-1/2 mx-auto mb-4" />
          <Skeleton className="h-5 w-full max-w-2xl mx-auto" />
        </div>
      </header>
    </FadeIn>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        <main className="lg:col-span-8 space-y-12">
          <FadeIn delay={200}>
            <section>
              <Skeleton className="h-8 w-1/3 mb-6" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-5/6 mb-2" />
              <Skeleton className="h-5 w-full" />
            </section>
          </FadeIn>
          <FadeIn delay={400}> {/* Adjusted delay to ensure "Our Process" skeleton shows if features don't */}
            <section>
              <Skeleton className="h-8 w-1/4 mb-8" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            </section>
          </FadeIn>
        </main>
        <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 self-start">
          <FadeIn delay={300}> {/* Key Features Skeleton */}
            <Card className="shadow-lg border border-border/50">
              <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
              <CardContent className="grid sm:grid-cols-1 gap-x-4 gap-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Skeleton className="h-5 w-5 rounded-full mt-0.5 shrink-0" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
              </CardContent>
            </Card>
          </FadeIn>
          <FadeIn delay={500}>
            <Card className="shadow-lg border border-border/50">
              <CardHeader><Skeleton className="h-6 w-3/4 mb-2" /></CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-full mb-6" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </FadeIn>
           <FadeIn delay={600}>
             <Card className="shadow-lg border border-border/50">
               <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
               <CardContent className="space-y-4">
                 {[...Array(3)].map((_, i) => <div key={i} className="flex items-start"><Skeleton className="h-5 w-5 rounded-full mr-3 mt-1 shrink-0" /><Skeleton className="h-4 w-3/4" /></div>)}
                  <Skeleton className="h-10 w-full mt-4" />
               </CardContent>
             </Card>
           </FadeIn>
        </aside>
      </div>
    </div>
  </div>
);


export default async function ServiceDetailPage({ params }: Props) {
  const serviceId = params.id;
  let service: Service | null = null;
  let otherServices: Service[] = [];
  let Icon: LucideIcon | null = null;
  
  try {
    const [fetchedService, allServices] = await Promise.all([
      getServiceById(serviceId),
      getServices()
    ]);
    
    if (fetchedService) {
      service = fetchedService;
      Icon = getIconComponent(fetchedService.iconName); 
      otherServices = allServices.filter(s => s.id !== fetchedService.id && s.status === 'Active').slice(0,3);
    } else {
      // If service not found, still fetch other services to display on the page
      otherServices = allServices.filter(s => s.status === 'Active').slice(0,3);
    }
  } catch (error) {
    console.error("Failed to fetch service details for Service Detail Page:", error);
    // Attempt to fetch other services even if the main service fails
    try {
      otherServices = (await getServices()).filter(s => s.status === 'Active').slice(0,3);
    } catch (otherServicesError) {
      console.error("Failed to fetch other services as well:", otherServicesError);
    }
  }

  if (!service) {
     return <ServiceDetailPageSkeleton />;
  }

  const { title, longDescription, features, process: processSteps, description } = service;

  return (
    <div className="bg-background text-foreground">
      <FadeIn>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/services" className="inline-flex items-center text-primary hover:underline mb-6 group text-sm">
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to All Services
            </Link>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <header className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {Icon && (
                <div className="mx-auto bg-primary/10 text-primary rounded-full p-5 w-fit mb-6 shadow-md">
                    <Icon className="h-16 w-16 md:h-20 md:w-20" />
                </div>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">{title}</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">{description}</p>
          </div>
        </header>
      </FadeIn>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-16 items-start">
          <main className="lg:col-span-8 space-y-12">
            <FadeIn delay={200}>
              <section>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">Service Overview</h2>
                <div className="prose prose-lg max-w-none dark:prose-invert text-muted-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:underline prose-p:leading-relaxed prose-p:text-balance">
                  {longDescription || description}
                </div>
              </section>
            </FadeIn>

            {processSteps && processSteps.length > 0 && (
              <FadeIn delay={400}>
                <section>
                  <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8">Our Process</h2>
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {processSteps.map((item, index) => (
                      <AccordionItem value={`item-${index}`} key={index} className="bg-card rounded-lg shadow-md border border-border/50 data-[state=open]:shadow-xl">
                        <AccordionTrigger className="p-5 md:p-6 text-lg md:text-xl font-medium hover:no-underline text-left text-card-foreground data-[state=open]:text-primary">
                          <span className="mr-3 text-primary">{index + 1}.</span> {item.step}
                        </AccordionTrigger>
                        <AccordionContent className="px-5 md:px-6 pb-5 md:pb-6 text-muted-foreground text-base">
                          {item.description}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              </FadeIn>
            )}
          </main>

          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 self-start">
            {features && features.length > 0 && (
              <FadeIn delay={300}>
                <Card className="shadow-lg border border-border/50">
                  <CardHeader>
                    <CardTitle className="text-xl text-card-foreground">Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-1 gap-x-4 gap-y-3">
                        {features.map((feature, index) => (
                        <div key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground text-sm">{feature}</span>
                        </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}

            <FadeIn delay={500}>
              <Card className="shadow-lg border border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center text-card-foreground">
                     <FileQuestion className="mr-3 h-6 w-6 text-primary" /> Interested in this Service?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 text-sm">
                    Let's discuss how our <span className="font-medium text-foreground">{title}</span> service can help your business achieve its goals.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg" className="w-full button-primary text-base py-3">
                        Inquire Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Inquire about: {service.title}</DialogTitle>
                        <DialogDescription>
                          Please fill out the form below and we'll get back to you shortly.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <ServiceInquiryForm 
                          serviceId={service.id} 
                          serviceName={service.title} 
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </FadeIn>
            
            {otherServices.length > 0 && (
              <FadeIn delay={600}>
                <Card className="shadow-lg border border-border/50">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center text-card-foreground">
                            <Briefcase className="mr-3 h-6 w-6 text-primary" /> Other Services
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {otherServices.map(otherService => {
                                const OtherIcon = getIconComponent(otherService.iconName);
                                return (
                                <li key={otherService.id}>
                                    <Link href={`/services/${otherService.id}`} className="flex items-center p-3 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-primary group transition-colors">
                                        {OtherIcon && <OtherIcon className="h-5 w-5 mr-3 text-primary/80 group-hover:text-primary transition-colors" />}
                                        <span className="text-sm font-medium">{otherService.title}</span>
                                        <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            )})}
                        </ul>
                        <Link href="/services" className="mt-6 block">
                            <Button variant="outline" className="w-full border-border hover:bg-muted/50">View All Services</Button>
                        </Link>
                    </CardContent>
                </Card>
              </FadeIn>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
