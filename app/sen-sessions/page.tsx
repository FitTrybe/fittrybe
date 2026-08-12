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

const PAGE_TITLE = "SEN Sports Sessions Surrey | Adapted Sport for SEN Children & Young People | FitTrybe";
const PAGE_DESCRIPTION =
  "Specialist SEN sports sessions in Surrey. Adapted sport for children with special needs including autism friendly sports, sensory friendly sessions, and SEND sports activities. Small groups (max 8), DBS-checked SEN-trained coaches, trauma-informed delivery. Soft archery, parachute games, adapted football. EHCP physical activity outcomes supported.";

const CALENDLY_URL = "/book-a-call?type=discovery";

const PAGE_KEYWORDS = [
  "SEN sports sessions surrey",
  "adapted sport SEN children",
  "SEN physical activity provider",
  "special needs sport sessions",
  "SEND sports activities",
  "inclusive sport for disabled children",
  "SEN after school sports",
  "adapted PE SEN",
  "sensory friendly sport sessions",
  "autism friendly sports",
  "SEN holiday activities",
  "disability sport provider surrey",
  "inclusive physical activity children",
  "EHCP physical activity",
  "SEN sport coaching",
  "adapted sport disabled children surrey",
  "special needs exercise sessions",
  "SEN friendly activities surrey",
  "SEND physical activity provider",
  "autism sport sessions",
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: PAGE_KEYWORDS,
  alternates: { canonical: buildCanonicalUrl("/sen-sessions") },
  openGraph: {
    type: "website",
    url: buildCanonicalUrl("/sen-sessions"),
    siteName: seoConfig.siteName,
    locale: seoConfig.siteLocale,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [{
      url: `${seoConfig.siteUrl}/api/og?title=${encodeURIComponent("SEN Sports Sessions")}&description=${encodeURIComponent("Adapted sport for SEN children & young people in Surrey")}`,
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
  { emoji: "🥊", name: "Boxing", desc: "Pad work, footwork drills, and controlled sparring adapted for SEN children. Builds confidence, focus, and emotional regulation. No contact — just technique, rhythm, and self-discipline." },
  { emoji: "🎾", name: "Tennis", desc: "Softer balls, shorter rackets, smaller courts. Adapted tennis that develops hand-eye coordination, spatial awareness, and turn-taking. Every rally is a win." },
  { emoji: "🏸", name: "Badminton", desc: "Lightweight rackets and slow-flight shuttlecocks. Perfect for children with sensory processing needs — controlled pace, clear boundaries, and a satisfying connection every hit." },
  { emoji: "⚽", name: "Adapted Football", desc: "Modified rules, softer balls, smaller pitch. Every child can participate regardless of motor skill level. Great for teamwork and social interaction." },
  { emoji: "🏹", name: "Soft Archery", desc: "Foam-tipped arrows and lightweight bows. Builds focus, coordination, and patience in a calm, low-stimulus environment." },
  { emoji: "🪂", name: "Parachute Games", desc: "Colourful group parachute play that builds teamwork, timing, and spatial awareness. Works for all abilities and keeps energy levels manageable." },
];

const TRUST_POINTS = [
  { icon: "\u{1F6E1}\uFE0F", title: "Enhanced DBS Checked", desc: "Every coach holds an enhanced DBS certificate for working with children and vulnerable adults. Certificates shared before your first session." },
  { icon: "\u{1F9E0}", title: "SEN Trained & Experienced", desc: "Our coaches have hands-on experience working with children with autism, ADHD, Down syndrome, cerebral palsy, and learning disabilities. They understand sensory needs and communication differences." },
  { icon: "\u{1F49C}", title: "Trauma-Informed Approach", desc: "We use trauma-informed coaching methods. No shouting, no pressure, no forced participation. Every child is met where they are and supported at their own pace." },
  { icon: "\u{1F4CB}", title: "Safeguarding Level 2", desc: "All coaches hold a minimum Level 2 safeguarding qualification. We follow strict safeguarding protocols and can provide our full safeguarding policy on request." },
];

const FAQS = [
  {
    question: "What special needs do you cater for?",
    answer: "Our SEN sports sessions are designed for children and young people with a wide range of additional needs including autism spectrum conditions, ADHD, Down syndrome, cerebral palsy, global developmental delay, sensory processing disorders, and moderate to severe learning disabilities. We adapt every session to the specific needs of the group. If your child has a condition not listed here, please get in touch — we are always happy to discuss how we can support them.",
  },
  {
    question: "Are your coaches trained in SEN?",
    answer: "Yes. Every FitTrybe SEN coach has hands-on experience working with children with special needs and additional training in adapted sport delivery. All coaches hold enhanced DBS certificates, a minimum Level 2 safeguarding qualification, and have completed training in trauma-informed practice. Several of our team have backgrounds in special education, occupational therapy, or disability sport coaching.",
  },
  {
    question: "What\u2019s the group size for SEN sports sessions?",
    answer: "We cap every SEN session at a maximum of 8 children. This lower ratio ensures every child receives the individual attention they need, reduces sensory overload, and creates a calm, manageable environment. For children who need higher levels of support, we can arrange 1:1 or 1:2 sessions at a bespoke rate.",
  },
  {
    question: "Can parents or carers stay during sessions?",
    answer: "Absolutely. Parents and carers are welcome to stay and watch throughout the session. For some children, having a familiar adult nearby helps them settle and engage. For others, a gradual separation approach works better. We are flexible and will follow whatever arrangement works best for your child.",
  },
  {
    question: "Do you work with schools as well as families?",
    answer: "Yes. We work with SEN schools, mainstream schools with SEND units, after-school clubs, holiday clubs, and individual families. For schools, we can deliver adapted PE sessions, lunchtime clubs, or enrichment programmes. We provide risk assessments, insurance documentation, and session plans in advance. Many schools use our sessions to meet their SEND provision requirements.",
  },
  {
    question: "Can sessions count towards EHCP outcomes?",
    answer: "Yes. Our SEN sports sessions can be designed to support specific EHCP outcomes including physical development, social interaction, communication, sensory regulation, and emotional wellbeing. We provide written session reports that document progress against agreed outcomes, which can be used as evidence for EHCP annual reviews. If you share your child\u2019s EHCP targets with us, we will build sessions around them.",
  },
];

const BREADCRUMBS = [
  { name: "Home", url: seoConfig.siteUrl },
  { name: "SEN Sessions", url: buildCanonicalUrl("/sen-sessions") },
];

function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${seoConfig.siteUrl}/#sen-sessions-business`,
    name: "FitTrybe SEN Sports Sessions",
    description: PAGE_DESCRIPTION,
    url: buildCanonicalUrl("/sen-sessions"),
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
    priceRange: "\u00A375-\u00A3840",
  };
}

function buildServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${seoConfig.siteUrl}/#sen-session-service`,
    name: "SEN Adapted Sport & Physical Activity Sessions",
    description: "Specialist adapted sport sessions for children and young people with special educational needs and disabilities (SEND). Sensory friendly, small groups (max 8), DBS-checked SEN-trained coaches. Activities include soft archery, balloon games, parachute games, and adapted football. Sessions support EHCP physical activity outcomes.",
    provider: {
      "@type": "Organization",
      name: seoConfig.siteName,
      url: seoConfig.siteUrl,
    },
    serviceType: "SEN Physical Activity Provider",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Surrey",
    },
    offers: {
      "@type": "Offer",
      price: "75.00",
      priceCurrency: "GBP",
      description: "45-minute adapted SEN sport session including all equipment, travel within Surrey, and session report",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Children and young people with special educational needs and disabilities",
    },
  };
}

