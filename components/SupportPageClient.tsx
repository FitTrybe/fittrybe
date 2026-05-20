"use client";

import { useState } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

function IconArrowLeft({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  );
}

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #0D0D0D; color: #fff; font-family: var(--font-inter-tight, 'Inter Tight', sans-serif); overflow-x: hidden; min-height: 100vh; }
  body::before {
    content: ''; position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.02; pointer-events: none; z-index: 1000;
  }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
  @keyframes glowPulse { 0%,100%{opacity:.5} 50%{opacity:.9} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
  .support-card { animation: fadeUp 0.6s ease forwards; }
  .shake { animation: shake 0.5s ease; }
  input:-webkit-autofill, textarea:-webkit-autofill, select:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px #111 inset !important;
    -webkit-text-fill-color: #fff !important;
  }
  :focus-visible { outline: 2px solid #B6FF00; outline-offset: 3px; border-radius: 4px; }
  select option { background: #111; color: #fff; }
`;

const CATEGORIES: ReadonlyArray<{ value: string; label: string }> = [
  { value: "general",     label: "General Enquiry" },
  { value: "account",     label: "Account & Login" },
  { value: "billing",     label: "Billing & Payments" },
  { value: "bug",         label: "Bug Report" },
  { value: "host",        label: "Host / Organiser" },
  { value: "partnership", label: "Partnership / Press" },
  { value: "other",       label: "Other" },
];

export default function SupportPageClient() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [category, setCategory] = useState<string>("general");
  const [subject, setSubject]   = useState("");
  const [message, setMessage]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [shake, setShake]       = useState(false);
  const [sent, setSent]         = useState(false);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600); };

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim())                           { setError("Please enter your name.");             triggerShake(); return; }
    if (!email.trim() || !email.includes("@"))  { setError("Please enter a valid email address."); triggerShake(); return; }
    if (!subject.trim())                        { setError("Please enter a subject.");             triggerShake(); return; }
    if (!message.trim() || message.trim().length < 10) {
      setError("Please give us a bit more detail (at least 10 characters).");
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          category,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        triggerShake();
        setLoading(false);
        return;
      }
      setSent(true);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%", background: "#111",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
    padding: "0.85rem 1rem", color: "#fff",
    fontFamily: "var(--font-inter-tight, 'Inter Tight', sans-serif)", fontSize: "0.95rem", outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.78rem", fontWeight: 600,
    letterSpacing: "0.05em", textTransform: "uppercase",
    color: "#4B5563", marginBottom: "0.4rem",
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(182,255,0,0.06) 0%, transparent 65%)", animation: "glowPulse 5s ease-in-out infinite" }} aria-hidden="true" />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(255,255,255,0.007) 60px, rgba(255,255,255,0.007) 62px)" }} aria-hidden="true" />

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10, padding: "1.5rem 5vw" }}>
        <Link href="/" aria-label="Back to Fittrybe homepage" style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          color: "#4B5563", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.03em", transition: "color 0.2s",
        }}
          onMouseEnter={e => (e.currentTarget.style.color = "#9CA3AF")}
          onMouseLeave={e => (e.currentTarget.style.color = "#4B5563")}
        >
          <IconArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      <main id="main-content" aria-label="Contact Fittrybe support" style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "100px 5vw 60px", position: "relative", zIndex: 1,
      }}>
        <div className="support-card" style={{ width: "100%", maxWidth: 560 }}>

          <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
            <Link href="/" aria-label="Fittrybe — return to homepage" style={{
              display: "inline-block", textDecoration: "none",
            }}>
              <Wordmark height={30} />
            </Link>
          </div>

          <div style={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "2.5rem" }}>

            {sent ? (
              <div style={{ textAlign: "center", padding: "1rem 0 0.5rem" }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 64, height: 64, margin: "0 auto 1.25rem",
                    borderRadius: "50%", background: "#B6FF00",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "checkPop 0.5s ease",
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h1 style={{
                  fontFamily: "var(--font-anton, 'Anton', sans-serif)", fontWeight: 900,
                  fontSize: "clamp(1.75rem, 5vw, 2.25rem)", lineHeight: 1, letterSpacing: "-0.02em",
                  textTransform: "uppercase", marginBottom: "0.75rem",
                }}>
                  Message <span style={{ color: "#B6FF00" }}>Sent</span>
                </h1>
                <p style={{ fontSize: "0.95rem", color: "#9CA3AF", lineHeight: 1.6, marginBottom: "1.75rem" }}>
                  Thanks for reaching out. We&rsquo;ve sent a confirmation to <strong style={{ color: "#fff" }}>{email}</strong>{" "}
                  and our team will get back to you within 1&ndash;2 business days.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setName(""); setEmail(""); setSubject(""); setMessage("");
                    setCategory("general");
                  }}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8, padding: "0.75rem 1.25rem",
                    color: "#9CA3AF", cursor: "pointer",
                    fontSize: "0.85rem", fontWeight: 600,
                    letterSpacing: "0.05em", textTransform: "uppercase",
                    transition: "border-color 0.2s, color 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(182,255,0,0.4)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#9CA3AF"; }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "0.5rem",
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 2, padding: "0.35rem 0.8rem", fontSize: "0.72rem", fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase", color: "#B6FF00", marginBottom: "1.25rem",
                  }}>
                    <span style={{ width: 6, height: 6, background: "#B6FF00", borderRadius: "50%", display: "inline-block", animation: "blink 1.5s infinite" }} aria-hidden="true" />
                    We&rsquo;re Here To Help
                  </div>

                  <h1 style={{
                    fontFamily: "var(--font-anton, 'Anton', sans-serif)", fontWeight: 900,
                    fontSize: "clamp(2rem, 6vw, 2.75rem)", lineHeight: 1, letterSpacing: "-0.02em",
                    textTransform: "uppercase", marginBottom: "0.75rem",
                  }}>
                    Contact <span style={{ color: "#B6FF00" }}>Support</span>
                  </h1>
                  <p style={{ fontSize: "0.92rem", color: "#6B7280", lineHeight: 1.6 }}>
                    Got a question, found a bug, or want to partner with us? Send us a message and we&rsquo;ll get back to you within 1&ndash;2 business days.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" }}>
                    <div>
                      <label htmlFor="support-name" style={labelStyle}>Full Name</label>
                      <input
                        id="support-name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        autoComplete="name"
                        onChange={e => setName(e.target.value)}
                        style={fieldStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(182,255,0,0.4)")}
                        onBlur={e =>  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor="support-email" style={labelStyle}>Email Address</label>
                      <input
                        id="support-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        autoComplete="email"
                        onChange={e => setEmail(e.target.value)}
                        style={fieldStyle}
                        onFocus={e => (e.currentTarget.style.borderColor = "rgba(182,255,0,0.4)")}
                        onBlur={e =>  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="support-category" style={labelStyle}>What&rsquo;s it about?</label>
                    <select
                      id="support-category"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      style={{ ...fieldStyle, appearance: "none", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", paddingRight: "2.5rem" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(182,255,0,0.4)")}
                      onBlur={e =>  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="support-subject" style={labelStyle}>Subject</label>
                    <input
                      id="support-subject"
                      type="text"
                      placeholder="A short summary of your message"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      maxLength={200}
                      style={fieldStyle}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(182,255,0,0.4)")}
                      onBlur={e =>  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <label htmlFor="support-message" style={labelStyle}>Message</label>
                    <textarea
                      id="support-message"
                      placeholder="Tell us what's going on — the more detail you give, the faster we can help."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={6}
                      maxLength={5000}
                      style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.5, minHeight: 140 }}
                      onFocus={e => (e.currentTarget.style.borderColor = "rgba(182,255,0,0.4)")}
                      onBlur={e =>  (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                      aria-required="true"
                    />
                    <p style={{ marginTop: "0.4rem", fontSize: "0.72rem", color: "#374151", textAlign: "right" }}>
                      {message.length} / 5000
                    </p>
                  </div>

                  {error && (
                    <p role="alert" style={{ fontSize: "0.82rem", color: "#ff6b6b", textAlign: "center", padding: "0.25rem 0" }}>
                      {error}
                    </p>
                  )}

                  <button
                    className={shake ? "shake" : ""}
                    onClick={handleSubmit}
                    disabled={loading}
                    aria-label="Send your support message"
                    style={{
                      width: "100%", background: loading ? "rgba(182,255,0,0.6)" : "#B6FF00",
                      border: "none", borderRadius: 8, padding: "1rem",
                      fontFamily: "var(--font-anton, 'Anton', sans-serif)",
                      fontSize: "1.05rem", fontWeight: 800, letterSpacing: "0.08em",
                      textTransform: "uppercase", color: "#0D0D0D",
                      cursor: loading ? "not-allowed" : "pointer",
                      marginTop: "0.25rem", transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
                    }}
                    onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(182,255,0,0.25)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    {loading ? "Sending..." : "Send Message →"}
                  </button>
                </div>

                <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#374151", marginTop: "1rem" }}>
                  We typically respond within 1&ndash;2 business days. No spam.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
