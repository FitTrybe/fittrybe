/**
 * Generates a beautiful ticket confirmation email for guest reservations.
 * Includes a barcode-style visual using the reservation ID.
 */

// ── Barcode Generator ────────────────────────────────────────────────────────
// Creates a Code128-style barcode visual using HTML table cells.
// Each character in the code maps to a pattern of thin/thick bars.

function generateBarcodeHtml(code: string): string {
  // Simple pattern: each hex char maps to a bar pattern
  const patterns: Record<string, string> = {
    "0": "1101", "1": "1110", "2": "0111", "3": "1011",
    "4": "0110", "5": "1001", "6": "0011", "7": "1100",
    "8": "0101", "9": "1010", a: "1110", b: "0111",
    c: "1011", d: "1101", e: "0110", f: "1001",
    "-": "0101",
  };

  let bars = "";
  // Start guard
  bars += '<td style="width:3px;background:#B6FF3B;height:48px;"></td>';
  bars += '<td style="width:1px;background:#000;height:48px;"></td>';
  bars += '<td style="width:1px;background:#B6FF3B;height:48px;"></td>';
  bars += '<td style="width:2px;background:#000;height:48px;"></td>';

  for (const char of code.slice(0, 16).toLowerCase()) {
    const pattern = patterns[char] || "1010";
    for (const bit of pattern) {
      const width = bit === "1" ? 2 : 1;
      const color = bars.split("</td>").length % 2 === 0 ? "#B6FF3B" : "#333";
      bars += `<td style="width:${width}px;background:${color};height:48px;"></td>`;
    }
    bars += '<td style="width:1px;background:#000;height:48px;"></td>';
  }

  // End guard
  bars += '<td style="width:1px;background:#B6FF3B;height:48px;"></td>';
  bars += '<td style="width:3px;background:#000;height:48px;"></td>';
  bars += '<td style="width:1px;background:#B6FF3B;height:48px;"></td>';

  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr>${bars}</tr></table>`;
}

// ── Sport Emoji ──────────────────────────────────────────────────────────────

const SPORT_EMOJI: Record<string, string> = {
  football: "⚽", basketball: "🏀", cycling: "🚴", running: "🏃",
  badminton: "🏸", tennis: "🎾", gym: "🏋️", swimming: "🏊",
};

// ── Email Builder ────────────────────────────────────────────────────────────

export interface GuestTicketData {
  guestName: string;
  guestEmail: string;
  reservationId: string;
  avatarSeed: string;  // used to generate multiavatar URL
  sessionTitle: string;
  sportId: string;
  date: string;       // formatted date string
  time: string;       // formatted time string
  location: string;
  locationArea: string;
  price: string;      // formatted price e.g. "Free" or "£5.00"
}

export function buildGuestTicketEmail(data: GuestTicketData): {
  subject: string;
  html: string;
} {
  const emoji = SPORT_EMOJI[data.sportId?.toLowerCase()] || "🏅";
  const ticketCode = data.reservationId.slice(0, 8).toUpperCase();
  const barcode = generateBarcodeHtml(data.reservationId);
  const avatarUrl = `https://api.dicebear.com/7.x/fun-emoji/png?seed=${encodeURIComponent(data.avatarSeed)}&size=128`;

  const subject = `Your spot is confirmed — ${data.sessionTitle}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="color-scheme" content="dark only"/>
<meta name="supported-color-schemes" content="dark only"/>
<title>${subject}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body,html{background:#000!important;font-family:'Inter',Arial,sans-serif;color:#fff;-webkit-font-smoothing:antialiased;}
  :root{color-scheme:dark;}
  a{color:#B6FF3B;text-decoration:none;}
</style>
</head>
<body style="background:#000;margin:0;padding:0;" bgcolor="#000000">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background:#000;">
<tr><td align="center" style="padding:32px 16px 48px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">

    <!-- Header -->
    <tr><td style="padding:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td>
          <span style="font-size:24px;font-weight:900;letter-spacing:-1px;">
            <span style="color:#fff;">fittry</span><span style="color:#B6FF3B;">be</span>
          </span>
        </td>
        <td align="right">
          <span style="background:#111;border:1px solid #222;border-radius:99px;padding:5px 14px;font-size:11px;font-weight:600;color:#B6FF3B;letter-spacing:0.5px;">
            ${emoji} CONFIRMED
          </span>
        </td>
      </tr></table>
    </td></tr>

    <!-- Greeting with avatar -->
    <tr><td style="padding:0 0 28px;">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle;padding-right:16px;">
          <img src="${avatarUrl}" alt="${data.guestName}" width="56" height="56"
            style="width:56px;height:56px;border-radius:50%;border:3px solid #B6FF3B;display:block;" />
        </td>
        <td style="vertical-align:middle;">
          <p style="font-size:22px;font-weight:800;color:#fff;margin-bottom:4px;">
            You're in, ${data.guestName.split(" ")[0]}! 🎉
          </p>
          <p style="font-size:13px;color:#888;line-height:1.5;">
            Your spot has been reserved. Show this ticket when you arrive.
          </p>
        </td>
      </tr></table>
    </td></tr>

    <!-- ═══ TICKET CARD ═══ -->
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#0A0A0A;border-radius:20px;border:1px solid #1A1A1A;overflow:hidden;">

        <!-- Green accent bar -->
        <tr><td style="background:linear-gradient(90deg,#B6FF3B,#8AC82C);height:4px;font-size:0;">&nbsp;</td></tr>

        <!-- Sport + Title -->
        <tr><td style="padding:28px 28px 0;">
          <div style="font-size:40px;margin-bottom:12px;">${emoji}</div>
          <p style="font-size:18px;font-weight:800;color:#fff;line-height:1.3;margin-bottom:4px;">
            ${data.sessionTitle}
          </p>
          <p style="font-size:12px;color:#555;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
            ${data.sportId}
          </p>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:20px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="border-bottom:1px dashed #222;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <!-- Details Grid -->
        <tr><td style="padding:0 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td width="50%" style="padding-bottom:20px;">
                <p style="font-size:10px;font-weight:600;color:#444;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Date</p>
                <p style="font-size:14px;font-weight:700;color:#fff;">${data.date}</p>
              </td>
              <td width="50%" style="padding-bottom:20px;">
                <p style="font-size:10px;font-weight:600;color:#444;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Time</p>
                <p style="font-size:14px;font-weight:700;color:#fff;">${data.time}</p>
              </td>
            </tr>
            <tr>
              <td width="50%" style="padding-bottom:20px;">
                <p style="font-size:10px;font-weight:600;color:#444;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Location</p>
                <p style="font-size:14px;font-weight:700;color:#fff;">${data.location}</p>
                <p style="font-size:11px;color:#555;margin-top:2px;">${data.locationArea}</p>
              </td>
              <td width="50%" style="padding-bottom:20px;">
                <p style="font-size:10px;font-weight:600;color:#444;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Entry</p>
                <p style="font-size:14px;font-weight:700;color:${data.price === "Free" ? "#B6FF3B" : "#fff"};">${data.price}</p>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-bottom:20px;">
                <p style="font-size:10px;font-weight:600;color:#444;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Guest</p>
                <table cellpadding="0" cellspacing="0" border="0"><tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="${avatarUrl}" alt="" width="36" height="36"
                      style="width:36px;height:36px;border-radius:50%;border:2px solid #B6FF3B;display:block;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="font-size:14px;font-weight:700;color:#fff;">${data.guestName}</p>
                    <p style="font-size:11px;color:#555;margin-top:1px;">${data.guestEmail}</p>
                  </td>
                </tr></table>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Tear line -->
        <tr><td style="padding:0 12px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="12" style="background:#000;border-radius:0 50% 50% 0;height:24px;">&nbsp;</td>
            <td style="border-bottom:2px dashed #1A1A1A;">&nbsp;</td>
            <td width="12" style="background:#000;border-radius:50% 0 0 50%;height:24px;">&nbsp;</td>
          </tr></table>
        </td></tr>

        <!-- Barcode Section -->
        <tr><td style="padding:20px 28px 28px;text-align:center;">
          ${barcode}
          <p style="font-size:13px;font-weight:800;color:#fff;letter-spacing:4px;margin-top:10px;font-family:'Courier New',monospace;">
            ${ticketCode}
          </p>
          <p style="font-size:10px;color:#333;margin-top:4px;">Reservation ID</p>
        </td></tr>

      </table>
    </td></tr>
    <!-- ═══ END TICKET ═══ -->

    <!-- What to know -->
    <tr><td style="padding:28px 0;">
      <p style="font-size:14px;font-weight:700;color:#fff;margin-bottom:14px;">Before you go:</p>
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        <tr><td style="padding:8px 0;vertical-align:top;">
          <span style="color:#B6FF3B;font-weight:700;margin-right:8px;">✓</span>
          <span style="color:#aaa;font-size:13px;">Arrive 5-10 mins early so you don't miss the start</span>
        </td></tr>
        <tr><td style="padding:8px 0;vertical-align:top;">
          <span style="color:#B6FF3B;font-weight:700;margin-right:8px;">✓</span>
          <span style="color:#aaa;font-size:13px;">Bring appropriate footwear and water</span>
        </td></tr>
        <tr><td style="padding:8px 0;vertical-align:top;">
          <span style="color:#B6FF3B;font-weight:700;margin-right:8px;">✓</span>
          <span style="color:#aaa;font-size:13px;">Everyone's friendly — don't worry about going solo</span>
        </td></tr>
      </table>
    </td></tr>

    <!-- CTA -->
    <tr><td style="padding:0 0 28px;text-align:center;">
      <a href="https://fittrybe.co.uk/events/${data.reservationId}"
        style="display:inline-block;padding:14px 36px;background:#B6FF3B;color:#000;font-weight:800;font-size:14px;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">
        View Session Details
      </a>
    </td></tr>

    <!-- Download app -->
    <tr><td style="padding:20px 0;border-top:1px solid #111;text-align:center;">
      <p style="font-size:12px;color:#555;margin-bottom:8px;">Want to join more sessions?</p>
      <a href="https://fittrybe.co.uk/download" style="color:#B6FF3B;font-size:13px;font-weight:600;">
        Download the FitTrybe app →
      </a>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:20px 0 0;border-top:1px solid #0D0D0D;">
      <p style="font-size:10px;color:#2A2A2A;line-height:1.7;">
        You're receiving this because you reserved a spot on
        <a href="https://fittrybe.co.uk" style="color:#333;">fittrybe.co.uk</a>.
        Questions? <a href="mailto:hello@fittrybe.co.uk" style="color:#333;">hello@fittrybe.co.uk</a>
      </p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html };
}
