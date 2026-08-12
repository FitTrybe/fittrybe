"use client";

import { useEffect, useState } from "react";
import SiteNav from "@/components/SiteNav";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  detectPlatform,
  type Platform,
} from "@/lib/download-links";

const pageStyles = `
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
  .dl-card { animation: fadeUp 0.55s ease forwards; }
  .dl-btn {
    display: inline-flex; align-items: center; gap: 12px;
    padding: 14px 22px; border-radius: 12px;
    border: 1.5px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.04);
    color: #fff; text-decoration: none;
    transition: background 0.2s, border-color 0.2s, transform 0.2s;
    min-width: 200px; justify-content: center;
  }
  .dl-btn:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.22);
    transform: translateY(-2px);
  }
  .dl-btn-primary {
    background: #B6FF00; color: #0D0D0D; border-color: #B6FF00;
  }
  .dl-btn-primary:hover {
    background: #c8ff33; border-color: #c8ff33;
    box-shadow: 0 12px 32px rgba(182,255,0,0.25);
  }
`;

function IconApple({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}
function IconPlay({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
    </svg>
  );
}

export default function DownloadPageClient() {
  const [platform, setPlatform] = useState<Platform>("web");
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = detectPlatform(window.navigator.userAgent);
    // One-shot hydration: read UA on mount, redirect mobile users to their
    // store. The setState calls below run exactly once and are the standard
    // pattern for this kind of client-only initialisation.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (p !== "web") {
      setRedirected(true);
      setPlatform(p);
      window.location.replace(p === "ios" ? APP_STORE_URL : PLAY_STORE_URL);
      return;
    }
    setPlatform(p);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />
      <SiteNav />
      <main
        id="main-content"
        aria-label="Download Fittrybe"
        style={{
          minHeight: "100vh",
          background: "#050505",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "4rem 1.5rem",
          fontFamily: "var(--font-inter-tight, sans-serif)",
        }}
      >
        <div className="dl-card" style={{ width: "100%", maxWidth: 520, textAlign: "center" }}>

          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#B6FF00",
              marginBottom: "1rem",
            }}
          >
            ● Available Now
          </p>

          <h1
            style={{
              fontFamily: "var(--font-anton, 'Anton', sans-serif)",
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              lineHeight: 1.0,
              marginBottom: "1.25rem",
            }}
          >
            Get Fittrybe<br />
            <span style={{ color: "#B6FF00" }}>on Your Phone</span>
          </h1>

          <p
            style={{
              color: "#9CA3AF",
              fontSize: "1rem",
              lineHeight: 1.6,
              maxWidth: 420,
              margin: "0 auto 2.5rem",
            }}
          >
            {redirected
              ? "Opening your app store… If nothing happens, use the buttons below."
              : "Download Fittrybe on iPhone or Android and start finding local sports sessions near you in seconds."}
          </p>

          <div
            style={{
              display: "flex",
              gap: "0.85rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "1.75rem",
            }}
          >
            <a
              href={APP_STORE_URL}
              className="dl-btn"
              aria-label="Download Fittrybe on the App Store"
              target="_blank"
              rel="noopener"
            >
              <IconApple size={22} color="#fff" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.62rem", color: "#9CA3AF", letterSpacing: "0.05em" }}>
                  DOWNLOAD ON THE
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700 }}>App Store</div>
              </div>
            </a>
            <a
              href={PLAY_STORE_URL}
              className="dl-btn"
              aria-label="Get Fittrybe on Google Play"
              target="_blank"
              rel="noopener"
            >
              <IconPlay size={22} color="#B6FF00" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "0.62rem", color: "#9CA3AF", letterSpacing: "0.05em" }}>
                  GET IT ON
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 700 }}>Google Play</div>
              </div>
            </a>
          </div>

        </div>
      </main>
    </>
  );
}
