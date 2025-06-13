
import type { Project } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Github, User } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { id, title, description, imageUrl, dataAiHint, tags, liveUrl, repoUrl, developerName } = project;

  return (
    <Card className="flex flex-col h-full overflow-hidden group hover:shadow-xl transition-shadow duration-300">
      <Link href={`/projects/${id}`} className="block">
        <Image
          src={imageUrl}
          alt={title || 'Project image'}
          width={600}
          height={400}
          data-ai-hint={dataAiHint || 'project abstract'}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <CardHeader>
        <Link href={`/projects/${id}`}>
          <CardTitle className="text-xl hover:text-primary transition-colors duration-300">{title}</CardTitle>
        </Link>
        <div className="text-xs text-muted-foreground flex items-center mt-1">
          <User className="h-3 w-3 mr-1" />
          <span>{developerName}</span>
        </div>
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="default">{tag}</Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm line-clamp-3">{description}</CardDescription>
      </CardContent>
      <CardFooter className="flex-col items-start space-y-3">
        <Link href={`/projects/${id}`} className="w-full">
          <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
            View Details
          </Button>
        </Link>
        <div className="flex space-x-2 w-full">
          {liveUrl && (
            <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary">
                <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
              </Button>
            </a>
          )}
          {repoUrl && (
            <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary">
                <Github className="mr-2 h-4 w-4" /> View Code
              </Button>
            </a>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
