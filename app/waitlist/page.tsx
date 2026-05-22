import { redirect } from "next/navigation";

/**
 * /waitlist is retired now that Fittrybe is live on the App Store and
 * Google Play. Keep the URL alive as a permanent redirect to the new
 * download page so any old marketing links still land somewhere useful.
 */
export const metadata = { robots: { index: false, follow: false } };

export default function WaitlistRedirect() {
  redirect("/download");
}
