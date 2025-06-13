
"use client";

import type { TeamMember } from '@/types';
import Image from 'next/image';
import Link from 'next/link'; // Link might still be used for social icons
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Linkedin, Github, Twitter, FileText, Info as InstagramIcon } from 'lucide-react';

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  let finalSrc = member.imageUrl;

  if (member.imageUrl && (member.imageUrl.includes("/_next/image?url=") || member.imageUrl.includes("localhost/_next/image?url="))) {
    try {
      const urlObj = new URL(member.imageUrl, member.imageUrl.startsWith("/") ? (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000") : undefined); 
      const originalUrlEncoded = urlObj.searchParams.get("url");
      if (originalUrlEncoded) {
        finalSrc = decodeURIComponent(originalUrlEncoded);
      }
    } catch (e) {
      console.warn("Failed to parse optimized image URL for team card, using original value:", member.imageUrl, e);
    }
  }

  return (
    <Card className="text-center overflow-hidden group hover:shadow-xl transition-shadow duration-300 h-full flex flex-col bg-card">
      <div className="block relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={finalSrc || 'https://placehold.co/400x300.png'}
          alt={`Portrait of ${member.name}, ${member.role} at ByteBrusters`}
          fill
          data-ai-hint={member.dataAiHint || 'person portrait'}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-card-foreground">{member.name}</CardTitle>
        <p className="text-sm text-muted-foreground font-medium">{member.role}</p>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <p className="text-sm text-muted-foreground mb-4 text-balance line-clamp-3">{member.bio}</p>
        <div className="mt-auto">
          <div className="flex justify-center space-x-2 mb-4">
            {member.socials?.linkedin && (
              <Link href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s LinkedIn Profile`}>
                <Button variant="outline" size="icon" className="hover:bg-primary/10 border-border rounded-full">
                  <Linkedin className="h-4 w-4 text-primary" />
                </Button>
              </Link>
            )}
            {member.socials?.github && (
              <Link href={member.socials.github} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s GitHub Profile`}>
                <Button variant="outline" size="icon" className="hover:bg-accent/10 border-border rounded-full">
                  <Github className="h-4 w-4 text-foreground/80" />
                </Button>
              </Link>
            )}
            {member.socials?.twitter && (
              <Link href={member.socials.twitter} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s Twitter Profile`}>
                <Button variant="outline" size="icon" className="hover:bg-sky-400/10 border-border rounded-full">
                  <Twitter className="h-4 w-4 text-sky-500" />
                </Button>
              </Link>
            )}
            {member.socials?.instagram && (
                <Link href={member.socials.instagram} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s Instagram Profile`}>
                    <Button variant="outline" size="icon" className="hover:bg-pink-400/10 border-border rounded-full">
                        <InstagramIcon className="h-4 w-4 text-pink-500" />
                    </Button>
                </Link>
            )}
            {member.socials?.cvUrl && (
              <Link href={member.socials.cvUrl} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s CV/Resume`}>
                <Button variant="outline" size="icon" className="hover:bg-green-400/10 border-border rounded-full">
                  <FileText className="h-4 w-4 text-green-500" />
                </Button>
              </Link>
            )}
          </div>
          {/* "View Full Profile" button removed */}
        </div>
      </CardContent>
    </Card>
  );
}
