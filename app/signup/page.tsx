import type { Metadata } from "next";
import SignupClient from "./SignupClient";

export const metadata: Metadata = {
  title: "Sign Up | Fittrybe",
  description: "Create your Fittrybe account to find games, join sessions, and meet your trybe.",
  robots: { index: false, follow: true },
};

export default function SignupPage() {
  return <SignupClient />;
}
