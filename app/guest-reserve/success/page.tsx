import Link from "next/link";
import { cookies, headers } from "next/headers";
import { Wordmark } from "@/components/brand/Wordmark";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { buildGuestTicketEmail } from "@/lib/guest-ticket-email";
import { buildGuestFollowupEmail } from "@/lib/guest-followup-email";
import { sendPurchaseToMeta } from "@/lib/meta-capi";
import { Resend } from "resend";
import {
  formatEventDate,
  formatEventTime,
  formatPrice,
  getEventById,
} from "@/lib/events";
import { BookingConfirmedTracking } from "@/components/tracking/BookingConfirmedTracking";

export const metadata = {
  title: "Spot Reserved! | Fittrybe",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * After Stripe payment: book guest into session, send email.
 * Uses existing app tables (session_guests, payments, sessions).
 */
async function confirmPaidGuest(
  sessionId: string,
  guestName: string,
  guestEmail: string,
  avatarSeed: string,
  trackingParams?: { clientIp?: string; userAgent?: string; fbp?: string; fbc?: string },
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) return;

  // Call edge function to handle booking (spots, session_guests, payment, wallet)
  await fetch(`${supabaseUrl}/functions/v1/guest-web-booking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      action: "confirm-booking",
      session_id: sessionId,
      guest_name: guestName,
      guest_email: guestEmail,
      amount_pence: 0, // will be filled by edge function from session data
    }),
  }).catch((e) => console.error("[guest-reserve/success] Edge function error:", e));

  // Fetch session for email
  const admin = getSupabaseAdmin();
  const { data: session } = await admin
    .from("sessions")
    .select("title, sport_id, starts_at, place_name, location_area, join_price_pence")
    .eq("id", sessionId)
    .single();

  if (!session) return;

  // Server-side Purchase event for Meta CAPI
  const pricePounds = (session.join_price_pence ?? 0) / 100;
  const bookingId = `${sessionId}_${guestEmail}`;
  const nameParts = guestName.split(" ");
  await sendPurchaseToMeta({
    bookingId,
    sessionId,
    sessionName: session.title,
    amountPaid: pricePounds,
    email: guestEmail,
    firstName: nameParts[0] || guestName,
    lastName: nameParts.slice(1).join(" ") || undefined,
    clientIp: trackingParams?.clientIp,
    userAgent: trackingParams?.userAgent,
    fbp: trackingParams?.fbp,
    fbc: trackingParams?.fbc,
  }).catch((err) => console.error("[guest-reserve/success] Meta CAPI Purchase failed:", err));

  // Send ticket email + follow-up + add to audience
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const resend = new Resend(resendKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || "FitTrybe <hello@fittrybe.co.uk>";
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  const ticketData = {
    guestName,
    guestEmail,
    reservationId: sessionId,
    avatarSeed,
    sessionTitle: session.title,
    sportId: session.sport_id ?? "",
    date: formatEventDate(session.starts_at),
    time: formatEventTime(session.starts_at),
    location: session.place_name || session.location_area,
    locationArea: session.location_area,
    price: formatPrice(session.join_price_pence ?? 0),
  };

  // Ticket email
  try {
    const { subject, html } = buildGuestTicketEmail(ticketData);
    await resend.emails.send({ from: fromEmail, to: [guestEmail], subject, html, replyTo: "hello@fittrybe.co.uk" });
  } catch (e) {
    console.error("[guest-reserve/success] Ticket email failed:", e);
  }

  // Follow-up email (2 hours later)
  try {
    const followup = buildGuestFollowupEmail({ guestName, guestEmail, sportId: session.sport_id ?? "", sessionTitle: session.title });
    await resend.emails.send({
      from: fromEmail, to: [guestEmail], subject: followup.subject, html: followup.html,
      replyTo: "francis@fittrybe.co.uk", scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    });
  } catch (e) {
    console.error("[guest-reserve/success] Follow-up failed:", e);
  }

  // Add to audience
  if (audienceId) {
    try {
      const nameParts = guestName.split(" ");
      await resend.contacts.create({
        audienceId, email: guestEmail,
        firstName: nameParts[0] || guestName,
        lastName: nameParts.slice(1).join(" ") || undefined,
        unsubscribed: false,
      });
    } catch (e) {
      console.error("[guest-reserve/success] Audience failed:", e);
    }
  }
}

export default async function GuestReserveSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; name?: string; email?: string; avatar?: string; fbp?: string; fbc?: string }>;
}) {
  const { session_id, name, email, avatar, fbp: qsFbp, fbc: qsFbc } = await searchParams;

  // Capture tracking context from the incoming request
  const cookieStore = await cookies();
  const headerStore = await headers();
  const trackingParams = {
    clientIp: headerStore.get("x-forwarded-for")?.split(",")[0].trim() || headerStore.get("x-real-ip") || undefined,
    userAgent: headerStore.get("user-agent") || undefined,
    fbp: cookieStore.get("_fbp")?.value || qsFbp,
    fbc: cookieStore.get("_fbc")?.value || qsFbc,
  };

  // For paid sessions — confirm booking via edge function + send emails
  if (session_id && name && email) {
    await confirmPaidGuest(session_id, name, email, avatar || session_id.slice(0, 12), trackingParams);
  }

  const event = session_id ? await getEventById(session_id) : null;
  const bookingId = session_id && email ? `${session_id}_${email}` : undefined;
  const amountPaid = event ? (event.joinPricePence ?? 0) / 100 : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      {bookingId && event && (
        <BookingConfirmedTracking
          bookingId={bookingId}
          sessionId={event.id}
          sessionName={event.title}
          amountPaid={amountPaid}
        />
      )}

      <Link href="/" style={{ marginBottom: 40 }}>
        <Wordmark height={28} />
      </Link>

      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: "rgba(182,255,0,0.1)", border: "1px solid rgba(182,255,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2.5rem", margin: "0 auto 24px",
        }}>
          🎉
        </div>

        <h1 style={{
          fontFamily: "var(--font-anton)", fontSize: "2.5rem",
          textTransform: "uppercase", letterSpacing: "-0.02em",
          color: "#fff", marginBottom: 12,
        }}>
          You&apos;re In!
        </h1>

        <p style={{
          color: "rgba(255,255,255,0.5)", fontSize: "0.95rem",
          fontFamily: "var(--font-inter-tight)", lineHeight: 1.7, marginBottom: 8,
        }}>
          Your spot{event ? ` for ${event.title}` : ""} has been reserved.
        </p>
        <p style={{
          color: "rgba(255,255,255,0.35)", fontSize: "0.85rem",
          fontFamily: "var(--font-inter-tight)", marginBottom: 32,
        }}>
          Check your email for your ticket with all the details.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {session_id && (
            <Link href={`/events/${session_id}`} className="btn-primary" style={{ textAlign: "center" }}>
              View Session
            </Link>
          )}
          <Link href="/events" className="btn-secondary" style={{ textAlign: "center" }}>
            Browse More Sessions
          </Link>
        </div>
      </div>
    </div>
  );
}
