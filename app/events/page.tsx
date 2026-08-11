import type { Metadata } from "next";
import {
  getUpcomingEventCities,
  getUpcomingEventsWithHosts,
} from "@/lib/events";
import { buildCanonicalUrl, seoConfig } from "@/lib/seo-config";
import {
  buildBreadcrumbSchema,
  buildCollectionPageSchema,
  buildFAQSchema,
  buildGraphSchema,
  buildItemListSchema,
  type ItemListEvent,
} from "@/lib/structured-data";
import EventCard from "@/components/EventCard";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import SmartDownloadLink from "@/components/SmartDownloadLink";

// Revalidate every 60 seconds so new sessions appear without a full rebuild
export const revalidate = 60;

const SPORT_FILTERS = [
  { id: "all", label: "All Sports", emoji: "" },
  { id: "football", label: "Football", emoji: "\u26BD" },
  { id: "basketball", label: "Basketball", emoji: "\uD83C\uDFC0" },
  { id: "cycling", label: "Cycling", emoji: "\uD83D\uDEB4" },
  { id: "running", label: "Running", emoji: "\uD83C\uDFC3" },
  { id: "badminton", label: "Badminton", emoji: "\uD83C\uDFF8" },
  { id: "tennis", label: "Tennis", emoji: "\uD83C\uDFBE" },
  { id: "gym", label: "Gym", emoji: "\uD83C\uDFCB\uFE0F" },
];

const EVENTS_FAQS = [
  {
    question: "How do I find a sports session near me?",
    answer:
      "Browse the live list above or filter by your sport. Every Fittrybe session shows the venue, time, price and remaining spots upfront \u2014 tap a session to view full details and reserve.",
  },
  {
    question: "Are sessions on Fittrybe free?",
    answer:
      "Many are free. Paid sessions show the price per player on the card before you join \u2014 typically \u00A33\u2013\u00A310 to cover pitch, court or coach costs.",
  },
  {
    question: "Can I join a session as a solo player?",
    answer:
      "Yes \u2014 most Fittrybe sessions are designed for solo joiners. Hosts split arrivals into balanced teams or pair you up on the day.",
  },
  {
    question: "What sports are listed on Fittrybe?",
    answer:
      "Football (5-a-side and 7-a-side), basketball, tennis, badminton, running groups, cycling, swimming, gym sessions and boxing \u2014 all hosted by real people in your area.",
  },
];

