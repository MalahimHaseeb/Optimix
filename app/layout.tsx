import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Optimix | AI-Powered SEO Audit & Growth Intelligence Tool",
  description: "Accelerate your web growth with Optimix. Get high-performance SEO insights, structural analysis, and keyword intelligence for any web project. Built for digital excellence.",
  keywords: ["SEO Audit", "Web Growth", "SEO Tool", "Growth Intelligence", "Website Analysis", "Optimix", "SEO Optimization"],
  authors: [{ name: "Malahim Haseeb", url: "https://malahim.dev" }],
  creator: "Malahim Haseeb",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://optimix.malahim.dev",
    title: "Optimix | AI-Powered SEO Audit & Growth Intelligence Tool",
    description: "Unlock high-performance insights for any web project. Our local intelligence engine scans structure and keywords to sharpen your digital edge.",
    siteName: "Optimix",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Optimix - AI-Powered SEO Audit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Optimix | AI-Powered SEO Audit & Growth Intelligence Tool",
    description: "Accelerate your web growth with high-performance SEO insights.",
    creator: "@MalahimHaseeb",
    images: ["/og-image.png"],
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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Optimix",
              "operatingSystem": "Web",
              "applicationCategory": "SEO Tool",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Person",
                "name": "Malahim Haseeb",
                "url": "https://malahim.dev"
              },
              "description": "Optimix is an AI-powered SEO audit and growth intelligence tool that provides high-performance insights for web projects."
            }),
          }}
        />
        <ThemeProvider

          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster
            toastOptions={{
              style: {
                background: 'var(--secondary)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                padding: '12px 16px',
                fontSize: '14px',
                backdropFilter: 'none',
                maxWidth: '90vw',
                width: 'auto',
                minWidth: '280px',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
                lineHeight: 1.4,
              },
              success: {
                iconTheme: { primary: 'var(--primary)', secondary: 'var(--secondary)' },
              },
              error: {
                iconTheme: { primary: 'var(--destructive)', secondary: 'var(--secondary)' },
              },
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
