"use client";

/**
 * ─── SmartDownloadLink ───────────────────────────────────────────────────────
 *
 * Renders an <a> tag whose href is resolved at click-time based on the user's
 * platform:
 *   • iOS     → App Store
 *   • Android → Google Play
 *   • Anything else → fittrybe.app (web app)
 *
 * The server-rendered href defaults to the web app URL so the link still works
 * without JS and search crawlers see a real destination.
 */

import { useCallback, type AnchorHTMLAttributes, type ReactNode } from "react";
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
  WEB_APP_URL,
  getDownloadUrl,
} from "@/lib/download-links";

type Force = "ios" | "android" | "web" | "auto";

interface SmartDownloadLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  children: ReactNode;
  /**
   * Force a specific store target (used by stacked App Store + Play Store
   * buttons where each button is platform-specific). Defaults to "auto".
   */
  force?: Force;
}

function resolveHref(force: Force): string {
  if (force === "ios") return APP_STORE_URL;
  if (force === "android") return PLAY_STORE_URL;
  if (force === "web") return WEB_APP_URL;
  return WEB_APP_URL;
}

export default function SmartDownloadLink({
  children,
  force = "auto",
  onClick,
  target,
  rel,
  ...rest
}: SmartDownloadLinkProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (force !== "auto") return; // forced links use their static href
      if (typeof window === "undefined") return;
      e.preventDefault();
      const url = getDownloadUrl(window.navigator.userAgent);
      window.location.href = url;
    },
    [force, onClick]
  );

  return (
    <a
      {...rest}
      href={resolveHref(force)}
      onClick={handleClick}
      target={target ?? "_blank"}
      rel={rel ?? "noopener"}
    >
      {children}
    </a>
  );
}
