/**
 * ─── Fittrybe — Support Page ──────────────────────────────────────────────────
 *
 * Public contact form. Submissions POST to /api/support which forwards the
 * message via Resend to the internal support inboxes and sends an
 * acknowledgement email back to the user.
 */

import type { Metadata } from "next";
import { seoConfig, buildOGImageUrl, buildCanonicalUrl } from "@/lib/seo-config";
import { buildWebPageSchema, buildBreadcrumbSchema, buildGraphSchema } from "@/lib/structured-data";
import SupportPageClient from "@/components/SupportPageClient";

const PAGE_URL = buildCanonicalUrl("/support");
const PAGE_TITLE = "Contact Support — Fittrybe";
const PAGE_DESCRIPTION =
  "Get in touch with the Fittrybe team. Report a bug, ask a question, or chat to us about partnerships — we usually reply within 1–2 business days.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    images: [
      {
        url: buildOGImageUrl({
          title: "Contact Fittrybe Support",
          description: "We usually reply within 1–2 business days.",
        }),
        width: 1200,
        height: 630,
        alt: "Contact Fittrybe Support",
      },
    ],
  },
  twitter: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [buildOGImageUrl({ title: "Contact Fittrybe Support" })],
  },
};

const pageJsonLd = buildGraphSchema([
  buildWebPageSchema({
    url: PAGE_URL,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    datePublished: "2026-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    breadcrumb: [
      { name: "Home", url: seoConfig.siteUrl },
      { name: "Support", url: PAGE_URL },
    ],
  }),
  buildBreadcrumbSchema([
    { name: "Home", url: seoConfig.siteUrl },
    { name: "Support", url: PAGE_URL },
  ]),
]);

export default function SupportPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pageJsonLd }} />
      <SupportPageClient />
    </>
  );
}
