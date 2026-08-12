"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Wordmark } from "@/components/brand/Wordmark";

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

function IconFacebook({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  void color;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.5 3v3.5H7V10h2.5v9h4v-9h3.5V6.5H13.5V4c0-.6.4-1 1-1h3V0h-4C10.8 0 9.5 1.3 9.5 3z"/>
    </svg>
  );
}

export default function SiteFooter() {
  const [currentYear] = useState<number>(() => new Date().getFullYear());

  return (
    <footer style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.05)", padding: "40px 5vw" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
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
            { label: "Care Homes", href: "/care-homes" },
            { label: "SEN Sessions", href: "/sen-sessions" },
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
          ].map(({ href, Icon, label }) => (
            <a key={href} href={href} className="social-icon-btn" aria-label={label} rel="noopener noreferrer" target="_blank">
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center", fontSize: "0.72rem", color: "#ffffff", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        © {currentYear} Fittrybe Ltd. All rights reserved. · London, United Kingdom
      </div>
      <div style={{ marginTop: "0.75rem", textAlign: "center", fontSize: "0.65rem", color: "#cccccc", fontWeight: 500, letterSpacing: "0.06em" }}>
        ICO Registration: ZC210931
      </div>
    </footer>
  );
}
