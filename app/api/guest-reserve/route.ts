/**
 * POST /api/guest-reserve
 *
 * Creates a guest reservation for a session. No auth required — just name + email.
 *
 * For paid sessions: calls the Supabase Edge Function (which has Stripe keys)
 *   to create a Checkout Session and returns the redirect URL.
 * For free sessions: confirms the reservation immediately.
 *
 * No Stripe keys needed on Vercel — all payments go through Supabase.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { buildGuestTicketEmail, type GuestTicketData } from "@/lib/guest-ticket-email";
import { buildGuestFollowupEmail } from "@/lib/guest-followup-email";
import { Resend } from "resend";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSiteUrl(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("host");
  return host ? `${proto}://${host}` : "https://fittrybe.co.uk";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatPrice(pence: number): string {
  if (pence === 0) return "Free";
  return `£${(pence / 100).toFixed(2)}`;
}

/** Send confirmation ticket email + add guest to Resend audience (non-blocking). */
async function sendConfirmationAndAddToAudience(
  ticketData: GuestTicketData,
) {
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "FitTrybe <hello@fittrybe.co.uk>";
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!resendKey) {
    console.warn("[guest-reserve] RESEND_API_KEY not set — skipping email");
    return;
  }

  const resend = new Resend(resendKey);
  const { subject, html } = buildGuestTicketEmail(ticketData);

  // Send the ticket email
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [ticketData.guestEmail],
      subject,
      html,
      replyTo: "hello@fittrybe.co.uk",
    });
    if (error) {
      console.error("[guest-reserve] Email send error:", error);
    } else {
      console.log(`[guest-reserve] Ticket email sent to ${ticketData.guestEmail} (${data?.id})`);
    }
  } catch (e) {
    console.error("[guest-reserve] Email send failed:", e);
  }

  // Add to Resend audience (mailing list)
  if (audienceId) {
    try {
      const nameParts = ticketData.guestName.split(" ");
      await resend.contacts.create({
        audienceId,
        email: ticketData.guestEmail,
        firstName: nameParts[0] || ticketData.guestName,
        lastName: nameParts.slice(1).join(" ") || undefined,
        unsubscribed: false,
      });
      console.log(`[guest-reserve] Added ${ticketData.guestEmail} to audience`);
    } catch (e) {
      console.error("[guest-reserve] Audience add failed:", e);
    }
  }

  // Schedule the "download app, next session free" follow-up email (2 hours later)
  try {
    const followup = buildGuestFollowupEmail({
      guestName: ticketData.guestName,
      guestEmail: ticketData.guestEmail,
      sportId: ticketData.sportId,
      sessionTitle: ticketData.sessionTitle,
    });

    const sendAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now

    await resend.emails.send({
      from: fromEmail,
      to: [ticketData.guestEmail],
      subject: followup.subject,
      html: followup.html,
      replyTo: "francis@fittrybe.co.uk",
      scheduledAt: sendAt,
    });
    console.log(`[guest-reserve] Follow-up email scheduled for ${ticketData.guestEmail} at ${sendAt}`);
  } catch (e) {
    console.error("[guest-reserve] Follow-up schedule failed:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, name, email } = body as {
      sessionId?: string;
      name?: string;
      email?: string;
    };

    // Validate inputs
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Session ID is required." }, { status: 400 });
    }
    if (!name || typeof name !== "string" || name.trim().length < 1) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Fetch session to check availability and price
    const { data: session, error: sessionError } = await admin
      .from("sessions")
      .select("id, title, sport_id, spots_left, join_price_pence, is_cancelled, starts_at, location_area, place_name")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    if (session.is_cancelled) {
      return NextResponse.json({ error: "This session has been cancelled." }, { status: 400 });
    }

    if (session.spots_left <= 0) {
      return NextResponse.json({ error: "This session is full." }, { status: 400 });
    }

    if (new Date(session.starts_at) < new Date()) {
      return NextResponse.json({ error: "This session has already started." }, { status: 400 });
    }

    const avatarSeed = crypto
      .createHash("md5")
      .update(email.trim().toLowerCase())
      .digest("hex")
      .slice(0, 12);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const pricePence = session.join_price_pence ?? 0;

    // Create the guest reservation
    const { data: reservation, error: insertError } = await admin
      .from("guest_reservations")
      .insert({
        session_id: sessionId,
        name: trimmedName,
        email: trimmedEmail,
        avatar_seed: avatarSeed,
        status: pricePence > 0 ? "pending" : "confirmed",
      })
      .select("id")
      .single();

    if (insertError || !reservation) {
      console.error("[guest-reserve] insert error:", insertError);
      return NextResponse.json({ error: "Could not create reservation." }, { status: 500 });
    }

    if (pricePence > 0) {
      // Paid session — call Supabase Edge Function to create Stripe Checkout
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceKey) {
        return NextResponse.json({ error: "Payment service not configured." }, { status: 500 });
      }

      const siteUrl = getSiteUrl(req);

      const stripeRes = await fetch(`${supabaseUrl}/functions/v1/guest-web-booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          action: "create-checkout",
          session_id: sessionId,
          amount_pence: pricePence,
          guest_reservation_id: reservation.id,
          guest_email: trimmedEmail,
          session_title: session.title,
          session_location: session.place_name || session.location_area,
          success_url: `${siteUrl}/guest-reserve/success?session_id=${sessionId}&reservation_id=${reservation.id}&name=${encodeURIComponent(trimmedName)}&email=${encodeURIComponent(trimmedEmail)}`,
          cancel_url: `${siteUrl}/events/${sessionId}?cancelled=1`,
        }),
      });

      const stripeData = await stripeRes.json();

      if (!stripeRes.ok || stripeData.error) {
        console.error("[guest-reserve] edge function error:", stripeData);
        // Clean up the pending reservation
        await admin.from("guest_reservations").delete().eq("id", reservation.id);
        return NextResponse.json(
          { error: stripeData.error || "Payment service error." },
          { status: 502 },
        );
      }

      // Save the Stripe session ID
      if (stripeData.checkout_session_id) {
        await admin
          .from("guest_reservations")
          .update({ stripe_session_id: stripeData.checkout_session_id })
          .eq("id", reservation.id);
      }

      return NextResponse.json({ url: stripeData.url }, { status: 200 });
    } else {
      // Free session — update spots
      const { data: current } = await admin
        .from("sessions")
        .select("spots_left, participants_count")
        .eq("id", sessionId)
        .single();

      if (current) {
        await admin
          .from("sessions")
          .update({
            spots_left: Math.max(0, (current.spots_left ?? 0) - 1),
            participants_count: (current.participants_count ?? 0) + 1,
          })
          .eq("id", sessionId);
      }

      // Send confirmation email + add to audience (non-blocking)
      sendConfirmationAndAddToAudience({
        guestName: trimmedName,
        guestEmail: trimmedEmail,
        reservationId: reservation.id,
        avatarSeed: avatarSeed,
        sessionTitle: session.title,
        sportId: session.sport_id ?? "",
        date: formatDate(session.starts_at),
        time: formatTime(session.starts_at),
        location: session.place_name || session.location_area,
        locationArea: session.location_area,
        price: formatPrice(pricePence),
      }).catch(() => {});

      return NextResponse.json({ success: true }, { status: 200 });
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong. Please try again.";
    console.error("[guest-reserve] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
