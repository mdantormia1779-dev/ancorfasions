import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Jost } from "next/font/google";
import "./globals.css";
import { GlobalProviders } from "@/providers/GlobalProviders";
import { AnalyticsProviders } from "@/components/analytics/AnalyticsProviders";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Anchor Fashion | Premium E-Commerce",
    template: "%s | Anchor Fashion",
  },
  description:
    "Enterprise e-commerce platform for Anchor Fashion. Discover the latest trends in fashion and apparel.",
  metadataBase: new URL("https://anchorfashion.com"),
  keywords: [
    "fashion",
    "clothing",
    "ecommerce",
    "premium apparel",
    "anchor fashion",
    "bangladesh",
  ],
  authors: [{ name: "Anchor Fashion" }],
  creator: "Anchor Fashion",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://anchorfashion.com",
    title: "Anchor Fashion | Premium E-Commerce",
    description:
      "Enterprise e-commerce platform for Anchor Fashion. Discover the latest trends in fashion and apparel.",
    siteName: "Anchor Fashion",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Anchor Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anchor Fashion | Premium E-Commerce",
    description:
      "Enterprise e-commerce platform for Anchor Fashion. Discover the latest trends in fashion and apparel.",
    images: ["/og-image.jpg"],
    creator: "@anchorfashion",
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
  alternates: {
    canonical: "https://anchorfashion.com",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jost.className} min-h-screen overflow-x-hidden bg-background text-foreground antialiased`}
        suppressHydrationWarning
      >
        <GlobalProviders>{children}</GlobalProviders>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Anchor Fashion",
              url: "https://anchorfashion.com",
              potentialAction: {
                "@type": "SearchAction",
                target:
                  "https://anchorfashion.com/products?search={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Suspense fallback={null}>
          <AnalyticsProviders />
        </Suspense>
      </body>
    </html>
  );
}
