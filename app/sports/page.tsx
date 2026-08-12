/**
 * /sports — Sport hub index page.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { SPORTS } from "@/lib/sports";
import { seoConfig, buildCanonicalUrl } from "@/lib/seo-config";
import SiteNav from "@/components/SiteNav";
import SmartDownloadLink from "@/components/SmartDownloadLink";
import {
  buildBreadcrumbSchema,
  buildGraphSchema,
  buildWebPageSchema,
} from "@/lib/structured-data";

const PAGE_TITLE = "Sports on Fittrybe — Football, Basketball, Tennis & More";
const PAGE_DESCRIPTION =
  "Browse every sport on Fittrybe. Find football, basketball, tennis, badminton, running and more grassroots sessions near you across the UK.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: buildCanonicalUrl("/sports") },
  openGraph: {
    type: "website",
    url: buildCanonicalUrl("/sports"),
    siteName: seoConfig.siteName,
    locale: seoConfig.siteLocale,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [
      {
        url: `${seoConfig.siteUrl}/api/og?title=${encodeURIComponent(
          "Find Your Game"
        )}&description=${encodeURIComponent(
          "Football, basketball, tennis, running and more — sports near you."
        )}`,
        width: 1200,
        height: 630,
        alt: PAGE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: seoConfig.twitterHandle,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default function SportsHubPage() {
  const canonicalUrl = buildCanonicalUrl("/sports");

  const collectionJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonicalUrl}/#collection`,
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: canonicalUrl,
    isPartOf: { "@id": `${seoConfig.siteUrl}/#website` },
    inLanguage: seoConfig.siteLanguage,
    hasPart: SPORTS.map((s) => ({
      "@type": "WebPage",
      url: buildCanonicalUrl(`/sports/${s.slug}`),
      name: s.headline,
      description: s.metaDescription,
    })),
  });

  const pageJsonLd = buildGraphSchema([
    buildWebPageSchema({
      url: canonicalUrl,
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      breadcrumb: [
        { name: "Home", url: seoConfig.siteUrl },
        { name: "Sports", url: canonicalUrl },
      ],
    }),
    buildBreadcrumbSchema([
      { name: "Home", url: seoConfig.siteUrl },
      { name: "Sports", url: canonicalUrl },
    ]),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pageJsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: collectionJsonLd }} />

      <main style={{ minHeight: "100vh", background: "#050505", color: "#fff" }}>
        {/* Nav */}
        <SiteNav />

        {/* Hero */}
        <header style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 64px", textAlign: "center", position: "relative" }}>
          <div aria-hidden="true" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 500, height: 350, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(182,255,0,0.06) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#B6FF00", boxShadow: "0 0 12px rgba(182,255,0,0.6)", display: "inline-block" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#B6FF00", fontFamily: "var(--font-inter-tight)" }}>Sports Hub</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: 20 }}>
              <span style={{ display: "block", background: "linear-gradient(to right, #fff 0%, rgba(255,255,255,0.6) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Find Your Game.</span>
              <span style={{ display: "block", background: "linear-gradient(135deg, #B6FF00 0%, #7CFC00 50%, #B6FF00 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Pick Your Sport.</span>
            </h1>
            <p style={{ fontSize: "1.125rem", maxWidth: 640, margin: "0 auto", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontFamily: "var(--font-inter-tight)" }}>
              From five-a-side football to morning tennis. Every grassroots sport on Fittrybe, with live sessions across the UK.
            </p>
          </div>
        </header>

        {/* Sports grid */}
        <section aria-label="All sports on Fittrybe" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 16 }}>
            {SPORTS.map((sport) => (
              <Link
                key={sport.slug}
                href={`/sports/${sport.slug}`}
                className="sport-card"
                aria-label={`${sport.name} sessions on Fittrybe`}
                style={{
                  display: "block",
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: 24,
                  textDecoration: "none",
                  transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s ease, box-shadow 0.4s ease",
                }}
              >
                <div style={{ fontSize: "2.8rem", marginBottom: 12 }} aria-hidden="true">
                  {sport.emoji}
                </div>
                <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.2rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", marginBottom: 6 }}>
                  {sport.name}
                </h2>
                <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {sport.tagline}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "80px 24px", textAlign: "center", position: "relative" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at center bottom, rgba(182,255,0,0.04) 0%, transparent 60%)" }} />
          <div style={{ position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 8, fontFamily: "var(--font-inter-tight)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Don&apos;t see your sport?
            </p>
            <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff", marginBottom: 24 }}>
              More Added Every Month
            </h2>
            <SmartDownloadLink className="btn-primary" style={{ fontSize: "1.125rem", padding: "16px 40px", boxShadow: "0 0 30px rgba(182,255,0,0.2)" }}>
              Get the App — Request a Sport
            </SmartDownloadLink>
          </div>
        </section>
      </main>

      <style>{`
        .sport-card:hover {
          transform: translateY(-8px) !important;
          border-color: rgba(182,255,0,0.25) !important;
          box-shadow: 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(182,255,0,0.1) !important;
        }
        .sport-card:hover h2 { color: #B6FF00 !important; }
      `}</style>
    </>
  );
}
