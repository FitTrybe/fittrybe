"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { sportEmoji } from "@/lib/events";
import { fbTrack, readMetaCookies } from "@/lib/fbq";

interface SessionInfo {
  id: string;
  title: string;
  startsAt: string;
  locationArea: string;
  placeName: string;
  joinPricePence: number;
  sportId: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Europe/London",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}

function formatPrice(pence: number): string {
  if (pence === 0) return "Free";
  return `£${(pence / 100).toFixed(2)}`;
}

export default function GuestReserveModal({
  session,
  onClose,
}: {
  session: SessionInfo;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emoji = sportEmoji(session.sportId);
  const isFree = session.joinPricePence === 0;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleNext() {
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email."); return;
    }
    setStep("confirm");
  }

  async function handleConfirm() {
    setLoading(true);
    setError("");

    // Fire InitiateCheckout before sending to payment
    fbTrack('InitiateCheckout', {
      content_ids: [session.id],
      content_name: session.title,
      content_type: 'product',
      value: session.joinPricePence / 100,
      currency: 'GBP',
      num_items: 1,
    });

    // Capture Meta cookies so the server event can use them for deduplication
    const { fbp, fbc } = readMetaCookies();

    try {
      const res = await fetch("/api/guest-reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          fbp,
          fbc,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setLoading(false); return; }

      if (data.url) {
        // Paid session — redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        // Free session — show success + fire CompleteRegistration (not Purchase)
        if (data.bookingId) {
          fbTrack('CompleteRegistration', {
            content_ids: [session.id],
            content_name: session.title,
            content_type: 'product',
            value: 0,
            currency: 'GBP',
            num_items: 1,
          }, data.bookingId);
        }
        setStep("success");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(8px)",
          zIndex: -1,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          background: "#111",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20,
          padding: 28,
          boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          animation: "modalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
          zIndex: 1,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 16, right: 16,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.85rem", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          ✕
        </button>

        {/* ─── STEP 1: Form ─── */}
        {step === "form" && (
          <div style={{ animation: "fadeIn 0.3s ease both" }}>
            {/* Animated sport emoji */}
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: "rgba(182,255,0,0.08)",
              border: "1px solid rgba(182,255,0,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", marginBottom: 20,
              animation: "emojiFloat 3s ease-in-out infinite",
            }}>
              {emoji}
            </div>

            <h2 style={{
              fontFamily: "var(--font-anton)", fontSize: "1.5rem",
              textTransform: "uppercase", letterSpacing: "-0.01em",
              color: "#fff", marginBottom: 4,
            }}>
              Reserve Your Spot
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.4)", fontSize: "0.85rem",
              fontFamily: "var(--font-inter-tight)", marginBottom: 24,
            }}>
              Just your name and email — no account needed.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label htmlFor="guest-name" style={{
                  display: "block", fontSize: "0.78rem", fontWeight: 600,
                  color: "rgba(255,255,255,0.5)", marginBottom: 6,
                  fontFamily: "var(--font-inter-tight)",
                }}>
                  Name
                </label>
                <input
                  id="guest-name" type="text" value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name" autoFocus
                  style={{
                    width: "100%", padding: "13px 16px",
                    background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, color: "#fff", fontSize: "0.9rem",
                    fontFamily: "var(--font-inter-tight)", outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(182,255,0,0.4)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </div>
              <div>
                <label htmlFor="guest-email" style={{
                  display: "block", fontSize: "0.78rem", fontWeight: 600,
                  color: "rgba(255,255,255,0.5)", marginBottom: 6,
                  fontFamily: "var(--font-inter-tight)",
                }}>
                  Email
                </label>
                <input
                  id="guest-email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}
                  style={{
                    width: "100%", padding: "13px 16px",
                    background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12, color: "#fff", fontSize: "0.9rem",
                    fontFamily: "var(--font-inter-tight)", outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(182,255,0,0.4)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </div>
            </div>

            {error && (
              <p style={{
                color: "#EF4444", fontSize: "0.82rem", marginTop: 12,
                fontFamily: "var(--font-inter-tight)",
                animation: "shake 0.4s ease",
              }}>
                {error}
              </p>
            )}

            <button onClick={handleNext} className="btn-primary" style={{ width: "100%", marginTop: 20 }}>
              Continue
            </button>
          </div>
        )}

        {/* ─── STEP 2: Confirm ─── */}
        {step === "confirm" && (
          <div style={{ animation: "slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
            {/* Animated emoji */}
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: "rgba(182,255,0,0.08)",
              border: "1px solid rgba(182,255,0,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem", marginBottom: 20,
              animation: "emojiBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
            }}>
              {emoji}
            </div>

            <h2 style={{
              fontFamily: "var(--font-anton)", fontSize: "1.5rem",
              textTransform: "uppercase", letterSpacing: "-0.01em",
              color: "#fff", marginBottom: 4,
            }}>
              Confirm Your Spot
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.4)", fontSize: "0.85rem",
              fontFamily: "var(--font-inter-tight)", marginBottom: 20,
            }}>
              Review the details below.
            </p>

            {/* Session details card */}
            <div style={{
              background: "#0a0a0a", borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.06)",
              padding: 16, marginBottom: 20,
              fontFamily: "var(--font-inter-tight)",
            }}>
              {[
                { label: "Session", value: session.title },
                { label: "Date", value: formatDate(session.startsAt) },
                { label: "Time", value: formatTime(session.startsAt) },
                { label: "Location", value: session.placeName || session.locationArea },
              ].map((row, i) => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 0",
                  borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>{row.label}</span>
                  <span style={{
                    color: "#fff", fontSize: "0.82rem", fontWeight: 500,
                    textAlign: "right", maxWidth: 200,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{row.value}</span>
                </div>
              ))}
              {/* Price row — highlighted */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0 10px",
                borderTop: "1px solid rgba(182,255,0,0.1)",
                marginTop: 4,
              }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>Price</span>
                <span style={{ color: "#B6FF00", fontSize: "0.95rem", fontWeight: 800 }}>
                  {formatPrice(session.joinPricePence)}
                </span>
              </div>
              {/* Guest info */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0 0",
                borderTop: "1px solid rgba(255,255,255,0.04)",
              }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}>Guest</span>
                <span style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 500 }}>
                  {name.trim()}
                </span>
              </div>
            </div>

            {error && (
              <p style={{
                color: "#EF4444", fontSize: "0.82rem", marginBottom: 12,
                fontFamily: "var(--font-inter-tight)",
                animation: "shake 0.4s ease",
              }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setStep("form"); setError(""); }}
                className="btn-secondary"
                disabled={loading}
                style={{ flex: 1, padding: "13px 16px", fontSize: "0.9rem", textAlign: "center" }}
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="btn-primary"
                style={{ flex: 1, padding: "13px 16px", fontSize: "0.9rem", opacity: loading ? 0.5 : 1 }}
              >
                {loading ? "Processing..." : isFree ? "Confirm" : `Pay ${formatPrice(session.joinPricePence)}`}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Success ─── */}
        {step === "success" && (
          <div style={{ textAlign: "center", padding: "16px 0", animation: "fadeIn 0.3s ease both" }}>
            {/* Celebration emoji burst */}
            <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 20px" }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: "rgba(182,255,0,0.1)",
                border: "1px solid rgba(182,255,0,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2.5rem",
                animation: "successPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
              }}>
                {emoji}
              </div>
              {/* Confetti emojis */}
              <span style={{ position: "absolute", top: -8, left: -4, fontSize: "1.2rem", animation: "confetti1 0.6s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both" }}>🎉</span>
              <span style={{ position: "absolute", top: -6, right: -6, fontSize: "1rem", animation: "confetti2 0.6s 0.3s cubic-bezier(0.16, 1, 0.3, 1) both" }}>⭐</span>
              <span style={{ position: "absolute", bottom: -4, left: 8, fontSize: "0.9rem", animation: "confetti3 0.6s 0.35s cubic-bezier(0.16, 1, 0.3, 1) both" }}>✨</span>
              <span style={{ position: "absolute", bottom: -2, right: 2, fontSize: "1.1rem", animation: "confetti1 0.6s 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}>🔥</span>
            </div>

            <h2 style={{
              fontFamily: "var(--font-anton)", fontSize: "1.75rem",
              textTransform: "uppercase", letterSpacing: "-0.01em",
              color: "#fff", marginBottom: 8,
              animation: "fadeIn 0.4s 0.2s ease both",
            }}>
              You&apos;re In!
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.5)", fontSize: "0.88rem",
              fontFamily: "var(--font-inter-tight)", marginBottom: 24,
              animation: "fadeIn 0.4s 0.3s ease both",
            }}>
              Your spot for <span style={{ color: "#fff", fontWeight: 600 }}>{session.title}</span> has
              been reserved. Check your email for details.
            </p>
            <button onClick={onClose} className="btn-primary" style={{ width: "100%", animation: "fadeIn 0.4s 0.4s ease both" }}>
              Done
            </button>
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes emojiFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-6px) rotate(5deg); }
          66% { transform: translateY(3px) rotate(-3deg); }
        }
        @keyframes emojiBounce {
          0% { transform: scale(0.5) rotate(-10deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes successPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes confetti1 {
          0% { opacity: 0; transform: translate(0, 0) scale(0); }
          100% { opacity: 1; transform: translate(-8px, -12px) scale(1); }
        }
        @keyframes confetti2 {
          0% { opacity: 0; transform: translate(0, 0) scale(0) rotate(0); }
          100% { opacity: 1; transform: translate(6px, -14px) scale(1) rotate(20deg); }
        }
        @keyframes confetti3 {
          0% { opacity: 0; transform: translate(0, 0) scale(0); }
          100% { opacity: 1; transform: translate(-6px, 8px) scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
