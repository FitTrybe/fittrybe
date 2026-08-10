/**
 * /download — Universal app-download landing page.
 *
 * On mount, the client component reads the user-agent and:
 *   • iOS     → redirects to the App Store
 *   • Android → redirects to Google Play
 *   • Web     → stays on the page and surfaces both store buttons + a
 *               "Open the web app" link
 */
import type { Metadata } from "next";
import { seoConfig, buildOGImageUrl } from "@/lib/seo-config";
import {
  buildBreadcrumbSchema,
  buildGraphSchema,
  buildWebPageSchema,
} from "@/lib/structured-data";
import DownloadPageClient from "@/components/DownloadPageClient";

export const metadata: Metadata = {
  title: seoConfig.pages.download.title,
  description: seoConfig.pages.download.description,
  alternates: { canonical: seoConfig.pages.download.url },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: seoConfig.pages.download.title,
    description: seoConfig.pages.download.description,
    url: seoConfig.pages.download.url,
    images: [
      {
        url: buildOGImageUrl({
          title: "Download Fittrybe",
          description: "Available now on iPhone and Android.",
        }),
        width: 1200,
        height: 630,
        alt: "Download Fittrybe — Available Now",
      },
    ],
  },
  twitter: {
    title: seoConfig.pages.download.title,
    description: seoConfig.pages.download.description,
    images: [buildOGImageUrl({ title: "Download Fittrybe" })],
  },
};

const pageJsonLd = buildGraphSchema([
  buildWebPageSchema({
    url: seoConfig.pages.download.url,
    title: seoConfig.pages.download.title,
    description: seoConfig.pages.download.description,
    datePublished: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    breadcrumb: [
      { name: "Home", url: seoConfig.siteUrl },
      { name: "Download", url: seoConfig.pages.download.url },
    ],
  }),
  buildBreadcrumbSchema([
    { name: "Home", url: seoConfig.siteUrl },
    { name: "Download", url: seoConfig.pages.download.url },
  ]),
]);

export default function DownloadPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: pageJsonLd }}
      />
      <DownloadPageClient />
    </>
  );
}
