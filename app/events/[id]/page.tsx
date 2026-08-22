// app/events/[id]/page.tsx — Individual event / session detail page

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/SiteNav";
import EventCTAFooter from "@/components/EventCTAFooter";
import {
  buildSessionKeywords,
  buildSessionMetaDescription,
  citySlug,
  formatEventDate,
  formatEventTime,
  formatPrice,
  getEventWithExtras,
  getOtherSessionsByHost,
  getRelatedEvents,
  resolvePartnerVenueForSession,
  sportEmoji,
  sportLabel,
} from "@/lib/events";
import { seoConfig, buildCanonicalUrl } from "@/lib/seo-config";
import {
  buildBreadcrumbSchema,
  buildEventSchema,
  buildGraphSchema,
  buildWebPageSchema,
} from "@/lib/structured-data";
import EventCard from "@/components/EventCard";
import { SessionViewTracking } from "@/components/tracking/SessionViewTracking";

export const revalidate = 60;

// Past events still need to resolve (deep-links shared after the fact remain
// valid) but we deliberately do NOT prebuild every event ID — the listing
// changes too often and the build would balloon. ISR handles long-tail traffic.
export const dynamicParams = true;

function resolveOGImage(
  event: {
    bannerUrl: string | null;
    title: string;
    locationArea: string;
    sportId: string;
    startsAt: string;
    joinPricePence: number;
    placeName: string;
    locationLabel: string;
  },
  descriptionOverride?: string
): string {
  if (event.bannerUrl && event.bannerUrl.startsWith("http")) {
    return event.bannerUrl;
  }
  // Prefer a sport-aware description (e.g. "5-a-side · Astroturf · Beginner")
  // over the bare city name — gives shared previews more pull.
  const venue = event.placeName || event.locationLabel || event.locationArea;
  const description = descriptionOverride ?? `${venue} · ${event.locationArea}`;
  const params = new URLSearchParams({
    title: event.title,
    description,
    sport: event.sportId,
    date: formatEventDate(event.startsAt),
    price: formatPrice(event.joinPricePence),
  });
  return `${seoConfig.siteUrl}/api/og?${params.toString()}`;
}

