
import type { Metadata, Viewport } from 'next';
import { Inter, Roboto_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { getSiteSettings } from '@/services/siteSettingsService';
import { ScrollToTopButton } from '@/components/layout/ScrollToTopButton';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

const primarySansFont = Inter({
  variable: '--font-primary-sans',
  subsets: ['latin'],
});

const primaryMonoFont = Roboto_Mono({
  variable: '--font-primary-mono',
  subsets: ['latin'],
});

const siteConfig = {
  name: 'webcraftingexperts',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  description: 'webcraftingexperts: Your expert partner for custom web development, mobile app creation, AI solutions, and comprehensive IT consulting. We build innovative digital experiences that drive growth.',
  defaultOgImage: '/og-default.png', // Ensure this image exists in /public
  twitterHandle: '@webcraftingexperts', // Replace with actual handle
  developerName: 'Mohammed Khizer Shaikh',
  developerLinkedIn: 'https://www.linkedin.com/in/mohammad-khizer-shaikh-14a362275/',
};

export async function generateMetadata(): Promise<Metadata> {
  let settings;
  try {
    settings = await getSiteSettings();
  } catch (error) {
    console.warn("Failed to fetch site settings for root metadata, using defaults:", error);
    settings = null;
  }

  const siteTitle = settings?.siteTitle || siteConfig.name;
  const siteDescription = settings?.siteDescription || siteConfig.description;
  const baseUrl = new URL(siteConfig.baseUrl);

  return {
    metadataBase: baseUrl,
    title: {
      default: `${siteTitle} - Innovating Your Digital Future`, // Default for homepage or if a page doesn't set a title
      template: `%s | ${siteTitle}`, // Template for other pages
    },
    description: siteDescription,
    keywords: ['IT solutions', 'web development', 'mobile apps', 'AI integration', 'ByteBrusters', 'tech agency', 'software development', 'digital transformation', 'custom software', 'Ahmedabad', 'Gujarat', 'India', 'Mohammed Khizer Shaikh'],
    authors: [{ name: siteConfig.developerName, url: siteConfig.developerLinkedIn }],
    creator: siteConfig.developerName,
    publisher: siteTitle,
    applicationName: siteTitle,

    openGraph: {
      title: {
        default: `${siteTitle} - Innovating Your Digital Future`,
        template: `%s | ${siteTitle}`,
      },
      description: siteDescription,
      url: siteConfig.baseUrl,
      siteName: siteTitle,
      images: [
        {
          url: new URL(siteConfig.defaultOgImage, siteConfig.baseUrl).toString(),
          width: 1200,
          height: 630,
          alt: `${siteTitle} - IT Solutions Agency`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: {
        default: `${siteTitle} - Innovating Your Digital Future`,
        template: `%s | ${siteTitle}`,
      },
      description: siteDescription,
      creator: siteConfig.twitterHandle,
      site: siteConfig.twitterHandle,
      images: [new URL(siteConfig.defaultOgImage, siteConfig.baseUrl).toString()],
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#E3EBF8' },
    { media: '(prefers-color-scheme: dark)', color: '#232323' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${primarySansFont.variable} ${primaryMonoFont.variable} antialiased flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <Toaster />
            <ScrollToTopButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
