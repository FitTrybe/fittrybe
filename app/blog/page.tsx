import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { buildCanonicalUrl, seoConfig } from "@/lib/seo-config";
import BlogCard from "@/components/BlogCard";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import SmartDownloadLink from "@/components/SmartDownloadLink";

const blogOGImage = `${seoConfig.siteUrl}/api/og?title=${encodeURIComponent(
  "The Fittrybe Blog"
)}&description=${encodeURIComponent(
  "Sports tips, fitness guides, and community stories for grassroots players."
)}`;

export const metadata: Metadata = {
  title: "Blog — Sports Tips, Fitness Guides & Community Stories | Fittrybe",
  description:
    "Read the Fittrybe blog for tips on finding local sports sessions, fitness advice, community stories, and how to stay active in your city. Football, basketball, badminton, tennis and more.",
  alternates: { canonical: buildCanonicalUrl("/blog") },
  openGraph: {
    type: "website",
    url: buildCanonicalUrl("/blog"),
    siteName: seoConfig.siteName,
    locale: seoConfig.siteLocale,
    title: "Fittrybe Blog — Sports, Fitness & Community",
    description: "Tips on finding local sports sessions, fitness guides, and community stories from the Fittrybe team.",
    images: [{ url: blogOGImage, secureUrl: blogOGImage, width: 1200, height: 630, alt: "Fittrybe Blog", type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    site: seoConfig.twitterHandle,
    title: "Fittrybe Blog — Sports, Fitness & Community",
    description: "Tips on finding local sports sessions, fitness guides, and community stories from the Fittrybe team.",
    images: [blogOGImage],
  },
};

export const revalidate = 60;

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <main style={{ minHeight: "100vh", background: "#050505", color: "#fff" }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1200, margin: "0 auto", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/" aria-label="Fittrybe — return to homepage" style={{ display: "inline-flex", alignItems: "center" }}>
          <Wordmark height={28} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/events" className="hidden sm:block" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", fontFamily: "var(--font-inter-tight)" }}>
            Sessions
          </Link>
          <SmartDownloadLink style={{ display: "inline-block", fontSize: "0.875rem", fontWeight: 600, padding: "10px 20px", borderRadius: 50, background: "#B6FF00", color: "#000", textDecoration: "none", fontFamily: "var(--font-inter-tight)" }}>
            Get the App
          </SmartDownloadLink>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 64px", textAlign: "center", position: "relative" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 500, height: 350, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(182,255,0,0.06) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#B6FF00", boxShadow: "0 0 12px rgba(182,255,0,0.6)", display: "inline-block" }} />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#B6FF00", fontFamily: "var(--font-inter-tight)" }}>The Fittrybe Blog</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 1.05, marginBottom: 20 }}>
            <span style={{ display: "block", background: "linear-gradient(to right, #fff 0%, rgba(255,255,255,0.6) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Find Your Game.</span>
            <span style={{ display: "block", background: "linear-gradient(135deg, #B6FF00 0%, #7CFC00 50%, #B6FF00 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Stay in the Know.</span>
          </h1>
          <p style={{ fontSize: "1.125rem", maxWidth: 600, margin: "0 auto", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontFamily: "var(--font-inter-tight)" }}>
            Sports tips, fitness guides, community stories, and everything you need to stay active in your city.
          </p>
        </div>
      </section>

      {/* Post grid */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: 20, filter: "drop-shadow(0 0 20px rgba(182,255,0,0.3))" }}>📝</div>
            <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-inter-tight)", marginBottom: 8 }}>
              No posts published yet.
            </p>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-inter-tight)" }}>
              We&apos;re working on something good — check back soon.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 32, padding: "6px 16px", borderRadius: 50, background: "#111", border: "1px solid rgba(255,255,255,0.06)", fontSize: "0.82rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-inter-tight)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#B6FF00", display: "inline-block" }} />
              {posts.length} article{posts.length !== 1 ? "s" : ""}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
              {posts.map((post, i) => (
                <div key={post.slug} style={{ animation: `fadeSlideUp 0.5s ease-out ${i * 0.06}s both` }}>
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "80px 24px", textAlign: "center", position: "relative" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at center bottom, rgba(182,255,0,0.04) 0%, transparent 60%)" }} />
        <div style={{ position: "relative" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 8, fontFamily: "var(--font-inter-tight)", fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Ready to play?
          </p>
          <h2 style={{ fontFamily: "var(--font-anton)", fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, textTransform: "uppercase", color: "#fff", marginBottom: 24 }}>
            Find Your Tribe
          </h2>
          <SmartDownloadLink className="btn-primary" style={{ fontSize: "1.125rem", padding: "16px 40px", boxShadow: "0 0 30px rgba(182,255,0,0.2)" }}>
            Get the App
          </SmartDownloadLink>
        </div>
      </section>
    </main>
  );
}
