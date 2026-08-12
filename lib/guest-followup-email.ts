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
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

    <!-- Logo -->
    <tr><td style="padding:0 0 32px;text-align:center;">
      <span style="font-size:26px;font-weight:900;letter-spacing:-1px;">
        <span style="color:#fff;">fittry</span><span style="color:#B6FF3B;">be</span>
      </span>
    </td></tr>

    <!-- Main Card -->
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#0A0A0A;border-radius:24px;border:1px solid #1E1E1E;overflow:hidden;">

        <!-- Top accent -->
        <tr><td style="background:linear-gradient(90deg,#B6FF3B,#8AC82C);height:4px;font-size:0;">&nbsp;</td></tr>

        <!-- Hero -->
        <tr><td style="padding:48px 40px 36px;text-align:center;">
          <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
            <tr><td style="width:72px;height:72px;border-radius:18px;background:rgba(182,255,0,0.1);border:1px solid rgba(182,255,0,0.2);text-align:center;vertical-align:middle;">
              <span style="font-size:36px;line-height:72px;">🎁</span>
            </td></tr>
          </table>
          <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:rgba(255,255,255,0.4);margin-top:24px;margin-bottom:10px;">
            Exclusive offer for you
          </p>
          <p style="font-size:32px;font-weight:900;color:#fff;line-height:1.15;margin-bottom:6px;">
            Your Next Session
          </p>
          <p style="font-size:48px;font-weight:900;line-height:1;letter-spacing:-2px;">
            <span style="color:#B6FF3B;">Is FREE</span>
          </p>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-bottom:1px solid #1A1A1A;">&nbsp;</td></tr></table></td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 40px;">
          <p style="font-size:16px;color:#fff;font-weight:600;line-height:1.5;margin-bottom:16px;">
            Hey ${firstName} ${emoji}
          </p>
          <p style="font-size:14px;color:#888;line-height:1.8;margin-bottom:16px;">
            Hope you had a great time at <strong style="color:#ccc;">${data.sessionTitle}</strong>.
          </p>
          <p style="font-size:14px;color:#888;line-height:1.8;margin-bottom:24px;">
            We built the FitTrybe app so you can find your next game even faster — browse sessions near you, join with one tap, and get notified the moment something new drops.
          </p>

          <!-- Value prop card -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#111;border-radius:16px;border:1px solid #1A1A1A;margin-bottom:28px;">
            <tr><td style="padding:24px;">
              <p style="font-size:18px;font-weight:800;color:#B6FF3B;margin-bottom:16px;text-align:center;">
                Download the app → your next session is free
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:36px;">
                    <table cellpadding="0" cellspacing="0" border="0"><tr>
                      <td style="width:28px;height:28px;border-radius:50%;background:#B6FF3B;color:#000;font-size:12px;font-weight:800;text-align:center;line-height:28px;">1</td>
                    </tr></table>
                  </td>
                  <td style="padding:10px 0 10px 12px;color:#ccc;font-size:13px;line-height:1.5;vertical-align:middle;">
                    Download at <a href="https://fittrybe.app" style="color:#B6FF3B;font-weight:700;text-decoration:underline;text-underline-offset:3px;">fittrybe.app</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:36px;">
                    <table cellpadding="0" cellspacing="0" border="0"><tr>
                      <td style="width:28px;height:28px;border-radius:50%;background:#B6FF3B;color:#000;font-size:12px;font-weight:800;text-align:center;line-height:28px;">2</td>
                    </tr></table>
                  </td>
                  <td style="padding:10px 0 10px 12px;color:#ccc;font-size:13px;line-height:1.5;vertical-align:middle;">
                    Sign up with <span style="color:#B6FF3B;font-weight:600;">${data.guestEmail}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;vertical-align:top;width:36px;">
                    <table cellpadding="0" cellspacing="0" border="0"><tr>
                      <td style="width:28px;height:28px;border-radius:50%;background:#B6FF3B;color:#000;font-size:12px;font-weight:800;text-align:center;line-height:28px;">3</td>
                    </tr></table>
                  </td>
                  <td style="padding:10px 0 10px 12px;color:#ccc;font-size:13px;line-height:1.5;vertical-align:middle;">
                    Join any session — fee <strong style="color:#B6FF3B;">waived automatically</strong>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="center">
              <a href="https://fittrybe.app" style="display:inline-block;padding:16px 48px;background:#B6FF3B;color:#000;font-weight:800;font-size:15px;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">
                Download Now
              </a>
            </td>
          </tr></table>
        </td></tr>

        <!-- Bottom accent -->
        <tr><td style="background:linear-gradient(90deg,#B6FF3B,#8AC82C);height:3px;font-size:0;">&nbsp;</td></tr>
      </table>
    </td></tr>

    <!-- Personal sign-off -->
    <tr><td style="padding:32px 8px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background:#0A0A0A;border-radius:16px;border:1px solid #141414;padding:24px 28px;">
        <tr><td style="padding:24px 28px;">
          <p style="font-size:13px;color:#666;line-height:1.8;margin-bottom:20px;">
            The app is where the magic happens — live updates, group chat, instant notifications when sessions near you go live.
          </p>
          <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="vertical-align:top;padding-right:12px;">
              <table cellpadding="0" cellspacing="0" border="0"><tr>
                <td style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,rgba(182,255,0,0.2),rgba(182,255,0,0.05));text-align:center;line-height:36px;font-size:14px;font-weight:800;color:#B6FF3B;">F</td>
              </tr></table>
            </td>
            <td style="vertical-align:middle;">
              <p style="font-size:14px;color:#fff;font-weight:700;margin:0;">Francis</p>
              <p style="font-size:11px;color:#555;margin:2px 0 0;">Founder, FitTrybe</p>
            </td>
          </tr></table>
          <p style="font-size:12px;color:#444;margin-top:16px;line-height:1.6;font-style:italic;">
            P.S. This offer doesn't expire. Take your time. But your next game is waiting ${emoji}
          </p>
        </td></tr>
      </table>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:24px 0 0;text-align:center;">
      <p style="font-size:10px;color:#333;line-height:1.7;">
        You're receiving this because you reserved a spot on
        <a href="https://fittrybe.co.uk" style="color:#444;">fittrybe.co.uk</a> ·
        <a href="mailto:hello@fittrybe.co.uk" style="color:#444;">hello@fittrybe.co.uk</a>
      </p>
    </td></tr>

  </table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html };
}
