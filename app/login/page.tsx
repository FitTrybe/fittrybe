import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In | Fittrybe",
  description: "Sign in to Fittrybe to join sessions, find games, and connect with your city.",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginClient />;
}
