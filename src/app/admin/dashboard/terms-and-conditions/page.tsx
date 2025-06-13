
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2, Info } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { useToast } from "@/hooks/use-toast";
import { getTermsAndConditions, updateTermsAndConditions } from '@/services/termsAndConditionsService';
import type { TermsAndConditions } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminTermsAndConditionsPage() {
  const { toast } = useToast();
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchTerms() {
      setIsLoading(true);
      try {
        const terms = await getTermsAndConditions();
        setContent(terms.content);
        setLastUpdated(terms.updatedAt);
      } catch (error) {
        console.error("Error loading Terms and Conditions:", error);
        toast({ title: "Error Loading Terms", description: (error as Error).message || "Failed to load terms and conditions.", variant: "destructive" });
        setContent("<p>Failed to load content. Please try refreshing.</p>");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTerms();
  }, [toast]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const updatedTerms = await updateTermsAndConditions(content);
      setContent(updatedTerms.content);
      setLastUpdated(updatedTerms.updatedAt);
      toast({ title: "Terms and Conditions Updated", description: "Your changes have been saved successfully." });
    } catch (error) {
      console.error("Error saving Terms and Conditions:", error);
      toast({ title: "Error Saving Terms", description: (error as Error).message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FadeIn>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Manage Terms and Conditions</h1>
          <p className="text-muted-foreground">Edit the content for your website's Terms and Conditions page.</p>
        </div>

        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Content Format</AlertTitle>
            <AlertDescription>
                The content below supports HTML. Ensure your markup is valid. Use headings (h2, h3), paragraphs (p), lists (ul, ol, li), and links (a) as needed.
                For new lines within a paragraph, you might need to use &lt;br&gt; tags if simple newlines in the editor don't render as expected.
            </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Terms and Conditions Content</CardTitle>
            <CardDescription>
              {lastUpdated ? `Last updated: ${new Date(lastUpdated).toLocaleString()}` : 'Not yet saved.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Textarea
                id="termsContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 min-h-[400px] text-sm font-mono"
                placeholder="Enter your terms and conditions content here (HTML is supported)..."
                disabled={isSaving}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSaveChanges} className="button-primary" disabled={isSaving || isLoading}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>
    </FadeIn>
  );
}
