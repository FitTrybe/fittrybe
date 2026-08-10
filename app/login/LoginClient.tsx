"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

function LoginInner() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? undefined;
  return <AuthForm mode="login" redirectTo={redirect} />;
}

export default function LoginClient() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
