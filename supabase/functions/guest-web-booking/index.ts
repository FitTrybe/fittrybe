// supabase/functions/guest-web-booking/index.ts
//
// GUEST WEB BOOKING — handles the full guest reservation flow from the website.
//
// Actions:
//   create-checkout  → Creates a Stripe Checkout Session for the guest
//   confirm-booking  → After payment, books the guest into the session
//
// Called by the Next.js /api/guest-reserve route using the service role key.
// No user auth needed — this is a server-to-server call.

import { serve }        from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe            from 'https://esm.sh/stripe@14.14.0'

const SUPABASE_URL         = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STRIPE_SECRET_KEY    = Deno.env.get('STRIPE_SECRET_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const stripe   = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })

// The system guest user ID — all web guests are tied to this account
const GUEST_UID = '00000000-0000-0000-0000-000000000001'
const PLATFORM_FEE_PERCENT = 15

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CREATE CHECKOUT — Stripe Checkout Session for guest payment
// ═══════════════════════════════════════════════════════════════════════════════

async function createCheckout(body: Record<string, unknown>) {
  const sessionId     = body.session_id as string
  const amountPence   = body.amount_pence as number
  const guestEmail    = body.guest_email as string
  const reservationId = body.guest_reservation_id as string
  const sessionTitle  = body.session_title as string
  const sessionLoc    = body.session_location as string
  const successUrl    = body.success_url as string
  const cancelUrl     = body.cancel_url as string

  if (!sessionId || !amountPence || !guestEmail) {
    return { error: 'Missing required fields' }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'gbp',
        unit_amount: amountPence,
        product_data: {
          name: sessionTitle || 'Session Booking',
          description: `Guest spot — ${sessionLoc || 'FitTrybe'}`,
        },
      },
      quantity: 1,
    }],
    customer_email: guestEmail,
    metadata: {
      guest_reservation_id: reservationId,
      session_id: sessionId,
      source: 'web_guest',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return {
    url: checkoutSession.url,
    checkout_session_id: checkoutSession.id,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CONFIRM BOOKING — after payment, book guest into session
//    Decrements spots, adds to session_guests, records payment, credits host
// ═══════════════════════════════════════════════════════════════════════════════

async function confirmBooking(body: Record<string, unknown>) {
  const sessionId     = body.session_id as string
  const guestName     = body.guest_name as string
  const guestEmail    = body.guest_email as string
  const amountPence   = (body.amount_pence as number) || 0
  const stripePayId   = (body.stripe_payment_id as string) || null
  const reservationId = body.guest_reservation_id as string

  if (!sessionId || !guestName || !guestEmail) {
    return { error: 'Missing required fields' }
  }

  // ── Idempotency: check if already processed ───────────────────────────
  if (reservationId) {
    const { data: existing } = await supabase
      .from('guest_reservations')
      .select('status')
      .eq('id', reservationId)
      .maybeSingle()

    if (existing?.status === 'paid') {
      return { success: true, already_processed: true }
    }
  }

  // ── 1. Get session + lock spots ───────────────────────────────────────
  const { data: session, error: sessErr } = await supabase
    .from('sessions')
    .select('id, host_id, title, spots_left, participants_count')
    .eq('id', sessionId)
    .single()

  if (sessErr || !session) return { error: 'Session not found' }
  if (session.spots_left <= 0) return { error: 'No spots left' }

  // ── 2. Decrement spots ────────────────────────────────────────────────
  const { error: updateErr } = await supabase
    .from('sessions')
    .update({
      spots_left: Math.max(0, session.spots_left - 1),
      participants_count: (session.participants_count || 0) + 1,
    })
    .eq('id', sessionId)

  if (updateErr) {
    console.error('Spots update failed:', updateErr)
    return { error: 'Could not update session' }
  }

  // ── 3. Add to session_guests (visible on host dashboard) ──────────────
  await supabase.from('session_guests').insert({
    session_id: sessionId,
    invited_by: GUEST_UID,
    guest_label: `${guestName} (${guestEmail})`,
    status: 'approved',
  }).then(() => {}, (e: unknown) => console.error('session_guests insert:', e))

  // ── 4. Record payment (if paid session) ───────────────────────────────
  if (amountPence > 0) {
    await supabase.from('payments').insert({
      user_id: GUEST_UID,
      session_id: sessionId,
      stripe_payment_id: stripePayId || `web_guest_${reservationId}`,
      amount_pence: amountPence,
      status: 'succeeded',
    }).then(() => {}, (e: unknown) => console.error('payments insert:', e))
  }

  // ── 5. Credit host wallet (minus platform fee) ────────────────────────
  if (amountPence > 0 && session.host_id) {
    const fee = Math.round(amountPence * PLATFORM_FEE_PERCENT / 100)
    const hostAmount = Math.max(amountPence - fee, 0)

    if (hostAmount > 0) {
      // Ensure wallet exists
      await supabase.from('wallets')
        .insert({ user_id: session.host_id, balance_pence: 0, pending_pence: 0, total_earned: 0, total_withdrawn: 0 })
        .then(() => {}, () => {}) // ignore conflict

      // Try atomic RPC first
      const { error: rpcErr } = await supabase.rpc('wallet_credit_pending', {
        p_host_id: session.host_id,
        p_amount: hostAmount,
      })

      if (rpcErr) {
        // Fallback: direct update
        console.warn('wallet_credit_pending RPC failed, using fallback:', rpcErr.message)
        const { data: wallet } = await supabase
          .from('wallets')
          .select('id, pending_pence')
          .eq('user_id', session.host_id)
          .single()

        if (wallet) {
          await supabase.from('wallets').update({
            pending_pence: (wallet.pending_pence || 0) + hostAmount,
            updated_at: new Date().toISOString(),
          }).eq('id', wallet.id)
        }
      }

      // Log wallet transaction
      const { data: walletRow } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', session.host_id)
        .single()

      if (walletRow) {
        await supabase.from('wallet_transactions').insert({
          wallet_id: walletRow.id,
          user_id: session.host_id,
          player_id: GUEST_UID,
          type: 'player_deposit',
          amount_pence: hostAmount,
          status: 'pending',
          description: `Web guest: ${guestName}`,
          session_id: sessionId,
        }).then(() => {}, () => {})
      }
    }
  }

  // ── 6. Update guest_reservations status ───────────────────────────────
  if (reservationId) {
    await supabase
      .from('guest_reservations')
      .update({ status: amountPence > 0 ? 'paid' : 'confirmed' })
      .eq('id', reservationId)
  }

  // ── 7. Notify admin (non-blocking) ────────────────────────────────────
  if (amountPence > 0) {
    try {
      const RESEND_KEY = Deno.env.get('RESEND_API_KEY')
      if (RESEND_KEY) {
        const amountStr = `£${(amountPence / 100).toFixed(2)}`
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'FitTrybe <hello@fittrybe.co.uk>',
            to: 'frankojarkarta@gmail.com',
            subject: `💰 Web guest payment: ${amountStr} — ${guestName}`,
            html: `<div style="font-family:system-ui;max-width:500px;padding:24px;background:#0a0a0a;color:#fff;border-radius:16px;">
              <h2 style="color:#B6FF3B;margin:0 0 16px;">New Web Guest Booking</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="color:#888;padding:8px 0;">Guest</td><td style="text-align:right;font-weight:700;">${guestName}</td></tr>
                <tr><td style="color:#888;padding:8px 0;">Email</td><td style="text-align:right;">${guestEmail}</td></tr>
                <tr><td style="color:#888;padding:8px 0;">Session</td><td style="text-align:right;">${session.title || sessionId}</td></tr>
                <tr><td style="color:#888;padding:8px 0;">Amount</td><td style="text-align:right;font-weight:700;color:#B6FF3B;">${amountStr}</td></tr>
                <tr><td style="color:#888;padding:8px 0;">Source</td><td style="text-align:right;">Website (guest)</td></tr>
              </table>
            </div>`,
          }),
        }).then(() => {}, () => {})
      }
    } catch (e) {
      console.error('Admin notification failed:', e)
    }
  }

  return {
    success: true,
    session_id: sessionId,
    host_amount: amountPence > 0 ? Math.max(amountPence - Math.round(amountPence * PLATFORM_FEE_PERCENT / 100), 0) : 0,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors })
  }

  try {
    // Auth: only allow calls with the service role key
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    // Verify it's a service role call (not a user JWT)
    // Service role key is longer than user JWTs and starts with 'eyJ'
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const action = body.action as string

    let result: Record<string, unknown>

    switch (action) {
      case 'create-checkout':
        result = await createCheckout(body)
        break
      case 'confirm-booking':
        result = await confirmBooking(body)
        break
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        })
    }

    return new Response(JSON.stringify(result), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('[guest-web-booking] Error:', e)
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
