"use client";

import { useState } from "react";
import Link from "next/link";
import SmartDownloadLink from "@/components/SmartDownloadLink";
import GuestReserveModal from "@/components/GuestReserveModal";

interface EventCTAFooterProps {
  event: {
    id: string;
    title: string;
    startsAt: string;
    locationArea: string;
    placeName: string;
    joinPricePence: number;
    sportId: string;
    isCancelled: boolean;
    spotsLeft: number;
  };
  isPast: boolean;
  isFull: boolean;
  isLowSpots: boolean;
  sportName: string;
  sportCityHref: string;
}

export default function EventCTAFooter({
  event,
  isPast,
  isFull,
  isLowSpots,
  sportName,
  sportCityHref,
}: EventCTAFooterProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        style={{
          marginTop: 24,
          padding: 28,
          borderRadius: 16,
          background: "#111",
          border: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
        }}
      >
        {event.isCancelled ? (
          <>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 16, fontFamily: "var(--font-inter-tight)", fontSize: "0.9rem" }}>
              This session was cancelled. Browse other upcoming sessions.
            </p>
            <Link href={sportCityHref} className="btn-primary">
              See {sportName} in {event.locationArea}
            </Link>
          </>
        ) : isPast ? (
          <>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 16, fontFamily: "var(--font-inter-tight)", fontSize: "0.9rem" }}>
              This session has finished. Find another one near you.
            </p>
            <Link href={sportCityHref} className="btn-primary">
              See Upcoming {sportName} Sessions
            </Link>
          </>
        ) : isFull ? (
          <>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 16, fontFamily: "var(--font-inter-tight)", fontSize: "0.9rem" }}>
              This session is full. Get the app to be notified when spots open up.
            </p>
            <SmartDownloadLink className="btn-primary">
              Get the App — Get Notified
            </SmartDownloadLink>
          </>
        ) : (
          <>
            <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 6, fontFamily: "var(--font-inter-tight)", fontSize: "0.95rem", fontWeight: 600 }}>
              {isLowSpots
                ? `Only ${event.spotsLeft} spot${event.spotsLeft === 1 ? "" : "s"} left!`
                : "Ready to play?"}
            </p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem", marginBottom: 20, fontFamily: "var(--font-inter-tight)" }}>
              Reserve your spot instantly — no account needed.
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary"
                style={{ width: "100%", maxWidth: 320 }}
              >
                Reserve Spot as Guest
              </button>
              <SmartDownloadLink
                className="btn-secondary"
                style={{ width: "100%", maxWidth: 320, textAlign: "center" }}
              >
                Download &amp; Sign Up
              </SmartDownloadLink>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <GuestReserveModal
          session={{
            id: event.id,
            title: event.title,
            startsAt: event.startsAt,
            locationArea: event.locationArea,
            placeName: event.placeName,
            joinPricePence: event.joinPricePence,
            sportId: event.sportId,
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
