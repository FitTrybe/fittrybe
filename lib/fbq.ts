// Meta Pixel helper for fittrybe.co.uk
// Pixel on the site: 1461832162343936
//
// IMPORTANT: the base pixel snippet in app/layout.tsx is loaded with
// next/script strategy="afterInteractive". React effects can still fire
// before it has finished loading, so this file queues calls until fbq
// shows up rather than silently dropping them.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

type Params = Record<string, unknown>

const MAX_WAIT_MS = 10_000
const POLL_MS = 150

const pending: Array<() => void> = []
let polling = false

function ready(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function'
}

function startPolling(): void {
  if (polling) return
  polling = true

  const startedAt = Date.now()

  const tick = () => {
    if (ready()) {
      polling = false
      while (pending.length) {
        const run = pending.shift()
        try {
          run?.()
        } catch {
          // Never let tracking break the page.
        }
      }
      return
    }

    if (Date.now() - startedAt > MAX_WAIT_MS) {
      // Give up. The server side Conversions API event still covers Purchase.
      polling = false
      pending.length = 0
      return
    }

    window.setTimeout(tick, POLL_MS)
  }

  tick()
}

/** Run now if the pixel is loaded, otherwise queue until it is. */
function whenReady(run: () => void): void {
  if (typeof window === 'undefined') return

  if (ready()) {
    try {
      run()
    } catch {
      // ignore
    }
    return
  }

  pending.push(run)
  startPolling()
}

/**
 * Send a standard Meta event.
 *
 * @param event    "ViewContent" | "InitiateCheckout" | "Purchase" | "CompleteRegistration" ...
 * @param params   custom_data. `value` must be a NUMBER, never a string.
 * @param eventId  Pass your booking id on Purchase so the browser event and the
 *                 server event are counted once, not twice.
 */
export function fbTrack(event: string, params: Params = {}, eventId?: string): void {
  whenReady(() => {
    if (eventId) {
      window.fbq!('track', event, params, { eventID: eventId })
    } else {
      window.fbq!('track', event, params)
    }
  })
}

/**
 * Fire an event at most once per key, per browser.
 * Use for Purchase so a refresh, or a link from the confirmation email,
 * does not report the same booking twice.
 *
 * The guard is set at send time, not at queue time. If the pixel never loads,
 * the key stays unset so a later visit can still report it.
 */
export function fbTrackOnce(
  key: string,
  event: string,
  params: Params = {},
  eventId?: string,
): void {
  const storageKey = `fb_sent:${event}:${key}`

  whenReady(() => {
    try {
      if (window.localStorage.getItem(storageKey)) return
      window.localStorage.setItem(storageKey, '1')
    } catch {
      // Private mode or blocked storage. Send anyway. The matching event_id on
      // the server call means Meta will still count one purchase.
    }

    if (eventId) {
      window.fbq!('track', event, params, { eventID: eventId })
    } else {
      window.fbq!('track', event, params)
    }
  })
}

/** Read the Meta cookies so they can be passed to the server event. */
export function readMetaCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {}

  const get = (name: string) =>
    document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${name}=`))
      ?.split('=')[1]

  return { fbp: get('_fbp'), fbc: get('_fbc') }
}

export {}
