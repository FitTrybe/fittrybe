/**
 * ─── Fittrybe — App Download Links ────────────────────────────────────────────
 *
 * Single source of truth for store URLs. Use these constants everywhere a
 * "Get the App" CTA points to.
 *
 *   • iOS    → App Store
 *   • Android → Google Play
 *   • Web / desktop → fittrybe.app
 */

export const APP_STORE_URL =
  "https://apps.apple.com/us/app/fittrybe/id6765941962";

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.fittrybe.app";

export const WEB_APP_URL = "https://fittrybe.app";

export type Platform = "ios" | "android" | "web";

/**
 * Resolve the right download URL for a given user-agent.
 * Server-rendered code (no UA) falls through to the web app URL so links
 * still work without JS.
 */
export function getDownloadUrl(userAgent?: string | null): string {
  if (!userAgent) return WEB_APP_URL;
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return APP_STORE_URL;
  if (/android/.test(ua)) return PLAY_STORE_URL;
  return WEB_APP_URL;
}

export function detectPlatform(userAgent?: string | null): Platform {
  if (!userAgent) return "web";
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "web";
}
