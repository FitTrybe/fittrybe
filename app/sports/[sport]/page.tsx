/**
 * /sports/[sport] — Per-sport programmatic SEO landing page.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllSportSlugs, getSportBySlug } from "@/lib/sports";
import SiteNav from "@/components/SiteNav";
import SmartDownloadLink from "@/components/SmartDownloadLink";
import { getUpcomingEventsWithHosts } from "@/lib/events";
import { seoConfig, buildCanonicalUrl } from "@/lib/seo-config";
import EventCard from "@/components/EventCard";
import {
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildGraphSchema,
  buildWebPageSchema,
} from "@/lib/structured-data";

export const revalidate = 600;

export async function generateStaticParams() {
  return getAllSportSlugs().map((sport) => ({ sport }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport } = await params;
  const content = getSportBySlug(sport);
  if (!content) return { title: "Sport Not Found" };

  const canonicalUrl = buildCanonicalUrl(`/sports/${content.slug}`);
  const ogImage = `${seoConfig.siteUrl}/api/og?title=${encodeURIComponent(
    content.headline
  )}&description=${encodeURIComponent(content.tagline)}`;

  return {
    title: `${content.headline} | Fittrybe`,
    description: content.metaDescription,
    keywords: content.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: seoConfig.siteName,
      locale: seoConfig.siteLocale,
      title: content.headline,
      description: content.metaDescription,
      images: [{ url: ogImage, secureUrl: ogImage, width: 1200, height: 630, alt: content.headline, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      site: seoConfig.twitterHandle,
      title: content.headline,
      description: content.metaDescription,
      images: [ogImage],
    },
  };
}

export default async function SportLandingPage({
  params,
}: {
  params: Promise<{ sport: string }>;
}) {
  const { sport } = await params;
  const content = getSportBySlug(sport);
  if (!content) notFound();

  const canonicalUrl = buildCanonicalUrl(`/sports/${content.slug}`);

  const allEvents = await getUpcomingEventsWithHosts();
  const sportEvents = allEvents
    .filter((e) => e.sportId === content.slug)
    .slice(0, 6);

  const pageJsonLd = buildGraphSchema([
    buildWebPageSchema({
      url: canonicalUrl,
      title: content.headline,
      description: content.metaDescription,
      breadcrumb: [
        { name: "Home", url: seoConfig.siteUrl },
        { name: "Sports", url: buildCanonicalUrl("/sports") },
        { name: content.name, url: canonicalUrl },
      ],
    }),
    buildBreadcrumbSchema([
      { name: "Home", url: seoConfig.siteUrl },
      { name: "Sports", url: buildCanonicalUrl("/sports") },
      { name: content.name, url: canonicalUrl },
    ]),
    buildFAQSchema(content.faqs),
  ]);

  const cardStyle = {
    background: "#111",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 24,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pageJsonLd }} />

      <main style={{ minHeight: "100vh", background: "#050505", color: "#fff" }}>
        {/* Nav */}
        <SiteNav />

        {/* Hero */}
        <header style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 48px", textAlign: "center", position: "relative" }}>
          <div aria-hidden="true" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 400, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(182,255,0,0.06) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{
              width: 88, height: 88, borderRadius: 22, margin: "0 auto 20px",
              background: "rgba(182,255,0,0.08)", border: "1px solid rgba(182,255,0,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem",
            }} aria-hidden="true">
              {content.emoji}
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#B6FF00", boxShadow: "0 0 12px rgba(182,255,0,0.6)", display: "inline-block" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#B6FF00", fontFamily: "var(--font-inter-tight)" }}>
                {content.name} on Fittrybe
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.5rem, 7vw, 5rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1.05, color: "#fff", marginBottom: 16 }}>
              {content.headline}
            </h1>
            <p style={{ fontSize: "1.05rem", maxWidth: 600, margin: "0 auto 32px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontFamily: "var(--font-inter-tight)" }}>
              {content.intro}
            </p>
            <Link href={`/session/${content.slug}`} className="btn-primary" style={{ fontSize: "1rem", padding: "14px 36px" }}>
              See Upcoming {content.name} Sessions
            </Link>
          </div>
        </header>

        {/* Highlights */}
        <section aria-label={`What to expect from ${content.name}`} style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 32 }}>
            <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
            <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
              What to Expect
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
            {content.highlights.map((h) => (
              <div key={h.title} style={cardStyle}>
                <h3 style={{ fontFamily: "var(--font-anton)", fontSize: "1.05rem", fontWeight: 700, textTransform: "uppercase", color: "#B6FF00", marginBottom: 8 }}>
                  {h.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.7 }}>
                  {h.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Live sessions */}
        <section aria-label={`Live ${content.name} sessions`} style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 64px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
              <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
                Live {content.name} Sessions
              </h2>
            </div>
            <Link href={`/session/${content.slug}`} style={{ fontSize: "0.85rem", color: "#B6FF00", textDecoration: "none", fontFamily: "var(--font-inter-tight)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
              View all →
            </Link>
          </div>

          {sportEvents.length === 0 ? (
            <div style={{ ...cardStyle, padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: 16, filter: "drop-shadow(0 0 20px rgba(182,255,0,0.3))" }}>{content.emoji}</div>
              <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24, fontFamily: "var(--font-inter-tight)", fontSize: "0.95rem" }}>
                No live {content.name.toLowerCase()} sessions right now. Get the app to be first in line.
              </p>
              <SmartDownloadLink className="btn-primary">
                Get the App
              </SmartDownloadLink>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
              {sportEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* FAQ */}
        <section aria-label={`${content.name} FAQ`} style={{ maxWidth: 768, margin: "0 auto", padding: "64px 24px 80px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 32 }}>
            <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
            <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
              {content.name} FAQ
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {content.faqs.map((faq) => (
              <div key={faq.question} style={{ ...cardStyle, borderLeft: "3px solid rgba(182,255,0,0.4)" }}>
                <dt style={{ fontFamily: "var(--font-inter-tight)", fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                  {faq.question}
                </dt>
                <dd style={{ fontFamily: "var(--font-inter-tight)", fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>
                  {faq.answer}
                </dd>
              </div>
            ))}
          </div>
        </section>

        {/* Other sports */}
        <section aria-label="Other sports on Fittrybe" style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 64px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.25rem", fontWeight: 700, textTransform: "uppercase", color: "#fff", marginBottom: 24, textAlign: "center" }}>
            Other Sports
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            {getAllSportSlugs()
              .filter((s) => s !== content.slug)
              .map((slug) => {
                const other = getSportBySlug(slug)!;
                return (
                  <Link
                    key={slug}
                    href={`/sports/${slug}`}
                    className="city-link"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "10px 18px", borderRadius: 14,
                      background: "#111", border: "1px solid rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", fontWeight: 500,
                      textDecoration: "none", fontFamily: "var(--font-inter-tight)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <span aria-hidden="true">{other.emoji}</span> {other.name}
                  </Link>
                );
              })}
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "80px 24px", textAlign: "center", position: "relative" }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at center bottom, rgba(182,255,0,0.04) 0%, transparent 60%)" }} />
          <div style={{ position: "relative" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 8, fontFamily: "var(--font-inter-tight)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Ready to play?
            </p>
            <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff", marginBottom: 24 }}>
              Find Your {content.name} Game
            </h2>
            <SmartDownloadLink className="btn-primary" style={{ fontSize: "1.125rem", padding: "16px 40px", boxShadow: "0 0 30px rgba(182,255,0,0.2)" }}>
              Get the App — Find Your Game
            </SmartDownloadLink>
          </div>
        </section>
      </main>
    </>
  );
}