export default function SENSessionsPage() {
  const structuredData = buildGraphSchema([
    buildWebPageSchema({
      url: buildCanonicalUrl("/sen-sessions"),
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      datePublished: "2024-08-01",
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
        @keyframes chFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .ch-reveal {
          opacity: 0; transform: translateY(30px);
          animation: chFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
          animation-timeline: view(); animation-range: entry 0% entry 30%;
        }
        .ch-reveal-scale {
          opacity: 0; transform: scale(0.92);
          animation: chScaleIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
          animation-timeline: view(); animation-range: entry 0% entry 30%;
        }
        .ch-reveal-left {
          opacity: 0; transform: translateX(-30px);
          animation: chSlideRight 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
          animation-timeline: view(); animation-range: entry 0% entry 30%;
        }
        @supports not (animation-timeline: view()) {
          .ch-reveal, .ch-reveal-scale, .ch-reveal-left { opacity: 1; transform: none; animation: none; }
        }
        .ch-emoji-card:hover .ch-emoji { animation: chFloat 1s ease-in-out infinite; }
        .ch-step:hover .ch-step-num { box-shadow: 0 0 20px rgba(182,255,0,0.4); transform: scale(1.1); }
        .ch-step-num { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .ch-faq:hover { border-color: rgba(182,255,0,0.2) !important; background: #141414 !important; }
        .ch-price-card { transition: box-shadow 0.4s ease; }
        .ch-price-card:hover { box-shadow: 0 0 40px rgba(182,255,0,0.08), 0 20px 60px rgba(0,0,0,0.3); }
      `}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />


      {/* Nav */}
      <SiteNav />

      {/* HERO — video background */}
      <section style={{ position: "relative", overflow: "hidden", minHeight: "90vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, opacity: 0.35 }}>
          <source src="/videos/ezgif-70e202262c183a61.webm" type="video/webm" />
          <source src="/videos/SEN.mp4" type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(180deg, #050505 0%, rgba(5,5,5,0.85) 25%, rgba(5,5,5,0.7) 50%, rgba(5,5,5,0.85) 75%, #050505 100%)" }} />
        <div aria-hidden="true" style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 500, height: 400, borderRadius: "50%", zIndex: 1, background: "radial-gradient(ellipse, rgba(182,255,0,0.06) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "120px 24px 100px", maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, animation: "chFadeUp 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#B6FF00", boxShadow: "0 0 12px rgba(182,255,0,0.6)", display: "inline-block", animation: "chPulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#B6FF00", fontFamily: "var(--font-inter-tight)" }}>
              SEN Programme
            </span>
          </div>

          <h1 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(2.5rem, 7vw, 4.5rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: 20 }}>
            <span style={{ display: "block", color: "#fff", animation: "chFadeUp 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both" }}>Adapted Sport for</span>
            <span style={{ display: "block", color: "#B6FF00", animation: "chFadeUp 0.7s 0.35s cubic-bezier(0.16,1,0.3,1) both" }}>
              SEN{" "}
              <span className="flip-word" style={{ verticalAlign: "baseline" }}>
                <span>Children</span>
                <span>Families</span>
              </span>
            </span>
          </h1>

          <p style={{ fontSize: "1.1rem", maxWidth: 650, margin: "0 auto 36px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, fontFamily: "var(--font-inter-tight)", animation: "chFadeUp 0.7s 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
            Sensory friendly sport sessions designed for children with special educational needs.
            Small groups, trained coaches, low-stimulus environments — adapted sport that meets every child where they are.
          </p>

          <div style={{ animation: "chFadeUp 0.7s 0.65s cubic-bezier(0.16,1,0.3,1) both" }}>
            <a href={CALENDLY_URL} className="btn-primary cta-hover" style={{ fontSize: "1.1rem", padding: "16px 40px", boxShadow: "0 0 30px rgba(182,255,0,0.3)" }}>
              Book a Free Intro Call
            </a>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginTop: 14, fontFamily: "var(--font-inter-tight)" }}>
              20-minute call &middot; No obligation &middot; Max 8 per group
            </p>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120, zIndex: 2, background: "linear-gradient(to bottom, transparent, #050505)", pointerEvents: "none" }} />
      </section>

      {/* WHAT WE OFFER */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 40 }}>
          <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
            What We Offer
          </h2>
        </div>

        <p style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 32px", fontSize: "0.92rem", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.7 }}>
          Every activity is delivered in a low-stimulus, sensory friendly environment with a maximum of 8 children per session. Our SEND sports activities are designed to be inclusive, adaptable, and genuinely fun.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
          {ACTIVITIES.map((a) => (
            <div key={a.name} className="card-hover ch-emoji-card ch-reveal-scale" style={{
              background: "#111", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
              padding: 28, transition: "border-color 0.3s ease",
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 14 }}>{a.emoji}</div>
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
          Every session is tailored to the child. We choose activities based on their needs, abilities, and interests — not a one-size-fits-all programme. All equipment provided.
        </p>
      </section>

      {/* WHO RUNS THEM */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 40 }}>
          <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
            Safe, Specialist Coaching
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 16 }}>
          {TRUST_POINTS.map((t) => (
            <div key={t.title} className="card-hover ch-emoji-card ch-reveal-scale" style={{
              background: "#111", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
              borderLeft: "3px solid rgba(182,255,0,0.4)",
              padding: 24, display: "flex", gap: 16, alignItems: "flex-start",
              transition: "border-color 0.3s ease",
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


      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 40 }}>
          <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
            Getting Started
          </h2>
        </div>

        <p style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 40px", fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.7 }}>
          Every child is different — so we start with a conversation. We learn about your children&apos;s needs, plan the right activities, and show up ready to deliver something they&apos;ll love.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { step: "1", title: "Book a 20-min intro call", desc: "We learn about your child, their needs, and what kind of adapted sport would suit them best. For schools, we discuss group composition, EHCP targets, and venue logistics. No sales pitch \u2014 just a conversation." },
            { step: "2", title: "We plan the session", desc: "We design a session plan tailored to the group\u2019s needs \u2014 selecting activities, adapting rules, and preparing for any sensory or behavioural considerations. You receive the plan in advance so there are no surprises." },
            { step: "3", title: "We show up and deliver", desc: "We bring all equipment, run the session in a calm and structured way, and provide a written report afterwards. For EHCP-linked sessions, reports document progress against agreed outcomes." },
          ].map((s, i) => (
            <div key={s.step} className="ch-step ch-reveal-left" style={{ display: "flex", gap: 20, position: "relative", paddingBottom: i < 2 ? 40 : 0 }}>
              {i < 2 && (
                <div style={{ position: "absolute", left: 19, top: 44, bottom: 0, width: 2, background: "rgba(182,255,0,0.15)" }} />
              )}
              <div style={{
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

      {/* WHY IT MATTERS */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 40 }}>
          <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
            Why Physical Activity Matters for SEN Children
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.8 }}>
            Children with special educational needs and disabilities are significantly less likely to meet recommended physical activity levels than their neurotypical peers. Research from the Activity Alliance shows that disabled children are twice as likely to be inactive, not because they lack interest in sport, but because mainstream provision rarely meets their needs. Adapted sport for SEN children bridges this gap by modifying rules, equipment, and environments to create genuinely inclusive physical activity. When a child with autism can participate in a sensory friendly sport session without feeling overwhelmed, or a child with cerebral palsy can play adapted football on equal terms with their peers, sport becomes accessible in a way it never was before.
          </p>

          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.8 }}>
            The benefits of regular physical activity for SEN children extend far beyond fitness. Structured SEND sports activities support sensory regulation — helping children with autism and sensory processing differences to manage their responses to stimuli. Group sport builds social skills in a natural, unpressured context: turn-taking, shared attention, reading body language, and celebrating together. For children who struggle in classroom settings, SEN sports sessions offer a space where they can experience success, build confidence, and develop a positive relationship with their own bodies. Many parents tell us their child&apos;s behaviour, sleep, and self-esteem improve visibly after starting regular adapted sport.
          </p>

          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.8 }}>
            For families navigating the EHCP process, physical activity outcomes are increasingly recognised as a core component of holistic support. Our SEN sports sessions can be designed to target specific EHCP outcomes — from gross motor development and coordination to emotional regulation and social interaction. We provide detailed session reports that document progress, giving families and schools the evidence they need for annual reviews. As a specialist SEN physical activity provider in Surrey, we work alongside schools, occupational therapists, and families to ensure that sport is not an afterthought but a central part of every child&apos;s development plan.
          </p>
        </div>

        <div style={{ marginTop: 32, padding: "20px 24px", background: "#111", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", borderLeft: "3px solid rgba(182,255,0,0.4)" }}>
          <p style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.7, margin: 0 }}>
            We also deliver <Link href="/care-homes" style={{ color: "#B6FF00", textDecoration: "underline", textUnderlineOffset: 3 }}>adapted sport and movement sessions for care home residents</Link>. If your organisation works across age groups, we can provide a joined-up programme.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 40 }}>
          <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff" }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {FAQS.map((faq) => (
            <div key={faq.question} style={{
              background: "#111", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)",
              padding: 28,
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
          <p style={{ fontSize: "2.5rem", marginBottom: 16 }}>{"\u{1F49A}"}</p>
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff", marginBottom: 12 }}>
            Every Child Deserves to Play
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-inter-tight)", lineHeight: 1.7, marginBottom: 32 }}>
            Adapted sport builds confidence, develops social skills, and gives SEN children a space where they belong.
            Let&apos;s talk about what that looks like for your child or your school.
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
            <Link href="/care-homes" className="link-hover" style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "var(--font-inter-tight)" }}>
              Care Home Sessions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
