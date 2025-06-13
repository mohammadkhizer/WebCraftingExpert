
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Github, CalendarDays, User, Layers, Tag, UserCircle } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { getProjectById } from '@/services/projectService';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';


type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let project: Project | null = null;
  try {
    project = await getProjectById(params.id);
  } catch (error) {
    console.error("Error fetching project for metadata:", error);
  }

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }
  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.imageUrl ? [{ url: project.imageUrl }] : [],
    },
     twitter: {
      title: project.title,
      description: project.description,
      images: project.imageUrl ? [project.imageUrl] : [],
    }
  };
}

const ProjectDetailPageSkeleton = () => (
  <div className="bg-background text-foreground">
    <FadeIn>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Skeleton className="h-6 w-48 mb-8" />
      </div>
    </FadeIn>
    <FadeIn delay={100}>
      <div className="relative h-64 md:h-96 lg:h-[500px] w-full overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10 container mx-auto">
          <Skeleton className="h-10 w-3/4 md:w-1/2 mb-2" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </FadeIn>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        <main className="lg:col-span-8 space-y-10">
          <FadeIn delay={200}>
            <section>
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-5/6 mb-2" />
              <Skeleton className="h-5 w-full" />
            </section>
          </FadeIn>
          <FadeIn delay={300}>
            <section>
              <Skeleton className="h-7 w-1/4 mb-4" />
              <div className="flex flex-wrap gap-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-7 w-24 rounded-md" />)}
              </div>
            </section>
          </FadeIn>
        </main>
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">
          <FadeIn delay={400}>
            <Card className="shadow-lg border border-border/50">
              <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => <div key={i} className="flex items-start"><Skeleton className="h-5 w-5 rounded-full mr-3 mt-1 shrink-0" /><Skeleton className="h-4 w-3/4" /></div>)}
              </CardContent>
            </Card>
          </FadeIn>
          <FadeIn delay={500}>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </FadeIn>
        </aside>
      </div>
    </div>
  </div>
);


export default async function ProjectDetailPage({ params }: Props) {
  const projectId = params.id;
  let project: Project | null = null;

  try {
    project = await getProjectById(projectId);
  } catch (error) {
    console.error("Failed to fetch project for Project Detail Page:", error);
  }

  if (!project) {
     return <ProjectDetailPageSkeleton />;
  }

  const { title, longDescription, imageUrl, dataAiHint, tags, liveUrl, repoUrl, client, date, technologies, description, developerName } = project;
  const displayDate = date ? format(new Date(date), 'MMMM dd, yyyy') : null;

  return (
    <div className="bg-background text-foreground">
      <FadeIn>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Link href="/projects" className="inline-flex items-center text-primary hover:underline mb-8 group text-sm">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to All Projects
          </Link>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="relative h-64 md:h-96 lg:h-[500px] w-full overflow-hidden group">
          <Image
            src={imageUrl}
            alt={`Showcase image for the project: ${title}`}
            fill
            data-ai-hint={dataAiHint || 'project showcase'}
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 md:p-10 container mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 shadow-text">{title}</h1>
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs backdrop-blur-sm bg-black/30 text-white border-white/30">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </FadeIn>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          <main className="lg:col-span-8 space-y-10">
            <FadeIn delay={200}>
              <section>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">Project Overview</h2>
                <div className="prose prose-lg max-w-none dark:prose-invert text-muted-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:underline prose-p:leading-relaxed prose-p:text-balance">
                  <p>{longDescription || description}</p>
                </div>
              </section>
            </FadeIn>

            {technologies && technologies.length > 0 && (
              <FadeIn delay={300}>
                <section>
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Technologies Used</h3>
                  <div className="flex flex-wrap gap-3">
                    {technologies.map(tech => (
                      <Badge key={tech} variant="default" className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </section>
              </FadeIn>
            )}
          </main>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">
            <FadeIn delay={400}>
              <Card className="shadow-lg border border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl text-card-foreground">Project Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center">
                    <UserCircle className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                    <div>
                      <span className="font-medium text-muted-foreground">Developer:</span>
                      <p className="text-foreground">{developerName}</p>
                    </div>
                  </div>
                  {client && (
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                       <div>
                        <span className="font-medium text-muted-foreground">Client:</span>
                        <p className="text-foreground">{client}</p>
                      </div>
                    </div>
                  )}
                  {displayDate && (
                    <div className="flex items-center">
                      <CalendarDays className="h-5 w-5 mr-3 text-primary flex-shrink-0" />
                       <div>
                        <span className="font-medium text-muted-foreground">Date:</span>
                        <p className="text-foreground">{displayDate}</p>
                      </div>
                    </div>
                  )}
                   {tags && tags.length > 0 && (
                     <div className="flex items-start">
                      <Tag className="h-5 w-5 mr-3 text-primary mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-muted-foreground">Categories:</span>
                        <div className="text-foreground flex flex-wrap gap-1 mt-1">
                           {tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
             <FadeIn delay={500}>
                <div className="space-y-3">
                    {liveUrl && liveUrl !== '#' && (
                    <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <Button className="w-full button-primary text-base py-3">
                        <ExternalLink className="mr-2 h-5 w-5" /> View Live Site
                        </Button>
                    </a>
                    )}
                    {repoUrl && repoUrl !== '#' && (
                    <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="outline" className="w-full border-border hover:bg-muted/50 text-base py-3">
                        <Github className="mr-2 h-5 w-5" /> View Code Repository
                        </Button>
                    </a>
                    )}
                    {(liveUrl === '#' || !liveUrl) && (repoUrl === '#' || !repoUrl) && (
                        <p className="text-xs text-center text-muted-foreground">Links not available for this project.</p>
                    )}
                </div>
            </FadeIn>
          </aside>
        </div>
      </div>
    </div>
  );
}
