
import type { Metadata } from 'next';
import { FadeIn } from '@/components/motion/fade-in';
import { RuleBasedChatbot } from '@/components/chatbot/RuleBasedChatbot';
import { Bot } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chatbot Assistant', // Will be appended with "| ByteBrusters" by RootLayout
  description: "Ask questions and get quick answers from the ByteBrusters chatbot assistant. We're here to help you with your IT needs.",
  openGraph: {
    title: 'ByteBrusters Chatbot - Your Digital Assistant',
    description: "Interact with our chatbot for quick support and information about ByteBrusters services.",
  },
  twitter: {
    title: 'ByteBrusters Chatbot - Your Digital Assistant',
    description: "Interact with our chatbot for quick support.",
  }
};

export default function ChatbotPage() {
  return (
    <div className="container mx-auto section-padding flex flex-col items-center">
      <FadeIn>
        <section className="text-center mb-12">
          <Bot className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="section-title inline-block">Chat with Our Assistant</h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto text-balance">
            Have a quick question? Our assistant can help you find information about our services, projects, or how to get in touch.
          </p>
        </section>
      </FadeIn>

      <FadeIn delay={100} className="w-full max-w-2xl h-[70vh] min-h-[400px] max-h-[600px]">
        <div className="bg-card p-0 rounded-lg shadow-xl border border-border/30 h-full">
          <RuleBasedChatbot />
        </div>
      </FadeIn>
    </div>
  );
}
