/**
 * ─── Fittrybe — Landing Page Client Component ────────────────────────────────
 *
 * All original UI preserved.
 * SEO improvements applied:
 *  • @import removed → CSS variables from next/font used instead
 *  • All inline <img> → next/image with alt, sizes, priority
 *  • Semantic HTML5 tags (<main>, <section aria-label="">, <header>, <footer>)
 *  • Heading hierarchy enforced: H1 hero, H2 sections, H3 cards
 *  • FAQ section added (visible, answers common questions for AI engines)
 *  • Anchor text on all CTAs is keyword-rich (not generic "click here")
 *  • All interactive elements have aria-label
 *  • Videos have aria-label + track placeholder for accessibility
 */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { FittrybeEvent } from "@/lib/events";
import { sportEmoji, formatEventDate, formatEventTime, formatPrice } from "@/lib/events";
import { Wordmark } from "@/components/brand/Wordmark";
import { useRouter } from "next/navigation";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import SmartDownloadLink from "@/components/SmartDownloadLink";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/download-links";

// ─── Icons ────────────────────────────────────────────────────────────────────
function IconArrowRight({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
function IconApple({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}
function IconGooglePlay({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z"/>
    </svg>
  );
}
function IconTwitterX({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.988l4.26 5.633 5.746-5.633zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
function IconInstagram({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5"/>
      <circle cx="12" cy="12" r="5"/>
      <circle cx="17.5" cy="6.5" r="1" fill={color}/>
    </svg>
  );
}
function IconTiktok({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.15 8.15 0 004.77 1.53V6.77a4.85 4.85 0 01-1-.08z"/>
    </svg>
  );
}

function IconFacebook({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M9.5 3v3.5H7V10h2.5v9h4v-9h3.5V6.5H13.5V4c0-.6.4-1 1-1h3V0h-4C10.8 0 9.5 1.3 9.5 3z"/>
    </svg>
  );
}

function IconChevronDown({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// ─── CSS (font variables injected by next/font in layout) ────────────────────
const globalStyles = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #050505; color: #fff; font-family: var(--font-inter-tight, 'Inter Tight', sans-serif); overflow-x: hidden; }

  @keyframes glowPulse {
    0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  @keyframes floatY {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-18px) rotate(5deg); }
    66% { transform: translateY(8px) rotate(-3deg); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
    0% { transform: rotateX(-90deg) translateY(8px); opacity: 0; }
    100% { transform: rotateX(0deg) translateY(0px); opacity: 1; }
  }
  @keyframes flipOut {
    0% { transform: rotateX(0deg) translateY(0px); opacity: 1; }
    100% { transform: rotateX(90deg) translateY(-8px); opacity: 0; }
  }
  .flip-word-enter {
    animation: flipIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .flip-word-exit {
    animation: flipOut 0.35s cubic-bezier(0.55, 0, 1, 0.45) forwards;
  }

  .bento-card {
    border-radius: 20px; background: #0D0D0D;
    border: 1px solid rgba(255,255,255,0.07); overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .bento-card:hover {
    transform: scale(1.025) translateY(-4px);
    border-color: rgba(182,255,0,0.3);
    box-shadow: 0 0 40px rgba(182,255,0,0.08), 0 20px 60px rgba(0,0,0,0.5);
  }
  .sport-icon-float {
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 14px; border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03); font-size: 2rem;
    transition: transform 0.3s ease, border-color 0.3s ease;
  }
  .sport-icon-float:hover { border-color: rgba(182,255,0,0.4); transform: scale(1.15) rotate(-3deg); }
  .social-icon-btn {
    width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
    border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
    color: #6B7280; transition: color 0.2s, border-color 0.2s, background 0.2s; text-decoration: none;
  }
  .social-icon-btn:hover { color: #B6FF00; border-color: rgba(182,255,0,0.3); background: rgba(182,255,0,0.05); }
  .footer-link {
    color: #4B5563; text-decoration: none; font-size: 0.8rem; font-weight: 500;
    letter-spacing: 0.05em; transition: color 0.2s;
  }
  .footer-link:hover { color: #9CA3AF; }
  .store-btn {
    display: inline-flex; align-items: center; gap: 10px; padding: 14px 22px;
    border-radius: 12px; border: 1.5px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.04); cursor: pointer;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    text-decoration: none; color: #fff;
  }
  .store-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); transform: translateY(-2px); }
  .faq-item { border-bottom: 1px solid rgba(255,255,255,0.06); }
  .faq-item:last-child { border-bottom: none; }

  /* ── Navbar ── */
  .nav-link {
    color: #9CA3AF;
    font-family: var(--font-anton, 'Anton', sans-serif);
    font-weight: 700; font-size: 0.9rem; letter-spacing: 0.07em;
    text-transform: uppercase; text-decoration: none;
    transition: color 0.2s;
  }
  .nav-link:hover { color: #fff; }
  .nav-cta {
    background: #B6FF00; color: #0D0D0D;
    padding: 0.45rem 1.3rem; border-radius: 6px;
    font-family: var(--font-anton, 'Anton', sans-serif);
    font-weight: 800; font-size: 0.9rem; letter-spacing: 0.07em;
    text-transform: uppercase; text-decoration: none; white-space: nowrap;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .nav-cta:hover { box-shadow: 0 8px 24px rgba(182,255,0,0.3); transform: translateY(-2px); }
  .mobile-menu-toggle {
    display: none;
    width: 40px; height: 40px;
    align-items: center; justify-content: center;
    background: transparent; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; cursor: pointer; color: #fff;
    transition: background 0.2s, border-color 0.2s;
  }
  .mobile-menu-toggle:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.2); }
  .mobile-menu {
    position: fixed; top: 64px; left: 0; right: 0;
    background: rgba(5,5,5,0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 1.25rem 5vw 1.75rem;
    display: flex; flex-direction: column; gap: 1.1rem;
    transform: translateY(-12px); opacity: 0; pointer-events: none;
    transition: transform 0.25s ease, opacity 0.25s ease;
    z-index: 99;
  }
  .mobile-menu.open { transform: translateY(0); opacity: 1; pointer-events: auto; }
  .mobile-menu .nav-link { font-size: 1.05rem; padding: 0.5rem 0; }
  .mobile-menu .nav-cta { text-align: center; margin-top: 0.4rem; padding: 0.75rem 1.3rem; font-size: 0.95rem; }

  @media (max-width: 720px) {
    .site-nav-links { display: none !important; }
    .mobile-menu-toggle { display: inline-flex !important; }
  }

  @media (max-width: 1024px) {
    .hero-section {
      grid-template-columns: 1fr !important;
      padding: 120px 6vw 80px !important;
      text-align: center;
      justify-items: center;
      gap: 3rem !important;
    }
    .hero-copy { display: flex !important; flex-direction: column !important; align-items: center !important; }
    .hero-buttons { justify-content: center !important; }
    .hero-phones { display: flex !important; min-height: 520px !important; }
    .bento-grid { grid-template-columns: 1fr 1fr !important; }
    .bento-grid > *:first-child { grid-column: 1 / -1 !important; grid-row: auto !important; min-height: 280px !important; flex-direction: row !important; align-items: center !important; }
  }
  @media (max-width: 768px) {
    .hero-section {
      padding: 90px 5vw 60px !important;
      min-height: 100svh !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 2rem !important;
    }
    .hero-phones { min-height: 400px !important; }
    .hero-phones > div { transform: none !important; }
    .bento-grid { grid-template-columns: 1fr !important; }
    .bento-grid > * { grid-column: 1 / -1 !important; grid-row: auto !important; }
    .footer-inner { flex-direction: column !important; align-items: flex-start !important; gap: 1.5rem !important; }

}

  /* ── Sessions Near You ── */
  .session-card {
    background: #111;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.06);
    overflow: hidden;
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s ease, box-shadow 0.4s ease;
  }
  .session-card:hover {
    transform: translateY(-8px);
    border-color: rgba(182,255,0,0.25);
    box-shadow: 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(182,255,0,0.1);
  }
  .session-card-img {
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .session-card:hover .session-card-img {
    transform: scale(1.08);
  }
  .sessions-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }
  .sessions-scroll-mobile {
    display: none;
  }
  .sessions-filters {
    display: flex;
  }
  .filter-chip {
    padding: 8px 16px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: #777;
    font-size: 0.76rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .filter-chip:hover {
    border-color: rgba(255,255,255,0.15);
    color: #aaa;
    background: rgba(255,255,255,0.05);
  }
  .filter-chip-active {
    background: #B6FF00 !important;
    color: #0D0D0D !important;
    border-color: #B6FF00 !important;
    font-weight: 700;
    box-shadow: 0 0 20px rgba(182,255,0,0.15);
  }
  .sport-chip {
    padding: 8px 14px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.06);
    background: transparent;
    color: #666;
    font-size: 0.76rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }
  .sport-chip:hover {
    border-color: rgba(182,255,0,0.2);
    color: #999;
  }
  .sport-chip-active {
    background: rgba(182,255,0,0.08) !important;
    color: #B6FF00 !important;
    border-color: rgba(182,255,0,0.3) !important;
  }
  @media (max-width: 1024px) {
    .sessions-grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
  @media (max-width: 768px) {
    .sessions-grid { display: none !important; }
    .sessions-scroll-mobile {
      display: flex !important;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      gap: 14px;
      padding: 0 5vw 20px;
      scrollbar-width: none;
    }
    .sessions-scroll-mobile::-webkit-scrollbar { display: none; }
    .sessions-scroll-mobile > * {
      scroll-snap-align: start;
      flex: 0 0 80vw;
      max-width: 300px;
    }
    .sessions-filters { display: none !important; }
  }

  /* ── Video Testimonials ── */
  .video-testimonials-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    max-width: 900px;
    margin: 0 auto;
  }
  .video-card {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    aspect-ratio: 9 / 14;
    background: #111;
    cursor: pointer;
  }
  .video-card video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .video-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%, transparent 70%, rgba(0,0,0,0.3) 100%);
    pointer-events: none;
    z-index: 2;
    transition: opacity 0.3s ease;
  }
  .video-card-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    z-index: 3;
  }
  .video-play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1);
    z-index: 4;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(182,255,0,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease, opacity 0.3s ease;
    backdrop-filter: blur(8px);
  }
  .video-card:hover .video-play-btn {
    transform: translate(-50%, -50%) scale(1.1);
  }
  .video-play-btn.is-playing {
    opacity: 0;
    pointer-events: none;
  }
  @media (max-width: 640px) {
    .video-testimonials-grid {
      grid-template-columns: 1fr;
      gap: 20px;
      max-width: 360px;
    }
    .video-card {
      aspect-ratio: 9 / 14;
    }
  }

  /* ── Community Section ── */
  .community-cta-btn:hover {
    box-shadow: 0 12px 40px rgba(182,255,0,0.3) !important;
    transform: translateY(-2px);
  }
  @media (max-width: 900px) {
    .community-section-inner {
      grid-template-columns: 1fr !important;
      min-height: auto !important;
    }
    .community-section-inner > div:first-child {
      padding: 80px 6vw 40px !important;
      text-align: center;
      align-items: center;
    }
    .community-section-inner > div:first-child h2 {
      font-size: clamp(2.2rem, 8vw, 3.5rem) !important;
    }
    .community-section-inner > div:first-child p {
      margin-left: auto;
      margin-right: auto;
    }
    .community-section-inner > div:first-child > div > div:nth-child(4) {
      justify-content: center !important;
    }
    .community-section-inner > div:last-child {
      height: 60vh;
      min-height: 400px;
      align-items: flex-end !important;
    }
  }
  @media (max-width: 480px) {
    .community-section-inner > div:last-child {
      height: 50vh;
      min-height: 340px;
    }
  }
  @media (max-width: 480px) {
    .hero-section { padding: 80px 4vw 50px !important; }
    .hero-phones { min-height: 360px !important; }
    .store-btn { padding: 10px 14px !important; }
    .bento-grid { gap: 10px !important; }
  }
`;

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on resize past mobile breakpoint
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 720) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <motion.nav
        role="navigation"
        aria-label="Main navigation"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "0 5vw", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: scrolled || menuOpen ? "rgba(5,5,5,0.92)" : "transparent",
          backdropFilter: scrolled || menuOpen ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled || menuOpen ? "blur(20px)" : "none",
          borderBottom: scrolled || menuOpen ? "1px solid rgba(255,255,255,0.05)" : "none",
          transition: "background 0.4s ease, backdrop-filter 0.4s ease, border-bottom 0.4s ease",
        }}
      >
        <Link href="/" aria-label="Fittrybe — return to homepage" style={{
          display: "flex", alignItems: "center", gap: "0.6rem", textDecoration: "none",
        }}>
          <Image src="/logo-mark.png" alt="" width={32} height={32} priority style={{ display: "block" }} />
          <Wordmark height={26} />
        </Link>

        <div className="site-nav-links" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/sports" aria-label="Browse sports on Fittrybe" className="nav-link">Sports</Link>
          <Link href="/events" aria-label="View upcoming sports sessions" className="nav-link">Sessions</Link>
          <Link href="/blog" aria-label="Read the Fittrybe blog" className="nav-link">Blog</Link>
          <Link href="/support" aria-label="Contact Fittrybe support" className="nav-link">Support</Link>
          <SmartDownloadLink aria-label="Download Fittrybe on your phone" className="nav-cta">Get the App</SmartDownloadLink>
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(v => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="21" y2="7" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="17" x2="21" y2="17" />
              </>
            )}
          </svg>
        </button>
      </motion.nav>

      <div id="mobile-menu" className={`mobile-menu${menuOpen ? " open" : ""}`} role="menu" aria-hidden={!menuOpen}>
        <Link href="/sports" className="nav-link" onClick={closeMenu} role="menuitem">Sports</Link>
        <Link href="/events" className="nav-link" onClick={closeMenu} role="menuitem">Sessions</Link>
        <Link href="/blog" className="nav-link" onClick={closeMenu} role="menuitem">Blog</Link>
        <Link href="/support" className="nav-link" onClick={closeMenu} role="menuitem">Support</Link>
        <SmartDownloadLink className="nav-cta" onClick={closeMenu} role="menuitem">Get the App</SmartDownloadLink>
      </div>
    </>
  );
}

// ─── Safari-safe autoplay video component ─────────────────────────────────────
function HeroPhoneVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    const tryPlay = () => {
      const p = v.play();
      if (p !== undefined) p.catch(() => { v.muted = true; v.play().catch(() => {}); });
    };
    if (v.readyState >= 2) { tryPlay(); }
    else { v.addEventListener("loadeddata", tryPlay, { once: true }); }
    return () => v.removeEventListener("loadeddata", tryPlay);
  }, []);
  return (
    <video
      ref={videoRef}
      autoPlay muted loop playsInline
      aria-label="Fittrybe app preview showing local sports sessions"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
      webkit-playsinline="true"
    >
      <source src="/videos/mockup.mp4" type="video/mp4" />
      <track kind="captions" />
    </video>
  );
}

// ─── 1. HERO ──────────────────────────────────────────────────────────────────
function HeroSection() {
  const [flipWord, setFlipWord] = useState<"game" | "trybe">("game");
  const [flipping, setFlipping] = useState(false);
  const [displayed, setDisplayed] = useState<"game" | "trybe">("game");

  useEffect(() => {
    const interval = setInterval(() => {
      setFlipping(true);
      setTimeout(() => {
        setDisplayed(prev => prev === "game" ? "trybe" : "game");
        setFlipWord(prev => prev === "game" ? "trybe" : "game");
        setFlipping(false);
      }, 350);
    }, 2800) as unknown as number;
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      aria-label="Hero — Find your local sports game"
      style={{
        minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr",
        alignItems: "center", padding: "140px 5vw 100px", gap: "4rem",
        position: "relative", overflow: "hidden",
      }}
      className="hero-section"
    >
      {/* Background Video */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <video
          autoPlay muted loop playsInline
          aria-label="Sports action background video"
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center",
            opacity: 0.18, filter: "saturate(0.4) brightness(0.7)",
          }}
          ref={el => { if (el) { el.muted = true; el.play().catch(() => {}); } }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
          <track kind="captions" />
        </video>
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to bottom, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.3) 40%, rgba(5,5,5,0.65) 75%, rgba(5,5,5,0.95) 100%), linear-gradient(to right, rgba(5,5,5,0.7) 0%, rgba(5,5,5,0.0) 60%)`,
        }} />
      </div>
      <div style={{
        position: "absolute", width: 600, height: 600,
        background: "radial-gradient(circle, rgba(182,255,0,0.05) 0%, transparent 70%)",
        top: "50%", left: "30%", transform: "translate(-50%, -50%)", pointerEvents: "none",
        animation: "glowPulse 4s ease-in-out infinite", zIndex: 1,
      }} />

      {/* Left copy */}
      <div className="hero-copy" style={{ position: "relative", zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(182,255,0,0.08)", border: "1px solid rgba(182,255,0,0.2)",
            borderRadius: 100, padding: "6px 16px", marginBottom: "1.5rem",
            fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#B6FF00",
          }}
        >
          <span style={{ width: 6, height: 6, background: "#B6FF00", borderRadius: "50%", animation: "blink 1.5s infinite" }} aria-hidden="true" />
          Available Now — Find Your Game
        </motion.div>

        {/* ── H1: Primary keyword target ── */}
        <h1 style={{
          fontFamily: "var(--font-anton, 'Anton', sans-serif)", fontWeight: 900,
          fontSize: "clamp(3.5rem, 7vw, 6.5rem)", lineHeight: 0.92,
          letterSpacing: "-0.02em", textTransform: "uppercase", marginBottom: "1.5rem",
        }}>
          {["Find", "Your"].map((word, i) => (
            <div key={word} style={{ overflow: "hidden", lineHeight: 0.95 }}>
              <motion.span
                initial={{ y: "110%" }} animate={{ y: 0 }}
                transition={{ delay: 0.35 + i * 0.14, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "block", color: i === 1 ? "#B6FF00" : "#fff" }}
              >{word}</motion.span>
            </div>
          ))}
          {/* Flipping word: game ↔ trybe */}
          <div style={{ overflow: "hidden", lineHeight: 0.95, perspective: "400px" }}>
            <motion.span
              initial={{ y: "110%" }} animate={{ y: 0 }}
              transition={{ delay: 0.63, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "block" }}
            >
              <span
                key={displayed}
                className={flipping ? "flip-word-exit" : "flip-word-enter"}
                style={{
                  display: "inline-block",
                  color: "#fff",
                  transformOrigin: "50% 50%",
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden",
                }}
              >{displayed}.</span>
            </motion.span>
          </div>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          style={{ fontSize: "1.05rem", color: "#6B7280", lineHeight: 1.7, maxWidth: 420, marginBottom: "2.5rem" }}
        >
          Discover real sports sessions near you. Join a game, meet people worth playing with, and build a routine that sticks. Football, basketball, tennis, badminton — all in one app.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="hero-buttons"
          style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}
        >
          <SmartDownloadLink aria-label="Download Fittrybe and find local sports sessions" style={{
            background: "#B6FF00", color: "#0D0D0D", padding: "0.85rem 2rem",
            borderRadius: 8, fontFamily: "var(--font-anton, 'Anton', sans-serif)",
            fontSize: "1rem", fontWeight: 800, letterSpacing: "0.08em",
            textTransform: "uppercase", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(182,255,0,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >Get the App <IconArrowRight size={16} color="#0D0D0D" /></SmartDownloadLink>

          <a href="#how-it-works" aria-label="Learn how Fittrybe works" style={{
            color: "#9CA3AF", padding: "0.85rem 2rem",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
            fontFamily: "var(--font-anton, 'Anton', sans-serif)",
            fontSize: "1rem", fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", textDecoration: "none",
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            transition: "border-color 0.2s, color 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#9CA3AF"; }}
          >▶ How It Works</a>
        </motion.div>
      </div>

      {/* Right — iPhone 17 Orange Phone Mockup */}
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="hero-phones"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2, minHeight: 600 }}
      >
        {/* Ambient glow matching phone color */}
        <div style={{ position: "absolute", width: 500, height: 500, background: "radial-gradient(circle, rgba(255,95,31,0.18) 0%, rgba(182,255,0,0.06) 50%, transparent 70%)", filter: "blur(60px)", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 3, transform: "rotateY(-9deg) rotateX(4deg)", transformStyle: "preserve-3d" }}>
          {/* Phone outer shell — iPhone 17 Orange titanium frame */}
          <div style={{
            width: 290, height: 610,
            borderRadius: 52,
            background: "linear-gradient(145deg, #FF6B1A 0%, #E8450A 35%, #C93B08 65%, #FF7A2A 100%)",
            padding: "3px",
            boxShadow: `
              0 0 0 1px rgba(255,120,50,0.6),
              0 2px 4px rgba(255,100,30,0.4),
              6px 6px 20px rgba(0,0,0,0.7),
              -2px -2px 10px rgba(255,140,60,0.25),
              0 40px 100px rgba(0,0,0,0.85),
              0 80px 160px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,200,150,0.5),
              inset 0 -1px 0 rgba(0,0,0,0.3)
            `,
            position: "relative",
          }}>
            {/* Side buttons — volume */}
            <div style={{ position: "absolute", left: -3, top: 110, width: 3, height: 36, background: "linear-gradient(to bottom, #FF7A2A, #C93B08)", borderRadius: "2px 0 0 2px", boxShadow: "-1px 0 3px rgba(0,0,0,0.4)" }} />
            <div style={{ position: "absolute", left: -3, top: 158, width: 3, height: 36, background: "linear-gradient(to bottom, #FF7A2A, #C93B08)", borderRadius: "2px 0 0 2px", boxShadow: "-1px 0 3px rgba(0,0,0,0.4)" }} />
            {/* Side button — mute/action */}
            <div style={{ position: "absolute", left: -3, top: 72, width: 3, height: 26, background: "linear-gradient(to bottom, #FF7A2A, #C93B08)", borderRadius: "2px 0 0 2px", boxShadow: "-1px 0 3px rgba(0,0,0,0.4)" }} />
            {/* Side button — power */}
            <div style={{ position: "absolute", right: -3, top: 130, width: 3, height: 50, background: "linear-gradient(to bottom, #FF7A2A, #C93B08)", borderRadius: "0 2px 2px 0", boxShadow: "1px 0 3px rgba(0,0,0,0.4)" }} />

            {/* Inner screen bezel */}
            <div style={{
              width: "100%", height: "100%",
              borderRadius: 50,
              background: "#080808",
              overflow: "hidden",
              position: "relative",
              // ✅ Add these two Safari fixes:
              WebkitMaskImage: "-webkit-radial-gradient(white, black)",
              transform: "translateZ(0)",
            }}>
              {/* Dynamic Island */}
              {/* <div style={{
                position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
                width: 110, height: 34,
                background: "#000",
                borderRadius: 20,
                zIndex: 20,
                boxShadow: "0 2px 8px rgba(0,0,0,0.8)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              * Camera dot *
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.05)", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "#0a0a0a" }} />
                  <div style={{ position: "absolute", top: 2, left: 2, width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                </div>
                * Face ID line *
                <div style={{ width: 40, height: 3, background: "#1a1a1a", borderRadius: 2 }} />
              </div> */}

              {/* App video */}
              <HeroPhoneVideo />

              {/* Screen edge gloss */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)", pointerEvents: "none", zIndex: 10, borderRadius: 50 }} />

              {/* Home indicator */}
              <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 100, height: 4, background: "rgba(255,255,255,0.35)", borderRadius: 4, zIndex: 15 }} aria-hidden="true" />
            </div>
          </div>

          {/* Reflection under phone */}
          <div style={{
            position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)",
            width: 200, height: 60,
            background: "radial-gradient(ellipse, rgba(255,95,31,0.25) 0%, transparent 70%)",
            filter: "blur(20px)",
            pointerEvents: "none",
          }} />
        </div>
      </motion.div>
    </section>
  );
}

