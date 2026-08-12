import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import { seoConfig, buildCanonicalUrl } from "@/lib/seo-config";
import {
  buildGraphSchema,
  buildWebPageSchema,
  buildBreadcrumbSchema,
} from "@/lib/structured-data";
import Script from "next/script";

const PAGE_TITLE = "Book a Free Call | FitTrybe — Care Homes, SEN, Partnerships";
const PAGE_DESCRIPTION =
  "Book a free 30-minute call with the FitTrybe team. Whether you're a care home, SEN school, event organiser, or have a venue to share — let's talk about bringing sport to your community.";

const ogImage = `${seoConfig.siteUrl}/api/og?title=${encodeURIComponent("Book a Call")}&description=${encodeURIComponent("Free 30-min call — Care homes, SEN schools, partnerships")}`;

const BREADCRUMBS = [
  { name: "Home", url: seoConfig.siteUrl },
  { name: "Book a Call", url: buildCanonicalUrl("/book-a-call") },
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: buildCanonicalUrl("/book-a-call") },
  openGraph: {
    type: "website",
    url: buildCanonicalUrl("/book-a-call"),
    siteName: seoConfig.siteName,
    locale: seoConfig.siteLocale,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [{ url: ogImage, secureUrl: ogImage, width: 1200, height: 630, alt: PAGE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    site: seoConfig.twitterHandle,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [ogImage],
  },
  robots: { index: true, follow: true },
};

const CALL_TYPES = [
  {
    id: "discovery",
    emoji: "🤝",
    title: "Discovery Call",
    for: "Care Homes · SEN Schools · Support Teams",
    description: "Let's talk about bringing adapted sport and movement sessions to your residents, students, or community.",
    points: ["Understand your needs", "Discuss session formats", "Answer safeguarding questions", "No commitment required"],
    url: "https://calendly.com/hello-fittrybe/discovery-call?hide_gdpr_banner=1",
    color: "#B6FF3B",
  },
  {
    id: "partnership",
    emoji: "🏟",
    title: "Partnership Call",
    for: "Event Organisers · Venue Owners · Community Groups",
    description: "Got a pitch, hall, or park? Want to bring grassroots sport to your area? Let's make it happen.",
    points: ["Explore venue options", "Plan community sessions", "Discuss revenue sharing", "Build something together"],
    url: "https://calendly.com/hello-fittrybe/partnership-call?hide_gdpr_banner=1",
    color: "#818CF8",
  },
];

export default async function BookACallPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const selected = type ? CALL_TYPES.find(c => c.id === type) : null;

  const structuredData = buildGraphSchema([
    buildWebPageSchema({
      url: buildCanonicalUrl("/book-a-call"),
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      breadcrumb: BREADCRUMBS,
    }),
    buildBreadcrumbSchema(BREADCRUMBS),
  ]);

  return (
    <main style={{ minHeight: "100vh", background: "#050505", color: "#fff" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <SiteNav />
      <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="lazyOnload" />

      {!selected ? (
        /* ═══ PICKER VIEW ═══ */
        <>
          {/* Hero */}
          <section style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 20px", textAlign: "center", position: "relative" }}>
            <div aria-hidden="true" style={{ position: "absolute", top: -40, left: "50%", transform: "translateX(-50%)", width: 600, height: 500, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(182,255,0,0.05) 0%, transparent 70%)", filter: "blur(100px)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20, margin: "0 auto 24px",
                background: "rgba(182,255,0,0.08)", border: "1px solid rgba(182,255,0,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem",
              }}>
                📞
              </div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#B6FF00", fontFamily: "var(--font-inter-tight)", marginBottom: 16 }}>
                30 minutes · Free · No obligation
              </p>
              <h1 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.5rem, 7vw, 4.5rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: 16 }}>
                <span style={{ color: "#fff" }}>Let&apos;s Have a </span>
                <span style={{ color: "#B6FF00" }}>Conversation</span>
              </h1>
              <p style={{ fontSize: "1.05rem", maxWidth: 520, margin: "0 auto", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontFamily: "var(--font-inter-tight)" }}>
                No forms, no back-and-forth emails. Pick a call type, choose a time, and we&apos;ll be there.
              </p>
            </div>
          </section>

          {/* Call type cards */}
          <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 40px" }}>
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 20 }}>
              {CALL_TYPES.map((call) => (
                <a
                  key={call.id}
                  href={`/book-a-call?type=${call.id}`}
                  className="bac-card"
                  style={{
                    display: "flex", flexDirection: "column",
                    background: "#111", borderRadius: 24,
                    border: "1px solid rgba(255,255,255,0.06)",
                    padding: 0, textDecoration: "none", color: "#fff",
                    overflow: "hidden",
                    transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                >
                  {/* Top accent */}
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${call.color}, ${call.color}88)` }} />

                  <div style={{ padding: "32px 28px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Icon + badge row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: `${call.color}15`, border: `1px solid ${call.color}25`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.6rem",
                      }}>
                        {call.emoji}
                      </div>
                      <span style={{
                        fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.1em", padding: "5px 12px", borderRadius: 50,
                        background: `${call.color}12`, color: call.color,
                        border: `1px solid ${call.color}20`,
                      }}>
                        Free · 30 min
                      </span>
                    </div>

                    {/* Title */}
                    <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.5rem", fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px" }}>
                      {call.title}
                    </h2>
                    <p style={{ fontSize: "0.82rem", color: call.color, fontWeight: 600, fontFamily: "var(--font-inter-tight)", margin: "0 0 14px" }}>
                      {call.for}
                    </p>
                    <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.7, margin: "0 0 20px" }}>
                      {call.description}
                    </p>

                    {/* What we'll cover */}
                    <div style={{ flex: 1 }} />
                    <div style={{
                      background: "#0A0A0A", borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.04)",
                      padding: "16px 18px", marginBottom: 20,
                    }}>
                      <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
                        What we&apos;ll cover
                      </p>
                      {call.points.map((point) => (
                        <div key={point} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                          <span style={{ color: call.color, fontSize: "0.75rem", fontWeight: 700 }}>✓</span>
                          <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-inter-tight)" }}>{point}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: 8, padding: "14px 24px", borderRadius: 50,
                      background: call.color, color: "#000",
                      fontFamily: "var(--font-anton)", fontSize: "0.95rem", fontWeight: 800,
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}>
                      Book This Call →
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Trust strip */}
          <section style={{ maxWidth: 700, margin: "0 auto", padding: "20px 24px 60px" }}>
            <div style={{
              display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap",
              padding: "24px 0",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              {[
                { icon: "🛡️", text: "DBS Checked" },
                { icon: "📋", text: "£5M Insured" },
                { icon: "⭐", text: "3 Towns Served" },
                { icon: "❤️", text: "Surrey Based" },
              ].map((t) => (
                <div key={t.text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1rem" }}>{t.icon}</span>
                  <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-inter-tight)", fontWeight: 500 }}>
                    {t.text}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Email fallback */}
          <section style={{ textAlign: "center", padding: "0 24px 80px" }}>
            <div style={{
              maxWidth: 500, margin: "0 auto",
              background: "#111", borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.06)",
              padding: "36px 32px",
            }}>
              <p style={{ fontSize: "1.2rem", marginBottom: 8 }}>💬</p>
              <p style={{ fontSize: "0.95rem", color: "#fff", fontWeight: 600, fontFamily: "var(--font-inter-tight)", marginBottom: 8 }}>
                Prefer email?
              </p>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-inter-tight)", marginBottom: 16 }}>
                No problem. Drop us a line and we&apos;ll get back to you within 24 hours.
              </p>
              <a
                href="mailto:hello@fittrybe.co.uk"
                style={{
                  display: "inline-block", padding: "12px 28px", borderRadius: 50,
                  background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", fontFamily: "var(--font-inter-tight)", fontSize: "0.88rem",
                  fontWeight: 600, textDecoration: "none",
                  transition: "all 0.3s ease",
                }}
                className="bac-email-btn"
              >
                hello@fittrybe.co.uk
              </a>
            </div>
          </section>
        </>
      ) : (
        /* ═══ CALENDAR VIEW ═══ */
        <>
          <section style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 60px" }}>
            {/* Back */}
            <a
              href="/book-a-call"
              className="bac-back"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: "0.85rem", color: "rgba(255,255,255,0.5)",
                textDecoration: "none", fontFamily: "var(--font-inter-tight)",
                marginBottom: 28, padding: "8px 16px 8px 12px", borderRadius: 10,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                transition: "all 0.2s ease",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              All call types
            </a>

            {/* Header card */}
            <div style={{
              background: "#111", borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.06)",
              overflow: "hidden", marginBottom: 28,
            }}>
              <div style={{ height: 4, background: `linear-gradient(90deg, ${selected.color}, ${selected.color}88)` }} />
              <div style={{ padding: "28px 32px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `${selected.color}15`, border: `1px solid ${selected.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.8rem", flexShrink: 0,
                }}>
                  {selected.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <h1 style={{ fontFamily: "var(--font-anton)", fontSize: "1.5rem", fontWeight: 700, textTransform: "uppercase", margin: "0 0 4px" }}>
                    {selected.title}
                  </h1>
                  <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-inter-tight)", margin: 0 }}>
                    {selected.for}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 600, padding: "6px 14px", borderRadius: 50,
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-inter-tight)",
                  }}>
                    ⏱ 30 min
                  </span>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 700, padding: "6px 14px", borderRadius: 50,
                    background: `${selected.color}12`, border: `1px solid ${selected.color}25`,
                    color: selected.color, fontFamily: "var(--font-inter-tight)",
                  }}>
                    Free
                  </span>
                </div>
              </div>
            </div>

            {/* Calendly embed */}
            <div style={{
              borderRadius: 20, overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
              background: "#fff",
              boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
            }}>
              <div
                className="calendly-inline-widget"
                data-url={selected.url}
                style={{ minWidth: 320, height: 700 }}
              />
            </div>
          </section>
        </>
      )}

      <style>{`
        .bac-card:hover {
          transform: translateY(-8px) !important;
          border-color: rgba(255,255,255,0.12) !important;
          box-shadow: 0 32px 64px rgba(0,0,0,0.5) !important;
        }
        .bac-back:hover {
          background: rgba(255,255,255,0.06) !important;
          color: #fff !important;
          border-color: rgba(255,255,255,0.12) !important;
        }
        .bac-email-btn:hover {
          border-color: rgba(182,255,0,0.3) !important;
          color: #B6FF00 !important;
          background: rgba(182,255,0,0.05) !important;
        }
      `}</style>
    </main>
  );
}
