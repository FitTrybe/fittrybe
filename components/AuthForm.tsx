"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { signIn, signUp } from "@/lib/auth";
import { Wordmark } from "@/components/brand/Wordmark";

// ─── Icons ──────────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.71a5.4 5.4 0 0 1 0-3.42V4.97H.96a9 9 0 0 0 0 8.06l3-2.32z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.96l3 2.33A5.36 5.36 0 0 1 9 3.58z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

const PAGE_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #050505; color: #fff; font-family: var(--font-inter-tight, 'Inter Tight', sans-serif); min-height: 100vh; overflow-x: hidden; }

  @keyframes authFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes authShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }

  .auth-fade { animation: authFadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
  .auth-shake { animation: authShake 0.5s ease; }

  .auth-input {
    width: 100%;
    background: #111;
    color: #fff;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 0.85rem 1rem;
    font-size: 0.92rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
  }
  .auth-input:focus { border-color: rgba(182,255,0,0.4); }
  .auth-input::placeholder { color: #4B5563; }

  .auth-label {
    display: block;
    font-size: 0.78rem;
    font-weight: 600;
    color: #9CA3AF;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 0.4rem;
  }

  .auth-cta {
    width: 100%;
    background: #B6FF00;
    color: #0D0D0D;
    border: none;
    border-radius: 10px;
    padding: 1.05rem 1.5rem;
    font-family: var(--font-anton, 'Anton', sans-serif);
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  }
  .auth-cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(182,255,0,0.28); }
  .auth-cta:disabled { cursor: not-allowed; opacity: 0.6; }
`;

type AuthMode = "login" | "signup";

export default function AuthForm({
  mode,
  redirectTo,
}: {
  mode: AuthMode;
  redirectTo?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const isLogin = mode === "login";
  const redirect = redirectTo || "/";

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      triggerShake();
      return;
    }

    if (!isLogin) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        triggerShake();
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        triggerShake();
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email.trim(), password);
        window.location.href = redirect;
      } else {
        await signUp(email.trim(), password);
        setSignupSuccess(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      triggerShake();
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "apple") {
    setError(null);
    setOauthBusy(provider);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}` },
    });
    if (err) {
      setOauthBusy(null);
      setError(err.message);
      triggerShake();
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError("Enter your email above, then click forgot password.");
      triggerShake();
      return;
    }
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/`,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      triggerShake();
    } else {
      setError(null);
      setSignupSuccess(true);
    }
  }

  if (signupSuccess) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
        <header
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 10,
            padding: "1.25rem 5vw", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "rgba(5,5,5,0.7)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <Link href="/" aria-label="Fittrybe home" style={{ display: "flex", alignItems: "center", gap: "0.55rem", textDecoration: "none" }}>
            <Image src="/logo-mark.png" alt="" width={28} height={28} priority style={{ display: "block" }} />
            <Wordmark height={22} />
          </Link>
        </header>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "6rem 1.25rem 3rem" }}>
          <div className="auth-fade" style={{ maxWidth: 460, textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              {isLogin ? "📬" : "🎉"}
            </div>
            <h1 style={{
              fontFamily: "var(--font-anton, 'Anton', sans-serif)", fontWeight: 900,
              fontSize: "clamp(1.5rem, 4vw, 2rem)", textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}>
              {isLogin ? "Check your email" : "Check your email"}
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: "0.95rem", lineHeight: 1.6 }}>
              {isLogin
                ? `We've sent a password reset link to ${email}. Click the link in the email to set a new password.`
                : `We've sent a confirmation link to ${email}. Click the link to activate your account, then you can sign in.`}
            </p>
            <Link
              href={isLogin ? "/login" : "/login"}
              style={{
                display: "inline-block", marginTop: "1.5rem",
                color: "#B6FF00", fontSize: "0.9rem", fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Go to sign in
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 10,
          padding: "1.25rem 5vw", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(5,5,5,0.7)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <Link href="/" aria-label="Fittrybe home" style={{ display: "flex", alignItems: "center", gap: "0.55rem", textDecoration: "none" }}>
          <Image src="/logo-mark.png" alt="" width={28} height={28} priority style={{ display: "block" }} />
          <Wordmark height={22} />
        </Link>
        <Link
          href="/"
          style={{ color: "#6B7280", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600, letterSpacing: "0.03em" }}
        >
          Home
        </Link>
      </header>

      {/* ── Form ───────────────────────────────────────────────────── */}
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "6rem 1.25rem 3rem" }}>
        <div className={`auth-fade ${shake ? "auth-shake" : ""}`} style={{ maxWidth: 460, width: "100%" }}>
          <div
            style={{
              background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: "2.25rem",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-anton, 'Anton', sans-serif)", fontWeight: 900,
                fontSize: "clamp(1.7rem, 4.5vw, 2.25rem)", lineHeight: 1.05,
                letterSpacing: "-0.01em", textTransform: "uppercase", marginBottom: "0.5rem",
              }}
            >
              {isLogin ? (
                <>Welcome <span style={{ color: "#B6FF00" }}>back</span></>
              ) : (
                <>Join <span style={{ color: "#B6FF00" }}>the trybe</span></>
              )}
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#9CA3AF", lineHeight: 1.6, marginBottom: "1.75rem" }}>
              {isLogin
                ? "Sign in to join sessions and connect with your city."
                : "Create your account to find games, join sessions, and meet your trybe."}
            </p>

            {/* OAuth buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem", marginBottom: "1rem" }}>
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={oauthBusy !== null || loading}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
                  width: "100%", background: "#fff", color: "#0D0D0D", border: "none",
                  borderRadius: 8, padding: "0.85rem 1rem", fontSize: "0.92rem", fontWeight: 600,
                  cursor: oauthBusy !== null || loading ? "not-allowed" : "pointer",
                  opacity: oauthBusy === "google" ? 0.7 : 1,
                }}
              >
                <GoogleIcon />
                {oauthBusy === "google" ? "Redirecting..." : "Continue with Google"}
              </button>

              <button
                type="button"
                onClick={() => handleOAuth("apple")}
                disabled={oauthBusy !== null || loading}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
                  width: "100%", background: "#000", color: "#fff",
                  border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8,
                  padding: "0.85rem 1rem", fontSize: "0.92rem", fontWeight: 600,
                  cursor: oauthBusy !== null || loading ? "not-allowed" : "pointer",
                  opacity: oauthBusy === "apple" ? 0.7 : 1,
                }}
              >
                <AppleIcon />
                {oauthBusy === "apple" ? "Redirecting..." : "Continue with Apple"}
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.5rem 0 1rem" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ fontSize: "0.7rem", color: "#4B5563", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                or with email
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            {/* Email / password form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
              <div>
                <label htmlFor="auth-email" className="auth-label">Email</label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="auth-pass" className="auth-label">Password</label>
                <input
                  id="auth-pass"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  placeholder={isLogin ? "Your password" : "At least 6 characters"}
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="auth-confirm" className="auth-label">Confirm password</label>
                  <input
                    id="auth-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input"
                    placeholder="Re-enter your password"
                  />
                </div>
              )}

              {error && (
                <p style={{ color: "#EF4444", fontSize: "0.85rem", margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || oauthBusy !== null}
                className="auth-cta"
              >
                {loading
                  ? (isLogin ? "Signing in..." : "Creating account...")
                  : (isLogin ? "Sign in" : "Create account")}
              </button>

              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  style={{
                    background: "none", border: "none", color: "#6B7280",
                    fontSize: "0.82rem", cursor: "pointer", textAlign: "center",
                    padding: "0.25rem", textDecoration: "underline",
                    textUnderlineOffset: "3px",
                  }}
                >
                  Forgot password?
                </button>
              )}
            </form>

            {/* Switch link */}
            <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.88rem", color: "#6B7280" }}>
              {isLogin ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link href={`/signup${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} style={{ color: "#B6FF00", fontWeight: 600, textDecoration: "none" }}>
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link href={`/login${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} style={{ color: "#B6FF00", fontWeight: 600, textDecoration: "none" }}>
                    Sign in
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
