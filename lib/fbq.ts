// Meta Pixel helper for fittrybe.co.uk
// Pixel already on the site: 1461832162343936 ("Waitlist Signup")
// The base pixel snippet is already installed, so this only wraps calls to it.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

type Params = Record<string, unknown>

/**
 * Send a standard Meta event.
 *
 * @param event    Standard event name, e.g. "ViewContent", "InitiateCheckout", "Purchase"
 * @param params   custom_data fields. `value` must be a NUMBER, never a string, never with a currency symbol.
 * @param eventId  Pass your booking id on Purchase so the browser event and the
 *                 server event (see meta-capi.ts) are counted once, not twice.
 */
export function fbTrack(event: string, params: Params = {}, eventId?: string): void {
  if (typeof window === 'undefined') return
  if (typeof window.fbq !== 'function') return

  try {
    if (eventId) {
      window.fbq('track', event, params, { eventID: eventId })
    } else {
      window.fbq('track', event, params)
    }
  } catch {
    // Never let tracking break the booking flow.
  }
}

/**
 * Fire an event at most once per key, per browser.
 * Use this for Purchase so a page refresh or a link from the confirmation
 * email does not report the same booking twice.
 */
export function fbTrackOnce(
  key: string,
  event: string,
  params: Params = {},
  eventId?: string,
): void {
  if (typeof window === 'undefined') return

  const storageKey = `fb_sent:${event}:${key}`

  try {
    if (window.localStorage.getItem(storageKey)) return
    window.localStorage.setItem(storageKey, '1')
  } catch {
    // Private mode or blocked storage. Fall through and send it anyway,
    // the server event carries the same event_id so Meta will dedupe.
  }

  fbTrack(event, params, eventId)
}

/**
 * Read the Meta cookies so you can pass them through to the server.
 * Call this in the browser at checkout and store the two values on the booking.
 */
export function readMetaCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {}

  const get = (name: string) =>
    document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1]

  return { fbp: get('_fbp'), fbc: get('_fbc') }
}
