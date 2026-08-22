// Server-side events for Meta Conversions API.
//
// Ad blockers and iOS eat a real share of browser events, so this is the
// reliable half. The browser event and this one share an event_id, so Meta
// counts one conversion, not two.
//
// Requires an env var on the server only. Never expose this in client code:
//   META_CAPI_TOKEN=...

import crypto from 'crypto'

const PIXEL_ID = '1461832162343936'
const GRAPH_VERSION = 'v21.0'

const sha256 = (value: string): string =>
  crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')

/**
 * Deterministic, PII-free booking id for event deduplication.
 * Pass the same value as eventID in the browser and as event_id on the server.
 */
export function hashBookingId(sessionId: string, email: string): string {
  return crypto
    .createHash('sha256')
    .update(`${sessionId}:${email.trim().toLowerCase()}`)
    .digest('hex')
    .slice(0, 16)
}

export type ServerEventData = {
  /** Same id you pass as eventID in the browser. This is what dedupes them. */
  bookingId: string
  sessionId: string
  sessionName: string
  /** Amount actually charged, after any discount code. */
  value: number
  email: string
  phone?: string
  firstName?: string
  lastName?: string
  clientIp?: string
  userAgent?: string
  fbp?: string
  fbc?: string
}

async function sendServerEvent(
  eventName: string,
  e: ServerEventData,
): Promise<void> {
  const token = process.env.META_CAPI_TOKEN
  if (!token) {
    console.warn(`[meta-capi] META_CAPI_TOKEN not set, skipping ${eventName}`)
    return
  }

  const userData: Record<string, unknown> = {
    em: [sha256(e.email)],
  }

  if (e.phone) userData.ph = [sha256(e.phone.replace(/[^0-9]/g, ''))]
  if (e.firstName) userData.fn = [sha256(e.firstName)]
  if (e.lastName) userData.ln = [sha256(e.lastName)]
  if (e.clientIp) userData.client_ip_address = e.clientIp
  if (e.userAgent) userData.client_user_agent = e.userAgent
  if (e.fbp) userData.fbp = e.fbp
  if (e.fbc) userData.fbc = e.fbc

  const body = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: e.bookingId,
        action_source: 'website',
        event_source_url: `https://fittrybe.co.uk/events/${e.sessionId}`,
        user_data: userData,
        custom_data: {
          currency: 'GBP',
          value: e.value,
          content_ids: [e.sessionId],
          content_name: e.sessionName,
          content_type: 'product',
          num_items: 1,
        },
      },
    ],
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )

    if (!res.ok) {
      console.error(`[meta-capi] ${eventName} rejected:`, res.status, await res.text())
    }
  } catch (err) {
    console.error(`[meta-capi] ${eventName} failed to send:`, err)
  }
}

/** Paid booking completed. Value = what was actually charged after discounts. */
export async function sendPurchaseToMeta(e: ServerEventData): Promise<void> {
  return sendServerEvent('Purchase', e)
}

/** Free booking completed. Value = 0. */
export async function sendCompleteRegistrationToMeta(e: ServerEventData): Promise<void> {
  return sendServerEvent('CompleteRegistration', e)
}