function capitalise(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}): Promise<Metadata> {
  const { sport } = await searchParams;
  const activeSport = sport && sport !== "all" ? sport : null;

  const title = activeSport
    ? `${capitalise(activeSport)} Sessions Near You | Fittrybe`
    : "Find Sports Sessions Near You | Fittrybe";

  const description = activeSport
    ? `Book grassroots ${activeSport} sessions near you on Fittrybe. Find local games, reserve your spot in one tap, and meet players in your area.`
    : "Browse upcoming grassroots sports sessions on Fittrybe. Find football, basketball, cycling, badminton and more near you. Reserve your spot in one tap.";

  const canonicalUrl = buildCanonicalUrl("/events");

  const eventsOGImage = `${seoConfig.siteUrl}/api/og?title=${encodeURIComponent(
    activeSport ? `${capitalise(activeSport)} Sessions Near You` : "Upcoming Sports Sessions"
  )}&description=${encodeURIComponent(description)}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: seoConfig.siteName,
      locale: seoConfig.siteLocale,
      title: activeSport
        ? `${capitalise(activeSport)} Sessions Near You | Fittrybe`
        : "Upcoming Sports Sessions | Fittrybe",
      description,
      images: [
        {
          url: eventsOGImage,
          secureUrl: eventsOGImage,
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: seoConfig.twitterHandle,
      title,
      description,
      images: [eventsOGImage],
    },
  };
}

export default async function EventsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const { sport } = await searchParams;
  const [allEvents, cities] = await Promise.all([
    getUpcomingEventsWithHosts(),
    getUpcomingEventCities(),
  ]);

  const activeSport = sport && sport !== "all" ? sport : null;
  const filteredEvents = activeSport
    ? allEvents.filter((e) => e.sportId === activeSport)
    : allEvents;

  const isEmpty = filteredEvents.length === 0;
  const canonicalUrl = buildCanonicalUrl("/events");

  const itemListEvents: ItemListEvent[] = filteredEvents
    .slice(0, 30)
    .map((e) => ({
      id: e.id,
      title: e.title,
      startsAt: e.startsAt,
      sportId: e.sportId,
      placeName: e.placeName || e.locationLabel,
      locationArea: e.locationArea,
      joinPricePence: e.joinPricePence,
      spotsLeft: e.spotsLeft,
      isCancelled: e.isCancelled,
      bannerUrl: e.bannerUrl,
      placeLat: e.placeLat,
      placeLng: e.placeLng,
    }));

  const collectionName = activeSport
    ? `${capitalise(activeSport)} Sessions on Fittrybe`
    : "Upcoming Sports Sessions on Fittrybe";

  const collectionDescription = activeSport
    ? `Live ${activeSport} sessions across the UK \u2014 book your spot, meet your tribe.`
    : "Live sports sessions across the UK \u2014 football, basketball, tennis, badminton and more. Book your spot, meet your tribe.";

  const pageJsonLd = buildGraphSchema(
    [
      buildCollectionPageSchema({
        url: canonicalUrl,
        name: collectionName,
        description: collectionDescription,
        numberOfItems: filteredEvents.length,
        breadcrumb: [
          { name: "Home", url: seoConfig.siteUrl },
          { name: "Events", url: canonicalUrl },
        ],
      }),
      buildBreadcrumbSchema([
        { name: "Home", url: seoConfig.siteUrl },
        { name: "Events", url: canonicalUrl },
      ]),
      buildFAQSchema(EVENTS_FAQS),
      ...(itemListEvents.length > 0
        ? [
            buildItemListSchema(itemListEvents, seoConfig.siteUrl, {
              name: collectionName,
              description: collectionDescription,
            }),
          ]
        : []),
    ].filter(Boolean) as Array<Record<string, unknown>>
  );

  return (
    <>
      {isEmpty && activeSport && (
        <meta name="robots" content="noindex, follow" />
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: pageJsonLd }}
      />

      <main
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#ffffff",
          overflow: "hidden",
        }}
      >
        {/* ── Nav ── */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "transparent",
          }}
        >
          <Link
            href="/"
            aria-label="Fittrybe \u2014 return to homepage"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            <Wordmark height={28} />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link
              href="/sports"
              style={{
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
                fontFamily: "var(--font-inter-tight)",
              }}
              className="hidden sm:block nav-link"
            >
              Sports
            </Link>
            <Link
              href="/blog"
              style={{
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
                fontFamily: "var(--font-inter-tight)",
              }}
              className="hidden sm:block nav-link"
            >
              Blog
            </Link>
            <SmartDownloadLink
              style={{
                display: "inline-block",
                fontSize: "0.875rem",
                fontWeight: 600,
                padding: "10px 20px",
                borderRadius: 50,
                background: "#B6FF00",
                color: "#000000",
                textDecoration: "none",
                fontFamily: "var(--font-inter-tight)",
              }}
            >
              Get the App
            </SmartDownloadLink>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section
          style={{
            position: "relative",
            maxWidth: 1200,
            margin: "0 auto",
            padding: "80px 24px 64px",
            textAlign: "center",
          }}
        >
          {/* Glow orb */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 600,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse, rgba(182,255,0,0.06) 0%, transparent 70%)",
              filter: "blur(80px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#B6FF00",
                  boxShadow: "0 0 12px rgba(182,255,0,0.6)",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "#B6FF00",
                  fontFamily: "var(--font-inter-tight)",
                }}
              >
                Live Sessions
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-anton)",
                fontSize: "clamp(3rem, 8vw, 6rem)",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                lineHeight: 1.05,
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  display: "block",
                  background:
                    "linear-gradient(to right, #ffffff 0%, rgba(255,255,255,0.6) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Find Your Game.
              </span>
              <span
                style={{
                  display: "block",
                  background:
                    "linear-gradient(135deg, #B6FF00 0%, #7CFC00 50%, #B6FF00 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Show Up and Play.
              </span>
            </h1>

            <p
              style={{
                fontSize: "1.125rem",
                maxWidth: 640,
                margin: "0 auto",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.7,
                fontFamily: "var(--font-inter-tight)",
              }}
            >
              {activeSport
                ? `Grassroots ${activeSport} sessions in Redhill, Surrey and across the UK. Reserve your spot and meet your tribe.`
                : "Grassroots sports sessions in Redhill, Surrey and across the UK. Football, basketball, cycling and more \u2014 reserve your spot in one tap."}
            </p>
          </div>
        </section>

        {/* ── Sport filter pills ── */}
        <section
          aria-label="Filter by sport"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 48px" }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {SPORT_FILTERS.map((filter) => {
              const isActive =
                (!activeSport && filter.id === "all") ||
                activeSport === filter.id;
              const href =
                filter.id === "all" ? "/events" : `/session/${filter.id}`;
              return (
                <Link
                  key={filter.id}
                  href={href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 20px",
                    borderRadius: 50,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    fontFamily: "var(--font-inter-tight)",
                    transition: "all 0.3s ease",
                    ...(isActive
                      ? {
                          background: "#B6FF00",
                          color: "#0D0D0D",
                          boxShadow: "0 0 20px rgba(182,255,0,0.25)",
                        }
                      : {
                          background: "#161616",
                          color: "rgba(255,255,255,0.55)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }),
                  }}
                  aria-current={isActive ? "page" : undefined}
                >
                  {filter.emoji && (
                    <span aria-hidden="true">{filter.emoji}</span>
                  )}
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── Events grid ── */}
        <section
          aria-label="Upcoming sessions"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 96px" }}
        >
          {isEmpty ? (
            <div style={{ textAlign: "center", padding: "96px 0" }}>
              <div
                style={{
                  fontSize: "4.5rem",
                  marginBottom: 24,
                  display: "inline-block",
                  filter: "drop-shadow(0 0 20px rgba(182,255,0,0.3))",
                }}
              >
                {activeSport
                  ? SPORT_FILTERS.find((f) => f.id === activeSport)?.emoji ||
                    "\uD83C\uDFC3"
                  : "\uD83C\uDFDF"}
              </div>
              <p
                style={{
                  fontSize: "1.125rem",
                  fontFamily: "var(--font-inter-tight)",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 8,
                }}
              >
                {activeSport
                  ? `No upcoming ${activeSport} sessions right now.`
                  : "No upcoming sessions right now."}
              </p>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-inter-tight)",
                  color: "rgba(255,255,255,0.3)",
                  marginBottom: 32,
                }}
              >
                New sessions are added daily \u2014 check back soon or get the app.
              </p>
              <SmartDownloadLink
                style={{
                  display: "inline-block",
                  padding: "14px 32px",
                  background: "#B6FF00",
                  color: "#000000",
                  fontWeight: 700,
                  borderRadius: 50,
                  textDecoration: "none",
                  fontFamily: "var(--font-anton)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontSize: "0.95rem",
                }}
              >
                Get the App
              </SmartDownloadLink>
            </div>
          ) : (
            <>
              {/* Session count pill */}
              <div style={{ marginBottom: 32 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 16px",
                    borderRadius: 50,
                    background: "#161616",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "var(--font-inter-tight)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#B6FF00",
                      display: "inline-block",
                    }}
                  />
                  {filteredEvents.length} session
                  {filteredEvents.length !== 1 ? "s" : ""} live
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, i) => (
                  <div
                    key={event.id}
                    style={{
                      animation: `fadeSlideUp 0.5s ease-out ${i * 0.06}s both`,
                    }}
                  >
                    <EventCard event={event} />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── Browse by City ── */}
        {cities.length > 0 && (
          <section
            aria-label="Browse sessions by city"
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "64px 24px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-anton)",
                fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                color: "#ffffff",
                marginBottom: 40,
                textAlign: "center",
              }}
            >
              Browse by City
            </h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 12,
              }}
            >
              {cities.slice(0, 24).map((city) => (
                <Link
                  key={city.slug}
                  href={`/events/in/${city.slug}`}
                  className="city-link"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 20px",
                    borderRadius: 14,
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    textDecoration: "none",
                    fontFamily: "var(--font-inter-tight)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {city.name}
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 8,
                      background: "rgba(182,255,0,0.1)",
                      color: "#B6FF00",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {city.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── FAQ ── */}
        <section
          aria-label="Frequently asked questions"
          style={{
            maxWidth: 768,
            margin: "0 auto",
            padding: "80px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-anton)",
              fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              color: "#ffffff",
              marginBottom: 40,
              textAlign: "center",
            }}
          >
            Sessions FAQ
          </h2>
          <dl style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {EVENTS_FAQS.map((faq) => (
              <div
                key={faq.question}
                style={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderLeft: "3px solid rgba(182,255,0,0.4)",
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <dt
                  style={{
                    fontFamily: "var(--font-inter-tight)",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#ffffff",
                    marginBottom: 8,
                  }}
                >
                  {faq.question}
                </dt>
                <dd
                  style={{
                    fontFamily: "var(--font-inter-tight)",
                    fontSize: "0.875rem",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Host CTA ── */}
        <section
          style={{
            padding: "80px 24px",
            textAlign: "center",
            position: "relative",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at center bottom, rgba(182,255,0,0.04) 0%, transparent 60%)",
            }}
          />
          <div style={{ position: "relative" }}>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                marginBottom: 8,
                fontFamily: "var(--font-inter-tight)",
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              Got a pitch? Got a group?
            </p>
            <h2
              style={{
                fontFamily: "var(--font-anton)",
                fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                color: "#ffffff",
                marginBottom: 24,
              }}
            >
              Host Your Own Session
            </h2>
            <SmartDownloadLink
              style={{
                display: "inline-block",
                padding: "16px 40px",
                background: "#B6FF00",
                color: "#000000",
                fontWeight: 700,
                borderRadius: 50,
                textDecoration: "none",
                fontFamily: "var(--font-anton)",
                fontSize: "1.125rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                boxShadow: "0 0 30px rgba(182,255,0,0.2)",
              }}
            >
              Get the App \u2014 Host for Free
            </SmartDownloadLink>
          </div>
        </section>
      </main>

      {/* ── Animations + hover styles ── */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .city-link:hover {
          border-color: rgba(182,255,0,0.3) !important;
          background: rgba(255,255,255,0.06) !important;
          color: #fff !important;
        }
        .nav-link:hover {
          color: #fff !important;
        }
      `}</style>
    </>
  );
}
