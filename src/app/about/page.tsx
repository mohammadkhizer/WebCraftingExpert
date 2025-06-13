
import type { Metadata } from 'next';
import Image from 'next/image';
import { CheckSquare, Users, Target, Lightbulb, Award } from 'lucide-react';
import type { AboutPageContent } from '@/types';
import { FadeIn } from '@/components/motion/fade-in';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAboutPageContent } from '@/services/aboutPageContentService';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'About Us', // RootLayout template will append "| ByteBrusters"
};

const coreValuesHardcoded = [
  { title: "Innovation", icon: Lightbulb, description: "We constantly seek new and better ways to solve problems and create value." },
  { title: "Integrity", icon: Award, description: "We operate with honesty and transparency in all our interactions." },
  { title: "Collaboration", icon: Users, description: "We believe in the power of teamwork, both internally and with our clients." },
  { title: "Excellence", icon: CheckSquare, description: "We strive for the highest quality in everything we do, aiming to exceed expectations." },
];

const AboutPageContentSkeleton = () => (
  <div className="container mx-auto section-padding">
    {/* Intro Section Skeleton */}
    <FadeIn>
      <section className="text-center mb-24">
        <Skeleton className="h-12 w-1/2 md:w-1/3 mx-auto mb-4" />
        <Skeleton className="h-6 w-3/4 md:w-2/3 mx-auto" />
        <Skeleton className="h-5 w-5/6 md:w-1/2 mx-auto mt-2" />
      </section>
    </FadeIn>

    {/* Mission Section Skeleton */}
    <FadeIn>
      <section className="mb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Skeleton className="h-10 w-1/3 mb-4" />
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-5 w-5/6" />
          </div>
          <div className="hidden md:block relative aspect-video">
             <Skeleton className="rounded-lg object-cover shadow-xl w-full h-full" />
          </div>
        </div>
      </section>
    </FadeIn>
    
    {/* Vision Section Skeleton */}
    <FadeIn>
        <section className="mb-24">
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <div className="hidden md:block relative aspect-video">
               <Skeleton className="rounded-lg object-cover shadow-xl w-full h-full" />
            </div>
            <div>
              <Skeleton className="h-10 w-1/3 mb-4" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-5/6" />
            </div>
          </div>
        </section>
      </FadeIn>

    {/* Core Values Skeleton */}
    <FadeIn>
      <section className="mb-24">
        <Skeleton className="h-10 w-1/2 md:w-1/3 mx-auto mb-12" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="text-center h-full">
              <CardHeader><div className="mx-auto bg-muted rounded-full p-3 w-16 h-16 mb-3 flex items-center justify-center"><Skeleton className="h-8 w-8 rounded-full"/></div><Skeleton className="h-6 w-3/4 mx-auto" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6 mt-2" /></CardContent>
            </Card>
          ))}
        </div>
      </section>
    </FadeIn>
  </div>
);


export default async function AboutPage() {
  let pageContent: AboutPageContent | null = null;

  try {
    pageContent = await getAboutPageContent();
  } catch (error) {
    console.error("[AboutPage] Failed to fetch about page content:", error);
  }
  
  if (!pageContent) {
    return <AboutPageContentSkeleton />;
  }

  return (
    <div className="container mx-auto section-padding">
      <FadeIn>
        <section className="text-center mb-24">
          <h1 className="section-title inline-block">{pageContent.introTitle}</h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto text-balance">
            {pageContent.introSubtitle}
          </p>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="mb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-subtitle !text-primary flex items-center mb-4">
                <Target className="w-10 h-10 mr-3" /> {pageContent.missionTitle}
              </h2>
              <p className="text-lg text-foreground mb-4 text-balance">
                {pageContent.missionParagraph}
              </p>
            </div>
            <div className="hidden md:block relative aspect-video">
               <Image
                  src="/public/our_mission.png"
                  alt={pageContent.missionTitle || "ByteBrusters' Mission"}
                  fill
                  data-ai-hint={pageContent.missionImageAiHint || "focused goals"}
                  className="rounded-lg object-cover shadow-xl"
                />
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="mb-24">
           <div className="grid md:grid-cols-2 gap-12 items-center">
             <div className="hidden md:block relative aspect-video">
               <Image
                  src={pageContent.visionImageUrl}
                  alt={pageContent.visionTitle || "ByteBrusters' Vision"}
                  fill
                  data-ai-hint={pageContent.visionImageAiHint || "future cityscape"}
                  className="rounded-lg object-cover shadow-xl"
                />
            </div>
            <div>
              <h2 className="section-subtitle !text-primary flex items-center mb-4">
                <Lightbulb className="w-10 h-10 mr-3" /> {pageContent.visionTitle}
              </h2>
              <p className="text-lg text-foreground mb-4 text-balance">
                {pageContent.visionParagraph}
              </p>
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn>
        <section className="mb-24">
          <h2 className="section-title">{pageContent.coreValuesTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {coreValuesHardcoded.map((value, index) => (
              <FadeIn key={value.title} delay={index * 100}>
                <Card className="text-center h-full hover:shadow-lg transition-shadow bg-card">
                  <CardHeader>
                    <div className="mx-auto text-primary bg-primary/10 p-3 rounded-full w-fit mb-3">
                      <value.icon size={32} />
                    </div>
                    <CardTitle className="text-xl text-card-foreground">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
