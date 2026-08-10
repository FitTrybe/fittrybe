"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Wordmark } from "@/components/brand/Wordmark";

function CallbackInner() {
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase automatically picks up the tokens from the URL hash
    // after an OAuth redirect. We just need to wait for the session.
    supabase.auth.getSession().then(({ data, error: err }) => {
      if (err) {
        setError(err.message);
        return;
      }
      if (data.session) {
        window.location.href = next;
      } else {
        // Sometimes the hash hasn't been processed yet — listen for it
        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            sub.subscription.unsubscribe();
            window.location.href = next;
          }
        });
        // Timeout after 10s
        setTimeout(() => {
          sub.subscription.unsubscribe();
          setError("Sign-in timed out. Please try again.");
        }, 10000);
      }
    });
  }, [next]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body { background: #050505; color: #fff; font-family: var(--font-inter-tight, 'Inter Tight', sans-serif); }
        @keyframes authSpin { to { transform: rotate(360deg); } }
      ` }} />
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 10,
          padding: "1.25rem 5vw", display: "flex", alignItems: "center",
          background: "rgba(5,5,5,0.7)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.55rem", textDecoration: "none" }}>
          <Image src="/logo-mark.png" alt="" width={28} height={28} priority style={{ display: "block" }} />
          <Wordmark height={22} />
        </Link>
      </header>
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "6rem 1.25rem 3rem" }}>
        {error ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#EF4444", marginBottom: "1rem" }}>{error}</p>
            <Link href="/login" style={{ color: "#B6FF00", fontWeight: 600, textDecoration: "none" }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 36, height: 36, border: "3px solid rgba(182,255,0,0.2)",
                borderTopColor: "#B6FF00", borderRadius: "50%",
                animation: "authSpin 0.8s linear infinite",
                margin: "0 auto 1.25rem",
              }}
            />
            <p style={{ color: "#9CA3AF", fontSize: "0.95rem" }}>Signing you in...</p>
          </div>
        )}
      </main>
    </>
  );
}

export default function AuthCallbackClient() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
