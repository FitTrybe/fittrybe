"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Wordmark } from "@/components/brand/Wordmark";
import SmartDownloadLink from "@/components/SmartDownloadLink";

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 1024) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="site-nav"
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
          <Link href="/sports" className="nav-link">Sports</Link>
          <Link href="/events" className="nav-link">Sessions</Link>
          <Link href="/care-homes" className="nav-link">Care Homes</Link>
          <Link href="/sen-sessions" className="nav-link">SEN</Link>
          <Link href="/blog" className="nav-link">Blog</Link>
          <Link href="/support" className="nav-link">Support</Link>
          <Link href="/book-a-call" className="nav-link">Book a Call</Link>
          <SmartDownloadLink className="nav-cta">Get the App</SmartDownloadLink>
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
      </nav>

      <div id="mobile-menu" className={`mobile-menu${menuOpen ? " open" : ""}`} role="menu" aria-hidden={!menuOpen}>
        <Link href="/sports" className="nav-link" onClick={closeMenu} role="menuitem">Sports</Link>
        <Link href="/events" className="nav-link" onClick={closeMenu} role="menuitem">Sessions</Link>
        <Link href="/care-homes" className="nav-link" onClick={closeMenu} role="menuitem">Care Homes</Link>
        <Link href="/sen-sessions" className="nav-link" onClick={closeMenu} role="menuitem">SEN</Link>
        <Link href="/blog" className="nav-link" onClick={closeMenu} role="menuitem">Blog</Link>
        <Link href="/support" className="nav-link" onClick={closeMenu} role="menuitem">Support</Link>
        <Link href="/book-a-call" className="nav-link" onClick={closeMenu} role="menuitem">Book a Call</Link>
        <SmartDownloadLink className="nav-cta" onClick={closeMenu} role="menuitem">Get the App</SmartDownloadLink>
      </div>

      {/* Spacer so content doesn't hide behind fixed nav */}
      <div style={{ height: 64 }} />
    </>
  );
}
