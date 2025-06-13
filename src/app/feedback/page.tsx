
"use client";

import type { Metadata } from 'next'; // Metadata is not used in Client Components directly
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Star, MessageCircleQuestion } from "lucide-react";
import { useState, useEffect } from "react";
import { submitFeedback, type CreateFeedbackData } from '@/services/feedbackService';
import { FadeIn } from '@/components/motion/fade-in';

// Metadata for Client Components should be handled by a parent Server Component (e.g., RootLayout or a dedicated Server Component for this route if more specific metadata is needed)
// The RootLayout already provides a template. If specific title/description is needed, this page might need a Server Component wrapper.
// export const metadata: Metadata = {
//   title: 'Share Your Feedback', // This would be the specific part
// };

const feedbackFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100, { message: "Name too long." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  rating: z.coerce.number().min(1, {message: "Please select a rating."}).max(5, {message: "Rating cannot exceed 5."}),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(1000, { message: "Message must not exceed 1000 characters." }),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export default function FeedbackPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRating, setCurrentRating] = useState(0);

  useEffect(() => {
    // For Client Components, document title can be set here if needed,
    // though it's often better managed by `generateMetadata` in Server Components.
    // For consistency with other pages, we'll let RootLayout's template handle it if
    // no specific Server Component parent provides a title.
    // Example: document.title = "Share Your Feedback | ByteBrusters";
  }, []);


  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      name: "",
      email: "",
      rating: 0, // Default to 0, so validation for min 1 catches it if not selected
      message: "",
    },
  });

  async function onSubmit(values: FeedbackFormValues) {
    setIsSubmitting(true);
    try {
      const feedbackData: CreateFeedbackData = {
        name: values.name,
        email: values.email,
        rating: values.rating,
        message: values.message,
      };
      await submitFeedback(feedbackData);
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your valuable feedback.",
      });
      form.reset();
      setCurrentRating(0); // Reset visual rating state
      form.setValue('rating', 0); // Explicitly reset form rating value for react-hook-form
    } catch (error) {
      toast({
        title: "Error Submitting Feedback",
        description: (error as Error).message || "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto section-padding">
      <FadeIn>
        <section className="text-center mb-16">
          <MessageCircleQuestion className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="section-title inline-block">Share Your Feedback</h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto text-balance">
            We value your opinion! Let us know how we're doing and how we can improve.
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="max-w-2xl mx-auto bg-card p-6 md:p-8 rounded-lg shadow-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => ( // field includes onChange, value, etc.
                  <FormItem className="space-y-2">
                    <FormLabel>Overall Rating</FormLabel>
                    <FormControl>
                       <div className="flex items-center space-x-1" role="radiogroup" aria-labelledby="rating-label">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                          <button
                            suppressHydrationWarning={true}
                            type="button"
                            key={starValue}
                            role="radio"
                            aria-checked={currentRating === starValue}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => {
                                field.onChange(starValue); // Update form state
                                setCurrentRating(starValue); // Update visual state
                            }}
                            className="focus:outline-none p-1 rounded-full focus-visible:ring-2 focus-visible:ring-ring"
                            aria-label={`Rate ${starValue} out of 5 stars`}
                          >
                            <Star
                              className={`h-8 w-8 cursor-pointer transition-colors
                                ${starValue <= (hoverRating || field.value || currentRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50 hover:text-yellow-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage /> {/* This will show "Please select a rating." if rating is 0 */}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us what you think..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full button-primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4"/> Submit Feedback</>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </FadeIn>
    </div>
  );
}
