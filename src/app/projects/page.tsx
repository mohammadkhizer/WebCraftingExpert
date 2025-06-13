
import type { Metadata } from 'next';
import type { Project } from '@/types';
import { ProjectCard } from '@/components/projects/project-card';
import { FadeIn } from '@/components/motion/fade-in';
import { getProjects } from '@/services/projectService';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Our Projects', // RootLayout template will append "| ByteBrusters"
};

const ProjectsPageSkeleton = () => (
  <div className="container mx-auto section-padding">
    <FadeIn>
      <section className="text-center mb-16">
        <Skeleton className="h-12 w-1/2 md:w-1/3 mx-auto mb-4" />
        <Skeleton className="h-6 w-3/4 md:w-2/3 mx-auto" />
      </section>
    </FadeIn>
     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, index) => (
            <Card key={index} className="overflow-hidden h-full">
                <Skeleton className="w-full h-56" />
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6 mt-2" /></CardContent>
                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
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


export default async function ProjectsPage() {
  let projects: Project[] = [];

  try {
    const fetchedProjects = await getProjects();
    projects = fetchedProjects.filter(p => p.status === 'Completed' || p.status === 'In Progress');
  } catch (error) {
    console.error("Failed to fetch projects for Projects Page:", error);
  }

  if (projects.length === 0) {
    return <ProjectsPageSkeleton />;
  }

  return (
    <div className="container mx-auto section-padding">
      <FadeIn>
        <section className="text-center mb-16">
          <h1 className="section-title inline-block">Our Projects</h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto text-balance">
            Discover a selection of our finest work. Each project showcases our commitment to quality, innovation, and client satisfaction.
          </p>
        </section>
      </FadeIn>

      {projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <FadeIn key={project.id} delay={index * 100}>
              <ProjectCard project={project} />
            </FadeIn>
          ))}
        </div>
      ) : (
        <FadeIn>
          <p className="text-center text-muted-foreground text-lg py-12">No projects to display at the moment. Check back soon!</p>
        </FadeIn>
      )}

      <FadeIn delay={projects.length * 100 + 200}>
        <section className="mt-24 text-center bg-muted/50 p-12 rounded-lg">
            <h2 className="text-3xl font-semibold mb-4"><span className="gradient-text">Have a Project in Mind?</span></h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
                We're excited to learn about your ideas and help bring them to life.
            </p>
            <Link href="/contact">
                <Button size="lg" className="button-primary">
                    Start Your Project Today <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </Link>
        </section>
      </FadeIn>
    </div>
  );
}
