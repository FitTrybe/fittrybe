/**
 * Reminder email sent to the guest 2 hours before the session starts.
 */

export interface GuestReminderData {
  guestName: string;
  guestEmail: string;
  sessionTitle: string;
  sportId: string;
  date: string;
  time: string;
  location: string;
  locationArea: string;
  sessionId: string;
}

const SPORT_EMOJI: Record<string, string> = {
  football: "⚽", basketball: "🏀", cycling: "🚴", running: "🏃",
  badminton: "🏸", tennis: "🎾", gym: "🏋️", swimming: "🏊",
};

export function buildGuestReminderEmail(data: GuestReminderData): {
  subject: string;
  html: string;
} {
  const emoji = SPORT_EMOJI[data.sportId?.toLowerCase()] || "🏅";
  const firstName = data.guestName.split(" ")[0] || data.guestName;

  const subject = `${emoji} ${firstName}, your session starts soon — ${data.sessionTitle}`;

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

    <tr><td style="padding:0 0 24px;">
      <span style="font-size:24px;font-weight:900;letter-spacing:-1px;">
        <span style="color:#fff;">fittry</span><span style="color:#B6FF3B;">be</span>
      </span>
    </td></tr>

    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#0A0A0A;border-radius:20px;border:1px solid #1A1A1A;overflow:hidden;">

        <tr><td style="background:linear-gradient(90deg,#FB923C,#F59E0B);height:4px;font-size:0;">&nbsp;</td></tr>

        <tr><td style="padding:32px 28px;text-align:center;">
          <div style="font-size:3.5rem;margin-bottom:16px;">${emoji}</div>
          <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#FB923C;margin-bottom:8px;">
            Starting Soon
          </p>
          <p style="font-size:22px;font-weight:900;color:#fff;line-height:1.3;">
            ${data.sessionTitle}
          </p>
        </td></tr>

        <tr><td style="padding:0 28px;"><div style="height:1px;background:#1A1A1A;"></div></td></tr>

        <tr><td style="padding:24px 28px;">
          <p style="font-size:15px;color:#ccc;line-height:1.7;margin-bottom:20px;">
            Hey ${firstName}, just a quick heads up — your session is coming up!
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#080808;border-radius:14px;border:1px solid #141414;margin-bottom:20px;">
            <tr><td style="padding:20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" style="padding:6px 0;">
                    <p style="font-size:10px;font-weight:600;color:#444;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">When</p>
                    <p style="font-size:14px;font-weight:700;color:#fff;">${data.date}</p>
                    <p style="font-size:13px;color:#888;margin-top:2px;">${data.time}</p>
                  </td>
                  <td width="50%" style="padding:6px 0;">
                    <p style="font-size:10px;font-weight:600;color:#444;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;">Where</p>
                    <p style="font-size:14px;font-weight:700;color:#fff;">${data.location}</p>
                    <p style="font-size:13px;color:#888;margin-top:2px;">${data.locationArea}</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
            <tr><td style="padding:6px 0;">
              <span style="color:#B6FF3B;font-weight:700;margin-right:8px;">✓</span>
              <span style="color:#aaa;font-size:13px;">Arrive 5–10 mins early</span>
            </td></tr>
            <tr><td style="padding:6px 0;">
              <span style="color:#B6FF3B;font-weight:700;margin-right:8px;">✓</span>
              <span style="color:#aaa;font-size:13px;">Bring water and appropriate footwear</span>
            </td></tr>
            <tr><td style="padding:6px 0;">
              <span style="color:#B6FF3B;font-weight:700;margin-right:8px;">✓</span>
              <span style="color:#aaa;font-size:13px;">Everyone's friendly — just show up and play</span>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:0 28px 28px;text-align:center;">
          <a href="https://fittrybe.co.uk/events/${data.sessionId}" style="display:inline-block;padding:14px 36px;background:#B6FF3B;color:#000;font-weight:800;font-size:14px;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">
            View Session Details
          </a>
        </td></tr>

        <tr><td style="background:linear-gradient(90deg,#FB923C,#F59E0B);height:3px;font-size:0;">&nbsp;</td></tr>
      </table>
    </td></tr>

    <tr><td style="padding:20px 0 0;">
      <p style="font-size:10px;color:#2A2A2A;line-height:1.7;">
        You're receiving this because you reserved a spot on
        <a href="https://fittrybe.co.uk" style="color:#333;">fittrybe.co.uk</a>.
      </p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html };
}
