import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { buildGuestTicketEmail } from "@/lib/guest-ticket-email";
import { buildGuestFollowupEmail } from "@/lib/guest-followup-email";
import { Resend } from "resend";
import {
  formatEventDate,
  formatEventTime,
  formatPrice,
  getEventById,
} from "@/lib/events";

export const metadata = {
  title: "Spot Reserved! | Fittrybe",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Send the ticket email + add to audience for paid guests.
 * Called once on the success page load after Stripe redirects back.
 */
async function confirmPaidReservation(
  reservationId: string,
  sessionId: string,
  guestName?: string,
  guestEmail?: string,
) {
  const admin = getSupabaseAdmin();

  // Check if already confirmed (prevent duplicate emails on refresh)
  const { data: reservation } = await admin
    .from("guest_reservations")
    .select("id, name, email, avatar_seed, status, session_id")
    .eq("id", reservationId)
    .single();

  if (!reservation || reservation.status === "paid") return;

  const name = guestName || reservation.name;
  const email = guestEmail || reservation.email;

  // Call the edge function to handle booking (spots, session_guests, payment, wallet)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    const { data: session } = await admin
      .from("sessions")
      .select("join_price_pence")
      .eq("id", sessionId)
      .single();

    await fetch(`${supabaseUrl}/functions/v1/guest-web-booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        action: "confirm-booking",
        session_id: sessionId,
        guest_name: name,
        guest_email: email,
        amount_pence: session?.join_price_pence ?? 0,
        guest_reservation_id: reservationId,
      }),
    }).catch((e) => console.error("[guest-reserve/success] Edge function call failed:", e));
  }

  // Fetch session for email data
  const { data: session } = await admin
    .from("sessions")
    .select("title, sport_id, starts_at, place_name, location_area, join_price_pence")
    .eq("id", sessionId)
    .single();

  if (session) {

    // Send ticket email + add to audience
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "FitTrybe <hello@fittrybe.co.uk>";
      const audienceId = process.env.RESEND_AUDIENCE_ID;

      const ticketData = {
        guestName: name,
        guestEmail: email,
        reservationId: reservation.id,
        avatarSeed: reservation.avatar_seed || reservation.id.slice(0, 12),
        sessionTitle: session.title,
        sportId: session.sport_id ?? "",
        date: formatEventDate(session.starts_at),
        time: formatEventTime(session.starts_at),
        location: session.place_name || session.location_area,
        locationArea: session.location_area,
        price: formatPrice(session.join_price_pence ?? 0),
      };

      const { subject, html } = buildGuestTicketEmail(ticketData);

      try {
        await resend.emails.send({
          from: fromEmail,
          to: [reservation.email],
          subject,
          html,
          replyTo: "hello@fittrybe.co.uk",
        });
      } catch (e) {
        console.error("[guest-reserve/success] Email failed:", e);
      }

      // Add to audience
      if (audienceId) {
        try {
          const nameParts = name.split(" ");
          await resend.contacts.create({
            audienceId,
            email: email,
            firstName: nameParts[0] || name,
            lastName: nameParts.slice(1).join(" ") || undefined,
            unsubscribed: false,
          });
        } catch (e) {
          console.error("[guest-reserve/success] Audience add failed:", e);
        }
      }

      // Schedule follow-up "download app, next session free" email (2 hours later)
      try {
        const followup = buildGuestFollowupEmail({
          guestName: name,
          guestEmail: email,
          sportId: session.sport_id ?? "",
          sessionTitle: session.title,
        });
        const sendAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
        await resend.emails.send({
          from: fromEmail,
          to: [reservation.email],
          subject: followup.subject,
          html: followup.html,
          replyTo: "francis@fittrybe.co.uk",
          scheduledAt: sendAt,
        });
      } catch (e) {
        console.error("[guest-reserve/success] Follow-up schedule failed:", e);
      }
    }
  }
}

export default async function GuestReserveSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; reservation_id?: string; name?: string; email?: string }>;
}) {
  const { session_id, reservation_id, name: guestName, email: guestEmail } = await searchParams;

  // For paid sessions — confirm reservation via edge function, send email, update spots
  if (reservation_id && session_id) {
    await confirmPaidReservation(reservation_id, session_id, guestName, guestEmail);
  }

  // Fetch session for display
  const event = session_id ? await getEventById(session_id) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <Link href="/" style={{ marginBottom: 40 }}>
        <Wordmark height={28} />
      </Link>

      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        {/* Success animation */}
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
          fontFamily: "var(--font-inter-tight)", lineHeight: 1.7,
          marginBottom: 8,
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
