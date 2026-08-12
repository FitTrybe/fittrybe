import Link from "next/link";
import Image from "next/image";
import type { FittrybeEvent } from "@/lib/events";
import { sportEmoji, formatEventTime, formatPrice } from "@/lib/events";

interface EventCardProps {
  event: FittrybeEvent & {
    hostName?: string | null;
    hostAvatar?: string | null;
    hostVerified?: boolean;
  };
}

const BADGE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  "FULL":          { bg: "rgba(239,68,68,0.15)",  color: "#EF4444", border: "rgba(239,68,68,0.3)" },
  "LAST SPOT":     { bg: "rgba(251,146,60,0.15)", color: "#FB923C", border: "rgba(251,146,60,0.3)" },
  "FILLING UP":    { bg: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "rgba(251,191,36,0.3)" },
  "STARTING SOON": { bg: "rgba(99,102,241,0.15)", color: "#818CF8", border: "rgba(99,102,241,0.3)" },
  "POPULAR":       { bg: "rgba(236,72,153,0.15)", color: "#EC4899", border: "rgba(236,72,153,0.3)" },
  "FREE":          { bg: "rgba(182,255,0,0.1)",  color: "#B6FF00", border: "rgba(182,255,0,0.3)" },
};

function getBadge(event: {
  spotsLeft: number;
  startsAt: string;
  participantsCount: number;
  joinPricePence: number;
}): string | null {
  if (event.spotsLeft <= 0) return "FULL";
  if (event.spotsLeft === 1) return "LAST SPOT";
  if (event.spotsLeft <= 3) return "FILLING UP";
  const hoursAway = (new Date(event.startsAt).getTime() - Date.now()) / 3600000;
  if (hoursAway <= 2 && hoursAway > 0) return "STARTING SOON";
  if (event.participantsCount >= 8) return "POPULAR";
  if (event.joinPricePence === 0) return "FREE";
  return null;
}

function formatRelativeDay(isoString: string): string {
  const TZ = "Europe/London";
  const date = new Date(isoString);
  const now = new Date();
  // Compare dates in UK timezone to get correct Today/Tomorrow labels
  const ukDate = date.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
  const ukToday = now.toLocaleDateString("en-CA", { timeZone: TZ });
  const diff = Math.round(
    (new Date(ukDate).getTime() - new Date(ukToday).getTime()) / 86400000
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });
}

export default function EventCard({ event }: EventCardProps) {
  const emoji = sportEmoji(event.sportId);
  const dayStr = formatRelativeDay(event.startsAt);
  const timeStr = formatEventTime(event.startsAt);
  const price = formatPrice(event.joinPricePence);
  const coverImage = event.bannerUrl || event.placePhotoUrl;
  const badge = getBadge(event);
  const badgeStyle = badge ? BADGE_STYLES[badge] : null;
  const spotsTotal = event.participantsCount + event.spotsLeft;
  const fillPercent = spotsTotal > 0 ? Math.min((event.participantsCount / spotsTotal) * 100, 100) : 0;

  return (
      <Link href={`/events/${event.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        <div className="event-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Image with gradient overlay */}
          <div style={{ position: "relative", aspectRatio: "3/2", overflow: "hidden" }}>
            {coverImage ? (
              <Image
                src={coverImage}
                alt={event.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="event-card-img"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div style={{
                width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(145deg, #111 0%, #0a0a0a 100%)",
              }}>
                <span style={{ fontSize: "3.5rem", filter: "saturate(0.8)" }}>{emoji}</span>
              </div>
            )}
            {/* Bottom gradient for text readability */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
              pointerEvents: "none",
            }} />

            {/* Price — top right */}
            <div style={{
              position: "absolute", top: 14, right: 14,
              padding: "5px 12px", borderRadius: 8,
              background: event.joinPricePence === 0
                ? "rgba(182,255,0,0.9)" : "rgba(0,0,0,0.7)",
              backdropFilter: "blur(12px)",
              color: event.joinPricePence === 0 ? "#0D0D0D" : "#fff",
              fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.02em",
            }}>
              {price}
            </div>

            {/* Badge — top left */}
            {badge && badgeStyle && (
              <div style={{
                position: "absolute", top: 14, left: 14,
                padding: "4px 10px", borderRadius: 8,
                background: badgeStyle.bg, backdropFilter: "blur(12px)",
                border: `1px solid ${badgeStyle.border}`,
                color: badgeStyle.color,
                fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.06em",
              }}>
                {badge}
              </div>
            )}

            {/* Sport + date overlay at bottom of image */}
            <div style={{
              position: "absolute", bottom: 14, left: 14, right: 14,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 6,
                background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
                fontSize: "0.68rem", fontWeight: 600, color: "#fff",
                textTransform: "capitalize",
              }}>
                {emoji} {event.sportId}
              </span>
              <span style={{
                fontSize: "0.68rem", fontWeight: 600, color: "rgba(255,255,255,0.85)",
              }}>
                {dayStr} · {timeStr}
              </span>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "16px 16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
            {/* Title */}
            <h3 style={{
              fontFamily: "var(--font-inter-tight, sans-serif)",
              fontSize: "0.92rem", fontWeight: 700, color: "#fff", marginBottom: 8,
              lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              {event.title}
            </h3>

            {/* Location */}
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 14 }}>
              <svg width="12" height="12" viewBox="0 0 20 20" fill="rgba(255,255,255,0.3)" style={{ flexShrink: 0 }}>
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span style={{
                fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontWeight: 500,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {event.locationLabel || event.placeName || event.locationArea}
              </span>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Host + spots row */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)",
            }}>
              {/* Host — only show when host data is available */}
              {event.hostName ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                  {event.hostAvatar ? (
                    <Image
                      src={event.hostAvatar}
                      alt=""
                      width={26}
                      height={26}
                      style={{
                        borderRadius: "50%", objectFit: "cover", flexShrink: 0,
                        border: event.hostVerified ? "2px solid #B6FF00" : "2px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  ) : (
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, rgba(182,255,0,0.2), rgba(182,255,0,0.05))",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.65rem", fontWeight: 700, color: "#B6FF00",
                      border: event.hostVerified ? "2px solid #B6FF00" : "2px solid rgba(255,255,255,0.08)",
                    }}>
                      {event.hostName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.7)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      display: "flex", alignItems: "center", gap: 3,
                    }}>
                      {event.hostName}
                      {event.hostVerified && (
                        <svg width="12" height="12" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10" fill="#B6FF00"/>
                          <path d="M9 12.5l2 2 4.5-4.5" stroke="#0D0D0D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>
                      {event.hostVerified ? "Verified Host" : "Host"}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1 }} />
              )}

              {/* Spots indicator */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <div style={{
                  fontSize: "0.65rem", fontWeight: 700,
                  color: event.spotsLeft <= 3 ? "#FB923C" : "rgba(255,255,255,0.5)",
                }}>
                  {event.spotsLeft > 0 ? `${event.spotsLeft} spot${event.spotsLeft === 1 ? "" : "s"} left` : "Full"}
                </div>
                <div style={{ width: 48, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    width: `${fillPercent}%`,
                    background: event.spotsLeft <= 3 ? "#FB923C" : "#B6FF00",
                    transition: "width 0.8s ease-out",
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
  );
}
