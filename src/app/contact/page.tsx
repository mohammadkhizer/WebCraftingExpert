
import type { Metadata } from 'next';
import { ContactForm } from '@/components/contact/contact-form';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FadeIn } from '@/components/motion/fade-in';
import { getFAQItems } from '@/services/faqService';
import type { FAQItem } from '@/types';
import { getContactInfo } from '@/services/contactService';
import type { ContactInfo } from '@/types';
import { StaticFAQ } from '@/components/faq/static-faq';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: "Have a question or project idea? Contact ByteBrusters. We're ready to discuss your IT needs and provide expert solutions. Reach out via form, email, or phone.",
  openGraph: {
    title: 'Contact ByteBrusters - Let\'s Start a Conversation',
    description: "Reach out to ByteBrusters for inquiries about our IT services, project collaborations, or general questions. We're here to help.",
  },
  twitter: {
    title: 'Contact ByteBrusters - Let\'s Start a Conversation',
    description: "Reach out to ByteBrusters for inquiries about our IT services, project collaborations, or general questions.",
  }
};

const ContactPageSkeleton = () => (
  <div className="container mx-auto section-padding">
    <FadeIn>
      <section className="text-center mb-16">
        <Skeleton className="h-12 w-1/2 md:w-1/3 mx-auto mb-4" />
        <Skeleton className="h-6 w-3/4 md:w-2/3 mx-auto" />
      </section>
    </FadeIn>
    <div className="grid lg:grid-cols-2 gap-x-12 gap-y-16 items-start mb-24">
      <FadeIn delay={100}>
        <div className="bg-card p-6 md:p-8 rounded-lg shadow-xl">
          <Skeleton className="h-8 w-1/2 mb-6" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </FadeIn>
      <FadeIn delay={200}>
        <div className="space-y-8">
          <div className="bg-card p-6 md:p-8 rounded-lg shadow-xl">
            <Skeleton className="h-8 w-3/4 mb-6" />
            <ul className="space-y-4">
              <li className="flex items-center"><Skeleton className="h-6 w-6 mr-3 rounded-full" /><Skeleton className="h-5 w-3/4" /></li>
              <li className="flex items-center"><Skeleton className="h-6 w-6 mr-3 rounded-full" /><Skeleton className="h-5 w-2/3" /></li>
              <li className="flex items-start"><Skeleton className="h-6 w-6 mr-3 rounded-full mt-1" /><Skeleton className="h-5 w-full" /></li>
            </ul>
          </div>
        </div>
      </FadeIn>
    </div>
    <FadeIn delay={300}>
      <section className="mb-16">
        <Skeleton className="h-10 w-1/3 mx-auto mb-8" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      </section>
    </FadeIn>
  </div>
);


export default async function ContactPage() {
  let faqItems: FAQItem[] = [];
  let contactInfo: ContactInfo | null = null;

  try {
    [faqItems, contactInfo] = await Promise.all([
      getFAQItems(),
      getContactInfo()
    ]);
  } catch (error) {
    console.error("Failed to load data for contact page:", error);
  }

  if (!contactInfo) {
    return <ContactPageSkeleton />;
  }

  return (
    <div className="container mx-auto section-padding">
      <FadeIn>
        <section className="text-center mb-16">
          <h1 className="section-title inline-block">Get In Touch</h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto text-balance">
            We're here to help and answer any question you might have. We look forward to hearing from you!
          </p>
        </section>
      </FadeIn>

      <div className="grid lg:grid-cols-2 gap-x-12 gap-y-16 items-start mb-24">
        <FadeIn delay={100}>
          <div className="bg-card p-6 md:p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-card-foreground">Send Us a Message</h2>
            <ContactForm />
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="space-y-8">
            <div className="bg-card p-6 md:p-8 rounded-lg shadow-xl">
              <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-card-foreground">Contact Information</h2>
              {contactInfo ? (
                <ul className="space-y-4 text-base md:text-lg text-muted-foreground">
                  <li className="flex items-center">
                    <Mail className="h-5 w-5 md:h-6 md:w-6 mr-3 text-primary" />
                    <a href={`mailto:${contactInfo.email}`} className="hover:text-primary transition-colors">{contactInfo.email}</a>
                  </li>
                  <li className="flex items-center">
                    <Phone className="h-5 w-5 md:h-6 md:w-6 mr-3 text-primary" />
                    <a href={`tel:${contactInfo.phone}`} className="hover:text-primary transition-colors">{contactInfo.phone}</a>
                  </li>
                  <li className="flex items-start"> 
                    <MapPin className="h-5 w-5 md:h-6 md:w-6 mr-3 text-primary mt-1 shrink-0 lucide lucide-map-pin"/>
                    <span>{contactInfo.address}</span>
                  </li>
                </ul>
              ) : (
                <p className="text-muted-foreground">Contact information is currently unavailable. Please try again later.</p>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
      <FadeIn delay={300}>
        <section>
           <StaticFAQ items={faqItems} />
        </section>
      </FadeIn>
    </div>
  );
}
