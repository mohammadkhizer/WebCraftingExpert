
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Briefcase, Award, Users } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import Image from 'next/image';
import { getServices } from '@/services/serviceService';
import { getIconComponent } from '@/lib/iconUtils';
import { getProjects } from '@/services/projectService';
import type { Service, Project, HomePageContent, SiteKeyStats, Testimonial, ClientLogo } from '@/types';
import { getHomePageContent } from '@/services/homePageContentService';
import { getKeyStats } from '@/services/siteKeyStatsService';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedStatItem } from '@/components/home/AnimatedStatItem';
import { TestimonialSlider } from '@/components/home/TestimonialSlider';
import { getVisibleTestimonials } from '@/services/testimonialService';
import { getClientLogos } from '@/services/clientLogoService';

export const metadata: Metadata = {
  title: 'Home', // RootLayout template will append "| ByteBrusters"
  // Description will be inherited from RootLayout or can be set specifically here if needed
};

// Define statItemsDisplayConfig at the module scope
const statItemsDisplayConfig: Array<{ key: keyof SiteKeyStats; title: string; iconName: string }> = [
  { key: 'satisfiedClients', title: 'Satisfied Clients', iconName: 'Users' },
  { key: 'projectsCompleted', title: 'Projects Completed', iconName: 'Briefcase' },
  { key: 'yearsOfExperience', title: 'Years of Experience', iconName: 'Award' },
];
console.log("[HomePage] statItemsDisplayConfig defined at module scope:", statItemsDisplayConfig);


const HomePageContentSkeleton = () => (
  <>
    {/* Hero Section Skeleton */}
    <FadeIn>
      <section className="section-padding bg-gradient-to-br from-background to-muted/30 text-center">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-3/4 md:h-16 lg:h-20 mx-auto mb-6" />
          <Skeleton className="h-6 w-full max-w-2xl mx-auto mb-10" />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </section>
    </FadeIn>

     {/* Why Choose Us Section Skeleton */}
     <FadeIn>
        <section className="section-padding bg-muted">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Skeleton className="h-10 w-1/2 md:w-1/3 mb-4" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-5/6 mb-6" />
                <ul className="space-y-4 mb-8">
                  {[...Array(4)].map((_,i) => <li key={i} className="flex items-start"><Skeleton className="h-6 w-6 rounded-full mr-3 mt-1 shrink-0" /><Skeleton className="h-5 w-3/4" /></li>)}
                </ul>
                <Skeleton className="h-12 w-40" />
              </div>
              <div className="hidden lg:block relative aspect-square">
                 <Skeleton className="rounded-lg object-cover shadow-xl w-full h-full" />
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

    <KeyStatsSectionSkeleton />

    {/* Featured Services Section Skeleton */}
    <FadeIn>
      <section className="section-padding">
        <div className="container mx-auto">
          <Skeleton className="h-10 w-1/2 md:w-1/3 mx-auto mb-4" />
          <Skeleton className="h-5 w-3/4 md:w-1/2 mx-auto mb-12" />
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="text-center h-full">
                <CardHeader><div className="mx-auto bg-muted rounded-full p-4 w-20 h-20 mb-4 flex items-center justify-center"><Skeleton className="h-10 w-10 rounded-full"/></div><Skeleton className="h-6 w-3/4 mx-auto" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6 mt-2" /></CardContent>
                 <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12"><Skeleton className="h-8 w-48 mx-auto" /></div>
        </div>
      </section>
    </FadeIn>
    
    <ClientLogosSectionSkeleton />
    <TestimonialsSectionSkeleton />

    {/* Featured Projects Section Skeleton */}
    <FadeIn>
        <section className="section-padding">
            <div className="container mx-auto">
                <Skeleton className="h-10 w-1/2 md:w-1/3 mx-auto mb-4" />
                <Skeleton className="h-5 w-3/4 md:w-1/2 mx-auto mb-12" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, index) => (
                        <Card key={index} className="overflow-hidden h-full">
                            <Skeleton className="w-full h-48" />
                            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                            <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6 mt-2" /></CardContent>
                            <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                        </Card>
                    ))}
                </div>
                <div className="text-center mt-12"><Skeleton className="h-8 w-48 mx-auto" /></div>
            </div>
        </section>
    </FadeIn>
    
    {/* Final CTA Skeleton */}
    <FadeIn>
       <section className="section-padding text-center bg-muted/50">
          <div className="container mx-auto">
            <Skeleton className="h-10 w-1/2 md:w-2/3 mx-auto mb-4" />
            <Skeleton className="h-5 w-3/4 md:w-1/2 mx-auto mb-8" />
            <Skeleton className="h-12 w-36 mx-auto" />
          </div>
        </section>
    </FadeIn>
  </>
);