// ─── 2. SESSIONS NEAR YOU ────────────────────────────────────────────────────

// Hyperlocal areas — not major cities
const LOCATION_OPTIONS = [
  { label: "All Areas", query: "" },
  { label: "Redhill", query: "Redhill" },
  { label: "Epsom", query: "Epsom" },
  { label: "Croydon", query: "Croydon" },
  { label: "Sutton", query: "Sutton" },
  { label: "Merstham", query: "Merstham" },
];

const SPORT_FILTERS = [
  { id: null, label: "All", emoji: "🔥" },
  { id: "football", label: "Football", emoji: "⚽" },
  { id: "basketball", label: "Basketball", emoji: "🏀" },
  { id: "tennis", label: "Tennis", emoji: "🎾" },
  { id: "badminton", label: "Badminton", emoji: "🏸" },
  { id: "running", label: "Running", emoji: "🏃" },
  { id: "cycling", label: "Cycling", emoji: "🚴" },
  { id: "gym", label: "Gym", emoji: "🏋️" },
];

interface SessionWithHost extends FittrybeEvent {
  hostName: string | null;
  hostAvatar: string | null;
  hostVerified: boolean;
  badge: string | null;
  commentsCount: number;
}

function getBadge(session: { spotsLeft: number; startsAt: string; participantsCount: number; joinPricePence: number }): string | null {
  if (session.spotsLeft <= 0) return "FULL";
  if (session.spotsLeft === 1) return "LAST SPOT";
  if (session.spotsLeft <= 3) return "FILLING UP";
  const hoursAway = (new Date(session.startsAt).getTime() - Date.now()) / 3600000;
  if (hoursAway <= 2 && hoursAway > 0) return "STARTING SOON";
  if (session.participantsCount >= 8) return "POPULAR";
  if (session.joinPricePence === 0) return "FREE";
  return null;
}

