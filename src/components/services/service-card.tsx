
import type { Service } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getIconComponent } from '@/lib/iconUtils'; // Import the utility function

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { id, title, description, iconName } = service; // Destructure iconName
  const IconComponent = getIconComponent(iconName); // Resolve icon component on the client side

  return (
    <Card className="flex flex-col h-full hover:shadow-xl transition-shadow duration-300 group">
      <CardHeader className="items-center text-center">
        {IconComponent && ( // Check if IconComponent exists
          <div className="mb-4 p-4 bg-primary/10 text-primary rounded-full w-fit group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
            <IconComponent className="h-10 w-10" />
          </div>
        )}
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-center">
        <CardDescription className="text-md">{description}</CardDescription>
      </CardContent>
      <CardFooter className="justify-center">
        <Link href={`/services/${id}`}>
          <Button variant="outline" className="group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
            Learn More <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
