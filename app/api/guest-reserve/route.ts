/**
 * POST /api/guest-reserve
 *
 * Creates a guest reservation using the app's existing tables:
 *   - session_guests (for the guest entry — visible on host dashboard)
 *   - payments (for paid sessions — after Stripe confirms)
 *   - sessions (decrement spots_left, increment participants_count)
 *
 * No new tables. No auth required — just name + email.
 *
 * For paid sessions: calls the Supabase Edge Function to create Stripe Checkout.
 * For free sessions: confirms immediately.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { buildGuestTicketEmail, type GuestTicketData } from "@/lib/guest-ticket-email";
import { buildGuestFollowupEmail } from "@/lib/guest-followup-email";
import { buildHostNotifyEmail } from "@/lib/guest-host-notify-email";
import { buildGuestReminderEmail } from "@/lib/guest-reminder-email";
import { Resend } from "resend";
import crypto from "crypto";
import { sendCompleteRegistrationToMeta, hashBookingId } from "@/lib/meta-capi";
import { encryptBookingToken } from "@/lib/booking-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The system guest user ID — all web guests are tied to this account
const GUEST_UID = "00000000-0000-0000-0000-000000000001";

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
    timeZone: "Europe/London",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" });
}

function formatPrice(pence: number): string {
  if (pence === 0) return "Free";
  return `£${(pence / 100).toFixed(2)}`;
}

/** Send all emails: ticket to guest, notification to host, schedule reminder + follow-up. */
async function sendAllEmails(
  ticketData: GuestTicketData,
  hostInfo: { hostName: string; hostEmail: string } | null,
  sessionStartsAt: string,
  spotsLeft: number,
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
      from: fromEmail, to: [ticketData.guestEmail], subject, html,
      replyTo: "hello@fittrybe.co.uk",
    });
    if (error) console.error("[guest-reserve] Email send error:", error);
    else console.log(`[guest-reserve] Ticket email sent to ${ticketData.guestEmail} (${data?.id})`);
  } catch (e) {
    console.error("[guest-reserve] Email send failed:", e);
  }

  // Add to Resend audience
  if (audienceId) {
    try {
      const nameParts = ticketData.guestName.split(" ");
      await resend.contacts.create({
        audienceId, email: ticketData.guestEmail,
        firstName: nameParts[0] || ticketData.guestName,
        lastName: nameParts.slice(1).join(" ") || undefined,
        unsubscribed: false,
      });
    } catch (e) {
      console.error("[guest-reserve] Audience add failed:", e);
    }
  }

  // Schedule follow-up "download app, next session free" email (2 hours after booking)
  try {
    const followup = buildGuestFollowupEmail({
      guestName: ticketData.guestName, guestEmail: ticketData.guestEmail,
      sportId: ticketData.sportId, sessionTitle: ticketData.sessionTitle,
    });
    const followupAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    await resend.emails.send({
      from: fromEmail, to: [ticketData.guestEmail],
      subject: followup.subject, html: followup.html,
      replyTo: "francis@fittrybe.co.uk", scheduledAt: followupAt,
    });
    console.log(`[guest-reserve] Follow-up scheduled for ${ticketData.guestEmail}`);
  } catch (e) {
    console.error("[guest-reserve] Follow-up schedule failed:", e);
  }

  // Send notification to session host
  if (hostInfo?.hostEmail) {
    try {
      const hostEmail = buildHostNotifyEmail({
        hostName: hostInfo.hostName,
        hostEmail: hostInfo.hostEmail,
        guestName: ticketData.guestName,
        guestEmail: ticketData.guestEmail,
        sessionTitle: ticketData.sessionTitle,
        sportId: ticketData.sportId,
        date: ticketData.date,
        time: ticketData.time,
        location: ticketData.location,
        price: ticketData.price,
        spotsLeft,
      });
      await resend.emails.send({
        from: fromEmail, to: [hostInfo.hostEmail],
        subject: hostEmail.subject, html: hostEmail.html,
        replyTo: "hello@fittrybe.co.uk",
      });
      console.log(`[guest-reserve] Host notified: ${hostInfo.hostEmail}`);
    } catch (e) {
      console.error("[guest-reserve] Host notify failed:", e);
    }
  }

  // Schedule reminder email 2 hours before session starts
  try {
    const sessionStart = new Date(sessionStartsAt).getTime();
    const reminderTime = sessionStart - 2 * 60 * 60 * 1000; // 2 hours before

    // Only schedule if the session is more than 2 hours away
    if (reminderTime > Date.now()) {
      const reminder = buildGuestReminderEmail({
        guestName: ticketData.guestName,
        guestEmail: ticketData.guestEmail,
        sessionTitle: ticketData.sessionTitle,
        sportId: ticketData.sportId,
        date: ticketData.date,
        time: ticketData.time,
        location: ticketData.location,
        locationArea: ticketData.locationArea,
        sessionId: ticketData.reservationId,
      });
      await resend.emails.send({
        from: fromEmail, to: [ticketData.guestEmail],
        subject: reminder.subject, html: reminder.html,
        replyTo: "hello@fittrybe.co.uk",
        scheduledAt: new Date(reminderTime).toISOString(),
      });
      console.log(`[guest-reserve] Reminder scheduled for ${ticketData.guestEmail} at ${new Date(reminderTime).toISOString()}`);
    }
  } catch (e) {
    console.error("[guest-reserve] Reminder schedule failed:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, name, email, fbp, fbc } = body as {
      sessionId?: string;
      name?: string;
      email?: string;
      fbp?: string;
      fbc?: string;
    };

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
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Fetch session
    const { data: session, error: sessionError } = await admin
      .from("sessions")
      .select("id, title, sport_id, spots_left, participants_count, join_price_pence, is_cancelled, starts_at, location_area, place_name, host_id")
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

    // Check for duplicate — same email already booked this session
    const { data: existingGuest } = await admin
      .from("session_guests")
      .select("id")
      .eq("session_id", sessionId)
      .like("guest_label", `%${trimmedEmail}%`)
      .maybeSingle();

    if (existingGuest) {
      return NextResponse.json({ error: "You've already reserved a spot for this session." }, { status: 400 });
    }

    // Avatar seed
    const avatarSeed = crypto
      .createHash("md5")
      .update(trimmedEmail)
      .digest("hex")
      .slice(0, 12);

    const pricePence = session.join_price_pence ?? 0;
    const guestLabel = `${trimmedName} (${trimmedEmail})`;

    if (pricePence > 0) {
      // ── PAID SESSION: create Stripe Checkout via Edge Function ──
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceKey) {
        return NextResponse.json({ error: "Payment service not configured." }, { status: 500 });
      }

      const siteUrl = getSiteUrl(req);

      // Encrypt guest PII into an opaque token so the success URL (which Meta
      // records in PageView) never carries plaintext name or email.
      const bookingToken = encryptBookingToken({ name: trimmedName, email: trimmedEmail });

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
          guest_name: trimmedName,
          guest_email: trimmedEmail,
          guest_label: guestLabel,
          avatar_seed: avatarSeed,
          session_title: session.title,
          session_location: session.place_name || session.location_area,
          success_url: `${siteUrl}/guest-reserve/success?session_id=${sessionId}&avatar=${avatarSeed}&t=${encodeURIComponent(bookingToken)}&cs={CHECKOUT_SESSION_ID}`,
          cancel_url: `${siteUrl}/events/${sessionId}?cancelled=1`,
        }),
      });

      const stripeData = await stripeRes.json();

      if (!stripeRes.ok || stripeData.error) {
        console.error("[guest-reserve] edge function error:", stripeData);
        return NextResponse.json(
          { error: stripeData.error || "Payment service error." },
          { status: 502 },
        );
      }

      return NextResponse.json({ url: stripeData.url }, { status: 200 });

    } else {
      // ── FREE SESSION: book directly using app's existing tables ──

      // 1. Add to session_guests
      const { error: guestError } = await admin.from("session_guests").insert({
        session_id: sessionId,
        invited_by: GUEST_UID,
        guest_label: guestLabel,
        status: "approved",
      });

      if (guestError) {
        console.error("[guest-reserve] session_guests insert error:", guestError);
        return NextResponse.json({ error: "Could not create reservation." }, { status: 500 });
      }

      // 2. Add to event_participants (keeps app counts in sync)
      await admin.from("event_participants").insert({
        session_id: sessionId,
        user_id: GUEST_UID,
        status: "approved",
        payment_status: "free",
        role: "player",
      }).then(() => {}, (e: unknown) => console.error("[guest-reserve] event_participants insert:", e));

      // 3. Decrement spots_left, increment participants_count
      await admin
        .from("sessions")
        .update({
          spots_left: Math.max(0, session.spots_left - 1),
          participants_count: (session.participants_count ?? 0) + 1,
        })
        .eq("id", sessionId);

      // 4. Fetch host profile for notification email
      let hostInfo: { hostName: string; hostEmail: string } | null = null;
      if (session.host_id) {
        const { data: hostProfile } = await admin
          .from("profiles")
          .select("full_name, display_name, email")
          .eq("id", session.host_id)
          .maybeSingle();
        if (hostProfile?.email) {
          hostInfo = {
            hostName: hostProfile.display_name || hostProfile.full_name || "Host",
            hostEmail: hostProfile.email,
          };
        }
      }

      // 5. Server-side CompleteRegistration for Meta CAPI (free sessions — not Purchase)
      const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || undefined;
      const userAgent = req.headers.get("user-agent") || undefined;
      const bookingId = hashBookingId(sessionId, trimmedEmail);
      sendCompleteRegistrationToMeta({
        bookingId,
        sessionId,
        sessionName: session.title,
        value: 0,
        email: trimmedEmail,
        firstName: trimmedName.split(" ")[0] || trimmedName,
        lastName: trimmedName.split(" ").slice(1).join(" ") || undefined,
        clientIp,
        userAgent,
        fbp: fbp || req.cookies.get("_fbp")?.value,
        fbc: fbc || req.cookies.get("_fbc")?.value,
      }).catch((err) => console.error("[guest-reserve] Meta CAPI CompleteRegistration failed:", err));

      // 6. Send all emails (ticket, host notify, reminder, follow-up) — non-blocking
      sendAllEmails(
        {
          guestName: trimmedName,
          guestEmail: trimmedEmail,
          reservationId: sessionId,
          avatarSeed,
          sessionTitle: session.title,
          sportId: session.sport_id ?? "",
          date: formatDate(session.starts_at),
          time: formatTime(session.starts_at),
          location: session.place_name || session.location_area,
          locationArea: session.location_area,
          price: formatPrice(pricePence),
        },
        hostInfo,
        session.starts_at,
        Math.max(0, session.spots_left - 1),
      ).catch(() => {});

      return NextResponse.json({ success: true, bookingId }, { status: 200 });
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong. Please try again.";
    console.error("[guest-reserve] error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