const BADGE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  "FULL":          { bg: "rgba(239,68,68,0.15)", color: "#EF4444", border: "rgba(239,68,68,0.3)" },
  "LAST SPOT":     { bg: "rgba(251,146,60,0.15)", color: "#FB923C", border: "rgba(251,146,60,0.3)" },
  "FILLING UP":    { bg: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "rgba(251,191,36,0.3)" },
  "STARTING SOON": { bg: "rgba(99,102,241,0.15)", color: "#818CF8", border: "rgba(99,102,241,0.3)" },
  "POPULAR":       { bg: "rgba(236,72,153,0.15)", color: "#EC4899", border: "rgba(236,72,153,0.3)" },
  "FREE":          { bg: "rgba(182,255,0,0.1)",  color: "#B6FF00", border: "rgba(182,255,0,0.3)" },
};

function formatRelativeDay(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function SessionCard({ event, index }: { event: SessionWithHost; index: number }) {
  const emoji = sportEmoji(event.sportId);
  const dayStr = formatRelativeDay(event.startsAt);
  const timeStr = formatEventTime(event.startsAt);
  const price = formatPrice(event.joinPricePence);
  const coverImage = event.bannerUrl || event.placePhotoUrl;
  const badge = event.badge;
  const badgeStyle = badge ? BADGE_STYLES[badge] : null;
  const spotsTotal = event.participantsCount + event.spotsLeft;
  const fillPercent = spotsTotal > 0 ? Math.min((event.participantsCount / spotsTotal) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="session-card-wrap"
    >
      <Link href={`/events/${event.id}`} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        <div className="session-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Image with gradient overlay */}
          <div style={{ position: "relative", aspectRatio: "3/2", overflow: "hidden" }}>
            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt={event.title} className="session-card-img"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
              {/* Host */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                {event.hostAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.hostAvatar} alt="" style={{
                    width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0,
                    border: event.hostVerified ? "2px solid #B6FF00" : "2px solid rgba(255,255,255,0.08)",
                  }} />
                ) : (
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, rgba(182,255,0,0.2), rgba(182,255,0,0.05))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.65rem", fontWeight: 700, color: "#B6FF00",
                    border: event.hostVerified ? "2px solid #B6FF00" : "2px solid rgba(255,255,255,0.08)",
                  }}>
                    {(event.hostName || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.7)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    display: "flex", alignItems: "center", gap: 3,
                  }}>
                    {event.hostName || "Host"}
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

              {/* Spots indicator */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <div style={{
                  fontSize: "0.65rem", fontWeight: 700,
                  color: event.spotsLeft <= 3 ? "#FB923C" : "rgba(255,255,255,0.5)",
                }}>
                  {event.spotsLeft > 0 ? `${event.spotsLeft} spot${event.spotsLeft === 1 ? "" : "s"} left` : "Full"}
                </div>
                <div style={{ width: 48, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${fillPercent}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.04, ease: "easeOut" }}
                    style={{
                      height: "100%", borderRadius: 2,
                      background: event.spotsLeft <= 3 ? "#FB923C" : "#B6FF00",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SessionsNearYou() {
  const [sessions, setSessions] = useState<SessionWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);

      const todayUTC = new Date().toISOString().split("T")[0];

      let query = supabase
        .from("sessions")
        .select(`
          id, host_id, sport_id, title, location_area, location_label,
          starts_at, place_name, place_vicinity, place_lat, place_lng,
          place_rating, banner_url, place_photo_url, status, created_at,
          is_cancelled, cancellation_reason, is_featured,
          participants_count, comments_count, views_count, spots_left,
          join_price_pence, payment_method, is_partner_session, partner_id,
          is_recurring, parent_session_id,
          running_details(*), racket_details(*), football_details(*),
          basketball_details(*), cycling_details(*), gym_details(*)
        `)
        .gte("starts_at", todayUTC)
        .eq("is_cancelled", false)
        .not("status", "in", "(cancelled,completed,draft,pre_approved)")
        .order("starts_at", { ascending: true })
        .limit(30);

      if (selectedLocation) {
        query = query.ilike("location_area", `%${selectedLocation}%`);
      }
      if (selectedSport) {
        query = query.eq("sport_id", selectedSport);
      }

      const { data: rawSessions } = await query;
      if (!rawSessions || rawSessions.length === 0) {
        setSessions([]);
        setLoading(false);
        return;
      }

      // Dedup recurring sessions — keep nearest per parent
      const seen = new Set<string>();
      const deduped = rawSessions.filter(s => {
        const key = s.parent_session_id || s.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Fetch host profiles
      const hostIds = [...new Set(deduped.map(s => s.host_id).filter(Boolean))];
      const { data: hosts } = hostIds.length > 0
        ? await supabase.from("profiles").select("id, full_name, avatar_url, is_verified").in("id", hostIds)
        : { data: [] };
      const hostMap = new Map((hosts ?? []).map(h => [h.id, h]));

      // Map to SessionWithHost
      const mapped: SessionWithHost[] = deduped.map(row => {
        const host = hostMap.get(row.host_id);
        const event: FittrybeEvent = {
          id: row.id,
          title: row.title,
          sportId: row.sport_id,
          locationArea: row.location_area ?? "",
          locationLabel: row.location_label ?? "",
          placeName: row.place_name ?? "",
          placeVicinity: row.place_vicinity ?? "",
          placeLat: row.place_lat ?? "",
          placeLng: row.place_lng ?? "",
          placeRating: row.place_rating ?? null,
          placePhotoUrl: row.place_photo_url ?? null,
          bannerUrl: row.banner_url ?? null,
          startsAt: row.starts_at,
          status: row.status ?? "upcoming",
          isCancelled: row.is_cancelled ?? false,
          cancellationReason: row.cancellation_reason ?? null,
          spotsLeft: row.spots_left ?? 0,
          joinPricePence: row.join_price_pence ?? 0,
          paymentMethod: row.payment_method ?? "cash",
          isRecurring: row.is_recurring ?? false,
          parentSessionId: row.parent_session_id ?? null,
          participantsCount: row.participants_count ?? 0,
          viewsCount: row.views_count ?? 0,
          isFeatured: row.is_featured ?? false,
          hostId: row.host_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at ?? null,
          description: null,
        };
        return {
          ...event,
          hostName: host?.full_name ?? null,
          hostAvatar: host?.avatar_url ?? null,
          hostVerified: host?.is_verified ?? false,
          badge: getBadge(event),
          commentsCount: row.comments_count ?? 0,
        };
      });

      // Sort by engagement score for display
      const scored = mapped.map(s => {
        let score = (s.participantsCount * 3) + (s.commentsCount) + (s.viewsCount * 0.1);
        if (s.spotsLeft <= 2) score += 15;
        if (s.isFeatured) score += 20;
        return { ...s, _score: score };
      });
      scored.sort((a, b) => b._score - a._score);

      setSessions(scored.slice(0, 12));
      setLoading(false);
    };
    fetchSessions();
  }, [selectedLocation, selectedSport]);

  // Auto-scroll to start on filter change (mobile)
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [selectedLocation, selectedSport]);

  return (
    <section
      id="sessions-near-you"
      aria-label="Upcoming sports sessions near you this week"
      style={{ padding: "100px 0", background: "#050505", position: "relative", overflow: "hidden" }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "30%", left: "20%", width: 500, height: 500,
        background: "radial-gradient(circle, rgba(182,255,0,0.04) 0%, transparent 70%)",
        pointerEvents: "none", filter: "blur(80px)",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400,
        background: "radial-gradient(circle, rgba(255,100,20,0.03) 0%, transparent 70%)",
        pointerEvents: "none", filter: "blur(60px)",
      }} />

      {/* Header */}
      <div style={{ padding: "0 5vw", marginBottom: 40, position: "relative" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%", background: "#B6FF00",
              display: "inline-block", animation: "blink 2s infinite",
            }} />
            <span style={{
              fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#B6FF00",
            }}>
              UPCOMING THIS WEEK
            </span>
          </div>
          <h2 style={{
            fontFamily: "var(--font-anton, 'Anton', sans-serif)",
            fontSize: "clamp(2.2rem, 5vw, 4.5rem)", fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1,
            color: "#fff", marginBottom: 10,
          }}>
            SESSIONS NEAR{" "}
            <span style={{
              color: "#B6FF00",
              textShadow: "0 0 30px rgba(182,255,0,0.3)",
            }}>
              {selectedLocation ? selectedLocation.toUpperCase() : "YOU"}
            </span>
          </h2>
          <p style={{
            fontSize: "0.9rem", color: "#4B5563", maxWidth: 480,
            fontFamily: "var(--font-inter-tight, sans-serif)", lineHeight: 1.5,
          }}>
            Upcoming sessions this week{selectedLocation ? ` in ${selectedLocation}` : ""}. Pick your area, find a game, and show up.
          </p>
        </motion.div>

        {/* Desktop filters */}
        <motion.div
          className="sessions-filters"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ marginTop: 32, flexDirection: "column", gap: 16 }}
        >
          {/* Location row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em", textTransform: "uppercase", minWidth: 52,
            }}>
              Area
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {LOCATION_OPTIONS.map(loc => (
                <button
                  key={loc.label}
                  onClick={() => setSelectedLocation(loc.query)}
                  className={`filter-chip ${selectedLocation === loc.query ? "filter-chip-active" : ""}`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sport row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.1em", textTransform: "uppercase", minWidth: 52,
            }}>
              Sport
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SPORT_FILTERS.map(sport => (
                <button
                  key={sport.label}
                  onClick={() => setSelectedSport(sport.id)}
                  className={`sport-chip ${selectedSport === sport.id ? "sport-chip-active" : ""}`}
                >
                  <span style={{ marginRight: 4 }}>{sport.emoji}</span>{sport.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Mobile: filter pills (horizontal scroll) */}
        <div className="sessions-scroll-mobile" style={{ marginTop: 20, paddingBottom: 4, gap: 8 }}>
          {LOCATION_OPTIONS.map(loc => (
            <button
              key={loc.label}
              onClick={() => setSelectedLocation(loc.query)}
              className={`filter-chip ${selectedLocation === loc.query ? "filter-chip-active" : ""}`}
              style={{ flex: "0 0 auto" }}
            >
              {loc.label}
            </button>
          ))}
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.08)", flexShrink: 0, margin: "0 4px", alignSelf: "center" }} />
          {SPORT_FILTERS.filter(s => s.id !== null).map(sport => (
            <button
              key={sport.label}
              onClick={() => setSelectedSport(selectedSport === sport.id ? null : sport.id)}
              className={`sport-chip ${selectedSport === sport.id ? "sport-chip-active" : ""}`}
              style={{ flex: "0 0 auto" }}
            >
              {sport.emoji} {sport.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ padding: "0 5vw" }}>
          <div className="sessions-grid" style={{ maxWidth: 1200, margin: "0 auto" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                background: "#111", borderRadius: 16, overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{
                  aspectRatio: "3/2",
                  background: "linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
                }} />
                <div style={{ padding: 16 }}>
                  <div style={{ height: 14, width: "80%", borderRadius: 6, background: "rgba(255,255,255,0.04)", marginBottom: 8 }} />
                  <div style={{ height: 10, width: "50%", borderRadius: 5, background: "rgba(255,255,255,0.03)", marginBottom: 16 }} />
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
                    <div style={{ height: 10, width: 80, borderRadius: 5, background: "rgba(255,255,255,0.03)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions — Desktop grid */}
      {!loading && sessions.length > 0 && (
        <div style={{ padding: "0 5vw" }}>
          <div className="sessions-grid" style={{ maxWidth: 1200, margin: "0 auto" }}>
            {sessions.slice(0, 6).map((event, i) => (
              <SessionCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Sessions — Mobile horizontal scroll */}
      {!loading && sessions.length > 0 && (
        <div className="sessions-scroll-mobile" ref={scrollRef}>
          {sessions.map((event, i) => (
            <SessionCard key={event.id} event={event} index={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && sessions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: "center", padding: "60px 5vw" }}
        >
          <div style={{
            width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px",
            background: "rgba(182,255,0,0.05)", border: "1px solid rgba(182,255,0,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem",
          }}>
            🏟️
          </div>
          <p style={{ fontSize: "1.1rem", color: "#6B7280", fontWeight: 600 }}>
            No sessions in {selectedLocation || "your area"} right now
          </p>
          <p style={{ fontSize: "0.85rem", color: "#374151", marginTop: 8, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
            New games drop daily. Try another area or download the app to get notified.
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {LOCATION_OPTIONS.filter(l => l.query && l.query !== selectedLocation).slice(0, 3).map(loc => (
              <button
                key={loc.label}
                onClick={() => setSelectedLocation(loc.query)}
                style={{
                  padding: "8px 16px", borderRadius: 10, cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)",
                  color: "#9CA3AF", fontSize: "0.78rem", fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
              >
                Try {loc.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* View all CTA */}
      {!loading && sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ textAlign: "center", marginTop: 48 }}
        >
          <Link
            href="/events"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px", borderRadius: 12,
              border: "1.5px solid rgba(182,255,0,0.3)",
              background: "rgba(182,255,0,0.05)",
              color: "#B6FF00", fontWeight: 700, fontSize: "0.85rem",
              letterSpacing: "0.05em", textTransform: "uppercase",
              textDecoration: "none", transition: "all 0.3s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(182,255,0,0.12)";
              e.currentTarget.style.borderColor = "rgba(182,255,0,0.5)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(182,255,0,0.15)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(182,255,0,0.05)";
              e.currentTarget.style.borderColor = "rgba(182,255,0,0.3)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Explore All Sessions <IconArrowRight size={14} />
          </Link>
        </motion.div>
      )}
    </section>
  );
}

// ─── 3. BENTO GRID ────────────────────────────────────────────────────────────
function AnimatedCount({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const triggered = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !triggered.current) {
        triggered.current = true;
        let start = 0;
        const inc = Math.max(1, Math.floor(target / 60));
        const timer = setInterval(() => {
  start = Math.min(start + inc, target);
  setDisplay(start);
  if (start >= target) clearInterval(timer);
}, 28) as unknown as number;
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

const SPORT_EMOJIS = [
  { emoji: "⚽", label: "Football", delay: 0 },
  { emoji: "🏀", label: "Basketball", delay: 0.3 },
  { emoji: "🎾", label: "Tennis", delay: 0.6 },
  { emoji: "🏊", label: "Swimming", delay: 0.9 },
  { emoji: "🚴", label: "Cycling", delay: 1.2 },
  { emoji: "🏋️", label: "Gym", delay: 0.2 },
  { emoji: "🏸", label: "Badminton", delay: 0.5 },
  { emoji: "🏃", label: "Running", delay: 0.8 },
  { emoji: "🥊", label: "Boxing", delay: 1.1 },
];

// ─── COMMUNITY SECTION ───────────────────────────────────────────────────────
function CommunitySection() {
  const words = ["THEIR SPORT", "THEIR PEOPLE", "THEIR CITY"];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % words.length);
    }, 2800);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      aria-label="Meet people who love sport"
      style={{
        position: "relative", overflow: "hidden",
        background: "#050505",
        padding: "0",
        minHeight: "100vh",
        display: "flex", alignItems: "stretch",
      }}
    >
      {/* Full section layout */}
      <div className="community-section-inner" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        width: "100%",
        minHeight: "100vh",
      }}>
        {/* Left — Copy */}
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "80px 5vw 80px 6vw",
          position: "relative",
        }}>
          {/* Decorative glow */}
          <div style={{
            position: "absolute", top: "20%", left: "-10%", width: 400, height: 400,
            background: "radial-gradient(circle, rgba(182,255,0,0.06) 0%, transparent 70%)",
            filter: "blur(80px)", pointerEvents: "none",
          }} />

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: "relative", zIndex: 1 }}
          >
            <p style={{
              fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "#B6FF00", marginBottom: 20,
            }}>
              MORE THAN AN APP
            </p>

            <h2 style={{
              fontFamily: "var(--font-anton, 'Anton', sans-serif)",
              fontSize: "clamp(2.5rem, 5.5vw, 5rem)", fontWeight: 900,
              textTransform: "uppercase", letterSpacing: "-0.02em",
              lineHeight: 1.05, color: "#fff", marginBottom: 24,
            }}>
              MEET PEOPLE<br />
              WHO LOVE<br />
              <span style={{ position: "relative", display: "inline-block", minWidth: 200 }}>
                <span
                  key={words[wordIndex]}
                  className="flip-word-enter"
                  style={{
                    color: "#B6FF00",
                    textShadow: "0 0 40px rgba(182,255,0,0.3)",
                    display: "inline-block",
                  }}
                >
                  {words[wordIndex]}
                </span>
              </span>
            </h2>

            <p style={{
              fontSize: "1.05rem", color: "#6B7280", lineHeight: 1.7,
              maxWidth: 420, fontFamily: "var(--font-inter-tight, sans-serif)",
              marginBottom: 36,
            }}>
              Fittrybe isn&apos;t just about finding a game — it&apos;s about finding your people.
              The ones who&apos;ll save you a spot, push your limits, and grab food after.
            </p>

            {/* Social proof stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ display: "flex", gap: 32, marginBottom: 40 }}
            >
              {[
                { value: "10+", label: "Sports" },
                { value: "6", label: "Local areas" },
                { value: "100%", label: "Free to join" },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{
                    fontFamily: "var(--font-anton, 'Anton', sans-serif)",
                    fontSize: "1.8rem", fontWeight: 900, color: "#fff",
                    lineHeight: 1,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize: "0.7rem", color: "#4B5563", fontWeight: 600,
                    letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 4,
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <SmartDownloadLink className="community-cta-btn" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "16px 32px", borderRadius: 14,
                background: "#B6FF00", color: "#0D0D0D",
                fontFamily: "var(--font-anton, 'Anton', sans-serif)",
                fontSize: "0.95rem", fontWeight: 800, letterSpacing: "0.05em",
                textTransform: "uppercase", textDecoration: "none",
                transition: "all 0.3s ease",
                boxShadow: "0 0 0 0 rgba(182,255,0,0)",
              }}>
                Find Your Tribe
                <IconArrowRight size={16} color="#0D0D0D" />
              </SmartDownloadLink>
            </motion.div>
          </motion.div>
        </div>

        {/* Right — Image */}
        <div style={{
          position: "relative",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          overflow: "hidden",
        }}>
          {/* Background gradient behind image */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "70%",
            background: "linear-gradient(to top, rgba(182,255,0,0.06) 0%, transparent 100%)",
            pointerEvents: "none",
          }} />

          {/* Floating accent circles */}
          <motion.div
            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute", top: "15%", right: "10%",
              width: 80, height: 80, borderRadius: "50%",
              border: "2px solid rgba(182,255,0,0.15)",
              pointerEvents: "none",
            }}
          />
          <motion.div
            animate={{ y: [8, -12, 8], rotate: [0, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{
              position: "absolute", top: "35%", left: "5%",
              width: 48, height: 48, borderRadius: "50%",
              background: "rgba(182,255,0,0.08)",
              pointerEvents: "none",
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            style={{
              position: "absolute", top: "25%", right: "30%",
              width: 12, height: 12, borderRadius: "50%",
              background: "#B6FF00",
              pointerEvents: "none",
            }}
          />

          {/* The image */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ position: "relative", zIndex: 2, width: "90%", maxWidth: 550 }}
          >
            <Image
              src="/web_img.png"
              alt="Two friends relaxing after a badminton session — the Fittrybe community"
              width={550}
              height={700}
              style={{
                width: "100%", height: "auto",
                objectFit: "contain", objectPosition: "bottom",
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))",
              }}
              sizes="(max-width: 768px) 90vw, 45vw"
            />
          </motion.div>

          {/* Floating quote card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{
              position: "absolute", top: "12%", left: "5%",
              padding: "16px 20px", borderRadius: 16,
              background: "rgba(13,13,13,0.85)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              maxWidth: 220, zIndex: 3,
            }}
          >
            <p style={{
              fontSize: "0.78rem", color: "rgba(255,255,255,0.7)",
              fontStyle: "italic", lineHeight: 1.5, marginBottom: 8,
              fontFamily: "var(--font-inter-tight, sans-serif)",
            }}>
              &ldquo;Found my weekly badminton crew through Fittrybe. Best decision ever.&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "linear-gradient(135deg, #B6FF00, #7acc00)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.55rem", fontWeight: 800, color: "#0D0D0D",
              }}>
                S
              </div>
              <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                Sarah, Redhill
              </span>
            </div>
          </motion.div>

          {/* Activity badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8, type: "spring", stiffness: 200 }}
            style={{
              position: "absolute", bottom: "18%", right: "5%",
              padding: "12px 18px", borderRadius: 14,
              background: "rgba(13,13,13,0.85)", backdropFilter: "blur(20px)",
              border: "1px solid rgba(182,255,0,0.15)",
              zIndex: 3, display: "flex", alignItems: "center", gap: 10,
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(182,255,0,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.2rem",
            }}>
              🏸
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#fff" }}>
                Game On!
              </div>
              <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                3 sessions this week
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile responsive styles are in globalStyles */}
    </section>
  );
}

// ─── Video Testimonials ──────────────────────────────────────────────────────
function VideoTestimonials() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);

  const testimonials = [
    {
      src: "/community.mp4",
      name: "The Fittrybe Community",
      caption: "Real players. Real sessions. Real energy.",
    },
    {
      src: "/community1.mp4",
      name: "Game Day Vibes",
      caption: "This is what showing up looks like.",
    },
  ];

  const handleToggle = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (playing === index) {
      video.pause();
      setPlaying(null);
    } else {
      // Pause any currently playing video
      if (playing !== null && videoRefs.current[playing]) {
        videoRefs.current[playing]!.pause();
      }
      video.play();
      setPlaying(index);
    }
  };

  return (
    <section
      aria-label="Community video testimonials"
      style={{
        padding: "100px 5vw",
        background: "#050505",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 600,
        background: "radial-gradient(circle, rgba(182,255,0,0.04) 0%, transparent 70%)",
        filter: "blur(100px)", pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: "center", marginBottom: 56, position: "relative", zIndex: 1 }}
      >
        <p style={{
          fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "#B6FF00", marginBottom: 16,
        }}>
          FROM THE FIELD
        </p>
        <h2 style={{
          fontFamily: "var(--font-anton, 'Anton', sans-serif)",
          fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)", fontWeight: 900,
          textTransform: "uppercase", letterSpacing: "-0.02em",
          lineHeight: 1.05, color: "#fff",
        }}>
          SEE THE <span style={{ color: "#B6FF00" }}>ENERGY</span>
        </h2>
        <p style={{
          fontSize: "1rem", color: "#6B7280", lineHeight: 1.7,
          maxWidth: 480, margin: "16px auto 0",
          fontFamily: "var(--font-inter-tight, sans-serif)",
        }}>
          Real moments from real players. This is what it looks like when your tribe links up.
        </p>
      </motion.div>

      <div className="video-testimonials-grid" style={{ position: "relative", zIndex: 1 }}>
        {testimonials.map((t, i) => (
          <motion.div
            key={t.src}
            className="video-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => handleToggle(i)}
          >
            <video
              ref={(el) => { videoRefs.current[i] = el; }}
              src={t.src}
              playsInline
              loop
              muted
              preload="metadata"
              aria-label={t.name}
              onEnded={() => setPlaying(null)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            >
              <track kind="descriptions" label="Video description" />
            </video>

            <div className="video-card-overlay" />

            {/* Play button */}
            <div className={`video-play-btn ${playing === i ? "is-playing" : ""}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#0D0D0D" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>

            {/* Bottom info */}
            <div className="video-card-info">
              <p style={{
                fontFamily: "var(--font-anton, 'Anton', sans-serif)",
                fontSize: "1.1rem", fontWeight: 800, color: "#fff",
                textTransform: "uppercase", letterSpacing: "0.02em",
                marginBottom: 4,
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}>
                {t.name}
              </p>
              <p style={{
                fontSize: "0.78rem", color: "rgba(255,255,255,0.7)",
                fontFamily: "var(--font-inter-tight, sans-serif)",
                fontWeight: 500,
              }}>
                {t.caption}
              </p>
            </div>

            {/* Live badge on first video */}
            {i === 0 && (
              <div style={{
                position: "absolute", top: 16, left: 16, zIndex: 5,
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 20,
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(182,255,0,0.2)",
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#B6FF00",
                  animation: "blink 1.5s infinite",
                }} />
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700, color: "#B6FF00",
                  textTransform: "uppercase", letterSpacing: "0.1em",
                }}>
                  Community
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function BentoGrid() {
  const [playerCount, setPlayerCount] = useState(0);
  useEffect(() => {
    const fetchCount = async () => {
      try {
        // Combine app users with historical waitlist signups for a single
        // "players on Fittrybe" number. Either table being unavailable just
        // falls through to 0 and the +100 floor still gives a friendly value.
        const [usersRes, waitlistRes] = await Promise.allSettled([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("waitlist").select("*", { count: "exact", head: true }),
        ]);
        const users = usersRes.status === "fulfilled" ? usersRes.value.count ?? 0 : 0;
        const waitlist = waitlistRes.status === "fulfilled" ? waitlistRes.value.count ?? 0 : 0;
        setPlayerCount(users + waitlist);
      } catch (error) {
        console.error("Error fetching player count:", error);
      }
    };
    fetchCount();
  }, []);

  return (
    <section aria-label="Fittrybe features and stats" style={{ padding: "100px 5vw", background: "#050505" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: "3rem", textAlign: "center" }}
      >
        <h2 style={{
          fontFamily: "var(--font-anton, 'Anton', sans-serif)",
          fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 900,
          textTransform: "uppercase", letterSpacing: "-0.02em",
        }}>
          BUILT FOR <span style={{ color: "#B6FF00" }}>PLAYERS</span>
        </h2>
      </motion.div>

      <div className="bento-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "auto auto", gap: 14, maxWidth: 1200, margin: "0 auto" }}>
        {/* Stats card */}
        <motion.article
          className="bento-card" aria-label="Fittrybe community stats"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: 0 }}
          style={{ gridColumn: "1 / 2", gridRow: "1 / 3", padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 400, background: "linear-gradient(145deg, #0D0D0D 0%, #111 100%)" }}
        >
          <div>
            <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#B6FF00", marginBottom: "1rem" }}>● LIVE COUNT</p>
            <p style={{ fontFamily: "var(--font-anton, 'Anton', sans-serif)", fontSize: "clamp(3.5rem, 6vw, 5.5rem)", fontWeight: 900, lineHeight: 1, color: "#fff" }}>
              <AnimatedCount target={playerCount + 100 || 240} suffix="+" />
            </p>
            <p style={{ fontSize: "0.85rem", color: "#4B5563", fontWeight: 500, marginTop: "0.5rem" }}>Players already on Fittrybe</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[{ num: "5+", label: "Sports & growing" }, { num: "FREE", label: "To join & play" }, { num: "LIVE", label: "iOS & Android" }].map(({ num, label }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontFamily: "var(--font-anton, 'Anton', sans-serif)", fontSize: "1.4rem", fontWeight: 800, color: "#B6FF00" }}>{num}</span>
                <span style={{ fontSize: "0.75rem", color: "#4B5563", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
              </div>
            ))}
          </div>
        </motion.article>

        {/* Sports icons - Updated with centered heading */}
        <motion.article
          className="bento-card" aria-label="Sports supported by Fittrybe"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ gridColumn: "2 / 4", padding: "2.5rem", background: "#0D0D0D", minHeight: 200 }}
        >
          <h3 style={{ 
            fontSize: "0.68rem", 
            fontWeight: 700, 
            letterSpacing: "0.12em", 
            textTransform: "uppercase", 
            color: "#B6FF00", 
            marginBottom: "1.5rem",
            textAlign: "center" // Added center alignment
          }}>● SPORTS</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }} role="list" aria-label="Supported sports"> {/* Added justifyContent center */}
            {SPORT_EMOJIS.map(({ emoji, label, delay }) => (
              <motion.div key={label} className="sport-icon-float" role="listitem"
                animate={{ y: [0, -8, 0] }} transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut", delay }}
                style={{ width: 60, height: 60 }} aria-label={label} title={label}>
                <span style={{ fontSize: "1.6rem" }} role="img" aria-label={label}>{emoji}</span>
              </motion.div>
            ))}
          </div>
        </motion.article>

        {/* Download CTA - Updated with side-by-side buttons on mobile and centered text */}
        <motion.article
          className="bento-card" aria-label="Download Fittrybe on the App Store and Google Play"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: 0.2 }}
          style={{ gridColumn: "2 / 4", padding: "2.5rem", background: "linear-gradient(135deg, #0f1a00 0%, #0D0D0D 60%)" }}
        >
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            width: "100%"
          }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <p style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#B6FF00",
                marginBottom: "0.75rem"
              }}>● AVAILABLE NOW</p>
              <h3 style={{
                fontFamily: "var(--font-anton, 'Anton', sans-serif)",
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                lineHeight: 1
              }}>GET THE APP</h3>
            </div>
            
            <div style={{ 
              display: "flex", 
              gap: "0.75rem", 
              flexWrap: "wrap", 
              justifyContent: "center",
              width: "100%"
            }}>
              <a href={APP_STORE_URL} target="_blank" rel="noopener" className="store-btn" aria-label="Download Fittrybe on the App Store" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 22px",
                borderRadius: "12px",
                border: "1.5px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s, transform 0.2s",
                textDecoration: "none",
                color: "#fff",
                flex: "0 1 auto",
                minWidth: "160px",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = ""; }}
              >
                <IconApple size={20} color="#fff" />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.6rem", color: "#9CA3AF", fontWeight: 500, letterSpacing: "0.05em" }}>DOWNLOAD ON THE</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>App Store</div>
                </div>
              </a>
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener" className="store-btn" aria-label="Get Fittrybe on Google Play" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 22px",
                borderRadius: "12px",
                border: "1.5px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.04)",
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s, transform 0.2s",
                textDecoration: "none",
                color: "#fff",
                flex: "0 1 auto",
                minWidth: "160px",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.transform = ""; }}
              >
                <IconGooglePlay size={20} color="#B6FF00" />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.6rem", color: "#9CA3AF", fontWeight: 500, letterSpacing: "0.05em" }}>GET IT ON</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

// ─── 5. BLOG PREVIEW ─────────────────────────────────────────────────────────
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: { seconds: number } | string | null;
  category?: string;
}

function BlogPreviewSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from("blogs").select("*").order("publishedAt", { ascending: false }).limit(3);
        if (data) setPosts(data as BlogPost[]);
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Don't render section at all if no posts and not loading
  if (!loading && posts.length === 0) return null;

  const formatDate = (raw: BlogPost["publishedAt"]) => {
    if (!raw) return "";
    const d = typeof raw === "string" ? new Date(raw) : new Date((raw as { seconds: number }).seconds * 1000);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <section aria-label="Latest from the Fittrybe blog" style={{ padding: "100px 5vw", background: "#080808", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }}
        style={{ marginBottom: "3rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}
      >
        <div>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#B6FF00", marginBottom: "0.6rem" }}>● FROM THE BLOG</p>
          <h2 style={{
            fontFamily: "var(--font-anton, 'Anton', sans-serif)",
            fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 900,
            textTransform: "uppercase", letterSpacing: "-0.02em",
          }}>
            LATEST <span style={{ color: "#B6FF00" }}>READS</span>
          </h2>
        </div>
        <Link href="/blog" style={{
          color: "#9CA3AF", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: "var(--font-anton, 'Anton', sans-serif)",
          fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.07em", textTransform: "uppercase",
          transition: "color 0.2s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#B6FF00"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#9CA3AF"; }}
        >
          View All Posts <IconArrowRight size={14} />
        </Link>
      </motion.div>

      {loading ? (
        // Skeleton loader matching card dimensions
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, maxWidth: 1200, margin: "0 auto" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ borderRadius: 20, background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", height: 340 }}>
              <div style={{ height: 180, background: "linear-gradient(90deg, #111 25%, #181818 50%, #111 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
              <div style={{ padding: "1.25rem" }}>
                <div style={{ height: 12, width: "40%", background: "#181818", borderRadius: 6, marginBottom: 12 }} />
                <div style={{ height: 20, width: "90%", background: "#181818", borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 14, width: "70%", background: "#181818", borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, maxWidth: 1200, margin: "0 auto" }}>
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              className="bento-card"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.55, delay: i * 0.1 }}
              onClick={() => router.push(`/blog/${post.slug}`)}
              style={{ cursor: "pointer", display: "flex", flexDirection: "column", overflow: "hidden" }}
              aria-label={`Read blog post: ${post.title}`}
            >
              {/* Cover image / fallback */}
              <div style={{ height: 190, background: post.coverImage ? "transparent" : "linear-gradient(135deg, #0f1a00 0%, #0d0d0d 100%)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                {post.coverImage ? (
                  <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: "cover" }} />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "3rem", opacity: 0.15 }}>📝</span>
                  </div>
                )}
                {/* Category badge */}
                {post.category && (
                  <span style={{
                    position: "absolute", top: 14, left: 14,
                    background: "rgba(182,255,0,0.12)", border: "1px solid rgba(182,255,0,0.25)",
                    color: "#B6FF00", fontSize: "0.6rem", fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "4px 10px", borderRadius: 100,
                  }}>{post.category}</span>
                )}
              </div>

              <div style={{ padding: "1.25rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                {post.publishedAt && (
                  <p style={{ fontSize: "0.68rem", color: "#4B5563", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    {formatDate(post.publishedAt)}
                  </p>
                )}
                <h3 style={{
                  fontFamily: "var(--font-anton, 'Anton', sans-serif)",
                  fontSize: "1.2rem", fontWeight: 800, textTransform: "uppercase",
                  letterSpacing: "-0.01em", lineHeight: 1.2, color: "#fff",
                  marginBottom: "0.6rem", flex: 1,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>{post.title}</h3>
                {post.excerpt && (
                  <p style={{
                    fontSize: "0.82rem", color: "#6B7280", lineHeight: 1.6,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    marginBottom: "1rem",
                  }}>{post.excerpt}</p>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#B6FF00", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "auto" }}>
                  Read More <IconArrowRight size={12} color="#B6FF00" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}


// ─── FAQ Section ──────────────────────────────────────────────────────────────
// Visible counterpart to the FAQPage JSON-LD already injected from app/page.tsx.
// Google requires the FAQ content to be present in the rendered HTML for the
// schema to be valid — without this section, the schema is non-compliant.
function FAQSection({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  if (!faqs?.length) return null;

  return (
    <section
      aria-label="Frequently asked questions"
      style={{
        padding: "80px 5vw",
        maxWidth: 880,
        margin: "0 auto",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <header style={{ textAlign: "center", marginBottom: "3rem" }}>
        <span
          style={{
            display: "inline-block",
            color: "#B6FF00",
            fontSize: "0.7rem",
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          FAQ
        </span>
        <h2
          style={{
            fontFamily:
              "var(--font-anton, 'Anton', sans-serif)",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
            color: "#fff",
            lineHeight: 1.05,
          }}
        >
          Questions, answered.
        </h2>
      </header>

      <dl style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          const panelId = `faq-panel-${i}`;
          const buttonId = `faq-button-${i}`;
          return (
            <div className="faq-item" key={faq.question}>
              <dt>
                <button
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem",
                    padding: "1.4rem 0",
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    fontFamily:
                      "var(--font-anton, 'Anton', sans-serif)",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    letterSpacing: "0.01em",
                    textTransform: "uppercase",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      color: "#B6FF00",
                      flexShrink: 0,
                    }}
                  >
                    <IconChevronDown size={18} />
                  </span>
                </button>
              </dt>
              <dd
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                style={{
                  padding: isOpen ? "0 0 1.4rem 0" : 0,
                  color: "#9CA3AF",
                  fontSize: "0.92rem",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {faq.answer}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function Footer() {
  // Use lazy initializer to get current year without causing hydration issues
  const [currentYear] = useState<number>(() => new Date().getFullYear());

  return (
    <footer style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "40px 5vw" }}>
      <div className="footer-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <Link href="/" aria-label="Fittrybe homepage" style={{
          display: "flex", alignItems: "center", gap: "0.55rem", textDecoration: "none",
        }}>
          <Image src="/logo-mark.png" alt="" width={28} height={28} style={{ display: "block" }} />
          <Wordmark height={22} />
        </Link>

        <nav aria-label="Footer navigation" style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: "Sports", href: "/sports" },
            { label: "Sessions", href: "/events" },
            { label: "Blog", href: "/blog" },
            { label: "Get the App", href: "/download" },
            { label: "Support", href: "/support" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Use", href: "/terms" },
          ].map(link => (
            <a key={link.label} href={link.href} className="footer-link">{link.label}</a>
          ))}
        </nav>

        <div style={{ display: "flex", gap: "0.5rem" }} aria-label="Fittrybe social media links">
          {[
            { href: "https://instagram.com/fittrybe.uk", Icon: IconInstagram, label: "Follow Fittrybe on Instagram" },
            { href: "https://www.facebook.com/share/1AZ19Yqe2y/", Icon: IconFacebook, label: "Follow Fittrybe on Facebook" },
            { href: "https://twitter.com/fittrybe", Icon: IconTwitterX, label: "Follow Fittrybe on X (Twitter)" },
            // { href: "https://tiktok.com/@fittrybe", Icon: IconTiktok, label: "Follow Fittrybe on TikTok" },
          ].map(({ href, Icon, label }) => (
            <a key={href} href={href} className="social-icon-btn" aria-label={label} rel="noopener noreferrer" target="_blank">
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.04)", textAlign: "center", fontSize: "0.72rem", color: "#2a2a2a", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        © {currentYear} Fittrybe Ltd. All rights reserved. · London, United Kingdom
      </div>
    </footer>
  );
}

// ─── Root Client Component ────────────────────────────────────────────────────
export default function LandingPageClient({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <SessionsNearYou />
        <CommunitySection />
        <VideoTestimonials />
        <BentoGrid />
        <BlogPreviewSection />
        <FAQSection faqs={faqs} />
      </main>
      <Footer />
    </>
  );
}