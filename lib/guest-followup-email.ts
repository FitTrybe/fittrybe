/**
 * Follow-up email sent to guests after their first session reservation.
 * Encourages app download with a "next session free" incentive.
 */

export interface GuestFollowupData {
  guestName: string;
  guestEmail: string;
  sportId: string;
  sessionTitle: string;
}

const SPORT_EMOJI: Record<string, string> = {
  football: "⚽", basketball: "🏀", cycling: "🚴", running: "🏃",
  badminton: "🏸", tennis: "🎾", gym: "🏋️", swimming: "🏊",
};

export function buildGuestFollowupEmail(data: GuestFollowupData): {
  subject: string;
  html: string;
} {
  const firstName = data.guestName.split(" ")[0] || data.guestName;
  const emoji = SPORT_EMOJI[data.sportId?.toLowerCase()] || "🏅";

  const subject = `${firstName}, your next session is on us`;

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
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

    <!-- Header -->
    <tr><td style="padding:0 0 28px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td>
          <span style="font-size:24px;font-weight:900;letter-spacing:-1px;">
            <span style="color:#fff;">fittry</span><span style="color:#B6FF3B;">be</span>
          </span>
        </td>
      </tr></table>
    </td></tr>

    <!-- Hero card -->
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#0A0A0A;border-radius:20px;border:1px solid #1A1A1A;overflow:hidden;">

        <tr><td style="background:linear-gradient(90deg,#B6FF3B,#8AC82C);height:4px;font-size:0;">&nbsp;</td></tr>

        <tr><td style="padding:36px 32px;text-align:center;">
          <!-- Gift emoji with glow -->
          <div style="width:80px;height:80px;margin:0 auto 20px;border-radius:20px;background:rgba(182,255,0,0.08);border:1px solid rgba(182,255,0,0.15);display:flex;align-items:center;justify-content:center;">
            <span style="font-size:40px;display:block;text-align:center;line-height:80px;">🎁</span>
          </div>

          <p style="font-size:26px;font-weight:900;color:#fff;line-height:1.2;margin-bottom:8px;">
            Your Next Session
          </p>
          <p style="font-size:42px;font-weight:900;line-height:1;">
            <span style="color:#B6FF3B;">Is FREE</span>
          </p>
        </td></tr>

        <tr><td style="padding:0 32px;"><div style="height:1px;background:#1A1A1A;"></div></td></tr>

        <tr><td style="padding:28px 32px;">
          <p style="font-size:15px;color:#ccc;line-height:1.8;margin-bottom:20px;">
            Hey ${firstName},
          </p>
          <p style="font-size:14px;color:#999;line-height:1.8;margin-bottom:20px;">
            Hope you enjoyed <strong style="color:#fff;">${data.sessionTitle}</strong> ${emoji}
          </p>
          <p style="font-size:14px;color:#999;line-height:1.8;margin-bottom:20px;">
            We built the FitTrybe app to make finding your next game even easier. Browse sessions near you, join with one tap, chat with other players, and get notified when new games pop up.
          </p>
          <p style="font-size:15px;color:#fff;font-weight:700;line-height:1.8;margin-bottom:20px;">
            Download the app and your next session is completely free — on us.
          </p>
        </td></tr>

        <!-- How it works -->
        <tr><td style="padding:0 32px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#080808;border-radius:14px;border:1px solid #141414;">
            <tr><td style="padding:20px 24px;">
              <p style="font-size:11px;font-weight:700;color:#555;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">
                How to claim
              </p>
              <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                <tr><td style="padding:8px 0;">
                  <table cellpadding="0" cellspacing="0" border="0"><tr>
                    <td style="width:28px;vertical-align:top;">
                      <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#B6FF3B;color:#000;font-size:11px;font-weight:800;text-align:center;line-height:22px;">1</span>
                    </td>
                    <td style="color:#bbb;font-size:13px;padding-left:8px;">Download FitTrybe from the App Store or Google Play</td>
                  </tr></table>
                </td></tr>
                <tr><td style="padding:8px 0;">
                  <table cellpadding="0" cellspacing="0" border="0"><tr>
                    <td style="width:28px;vertical-align:top;">
                      <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#B6FF3B;color:#000;font-size:11px;font-weight:800;text-align:center;line-height:22px;">2</span>
                    </td>
                    <td style="color:#bbb;font-size:13px;padding-left:8px;">Sign up with this email <span style="color:#B6FF3B;font-weight:600;">(${data.guestEmail})</span></td>
                  </tr></table>
                </td></tr>
                <tr><td style="padding:8px 0;">
                  <table cellpadding="0" cellspacing="0" border="0"><tr>
                    <td style="width:28px;vertical-align:top;">
                      <span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#B6FF3B;color:#000;font-size:11px;font-weight:800;text-align:center;line-height:22px;">3</span>
                    </td>
                    <td style="color:#bbb;font-size:13px;padding-left:8px;">Join any session — the fee is <strong style="color:#B6FF3B;">waived automatically</strong></td>
                  </tr></table>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- CTA buttons -->
        <tr><td style="padding:0 32px 32px;text-align:center;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="center" style="padding-bottom:10px;">
                <a href="https://apps.apple.com/app/fittrybe/id6740083498" style="display:inline-block;padding:14px 32px;background:#B6FF3B;color:#000;font-weight:800;font-size:13px;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">
                  Download for iPhone
                </a>
              </td>
            </tr>
            <tr>
              <td align="center">
                <a href="https://play.google.com/store/apps/details?id=com.fittrybe.app" style="display:inline-block;padding:14px 32px;background:#111;border:1px solid #333;color:#fff;font-weight:700;font-size:13px;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">
                  Download for Android
                </a>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="background:linear-gradient(90deg,#B6FF3B,#8AC82C);height:3px;font-size:0;">&nbsp;</td></tr>
      </table>
    </td></tr>

    <!-- Personal note -->
    <tr><td style="padding:28px 0;">
      <p style="font-size:13px;color:#777;line-height:1.8;margin-bottom:16px;">
        The web is great for discovering sessions, but the app is where the magic happens — live updates, group chat, instant notifications when sessions near you go live.
      </p>
      <p style="font-size:14px;color:#fff;font-weight:600;margin-top:16px;">
        Francis<br/>
        <span style="color:#555;font-size:12px;font-weight:400;">Founder, FitTrybe</span>
      </p>
      <p style="font-size:12px;color:#444;margin-top:8px;">
        P.S. This offer doesn't expire. Take your time. But your next game is waiting ${emoji}
      </p>
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
