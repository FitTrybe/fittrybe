import type { Metadata } from "next";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import { seoConfig, buildCanonicalUrl } from "@/lib/seo-config";
import {
  buildGraphSchema,
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildWebPageSchema,
} from "@/lib/structured-data";

export const revalidate = 3600;

const PAGE_TITLE = "Care Home Activity Sessions Surrey | Adapted Sport for Elderly Residents | FitTrybe";
const PAGE_DESCRIPTION =
  "Professional care home activity provider in Surrey delivering adapted sport and seated exercise classes for elderly residents. Balloon badminton, boccia, chair yoga, dementia friendly activities. DBS-checked coaches, CQC-ready impact reports. Book a free intro call.";

const CALENDLY_URL = "/book-a-call?type=discovery";

const PAGE_KEYWORDS = [
  "care home activities surrey",
  "care home activity provider",
  "adapted sport for elderly",
  "care home exercise sessions",
  "seated exercise classes care homes",
  "elderly fitness sessions surrey",
  "care home entertainment provider",
  "boccia care homes",
  "balloon badminton elderly",
  "dementia friendly activities",
  "care home CQC activities",
  "activities coordinator care home",
  "physical activity older adults",
  "care home wellbeing programme",
  "care home seated exercise",
  "elderly movement sessions",
  "care home sports sessions surrey",
  "chair yoga care homes",
  "care home activity ideas",
  "adapted physical activity elderly",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: { canonical: buildCanonicalUrl("/care-homes") },
  openGraph: {
    type: "website",
    url: buildCanonicalUrl("/care-homes"),
    siteName: seoConfig.siteName,
    locale: seoConfig.siteLocale,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [{
      url: `${seoConfig.siteUrl}/api/og?title=${encodeURIComponent("Care Home Activity Sessions")}&description=${encodeURIComponent("Adapted sport & movement for elderly residents in Surrey")}`,
      width: 1200, height: 630, alt: PAGE_TITLE,
    }],
  },
  twitter: {
    card: "summary_large_image",
    site: seoConfig.twitterHandle,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const ACTIVITIES = [
  { emoji: "\u{1F3F8}", name: "Balloon Badminton", desc: "Lightweight balloon rally — works seated or standing. Gets everyone laughing. One of the most popular care home activities for residents of all abilities." },
  { emoji: "\u{1F3AF}", name: "Boccia", desc: "Precision target bowling adapted for care homes. Inclusive, competitive, and surprisingly addictive. Perfect for residents with limited mobility." },
  { emoji: "\u{1F9D8}", name: "Chair Yoga & Stretch", desc: "Gentle seated exercise classes designed for care home residents. Breathing, stretching, balance — all from a chair. Ideal for dementia friendly activity sessions." },
  { emoji: "\u26BD", name: "Seated Football", desc: "Adapted table-top or balloon football. Team-based, low impact, high energy. Great for social interaction and physical activity for older adults." },
];

const TRUST_POINTS = [
  { icon: "\u{1F6E1}\uFE0F", title: "DBS Checked", desc: "Every coach holds an enhanced DBS certificate. No exceptions. Certificates available on request before your first session." },
  { icon: "\u{1F4CB}", title: "\u00A35M Insured", desc: "Full public liability insurance. Documentation provided before first session. Everything your activities coordinator needs for compliance." },
  { icon: "\u2764\uFE0F", title: "Care Sector Experience", desc: "Our coaches understand dementia-friendly approaches, mobility limitations, and safeguarding. Trained to work with elderly residents across all cognitive abilities." },
  { icon: "\u{1F4CA}", title: "CQC-Ready Impact Reports", desc: "Post-session feedback for your CQC evidence file. Participation rates, engagement scores, wellbeing indicators — everything inspectors want to see." },
];

const FAQS = [
  {
    question: "Do you provide DBS certificates?",
    answer: "Yes. Every FitTrybe coach holds an enhanced DBS certificate, and we provide copies before your first session. We also carry full public liability insurance (\u00A35M) and can supply all documentation your activities coordinator or compliance team requires.",
  },
  {
    question: "What space do you need for care home activity sessions?",
    answer: "We need a communal room or lounge with enough space for residents to sit in a rough circle or semicircle. A standard care home lounge or dining room works perfectly. We bring all equipment — chairs, balloons, boccia sets, parachutes — so you don\u2019t need to provide anything beyond the space itself.",
  },
  {
    question: "Can residents with dementia participate in your sessions?",
    answer: "Absolutely. Our coaches are trained in dementia friendly activity delivery. We adapt every session to meet residents where they are — using simple instructions, visual cues, repetitive movements, and plenty of encouragement. Many care homes tell us that residents with dementia are among the most engaged participants because the activities tap into muscle memory and social instincts.",
  },
  {
    question: "What\u2019s included in the price of a care home exercise session?",
    answer: "Each session costs \u00A360 and includes 45 minutes of coached activity, all equipment, travel within Surrey, and a post-session impact report for your CQC evidence file. Block booking discounts are available: a 4-week block is \u00A3220 (save \u00A320) and a 12-week termly booking is \u00A3600 (save \u00A3120).",
  },
  {
    question: "Can we do a trial session before committing?",
    answer: "Yes. We encourage every care home to book a free 20-minute intro call first, where we learn about your residents and their needs. After that, you can book a single trial session at the standard \u00A360 rate with no commitment to continue. Most homes book a block after the first session — but there\u2019s never any pressure.",
  },
];

const BREADCRUMBS = [
  { name: "Home", url: seoConfig.siteUrl },
  { name: "Care Home Sessions", url: buildCanonicalUrl("/care-homes") },
];

function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${seoConfig.siteUrl}/#care-homes-business`,
    name: "FitTrybe Care Home Activity Sessions",
    description: PAGE_DESCRIPTION,
    url: buildCanonicalUrl("/care-homes"),
    telephone: "+44",
    email: "hello@fittrybe.co.uk",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Surrey",
      addressCountry: "GB",
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Surrey",
    },
    priceRange: "\u00A360-\u00A3600",
  };
}

function buildServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${seoConfig.siteUrl}/#care-home-service`,
    name: "Care Home Adapted Sport & Exercise Sessions",
    description: "Professional adapted sport and seated exercise sessions delivered at care homes across Surrey. Activities include balloon badminton, boccia, chair yoga, and seated football. DBS-checked coaches, full insurance, CQC-ready impact reports.",
    provider: {
      "@type": "Organization",
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
    },
    serviceType: "Care Home Activity Provider",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Surrey",
    },
    offers: {
      "@type": "Offer",
      price: "60.00",
      priceCurrency: "GBP",
      description: "45-minute adapted sport session including all equipment and travel within Surrey",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Care home residents, elderly adults, people with dementia",
    },
  };
}

export default function CareHomesPage() {
  const structuredData = buildGraphSchema([
    buildWebPageSchema({
      url: buildCanonicalUrl("/care-homes"),
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      datePublished: "2024-06-01",
      dateModified: "2026-08-01",
      breadcrumb: BREADCRUMBS,
    }),
    buildBreadcrumbSchema(BREADCRUMBS),
    buildFAQSchema(FAQS),
    buildLocalBusinessSchema(),
    buildServiceSchema(),
  ]);

  return (
    <main style={{ minHeight: "100vh", background: "#050505", color: "#fff" }}>
      <style>{`
        .card-hover:hover {
          border-color: rgba(182,255,0,0.3) !important;
          transform: translateY(-6px) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(182,255,0,0.1) !important;
        }
        .cta-hover:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 32px rgba(182,255,0,0.3) !important; }
        .link-hover:hover { color: #B6FF00 !important; }

        @keyframes chFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes chPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 12px rgba(182,255,0,0.6); }
          50% { opacity: 0.5; box-shadow: 0 0 6px rgba(182,255,0,0.3); }
        }
        @keyframes chScaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes chSlideRight {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes chCountUp {
          from { opacity: 0; transform: translateY(20px) scale(0.8); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* Scroll-triggered reveal using animation-timeline */
        .ch-reveal {
          opacity: 0;
          transform: translateY(30px);
          animation: chFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
          animation-timeline: view();
          animation-range: entry 0% entry 30%;
        }
        .ch-reveal-scale {
          opacity: 0;
          transform: scale(0.92);
          animation: chScaleIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
          animation-timeline: view();
          animation-range: entry 0% entry 30%;
        }
        .ch-reveal-left {
          opacity: 0;
          transform: translateX(-30px);
          animation: chSlideRight 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
          animation-timeline: view();
          animation-range: entry 0% entry 30%;
        }

        /* Fallback for browsers without animation-timeline */
        @supports not (animation-timeline: view()) {
          .ch-reveal, .ch-reveal-scale, .ch-reveal-left {
            opacity: 1;
            transform: none;
            animation: none;
          }
        }

        /* Emoji hover float */
        .ch-emoji-card:hover .ch-emoji {
          animation: chFloat 1s ease-in-out infinite;
        }

        /* Step number pulse on hover */
        .ch-step:hover .ch-step-num {
          box-shadow: 0 0 20px rgba(182,255,0,0.4);
          transform: scale(1.1);
        }
        .ch-step-num {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        /* FAQ card hover */
        .ch-faq:hover {
          border-color: rgba(182,255,0,0.2) !important;
          background: #141414 !important;
        }

        /* Price card glow */
        .ch-price-card {
          transition: box-shadow 0.4s ease;
        }
        .ch-price-card:hover {
          box-shadow: 0 0 40px rgba(182,255,0,0.08), 0 20px 60px rgba(0,0,0,0.3);
        }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />


      {/* Nav */}
      <SiteNav />

      {/* HERO — video background */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            zIndex: 0,
            opacity: 0.35,
          }}
        >
          <source src="/videos/elderly_video.webm" type="video/webm" />
          <source src="/videos/elderly_video.mp4" type="video/mp4" />
        </video>

        {/* Heavy dark overlay — matches #050505 UI */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(180deg, #050505 0%, rgba(5,5,5,0.85) 25%, rgba(5,5,5,0.7) 50%, rgba(5,5,5,0.85) 75%, #050505 100%)",
        }} />

        {/* Green glow accent */}
        <div aria-hidden="true" style={{
          position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
          width: 500, height: 400, borderRadius: "50%", zIndex: 1,
          background: "radial-gradient(ellipse, rgba(182,255,0,0.06) 0%, transparent 70%)",
          filter: "blur(80px)", pointerEvents: "none",
        }} />

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "120px 24px 100px", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, animation: "chFadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#B6FF00", boxShadow: "0 0 12px rgba(182,255,0,0.6)", display: "inline-block", animation: "chPulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#B6FF00", fontFamily: "var(--font-inter-tight)" }}>
              Care Home Programme
            </span>
          </div>

          <h1 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.5rem, 7vw, 4.5rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: 20 }}>
            <span style={{ display: "block", color: "#fff", animation: "chFadeUp 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both" }}>Sport &amp; Movement</span>
            <span style={{ display: "block", color: "#B6FF00", animation: "chFadeUp 0.7s 0.35s cubic-bezier(0.16,1,0.3,1) both" }}>
              For Your{" "}
              <span className="flip-word" style={{ verticalAlign: "baseline" }}>
                <span>Residents</span>
                <span>Community</span>
              </span>
            </span>
          </h1>

          <p style={{ fontSize: "1.1rem", maxWidth: 650, margin: "0 auto 36px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, fontFamily: "var(--font-inter-tight)", animation: "chFadeUp 0.7s 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
            Adapted, seated-friendly activity sessions delivered at your care home in Surrey.
            45 minutes of movement, laughter, and connection — designed for all abilities including residents living with dementia.
          </p>

          <div style={{ animation: "chFadeUp 0.7s 0.65s cubic-bezier(0.16,1,0.3,1) both" }}>
            <a href={CALENDLY_URL} className="btn-primary cta-hover" style={{ fontSize: "1.1rem", padding: "16px 40px", boxShadow: "0 0 30px rgba(182,255,0,0.25)" }}>
              Book a Free Intro Call
            </a>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginTop: 14, fontFamily: "var(--font-inter-tight)" }}>
              20-minute call &middot; No obligation &middot; We come to you
            </p>
          </div>
        </div>

        {/* Bottom fade to page bg */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, zIndex: 2, background: "linear-gradient(to bottom, transparent, #050505)", pointerEvents: "none" }} />
      </section>

      {/* WHAT WE DO */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="ch-reveal" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 40 }}>
          <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
            What We Bring
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
          {ACTIVITIES.map((a, i) => (
            <div key={a.name} className="card-hover ch-emoji-card ch-reveal-scale" style={{
              background: "#111", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
              padding: 28, transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              animationDelay: `${i * 0.1}s`,
            }}>
              <div className="ch-emoji" style={{ fontSize: "2.5rem", marginBottom: 14, transition: "transform 0.3s ease" }}>{a.emoji}</div>
              <h3 style={{ fontFamily: "var(--font-anton)", fontSize: "1.15rem", fontWeight: 700, textTransform: "uppercase", color: "#B6FF00", marginBottom: 8 }}>
                {a.name}
              </h3>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.7 }}>
                {a.desc}
              </p>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: "0.85rem", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-inter-tight)" }}>
          All activities adapted to residents&apos; abilities. We bring all equipment — you just need a communal room.
        </p>
      </section>

      {/* WHY MOVEMENT MATTERS */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="ch-reveal" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 40 }}>
          <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
            Why Movement Matters
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.8 }}>
            Physical activity for older adults living in care homes is not a luxury — it is a clinical necessity. Research consistently shows that regular movement reduces the risk of falls by up to 30%, the single biggest cause of injury-related hospital admissions among elderly residents. Even gentle seated exercise classes can improve balance, strengthen muscles, and build the confidence residents need to move safely throughout their day. For activities coordinators looking to improve CQC outcomes, a structured care home wellbeing programme built around adapted sport is one of the most effective interventions available.
          </p>

          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.8 }}>
            Beyond the physical benefits, care home exercise sessions have a profound impact on mood and mental health. Elderly fitness sessions that involve group interaction — like balloon badminton or boccia — stimulate social connection, reduce feelings of isolation, and give residents something to genuinely look forward to each week. For residents living with dementia, dementia friendly activities that use repetitive, rhythmic movements and familiar social patterns can reduce agitation, improve sleep quality, and create moments of genuine joy and engagement.
          </p>

          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.8 }}>
            Cognitive function also benefits from regular physical activity. Studies published by Age UK and the NHS highlight that older adults who engage in regular movement — even seated exercise — show slower rates of cognitive decline. As a care home activity provider, we design every session to combine physical movement with social stimulation and gentle cognitive challenge, whether that is keeping score in boccia, tracking a balloon in badminton, or following a sequence in chair yoga. The result is a care home activity that genuinely supports the whole person — body, mind, and spirit.
          </p>
        </div>

        <div style={{ marginTop: 32, padding: "20px 24px", background: "#111", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid rgba(182,255,0,0.4)" }}>
          <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.7, margin: 0 }}>
            We also run <Link href="/sen-sessions" style={{ color: "#B6FF00", textDecoration: "underline", textUnderlineOffset: 3 }}>adapted sport sessions for SEN children and young people</Link>. If your organisation works with both elderly and younger populations, we can support across the full age range.
          </p>
        </div>
      </section>

      {/* WHO RUNS THEM */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="ch-reveal" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 40 }}>
          <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
            Safe Hands
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
          {TRUST_POINTS.map((t, i) => (
            <div key={t.title} className="card-hover ch-reveal-left" style={{
              background: "#111", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
              borderLeft: "3px solid rgba(182,255,0,0.4)",
              padding: 24, display: "flex", gap: 16, alignItems: "flex-start",
              transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              animationDelay: `${i * 0.08}s`,
            }}>
              <div style={{ fontSize: "1.8rem", flexShrink: 0, marginTop: 2 }}>{t.icon}</div>
              <div>
                <h3 style={{ fontFamily: "var(--font-inter-tight)", fontSize: "1rem", fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                  {t.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.6 }}>
                  {t.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* GETTING STARTED */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="ch-reveal" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 40 }}>
          <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
            Getting Started
          </h2>
        </div>

        <p style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 40px", fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.7 }}>
          From first call to first session in under a week. We handle the planning, equipment, and delivery — your activities coordinator just tells us when.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { step: "1", title: "Book a 20-min intro call", desc: "We learn about your residents, their abilities, and what your home needs. No sales pitch — just a conversation about how adapted sport can fit into your care home activity programme." },
            { step: "2", title: "We plan your first session", desc: "We pick the right activities, adapt for mobility and cognitive needs, and confirm safeguarding paperwork. Your activities coordinator gets a full brief before we arrive." },
            { step: "3", title: "We show up and deliver", desc: "We bring all the equipment, run the session, and leave your residents smiling. You get a CQC-ready impact report with participation rates, engagement scores, and wellbeing indicators." },
          ].map((s, i) => (
            <div key={s.step} className="ch-step ch-reveal-left" style={{ display: "flex", gap: 20, position: "relative", paddingBottom: i < 2 ? 40 : 0, animationDelay: `${i * 0.15}s` }}>
              {i < 2 && (
                <div style={{ position: "absolute", left: 19, top: 44, bottom: 0, width: 2, background: "rgba(182,255,0,0.15)" }} />
              )}
              <div className="ch-step-num" style={{
                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                background: "#B6FF00", color: "#000",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem", fontWeight: 900, fontFamily: "var(--font-anton)",
                position: "relative", zIndex: 1,
              }}>
                {s.step}
              </div>
              <div style={{ paddingTop: 4 }}>
                <h3 style={{ fontFamily: "var(--font-inter-tight)", fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.7 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="ch-reveal" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 40 }}>
          <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {FAQS.map((faq, i) => (
            <div key={faq.question} className="ch-faq ch-reveal" style={{
              background: "#111", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
              padding: 28, transition: "all 0.3s ease",
              animationDelay: `${i * 0.08}s`,
            }}>
              <h3 style={{ fontFamily: "var(--font-inter-tight)", fontSize: "1.05rem", fontWeight: 700, color: "#B6FF00", marginBottom: 12 }}>
                {faq.question}
              </h3>
              <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.8, margin: 0 }}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: "80px 24px", textAlign: "center", position: "relative", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at center bottom, rgba(182,255,0,0.04) 0%, transparent 60%)" }} />
        <div style={{ position: "relative", maxWidth: 600, margin: "0 auto" }}>
          <p style={{ fontSize: "2.5rem", marginBottom: 16 }}>{"\u2764\uFE0F"}</p>
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff", marginBottom: 12 }}>
            Your Residents Deserve to Move
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.7, marginBottom: 32 }}>
            Physical activity reduces falls, improves mood, and gives residents something to look forward to each week.
            Let&apos;s talk about what a care home wellbeing programme looks like at your home.
          </p>
          <a href={CALENDLY_URL} className="btn-primary cta-hover" style={{ fontSize: "1.1rem", padding: "16px 44px", boxShadow: "0 0 30px rgba(182,255,0,0.2)" }}>
            Book a Free Intro Call
          </a>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.3)", marginTop: 12, fontFamily: "var(--font-inter-tight)" }}>
            Or email us at <a href="mailto:hello@fittrybe.co.uk" style={{ color: "#B6FF00" }}>hello@fittrybe.co.uk</a>
          </p>

          <div style={{ marginTop: 40, display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            <Link href="/events" className="link-hover" style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "var(--font-inter-tight)" }}>
              Browse Sessions
            </Link>
            <Link href="/sports" className="link-hover" style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "var(--font-inter-tight)" }}>
              Our Sports
            </Link>
            <Link href="/sen-sessions" className="link-hover" style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "var(--font-inter-tight)" }}>
              SEN Sessions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