function isEventPast(startsAt: string, durationMinutes: number | null): boolean {
  const start = new Date(startsAt).getTime();
  const minutes = durationMinutes && durationMinutes > 0 ? durationMinutes : 60;
  return Date.now() > start + minutes * 60_000;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getEventWithExtras(id);
  if (!result) {
    return {
      title: "Session Not Found",
      robots: { index: false, follow: false },
    };
  }
  const { event, extras } = result;

  const canonicalUrl = buildCanonicalUrl(`/events/${id}`);
  const isPast = isEventPast(event.startsAt, extras.durationMinutes);
  const shouldNoindex = event.isCancelled || isPast;

  // Build a sport-fact OG subtitle ("5-a-side · Astroturf · Beginner") when
  // we have rich data; otherwise fall back to venue + city.
  const ogFacts = [
    extras.rich.gameFormat,
    extras.rich.pitchType,
    extras.rich.courtType,
    extras.rich.skillLevel && extras.rich.skillLevel.toLowerCase() !== "all levels"
      ? extras.rich.skillLevel
      : null,
  ].filter(Boolean) as string[];
  const ogSubtitle =
    ogFacts.length > 0
      ? ogFacts.join(" · ")
      : `${event.placeName || event.locationLabel} · ${event.locationArea}`;
  const ogImage = resolveOGImage(event, ogSubtitle);

  const spotsText =
    event.spotsLeft <= 0
      ? "Session full"
      : event.spotsLeft <= 3
      ? `Only ${event.spotsLeft} spot${event.spotsLeft === 1 ? "" : "s"} left`
      : `${event.spotsLeft} spots available`;

  const sportName = sportLabel(event.sportId);
  const venuePart = event.placeName || event.locationLabel;

  // Sport-aware description folds in skill level, game format, pitch type,
  // distance — the unique facts that differentiate this session from generic
  // "football near me" pages and earn long-tail SERP visibility.
  const description = buildSessionMetaDescription({
    sportId: event.sportId,
    sportName,
    sportEmoji: sportEmoji(event.sportId),
    title: event.title,
    venue: venuePart,
    city: event.locationArea,
    dateLabel: formatEventDate(event.startsAt),
    timeLabel: formatEventTime(event.startsAt),
    priceLabel: formatPrice(event.joinPricePence),
    spotsLeft: event.spotsLeft,
    rich: extras.rich,
  });
  // Keep spotsText in scope for any future use; the description already folds
  // it in via buildSessionMetaDescription.
  void spotsText;

  // Per-event keywords mix sport, location, and intent — feeds long-tail
  // queries like "five-a-side astroturf redhill saturday".
  const keywords = buildSessionKeywords({
    sportId: event.sportId,
    sportName,
    city: event.locationArea,
    venue: venuePart,
    rich: extras.rich,
  });

  return {
    title: `${event.title} — ${formatEventDate(event.startsAt)} | Fittrybe`,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    robots: shouldNoindex
      ? {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true, "max-snippet": 0 },
        }
      : seoConfig.robotsDefault,
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: seoConfig.siteName,
      locale: seoConfig.siteLocale,
      title: event.title,
      description,
      images: [
        {
          url: ogImage,
          secureUrl: ogImage,
          width: 1200,
          height: 630,
          alt: event.title,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: seoConfig.twitterHandle,
      title: event.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getEventWithExtras(id);

  if (!result) notFound();
  const { event, extras } = result;

  const canonicalUrl = buildCanonicalUrl(`/events/${id}`);
  // Mirror the metadata-side enriched OG subtitle so the schema's image:[]
  // entry matches the og:image URL used by social crawlers — same cached
  // asset, no double-render.
  const bodyOgFacts = [
    extras.rich.gameFormat,
    extras.rich.pitchType,
    extras.rich.courtType,
    extras.rich.skillLevel && extras.rich.skillLevel.toLowerCase() !== "all levels"
      ? extras.rich.skillLevel
      : null,
  ].filter(Boolean) as string[];
  const ogImage = resolveOGImage(
    event,
    bodyOgFacts.length > 0 ? bodyOgFacts.join(" · ") : undefined
  );
  const emoji = sportEmoji(event.sportId);
  const dateStr = formatEventDate(event.startsAt);
  const timeStr = formatEventTime(event.startsAt);
  const price = formatPrice(event.joinPricePence);
  const coverImage = event.bannerUrl || event.placePhotoUrl;
  const isFull = event.spotsLeft === 0;
  const isLowSpots = event.spotsLeft > 0 && event.spotsLeft <= 3;
  const isPast = isEventPast(event.startsAt, extras.durationMinutes);
  const sportName = sportLabel(event.sportId);
  const cityHref = `/events/in/${citySlug(event.locationArea)}`;
  const sportCityHref = `/events/${event.sportId}/in/${citySlug(event.locationArea)}`;

  const computedEndDate = new Date(
    new Date(event.startsAt).getTime() +
      (extras.durationMinutes && extras.durationMinutes > 0
        ? extras.durationMinutes
        : 60) *
        60_000
  ).toISOString();

  const parentSessionUrl = event.parentSessionId
    ? buildCanonicalUrl(`/events/${event.parentSessionId}`)
    : null;

  const eventSchema = buildEventSchema({
    id: event.id,
    title: event.title,
    description: event.description ?? null,
    startsAt: event.startsAt,
    endsAt: computedEndDate,
    durationMinutes: extras.durationMinutes,
    placeName: event.placeName || event.locationLabel,
    placeVicinity: event.placeVicinity,
    locationArea: event.locationArea,
    placeLat: event.placeLat,
    placeLng: event.placeLng,
    joinPricePence: event.joinPricePence,
    spotsLeft: event.spotsLeft,
    capacity: extras.capacity,
    isCancelled: event.isCancelled,
    previousStartDate: event.isCancelled ? event.startsAt : null,
    ogImage,
    canonicalUrl,
    sportId: event.sportId,
    hostName: extras.hostName,
    hostUrl: extras.hostUsername
      ? `${seoConfig.siteUrl}/u/${extras.hostUsername}`
      : null,
    parentSessionUrl,
    aggregateRating: extras.reviewSummary,
    keywords: [
      `${event.sportId} near me`,
      `${sportName} ${event.locationArea}`,
      event.placeName || event.locationLabel,
    ],
  });

  const pageJsonLd = buildGraphSchema([
    eventSchema,
    buildWebPageSchema({
      url: canonicalUrl,
      title: event.title,
      description: `${sportName} session at ${event.placeName || event.locationLabel} — ${dateStr} ${timeStr}. Book on Fittrybe.`,
      datePublished: event.createdAt,
      dateModified: event.updatedAt ?? event.createdAt,
      breadcrumb: [
        { name: "Home", url: seoConfig.siteUrl },
        { name: "Events", url: buildCanonicalUrl("/events") },
        { name: event.locationArea, url: buildCanonicalUrl(cityHref) },
        { name: event.title, url: canonicalUrl },
      ],
    }),
    buildBreadcrumbSchema([
      { name: "Home", url: seoConfig.siteUrl },
      { name: "Events", url: buildCanonicalUrl("/events") },
      { name: event.locationArea, url: buildCanonicalUrl(cityHref) },
      { name: event.title, url: canonicalUrl },
    ]),
  ]);

  // Place name + area is more reliable for Maps than the synthetic UUID query
  const mapsQuery = encodeURIComponent(
    `${event.placeName || event.locationLabel} ${event.locationArea}`
  );
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  // Cross-links — feed crawlers into the host's other listings and into the
  // partner-venue page when one exists. Failures here never block the render.
  const [relatedEvents, hostMore, partnerVenue] = await Promise.all([
    getRelatedEvents(event, 3),
    getOtherSessionsByHost(event.hostId, event.id, 3),
    resolvePartnerVenueForSession(
      event.placeName || event.locationLabel,
      event.locationArea
    ),
  ]);

  const rich = extras.rich;
  // A "section is renderable" guard the JSX uses repeatedly to keep the markup
  // free of empty headers when the host left a sport-specific field blank.
  const hasFacts =
    !!(
      rich.skillLevel ||
      rich.gameFormat ||
      rich.matchType ||
      rich.pitchType ||
      rich.courtType ||
      rich.courtSurface ||
      rich.sessionType ||
      rich.focusArea ||
      rich.bikeType ||
      rich.paceType ||
      rich.routeType
    );
  const hasWhatToBring = rich.whatToBring.length > 0;
  const hasHouseRules = rich.houseRules.length > 0;
  const hasAmenities =
    rich.amenities.changingRooms ||
    rich.amenities.showers ||
    rich.amenities.parking ||
    rich.amenities.refreshments ||
    rich.amenities.waterFountain;
  const hasMeetingInfo =
    !!(rich.meetingInstructions || rich.meetingPointTitle || rich.parkingInfo || rich.publicTransportInfo);
  const hasRouteFacts =
    !!(rich.distanceKm || rich.elevationGainM || rich.routeType || rich.terrainType || rich.surfaceType);
  const hasRacketFacts =
    !!(rich.numberOfSets || rich.gamesPerSet || rich.scoringSystem || rich.warmUpMinutes || rich.coachPresent);

  // Pre-build the venue page href when partner venue resolved
  const venuePageHref = partnerVenue ? `/venues/${partnerVenue.slug}` : null;

  const spotsTotal = event.participantsCount + event.spotsLeft;
  const fillPercent = spotsTotal > 0 ? Math.min((event.participantsCount / spotsTotal) * 100, 100) : 0;

  // Shared inline style objects matching landing page design language
  const cardStyle: React.CSSProperties = {
    background: "#111",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.06)",
    padding: 20,
  };
  const chipStyle: React.CSSProperties = {
    background: "#1a1a1a",
    color: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "8px 16px",
    borderRadius: 50,
    fontSize: "0.85rem",
    fontWeight: 500,
  };
  const accentChipStyle: React.CSSProperties = {
    background: "rgba(182,255,0,0.1)",
    color: "#B6FF00",
    border: "1px solid rgba(182,255,0,0.2)",
    padding: "8px 16px",
    borderRadius: 50,
    fontSize: "0.85rem",
    fontWeight: 500,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "0.68rem",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.35)",
    marginBottom: 4,
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .event-host-link:hover { color: #B6FF00 !important; }
        .event-maps-btn:hover { background: rgba(255,255,255,0.04) !important; }
        .event-venue-btn:hover { background: rgba(182,255,0,0.08) !important; }
        .event-crumb:hover { color: #B6FF00 !important; }
        .event-back:hover { color: #fff !important; }
        .event-host-more:hover { background: #161616 !important; border-color: rgba(255,255,255,0.12) !important; }
        .event-viewall:hover { color: #fff !important; }
      ` }} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: pageJsonLd }}
      />

      <main style={{ minHeight: "100vh", background: "#050505", color: "#fff", fontFamily: "var(--font-inter-tight)" }}>
        {/* Nav */}
        <SiteNav />

        <SessionViewTracking
          sessionId={event.id}
          sessionName={event.title}
          price={(event.joinPricePence ?? 0) / 100}
        />

        <article style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }} className="lg:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: 24, fontSize: "0.875rem", fontFamily: "var(--font-inter-tight)", color: "rgba(255,255,255,0.35)" }}>
            <ol style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
              <li>
                <Link href="/events" className="event-crumb" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}>Events</Link>
              </li>
              <li aria-hidden="true" style={{ color: "rgba(255,255,255,0.15)" }}>/</li>
              <li>
                <Link href={cityHref} className="event-crumb" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}>{event.locationArea}</Link>
              </li>
              <li aria-hidden="true" style={{ color: "rgba(255,255,255,0.15)" }}>/</li>
              <li>
                <Link href={sportCityHref} className="event-crumb" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }}>{sportName}</Link>
              </li>
            </ol>
          </nav>

          {/* Title + badges — full width above the split */}
          <header style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Link
                href={sportCityHref}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em",
                  padding: "6px 12px", borderRadius: 50, textDecoration: "none",
                  background: "rgba(182,255,0,0.1)", color: "#B6FF00", border: "1px solid rgba(182,255,0,0.2)",
                }}
              >
                {emoji} {sportName}
              </Link>
              {event.isFeatured && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "6px 12px", borderRadius: 50, background: "rgba(250,204,21,0.1)", color: "#FACC15", border: "1px solid rgba(250,204,21,0.2)" }}>
                  Featured
                </span>
              )}
              {event.isRecurring && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "6px 12px", borderRadius: 50, background: "#111", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  Recurring
                </span>
              )}
            </div>
            <h1 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.875rem, 4vw, 3rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", color: "#fff", margin: 0, lineHeight: 1.1 }}>
              {event.title}
            </h1>
          </header>

          {/* Past / Cancelled banners */}
          {isPast && !event.isCancelled && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 12, marginBottom: 24, background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.5)" }}>⌛</span>
              <p style={{ color: "rgba(255,255,255,0.7)", fontWeight: 500, fontFamily: "var(--font-inter-tight)", fontSize: "0.875rem", margin: 0 }}>
                This session has already happened. Browse upcoming{" "}
                <Link href={sportCityHref} style={{ color: "#B6FF00", textDecoration: "none" }}>
                  {sportName.toLowerCase()} sessions in {event.locationArea}
                </Link>.
              </p>
            </div>
          )}
          {event.isCancelled && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 16, borderRadius: 12, marginBottom: 24, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <span style={{ fontSize: "1.25rem", color: "#F87171" }}>⚠️</span>
              <p style={{ color: "#F87171", fontWeight: 500, fontFamily: "var(--font-inter-tight)", fontSize: "0.875rem", margin: 0 }}>
                This session has been cancelled.
                {event.cancellationReason && (
                  <span style={{ color: "rgba(248,113,113,0.7)", marginLeft: 4 }}>
                    ({event.cancellationReason.replace(/_/g, " ")})
                  </span>
                )}
              </p>
            </div>
          )}

          {/* SPLIT LAYOUT */}
          <div className="lg:grid lg:grid-cols-[400px_1fr] lg:gap-10">
            {/* LEFT COLUMN (sticky on desktop) */}
            <div className="lg:sticky lg:top-8 lg:self-start" style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 40 }} >
              {/* Banner image */}
              {coverImage && (
                <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "4/3", position: "relative", background: "#111" }}>
                  <Image
                    src={coverImage}
                    alt={`${event.title} — ${sportName} at ${event.placeName || event.locationLabel}, ${event.locationArea}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 400px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}

              {/* Key info card */}
              <div style={cardStyle}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <p style={labelStyle}>Date</p>
                    <time dateTime={event.startsAt} style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", display: "block" }}>{dateStr}</time>
                  </div>
                  <div>
                    <p style={labelStyle}>Time</p>
                    <time dateTime={event.startsAt} style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", display: "block" }}>{timeStr}</time>
                  </div>
                  <div>
                    <p style={labelStyle}>Entry</p>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", margin: 0, color: event.joinPricePence === 0 ? "#B6FF00" : "#fff" }}>
                      {price}
                      {event.joinPricePence > 0 && (
                        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", fontWeight: 400, marginLeft: 4 }}>
                          ({event.paymentMethod})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p style={labelStyle}>Spots</p>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", margin: 0, color: isFull ? "#EF4444" : isLowSpots ? "#FB923C" : "#fff" }}>
                      {isFull
                        ? "Full"
                        : `${event.spotsLeft}${extras.capacity ? ` of ${extras.capacity}` : ""} left`}
                    </p>
                  </div>
                </div>
                {extras.durationMinutes && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, fontSize: "0.875rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ ...labelStyle, marginBottom: 0 }}>Duration</span>
                    <span style={{ color: "#fff", fontWeight: 600 }}>{extras.durationMinutes} min</span>
                  </div>
                )}
                {/* Spots fill bar */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: `${fillPercent}%`,
                      background: isFull ? "#EF4444" : isLowSpots ? "#FB923C" : "#B6FF00",
                      transition: "width 0.8s ease-out",
                    }} />
                  </div>
                  <p style={{ fontSize: "0.75rem", marginTop: 6, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-inter-tight)" }}>
                    {event.participantsCount} joined
                  </p>
                </div>
              </div>

              {/* Host card */}
              {extras.hostName && (
                <div style={cardStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {extras.hostAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={extras.hostAvatar}
                        alt=""
                        style={{
                          width: 44, height: 44, borderRadius: "50%", objectFit: "cover",
                          border: "2px solid #B6FF00", flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "linear-gradient(135deg, rgba(182,255,0,0.2), rgba(182,255,0,0.05))",
                        fontSize: "1rem", fontWeight: 700, color: "#B6FF00",
                        border: "2px solid #B6FF00",
                      }}>
                        {extras.hostName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {extras.hostUsername ? (
                          <Link
                            href={`/u/${extras.hostUsername}`}
                            className="event-host-link"
                            rel="author"
                            style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", transition: "color 0.2s" }}
                          >
                            {extras.hostName}
                          </Link>
                        ) : (
                          <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem" }}>{extras.hostName}</span>
                        )}
                        <svg width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10" fill="#B6FF00" />
                          <path d="M9 12.5l2 2 4.5-4.5" stroke="#0D0D0D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>Verified Host</p>
                      {extras.reviewSummary && extras.reviewSummary.reviewCount > 0 && (
                        <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", margin: "2px 0 0" }}>
                          ⭐ {extras.reviewSummary.ratingValue.toFixed(1)} ({extras.reviewSummary.reviewCount} review{extras.reviewSummary.reviewCount !== 1 ? "s" : ""})
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CTA — desktop */}
              <div className="hidden lg:block">
                <EventCTAFooter
                  event={{
                    id: event.id,
                    title: event.title,
                    startsAt: event.startsAt,
                    locationArea: event.locationArea,
                    placeName: event.placeName,
                    joinPricePence: event.joinPricePence,
                    sportId: event.sportId,
                    isCancelled: event.isCancelled,
                    spotsLeft: event.spotsLeft,
                  }}
                  isPast={isPast}
                  isFull={isFull}
                  isLowSpots={isLowSpots}
                  sportName={sportName}
                  sportCityHref={sportCityHref}
                />
              </div>
            </div>

            {/* RIGHT COLUMN (scrollable content) */}
            <div style={{ minWidth: 0 }}>
              {/* Description */}
              {(event.description || rich.description) && (
                <section style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
                    <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.15rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", margin: 0 }}>
                      About This Session
                    </h2>
                  </div>
                  <div style={cardStyle}>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.92rem", lineHeight: 1.7, whiteSpace: "pre-line", margin: 0 }}>
                      {event.description || rich.description}
                    </p>
                    {rich.additionalNotes && (
                      <p style={{ marginTop: 16, paddingTop: 16, color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.7, whiteSpace: "pre-line", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ color: "#B6FF00", fontWeight: 600 }}>Note from host:</span>{" "}
                        {rich.additionalNotes}
                      </p>
                    )}
                  </div>
                </section>
              )}

              {/* Session details chips */}
              {hasFacts && (
                <section aria-label="Session details" style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
                    <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.15rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", margin: 0 }}>
                      Session Details
                    </h2>
                  </div>
                  <ul style={{ display: "flex", flexWrap: "wrap", gap: 8, listStyle: "none", margin: 0, padding: 0, fontFamily: "var(--font-inter-tight)" }}>
                    {rich.gameFormat && (
                      <li style={accentChipStyle}>{rich.gameFormat}</li>
                    )}
                    {rich.matchType && (
                      <li style={chipStyle}>{rich.matchType} match</li>
                    )}
                    {rich.skillLevel && (
                      <li style={chipStyle}>{rich.skillLevel}</li>
                    )}
                    {rich.pitchType && (
                      <li style={chipStyle}>{rich.pitchType} pitch</li>
                    )}
                    {rich.courtType && (
                      <li style={chipStyle}>{rich.courtType} court</li>
                    )}
                    {rich.courtSurface && (
                      <li style={chipStyle}>{rich.courtSurface}</li>
                    )}
                    {rich.courtNumber && (
                      <li style={chipStyle}>Court {rich.courtNumber}</li>
                    )}
                    {rich.sessionType && (
                      <li style={chipStyle}>{rich.sessionType}</li>
                    )}
                    {rich.focusArea && (
                      <li style={chipStyle}>{rich.focusArea}</li>
                    )}
                    {rich.bikeType && (
                      <li style={chipStyle}>{rich.bikeType}</li>
                    )}
                    {rich.paceType && (
                      <li style={chipStyle}>{rich.paceType} pace</li>
                    )}
                    {rich.routeType && (
                      <li style={chipStyle}>{rich.routeType} route</li>
                    )}
                    {rich.womenOnly && (
                      <li style={{ ...chipStyle, background: "rgba(236,72,153,0.1)", color: "#F472B6", border: "1px solid rgba(236,72,153,0.2)" }}>
                        Women only
                      </li>
                    )}
                    {rich.genderPreference &&
                      rich.genderPreference.toLowerCase() !== "everyone" &&
                      !rich.womenOnly && (
                        <li style={chipStyle}>{rich.genderPreference}</li>
                      )}
                  </ul>
                </section>
              )}

              {/* Route facts (cycling/running) */}
              {hasRouteFacts && (
                <section aria-label="Route information" style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
                    <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.15rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", margin: 0 }}>
                      The Route
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 12, fontFamily: "var(--font-inter-tight)" }}>
                    {typeof rich.distanceKm === "number" && rich.distanceKm > 0 && (
                      <div style={cardStyle}>
                        <p style={labelStyle}>Distance</p>
                        <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{rich.distanceKm.toFixed(1)} km</p>
                      </div>
                    )}
                    {typeof rich.elevationGainM === "number" && rich.elevationGainM > 0 && (
                      <div style={cardStyle}>
                        <p style={labelStyle}>Elevation</p>
                        <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{rich.elevationGainM} m</p>
                      </div>
                    )}
                    {rich.terrainType && (
                      <div style={cardStyle}>
                        <p style={labelStyle}>Terrain</p>
                        <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{rich.terrainType}</p>
                      </div>
                    )}
                    {rich.surfaceType && (
                      <div style={cardStyle}>
                        <p style={labelStyle}>Surface</p>
                        <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{rich.surfaceType}</p>
                      </div>
                    )}
                    {rich.rideIntensity && (
                      <div style={cardStyle}>
                        <p style={labelStyle}>Intensity</p>
                        <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{rich.rideIntensity}</p>
                      </div>
                    )}
                  </div>
                  {(rich.startTitle || rich.finishTitle) && (
                    <p style={{ marginTop: 12, fontSize: "0.875rem", fontFamily: "var(--font-inter-tight)", color: "rgba(255,255,255,0.5)" }}>
                      {rich.startTitle && (<><span style={{ color: "#B6FF00" }}>Start:</span> {rich.startTitle}</>)}
                      {rich.startTitle && rich.finishTitle && <span style={{ margin: "0 8px" }}>·</span>}
                      {rich.finishTitle && (<><span style={{ color: "#B6FF00" }}>Finish:</span> {rich.finishTitle}</>)}
                    </p>
                  )}
                  {rich.hasCoffeeStop && (
                    <p style={{ marginTop: 8, fontSize: "0.875rem", fontFamily: "var(--font-inter-tight)", color: "rgba(255,255,255,0.5)" }}>
                      ☕ Includes coffee stop
                    </p>
                  )}
                </section>
              )}

              {/* Racket match format */}
              {hasRacketFacts && (
                <section aria-label="Match format" style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
                    <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.15rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", margin: 0 }}>
                      Match Format
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 12, fontFamily: "var(--font-inter-tight)" }}>
                    {rich.numberOfSets && (
                      <div style={cardStyle}>
                        <p style={labelStyle}>Sets</p>
                        <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>Best of {rich.numberOfSets}</p>
                      </div>
                    )}
                    {rich.gamesPerSet && (
                      <div style={cardStyle}>
                        <p style={labelStyle}>Games / set</p>
                        <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{rich.gamesPerSet}</p>
                      </div>
                    )}
                    {rich.scoringSystem && (
                      <div style={cardStyle}>
                        <p style={labelStyle}>Scoring</p>
                        <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{rich.scoringSystem}</p>
                      </div>
                    )}
                    {typeof rich.warmUpMinutes === "number" && rich.warmUpMinutes > 0 && (
                      <div style={cardStyle}>
                        <p style={labelStyle}>Warm-up</p>
                        <p style={{ color: "#fff", fontWeight: 600, margin: 0 }}>{rich.warmUpMinutes} min</p>
                      </div>
                    )}
                  </div>
                  {rich.coachPresent && (
                    <p style={{ marginTop: 12, fontSize: "0.875rem", fontFamily: "var(--font-inter-tight)", color: "rgba(255,255,255,0.5)" }}>
                      Coach present{rich.coachName ? `: ${rich.coachName}` : ""}
                    </p>
                  )}
                </section>
              )}

              {/* What to Bring */}
              {hasWhatToBring && (
                <section aria-label="What to bring" style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
                    <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.15rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", margin: 0 }}>
                      What to Bring
                    </h2>
                  </div>
                  <div style={cardStyle}>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                      {rich.whatToBring.map((item, i) => (
                        <li key={`${i}-${item}`} style={{ display: "flex", alignItems: "flex-start", gap: 12, color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}>
                          <span style={{ color: "#B6FF00", marginTop: 2, fontSize: "0.75rem" }}>✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {(rich.ballProvided !== null || rich.bibsProvided !== null || rich.equipmentProvided !== null || rich.ballsProvided !== null) && (
                      <div style={{ marginTop: 16, paddingTop: 16, display: "flex", flexWrap: "wrap", gap: 8, fontSize: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        {rich.ballProvided && (
                          <span style={{ padding: "4px 10px", borderRadius: 50, background: "rgba(182,255,0,0.1)", color: "#B6FF00", border: "1px solid rgba(182,255,0,0.2)" }}>Ball provided</span>
                        )}
                        {rich.bibsProvided && (
                          <span style={{ padding: "4px 10px", borderRadius: 50, background: "rgba(182,255,0,0.1)", color: "#B6FF00", border: "1px solid rgba(182,255,0,0.2)" }}>Bibs provided</span>
                        )}
                        {rich.equipmentProvided && (
                          <span style={{ padding: "4px 10px", borderRadius: 50, background: "rgba(182,255,0,0.1)", color: "#B6FF00", border: "1px solid rgba(182,255,0,0.2)" }}>Equipment provided</span>
                        )}
                        {rich.ballsProvided && (
                          <span style={{ padding: "4px 10px", borderRadius: 50, background: "rgba(182,255,0,0.1)", color: "#B6FF00", border: "1px solid rgba(182,255,0,0.2)" }}>Balls provided</span>
                        )}
                        {rich.ownRacketRequired && (
                          <span style={{ padding: "4px 10px", borderRadius: 50, background: "rgba(251,146,60,0.1)", color: "#FB923C", border: "1px solid rgba(251,146,60,0.2)" }}>Own racket required</span>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* House Rules */}
              {hasHouseRules && (
                <section aria-label="House rules" style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
                    <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.15rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", margin: 0 }}>
                      House Rules
                    </h2>
                  </div>
                  <div style={cardStyle}>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                      {rich.houseRules.map((rule, i) => (
                        <li key={`${i}-${rule}`} style={{ display: "flex", alignItems: "flex-start", gap: 12, color: "rgba(255,255,255,0.8)", fontSize: "0.875rem" }}>
                          <span style={{ color: "#B6FF00", marginTop: 2, fontSize: "0.75rem" }}>•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Amenities */}
              {hasAmenities && (
                <section aria-label="Venue amenities" style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
                    <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.15rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", margin: 0 }}>
                      Amenities
                    </h2>
                  </div>
                  <ul className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 10, listStyle: "none", margin: 0, padding: 0, fontFamily: "var(--font-inter-tight)" }}>
                    {rich.amenities.changingRooms && (
                      <li style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 12, padding: 14, fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ color: "#B6FF00", fontSize: "0.75rem" }}>✓</span> Changing rooms
                      </li>
                    )}
                    {rich.amenities.showers && (
                      <li style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 12, padding: 14, fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ color: "#B6FF00", fontSize: "0.75rem" }}>✓</span> Showers
                      </li>
                    )}
                    {rich.amenities.parking && (
                      <li style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 12, padding: 14, fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ color: "#B6FF00", fontSize: "0.75rem" }}>✓</span> Parking
                      </li>
                    )}
                    {rich.amenities.refreshments && (
                      <li style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 12, padding: 14, fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ color: "#B6FF00", fontSize: "0.75rem" }}>✓</span> Refreshments
                      </li>
                    )}
                    {rich.amenities.waterFountain && (
                      <li style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 12, padding: 14, fontSize: "0.875rem", color: "rgba(255,255,255,0.8)", background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ color: "#B6FF00", fontSize: "0.75rem" }}>✓</span> Water fountain
                      </li>
                    )}
                  </ul>
                  {rich.requiresMembership && (
                    <p style={{ marginTop: 12, fontSize: "0.875rem", color: "#FDBA74", fontFamily: "var(--font-inter-tight)" }}>
                      Venue requires membership to enter
                    </p>
                  )}
                </section>
              )}

              {/* Getting There */}
              {hasMeetingInfo && (
                <section aria-label="Meeting and travel information" style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
                    <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.15rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", margin: 0 }}>
                      Getting There
                    </h2>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, fontFamily: "var(--font-inter-tight)" }}>
                    {(rich.meetingPointTitle || rich.meetingInstructions) && (
                      <div style={{ ...cardStyle, borderLeft: "3px solid rgba(182,255,0,0.4)" }}>
                        <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#B6FF00", marginBottom: 8, marginTop: 0 }}>Meeting point</h3>
                        {rich.meetingPointTitle && <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.875rem", marginBottom: 4, marginTop: 0 }}>{rich.meetingPointTitle}</p>}
                        {rich.meetingInstructions && <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.7, whiteSpace: "pre-line", margin: 0 }}>{rich.meetingInstructions}</p>}
                      </div>
                    )}
                    {rich.parkingInfo && (
                      <div style={cardStyle}>
                        <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#B6FF00", marginBottom: 8, marginTop: 0 }}>Parking</h3>
                        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.7, whiteSpace: "pre-line", margin: 0 }}>{rich.parkingInfo}</p>
                      </div>
                    )}
                    {rich.publicTransportInfo && (
                      <div style={cardStyle}>
                        <h3 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#B6FF00", marginBottom: 8, marginTop: 0 }}>Public transport</h3>
                        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.7, whiteSpace: "pre-line", margin: 0 }}>{rich.publicTransportInfo}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Location */}
              <section style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
                  <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.15rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", margin: 0 }}>
                    Location
                  </h2>
                </div>
                <div
                  style={cardStyle}
                  itemScope
                  itemType="https://schema.org/Place"
                >
                  <p style={{ color: "#fff", fontWeight: 600, fontSize: "1rem", marginBottom: 4, marginTop: 0 }} itemProp="name">
                    {event.placeName || event.locationLabel}
                  </p>
                  <div itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                    {event.placeVicinity && (
                      <p style={{ fontSize: "0.875rem", marginBottom: 2, color: "rgba(255,255,255,0.5)", marginTop: 0 }} itemProp="streetAddress">{event.placeVicinity}</p>
                    )}
                    <p style={{ fontSize: "0.875rem", marginBottom: 16, color: "rgba(255,255,255,0.35)", marginTop: 0 }}>
                      <span itemProp="addressLocality">{event.locationArea}</span>
                      <meta itemProp="addressCountry" content="GB" />
                    </p>
                  </div>
                  {event.placeRating && (
                    <p style={{ fontSize: "0.75rem", marginBottom: 16, color: "rgba(255,255,255,0.4)", marginTop: 0 }}>⭐ {event.placeRating} on Google</p>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="event-maps-btn"
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.875rem", padding: "10px 16px", borderRadius: 50, border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", textDecoration: "none", transition: "background 0.2s" }}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Open in Google Maps
                    </a>
                    {venuePageHref && partnerVenue && (
                      <Link
                        href={venuePageHref}
                        className="event-venue-btn"
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.875rem", padding: "10px 16px", borderRadius: 50, color: "#B6FF00", border: "1px solid rgba(182,255,0,0.25)", textDecoration: "none", transition: "background 0.2s" }}
                      >
                        View {partnerVenue.name}
                      </Link>
                    )}
                  </div>
                </div>
              </section>

              {/* CTA — mobile only */}
              <div className="lg:hidden" style={{ marginBottom: 32 }}>
                <EventCTAFooter
                  event={{
                    id: event.id,
                    title: event.title,
                    startsAt: event.startsAt,
                    locationArea: event.locationArea,
                    placeName: event.placeName,
                    joinPricePence: event.joinPricePence,
                    sportId: event.sportId,
                    isCancelled: event.isCancelled,
                    spotsLeft: event.spotsLeft,
                  }}
                  isPast={isPast}
                  isFull={isFull}
                  isLowSpots={isLowSpots}
                  sportName={sportName}
                  sportCityHref={sportCityHref}
                />
              </div>

              {/* More from host */}
              {hostMore.length > 0 && extras.hostName && (
                <section
                  aria-label={`More sessions hosted by ${extras.hostName}`}
                  style={{ marginBottom: 32, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
                    <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.15rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", margin: 0 }}>
                      More from {extras.hostName}
                    </h2>
                  </div>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8, fontFamily: "var(--font-inter-tight)" }}>
                    {hostMore.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/events/${s.id}`}
                          className="event-host-more"
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                            padding: 16, borderRadius: 12, textDecoration: "none",
                            background: "#111", border: "1px solid rgba(255,255,255,0.06)",
                            transition: "background 0.2s, border-color 0.2s",
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ color: "#fff", fontWeight: 500, fontSize: "0.875rem", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {sportEmoji(s.sportId)} {s.title}
                            </p>
                            <p style={{ fontSize: "0.75rem", marginTop: 2, color: "rgba(255,255,255,0.4)" }}>
                              {formatEventDate(s.startsAt)} · {s.locationArea}
                            </p>
                          </div>
                          <span
                            style={{
                              fontSize: "0.75rem", fontWeight: 700, padding: "4px 10px", borderRadius: 50, flexShrink: 0,
                              ...(s.joinPricePence === 0
                                ? { background: "rgba(182,255,0,0.1)", color: "#B6FF00" }
                                : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }),
                            }}
                          >
                            {formatPrice(s.joinPricePence)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Related events */}
              {relatedEvents.length > 0 && (
                <section
                  aria-label={`More ${sportName} sessions`}
                  style={{ paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 3, height: 20, borderRadius: 2, background: "#B6FF00" }} />
                      <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "1.15rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.01em", color: "#fff", margin: 0 }}>
                        More {sportName} Sessions
                      </h2>
                    </div>
                    <Link
                      href={sportCityHref}
                      className="event-viewall"
                      style={{ fontSize: "0.875rem", color: "#B6FF00", textDecoration: "none", transition: "color 0.2s", fontFamily: "var(--font-inter-tight)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 20 }}>
                    {relatedEvents.map((related) => (
                      <EventCard key={related.id} event={related} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
