import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata = {
  metadataBase: new URL("https://social-flowai.vercel.app"),
  title: {
    default: "OmaticSocial - AI Social Media Content Management",
    template: "%s | OmaticSocial",
  },
  description:
    "OmaticSocial is an AI-powered platform that helps you create, schedule, and manage social media content effortlessly. Generate posts, analyze engagement, and grow your brand with AI automation.",
  keywords: [
    "AI social media manager",
    "AI content creator",
    "social media automation",
    "social media scheduler",
    "AI copywriter",
    "content planner",
    "Instagram scheduler",
    "Facebook post generator",
    "LinkedIn AI content",
    "OmaticSocial",
  ],
  authors: [
    { name: "OmaticSocial Team", url: "https://social-flowai.vercel.app" },
  ],
  creator: "OmaticSocial AI",
  publisher: "OmaticSocial",
  openGraph: {
    title: "OmaticSocial - AI Social Media Content Management",
    description:
      "Create, schedule, and manage all your social media content with AI. OmaticSocial helps automate your social growth with smart scheduling and post generation.",
    url: "https://social-flowai.vercel.app",
    siteName: "OmaticSocial",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://social-flowai.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "OmaticSocial - AI Social Media Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OmaticSocial - AI Social Media Content Management",
    description:
      "AI-powered social media content creation and scheduling platform. Save time and grow faster with OmaticSocial.",
    site: "@omaticsocial",
    creator: "@omaticsocial",
    images: ["https://social-flowai.vercel.app/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  alternates: {
    canonical: "https://social-flowai.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


import { ClerkProvider } from '@clerk/nextjs'

import { Toaster } from "@/components/ui/toaster"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "OmaticSocial",
                url: "https://social-flowai.vercel.app",
                applicationCategory: "Social Media Management",
                operatingSystem: "Web",
                description:
                  "AI-powered platform for managing, scheduling, and generating social media content.",
                image: "https://social-flowai.vercel.app/og-image.png",
                author: {
                  "@type": "Organization",
                  name: "OmaticSocial AI",
                },
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: "4.9",
                  reviewCount: "128",
                },
              }),
            }}
          />

          {/* <link rel="canonical" href="https://bismillah-auto.netlify.app" /> */}
          <link rel="icon" type="image/svg+xml" href="/favicon.png" />
          <link href="https://fonts.googleapis.com" rel="preconnect" />
          <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
          <link href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700;900&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </head>
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
          {children}
          <Analytics />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
