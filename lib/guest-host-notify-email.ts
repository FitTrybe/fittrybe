/**
 * Email sent to the session host when a web guest reserves a spot.
 */

export interface HostNotifyData {
  hostName: string;
  hostEmail: string;
  guestName: string;
  guestEmail: string;
  sessionTitle: string;
  sportId: string;
  date: string;
  time: string;
  location: string;
  price: string;
  spotsLeft: number;
}

const SPORT_EMOJI: Record<string, string> = {
  football: "⚽", basketball: "🏀", cycling: "🚴", running: "🏃",
  badminton: "🏸", tennis: "🎾", gym: "🏋️", swimming: "🏊",
};

export function buildHostNotifyEmail(data: HostNotifyData): {
  subject: string;
  html: string;
} {
  const emoji = SPORT_EMOJI[data.sportId?.toLowerCase()] || "🏅";
  const firstName = data.hostName.split(" ")[0] || data.hostName;

  const subject = `New booking — ${data.guestName} joined ${data.sessionTitle}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta name="color-scheme" content="dark only"/>
<title>${subject}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body,html{background:#000!important;font-family:'Inter',Arial,sans-serif;color:#fff;}
  :root{color-scheme:dark;}
  a{color:#B6FF3B;text-decoration:none;}
</style>
</head>
<body style="background:#000;margin:0;padding:0;" bgcolor="#000000">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000">
<tr><td align="center" style="padding:32px 16px 48px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

    <!-- Header -->
    <tr><td style="padding:0 0 24px;">
      <span style="font-size:24px;font-weight:900;letter-spacing:-1px;">
        <span style="color:#fff;">fittry</span><span style="color:#B6FF3B;">be</span>
      </span>
    </td></tr>

    <!-- Card -->
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#0A0A0A;border-radius:20px;border:1px solid #1A1A1A;overflow:hidden;">

        <tr><td style="background:#B6FF3B;height:4px;font-size:0;">&nbsp;</td></tr>

        <tr><td style="padding:28px 28px 0;">
          <p style="font-size:16px;font-weight:700;color:#fff;margin-bottom:4px;">
            Hey ${firstName} 👋
          </p>
          <p style="font-size:14px;color:#888;line-height:1.6;margin-bottom:20px;">
            Someone just reserved a spot for your session from the website.
          </p>
        </td></tr>

        <tr><td style="padding:0 28px;"><div style="height:1px;background:#1A1A1A;"></div></td></tr>

        <!-- Booking details -->
        <tr><td style="padding:20px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:8px 0;">
                <span style="font-size:12px;color:#555;">Guest</span>
              </td>
              <td style="padding:8px 0;text-align:right;">
                <span style="font-size:14px;font-weight:700;color:#fff;">${data.guestName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="font-size:12px;color:#555;">Email</span>
              </td>
              <td style="padding:8px 0;text-align:right;">
                <a href="mailto:${data.guestEmail}" style="font-size:13px;color:#B6FF3B;">${data.guestEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="font-size:12px;color:#555;">Session</span>
              </td>
              <td style="padding:8px 0;text-align:right;">
                <span style="font-size:13px;color:#fff;">${emoji} ${data.sessionTitle}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="font-size:12px;color:#555;">When</span>
              </td>
              <td style="padding:8px 0;text-align:right;">
                <span style="font-size:13px;color:#fff;">${data.date} · ${data.time}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="font-size:12px;color:#555;">Entry</span>
              </td>
              <td style="padding:8px 0;text-align:right;">
                <span style="font-size:13px;font-weight:700;color:${data.price === "Free" ? "#B6FF3B" : "#fff"};">${data.price}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;">
                <span style="font-size:12px;color:#555;">Spots remaining</span>
              </td>
              <td style="padding:8px 0;text-align:right;">
                <span style="font-size:13px;font-weight:700;color:${data.spotsLeft <= 3 ? "#FB923C" : "#fff"};">${data.spotsLeft}</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 28px;"><div style="height:1px;background:#1A1A1A;"></div></td></tr>

        <tr><td style="padding:20px 28px;">
          <p style="font-size:12px;color:#555;line-height:1.6;">
            This guest booked via the FitTrybe website. They'll show up with their name —
            look out for <strong style="color:#fff;">${data.guestName}</strong> on the day.
          </p>
        </td></tr>

        <tr><td style="background:linear-gradient(90deg,#B6FF3B,#8AC82C);height:3px;font-size:0;">&nbsp;</td></tr>
      </table>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:20px 0 0;">
      <p style="font-size:10px;color:#2A2A2A;line-height:1.7;">
        You're receiving this because you host sessions on
        <a href="https://fittrybe.co.uk" style="color:#333;">FitTrybe</a>.
      </p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html };
}
