/**
 * ─── POST /api/support ────────────────────────────────────────────────────────
 *
 * 1. Validates payload (name, email, subject, message; optional category)
 * 2. Sends the support request via Resend to the internal support inboxes
 * 3. Sends a branded acknowledgement email back to the user
 *
 * Required env vars:
 *   RESEND_API_KEY     — from resend.com dashboard
 *   RESEND_FROM_EMAIL  — e.g. "Fittrybe <hello@fittrybe.co.uk>" (must be a verified domain)
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const SUPPORT_RECIPIENTS = [
  "ekechukwuemeka25@gmail.com",
  "frankojarkarta@gmail.com",
];

const ALLOWED_CATEGORIES = [
  "general",
  "account",
  "billing",
  "bug",
  "host",
  "partnership",
  "other",
] as const;
type Category = (typeof ALLOWED_CATEGORIES)[number];

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY is not set; skipping support emails.");
    return null;
  }
  return new Resend(apiKey);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function categoryLabel(category: Category): string {
  switch (category) {
    case "general":      return "General Enquiry";
    case "account":      return "Account & Login";
    case "billing":      return "Billing & Payments";
    case "bug":          return "Bug Report";
    case "host":         return "Host / Organiser";
    case "partnership":  return "Partnership / Press";
    case "other":        return "Other";
  }
}

function buildInternalEmailHtml(params: {
  name: string;
  email: string;
  subject: string;
  category: Category;
  message: string;
  meta: { userAgent: string; ip: string; referer: string; submittedAt: string };
}): string {
  const { name, email, subject, category, message, meta } = params;
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New support request — ${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:'Inter Tight',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">

          <tr>
            <td style="background:#B6FF00;padding:6px 32px;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#0D0D0D;">
                New Support Request
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4B5563;">
                ${escapeHtml(categoryLabel(category))}
              </p>
              <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.01em;line-height:1.25;color:#fff;">
                ${escapeHtml(subject)}
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#6B7280;width:120px;">From</td>
                  <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:14px;color:#fff;">${escapeHtml(name)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#6B7280;">Email</td>
                  <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:14px;color:#fff;">
                    <a href="mailto:${escapeHtml(email)}" style="color:#B6FF00;text-decoration:none;">${escapeHtml(email)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#6B7280;">Category</td>
                  <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:14px;color:#fff;">${escapeHtml(categoryLabel(category))}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#6B7280;">Submitted</td>
                  <td style="padding:10px 0;border-top:1px solid rgba(255,255,255,0.06);font-size:14px;color:#fff;">${escapeHtml(meta.submittedAt)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4B5563;">
                Message
              </p>
              <div style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:18px;font-size:14px;line-height:1.6;color:#E5E7EB;white-space:pre-wrap;">
                ${safeMessage}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4B5563;">
                Diagnostic
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:4px 0;font-size:12px;color:#6B7280;width:120px;">IP</td><td style="padding:4px 0;font-size:12px;color:#9CA3AF;">${escapeHtml(meta.ip || "—")}</td></tr>
                <tr><td style="padding:4px 0;font-size:12px;color:#6B7280;">User Agent</td><td style="padding:4px 0;font-size:12px;color:#9CA3AF;word-break:break-all;">${escapeHtml(meta.userAgent || "—")}</td></tr>
                <tr><td style="padding:4px 0;font-size:12px;color:#6B7280;">Referer</td><td style="padding:4px 0;font-size:12px;color:#9CA3AF;word-break:break-all;">${escapeHtml(meta.referer || "—")}</td></tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildAckEmailHtml(name: string, subject: string, message: string): string {
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We got your message</title>
</head>
<body style="margin:0;padding:0;background:#0D0D0D;font-family:'Inter Tight',Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0D0D;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">

          <tr>
            <td style="background:#B6FF00;padding:6px 32px;">
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#0D0D0D;">
                Message Received
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 0;text-align:center;">
              <p style="margin:0 0 24px;line-height:1;font-size:32px;font-weight:800;letter-spacing:-0.01em;font-family:Arial,Helvetica,sans-serif;">
                <span style="color:#ffffff;">fitTry</span><span style="color:#B6FF00;font-weight:900;">be</span>
              </p>
              <h1 style="margin:0 0 12px;font-size:30px;font-weight:900;letter-spacing:-0.02em;text-transform:uppercase;line-height:1.1;color:#fff;">
                Thanks, ${escapeHtml(name.split(" ")[0])}!
              </h1>
              <p style="margin:0;font-size:15px;color:#6B7280;line-height:1.7;">
                We've got your message and our team will get back to you<br/>as soon as we can — usually within 1–2 business days.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#4B5563;">
                Your message
              </p>
              <p style="margin:0 0 12px;font-size:13px;color:#9CA3AF;">
                <strong style="color:#fff;">Subject:</strong> ${escapeHtml(subject)}
              </p>
              <div style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px;font-size:14px;line-height:1.6;color:#E5E7EB;white-space:pre-wrap;">
                ${safeMessage}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <a href="https://fittrybe.co.uk" style="display:inline-block;background:#B6FF00;color:#0D0D0D;font-size:14px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:8px;">
                Back to Fittrybe →
              </a>
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid rgba(255,255,255,0.06);padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#374151;">
                You received this because you contacted Fittrybe support.
              </p>
              <p style="margin:0;font-size:12px;color:#374151;">
                © ${new Date().getFullYear()} Fittrybe. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      subject,
      message,
      category,
    } = body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      category?: string;
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!email?.trim() || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!subject?.trim()) {
      return NextResponse.json({ error: "Please enter a subject." }, { status: 400 });
    }
    if (!message?.trim() || message.trim().length < 10) {
      return NextResponse.json({ error: "Please give us a bit more detail (at least 10 characters)." }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: "Your message is too long — please keep it under 5000 characters." }, { status: 400 });
    }

    const safeCategory: Category =
      ALLOWED_CATEGORIES.includes((category ?? "") as Category)
        ? (category as Category)
        : "general";

    const cleanName    = name.trim();
    const cleanEmail   = email.toLowerCase().trim();
    const cleanSubject = subject.trim().slice(0, 200);
    const cleanMessage = message.trim();

    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json(
        { error: "Email service is not configured. Please try again later." },
        { status: 503 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "Fittrybe <onboarding@resend.dev>";
    const userAgent = req.headers.get("user-agent") ?? "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "";
    const referer = req.headers.get("referer") ?? "";
    const submittedAt = new Date().toUTCString();

    const internalHtml = buildInternalEmailHtml({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      category: safeCategory,
      message: cleanMessage,
      meta: { userAgent, ip, referer, submittedAt },
    });

    const internalSubject = `[Support · ${categoryLabel(safeCategory)}] ${cleanSubject}`;

    const { data: internalRes, error: internalErr } = await resend.emails.send({
      from: fromEmail,
      to: SUPPORT_RECIPIENTS,
      replyTo: cleanEmail,
      subject: internalSubject,
      html: internalHtml,
    });

    if (internalErr) {
      console.error("[Resend] Support email failed:", {
        from: fromEmail,
        to: SUPPORT_RECIPIENTS,
        error: internalErr,
      });
      const isDev = process.env.NODE_ENV !== "production";
      return NextResponse.json(
        {
          error: "We couldn't send your message right now. Please try again in a moment.",
          ...(isDev
            ? {
                debug: {
                  from: fromEmail,
                  to: SUPPORT_RECIPIENTS,
                  resendError: internalErr,
                  hint:
                    "If `from` is onboarding@resend.dev, Resend's sandbox only delivers to your own account email — set RESEND_FROM_EMAIL to a verified-domain sender (e.g. \"Fittrybe <hello@fittrybe.co.uk>\") in .env.local and restart `next dev`.",
                },
              }
            : {}),
        },
        { status: 502 }
      );
    }

    const { error: ackErr } = await resend.emails.send({
      from: fromEmail,
      to: cleanEmail,
      subject: `We got your message — ${cleanSubject}`,
      html: buildAckEmailHtml(cleanName, cleanSubject, cleanMessage),
    });

    if (ackErr) {
      console.warn("[Resend] Acknowledgement email failed (non-fatal):", ackErr);
    }

    return NextResponse.json({ success: true, id: internalRes?.id }, { status: 200 });
  } catch (err) {
    console.error("[/api/support] Unexpected error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
