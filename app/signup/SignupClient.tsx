"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

function SignupInner() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? undefined;
  return <AuthForm mode="signup" redirectTo={redirect} />;
}

export default function SignupClient() {
  return (
    <Suspense>
      <SignupInner />
    </Suspense>
  );
}