const KeyStatsSectionSkeleton = () => (
  <section className="section-padding bg-primary/5">
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-around items-center gap-8 py-8">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex flex-col items-center text-center p-4">
            <Skeleton className="h-16 w-16 rounded-full mb-4"/>
            <Skeleton className="h-12 w-20 mx-auto mb-2"/>
            <Skeleton className="h-6 w-32 mx-auto"/>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const TestimonialsSectionSkeleton = () => (
  <section className="section-padding bg-muted">
    <div className="container mx-auto">
      <Skeleton className="h-10 w-1/2 md:w-1/3 mx-auto mb-4" />
      <Skeleton className="h-5 w-3/4 md:w-1/2 mx-auto mb-12" />
      <div className="relative w-full max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
        <div className="overflow-hidden">
          <div className="flex -ml-4">
            {[...Array(1)].map((_, index) => ( 
              <div key={index} className="min-w-0 shrink-0 grow-0 basis-full md:basis-1/2 lg:basis-1/3 pl-4">
                <Card className="text-center p-6 rounded-xl h-full">
                  <CardHeader className="items-center">
                    <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-3/4 mx-auto mb-1" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center mb-3">
                      {[...Array(5)].map((s, i) => <Skeleton key={i} className="h-5 w-5 rounded-sm mr-1" />)}
                    </div>
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6 mx-auto" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="absolute h-8 w-8 rounded-full -left-12 top-1/2 -translate-y-1/2 hidden sm:block" />
        <Skeleton className="absolute h-8 w-8 rounded-full -right-12 top-1/2 -translate-y-1/2 hidden sm:block" />
      </div>
    </div>
  </section>
);

const ClientLogosSectionSkeleton = () => (
  <section className="section-padding">
    <div className="container mx-auto text-center">
      <Skeleton className="h-10 w-1/2 md:w-1/3 mx-auto mb-4" />
      <Skeleton className="h-5 w-3/4 md:w-1/2 mx-auto mb-12" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-md" />
        ))}
      </div>
    </div>
  </section>
);


export default async function HomePage() {
  let pageContent: HomePageContent | null = null;
  let featuredServices: Service[] = [];
  let featuredProjects: Project[] = [];
  let keyStats: SiteKeyStats | null = null;
  let testimonials: Testimonial[] = [];
  let clientLogos: ClientLogo[] = [];

  try {
    [pageContent, featuredServices, featuredProjects, keyStats, testimonials, clientLogos] = await Promise.all([
      getHomePageContent(),
      getServices().then(services => services.filter(service => service.status === 'Active').slice(0, 3)),
      getProjects().then(projects => projects.filter(project => project.status === 'Completed' || project.status === 'In Progress').slice(0, 3)),
      getKeyStats(),
      getVisibleTestimonials(),
      getClientLogos()
    ]);
  } catch (error) {
    console.error("[HomePage] Error fetching initial data:", error);
    // pageContent might be null, other arrays might be empty
  }

  if (!pageContent) {
     console.warn("[HomePage] Page content is null even after attempting to fetch. Rendering skeleton.");
     return <HomePageContentSkeleton />;
  }

  let shouldRenderStatsSection = false;
  if (keyStats && Array.isArray(statItemsDisplayConfig)) {
    const satisfiedClientsNum = parseInt(keyStats.satisfiedClients, 10) || 0;
    const projectsCompletedNum = parseInt(keyStats.projectsCompleted, 10) || 0;
    const yearsOfExperienceIsPresent = keyStats.yearsOfExperience && keyStats.yearsOfExperience.trim() !== "" && keyStats.yearsOfExperience.trim() !== "0" && keyStats.yearsOfExperience.trim() !== "0+";
    
    if (satisfiedClientsNum > 10 || projectsCompletedNum > 10 || yearsOfExperienceIsPresent) {
      shouldRenderStatsSection = true;
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <FadeIn>
        <section className="section-padding bg-gradient-to-br from-background to-muted/30 text-center">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" dangerouslySetInnerHTML={{ __html: pageContent.heroTitle }}></h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance">
              {pageContent.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="button-primary w-full sm:w-auto">Get Started</Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" className="button-outline w-full sm:w-auto">Our Services <ArrowRight className="ml-2 h-5 w-5" /></Button>
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Why Choose Us Section */}
      <FadeIn>
        <section className="section-padding bg-muted">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="section-title">{pageContent.whyByteBrustersTitle}</h2>
                <p className="text-lg text-muted-foreground mb-6 text-balance">
                  {pageContent.whyByteBrustersParagraph}
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start"><CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 shrink-0" /><span><span className="font-semibold text-foreground">Expert Team:</span> Highly skilled professionals passionate about technology.</span></li>
                  <li className="flex items-start"><CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 shrink-0" /><span><span className="font-semibold text-foreground">Custom Solutions:</span> Tailored strategies and applications that fit your unique requirements.</span></li>
                  <li className="flex items-start"><CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 shrink-0" /><span><span className="font-semibold text-foreground">Transparent Communication:</span> Keeping you informed every step of the way.</span></li>
                   <li className="flex items-start"><CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 shrink-0" /><span><span className="font-semibold text-foreground">Future-Proof Technology:</span> Utilizing the latest tools and frameworks for scalable solutions.</span></li>
                </ul>
                <Link href="/about">
                  <Button className="button-secondary">Learn More About Us</Button>
                </Link>
              </div>
              <div className="hidden lg:block relative aspect-square">
                 <Image
                    src={pageContent.whyByteBrustersImageUrl}
                    alt={pageContent.whyByteBrustersTitle || "webcraftingexperts Team Collaboration"}
                    fill
                    data-ai-hint={pageContent.whyByteBrustersImageAiHint || 'digital innovation'}
                    className="rounded-lg object-cover shadow-xl"
                 />
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Stats Section - Conditional Rendering */}
      {shouldRenderStatsSection && keyStats && Array.isArray(statItemsDisplayConfig) && (
        <FadeIn>
          <section className="section-padding bg-primary/5">
            <div className="container mx-auto">
              <div className="flex flex-col sm:flex-row justify-around items-center gap-8 py-8">
                {statItemsDisplayConfig.map((itemConfig, index) => {
                  const valueString = keyStats[itemConfig.key as keyof SiteKeyStats];
                  return valueString ? (
                    <AnimatedStatItem
                      key={itemConfig.key}
                      valueString={valueString}
                      title={itemConfig.title}
                      iconName={itemConfig.iconName}
                      delay={index * 150}
                    />
                  ) : null; 
                })}
              </div>
            </div>
          </section>
        </FadeIn>
      )}
      
      {/* Featured Services Section */}
      <FadeIn>
        <section className="section-padding">
          <div className="container mx-auto">
            <h2 className="section-title">Our Core Services</h2>
            <p className="text-lg text-muted-foreground text-center mb-12 max-w-xl mx-auto text-balance">
              We deliver a wide range of IT services designed to elevate your business.
            </p>
            {featuredServices.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {featuredServices.map((service, index) => {
                  const IconComponent = service.iconName ? getIconComponent(service.iconName) : Briefcase;
                  return (
                    <FadeIn key={service.id} delay={index * 150}>
                      <Card className="text-center h-full hover:shadow-xl transition-shadow duration-300">
                        <CardHeader>
                          <div className="mx-auto bg-primary/10 text-primary rounded-full p-4 w-fit mb-4">
                            <IconComponent className="h-10 w-10" />
                          </div>
                          <CardTitle className="text-2xl">{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{service.description}</p>
                        </CardContent>
                         <CardFooter>
                            <Link href={`/services/${service.id}`} className="w-full">
                                <Button variant="outline" className="w-full">Learn More</Button>
                            </Link>
                        </CardFooter>
                      </Card>
                    </FadeIn>
                  );
                })}
              </div>
            ) : (
               <div className="grid md:grid-cols-3 gap-8">
                {[...Array(3)].map((_, index) => (
                  <Card key={index} className="text-center h-full">
                    <CardHeader><div className="mx-auto bg-muted rounded-full p-4 w-20 h-20 mb-4 flex items-center justify-center"><Skeleton className="h-10 w-10 rounded-full"/></div><Skeleton className="h-6 w-3/4 mx-auto" /></CardHeader>
                    <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6 mt-2" /></CardContent>
                    <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                  </Card>
                ))}
              </div>
            )}
            <div className="text-center mt-12">
              <Link href="/services">
                <Button variant="link" className="text-lg text-primary hover:underline">
                  Explore All Services <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Client Logos Section */}
      {clientLogos && clientLogos.length > 5 && (
        <FadeIn>
          <section className="py-16 bg-muted/50">
            <div className="container mx-auto text-center">
              <h2 className="section-title inline-block !text-center mx-auto">Trusted By</h2>
              <p className="text-lg text-muted-foreground mt-4 mb-12 max-w-xl mx-auto text-balance">
                We are proud to have collaborated with a diverse range of innovative companies.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-10 items-center justify-center">
                {clientLogos.map((client, index) => (
                  <FadeIn key={client.id} delay={index * 100}>
                    <a 
                      href={client.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      title={client.name}
                      className="block grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                    >
                      <img 
                        src={client.logoUrl} 
                        alt={client.name} 
                        className="h-12 md:h-16 w-auto mx-auto object-contain" 
                      />
                    </a>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 ? (
        <FadeIn>
          <section className="section-padding bg-muted">
            <div className="container mx-auto">
              <h2 className="section-title">What Our Clients Say</h2>
              <p className="text-lg text-muted-foreground text-center mb-12 max-w-xl mx-auto text-balance">
                Hear directly from those we've partnered with.
              </p>
              <TestimonialSlider testimonials={testimonials} />
            </div>
          </section>
        </FadeIn>
      ) : ( 
        <FadeIn>
            <section className="section-padding bg-muted">
                <div className="container mx-auto text-center">
                    <h2 className="section-title">What Our Clients Say</h2>
                    <p className="text-lg text-muted-foreground mt-4 mb-12 max-w-xl mx-auto text-balance">
                        We are currently gathering testimonials. Check back soon!
                    </p>
                </div>
            </section>
        </FadeIn>
      )}

      {/* Featured Projects Section */}
      <FadeIn>
        <section className="section-padding">
          <div className="container mx-auto">
            <h2 className="section-title">Our Projects</h2>
             <p className="text-lg text-muted-foreground text-center mb-12 max-w-xl mx-auto text-balance">
              Take a glimpse at some of the impactful projects we've delivered.
            </p>
            {featuredProjects.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProjects.map((project, index) => (
                    <FadeIn key={project.id} delay={index * 150}>
                    <Card className="overflow-hidden h-full hover:shadow-xl transition-shadow duration-300 flex flex-col">
                        <Image
                        src={project.imageUrl}
                        alt={project.title || 'Project showcase image'}
                        width={600}
                        height={400}
                        data-ai-hint={project.dataAiHint || 'project image'}
                        className="w-full h-48 object-cover"
                        />
                        <CardHeader>
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                        <CardDescription>{project.description}</CardDescription>
                        </CardContent>
                        <CardFooter>
                        <Link href={`/projects/${project.id}`} className="w-full">
                            <Button variant="outline" className="w-full">View Case Study</Button>
                        </Link>
                        </CardFooter>
                    </Card>
                    </FadeIn>
                ))}
                </div>
            ) : (
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, index) => (
                        <Card key={index} className="overflow-hidden h-full">
                            <Skeleton className="w-full h-48" />
                            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                            <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6 mt-2" /></CardContent>
                            <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
                        </Card>
                    ))}
                </div>
            )}
             <div className="text-center mt-12">
              <Link href="/projects">
                <Button variant="link" className="text-lg text-primary hover:underline">
                  See All Projects <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="section-padding text-center bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-semibold mb-4" dangerouslySetInnerHTML={{ __html: pageContent.finalCtaTitle }}></h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
                {pageContent.finalCtaSubtitle}
            </p>
            <Link href="/contact">
                <Button size="lg" className="button-primary">
                    Let's Talk
                </Button>
            </Link>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
