
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FaqClient() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<{ answer: string; useCannedResponse: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setResponse({ answer: "AI FAQ functionality has been removed.", useCannedResponse: true});
    setIsLoading(false);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <MessageSquare className="mr-2 h-6 w-6 text-primary" />
          Ask a Question
        </CardTitle>
        <CardDescription>
          This AI assistant feature has been removed. Please use the static FAQ or contact us directly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px] text-base"
              disabled={true} // Disabled as feature is removed
            />
          </div>
          <Button type="submit" className="w-full button-primary" disabled={true}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Answer...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Ask (Feature Removed)
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {response && (
          <div className="mt-6 p-6 bg-muted rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-foreground">Response:</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{response.answer}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          For complex queries, please <a href="/contact" className="text-primary hover:underline">contact us</a> directly.
        </p>
      </CardFooter>
    </Card>
  );
}
