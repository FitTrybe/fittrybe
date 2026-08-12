/**
 * Blog post detail page — keeps all SEO/metadata logic, premium design.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogPost, getAllBlogSlugs } from "@/lib/posts";
import SiteNav from "@/components/SiteNav";
import SmartDownloadLink from "@/components/SmartDownloadLink";
import { seoConfig, buildCanonicalUrl } from "@/lib/seo-config";
import {
  buildWebPageSchema,
  buildGraphSchema,
  buildBreadcrumbSchema,
} from "@/lib/structured-data";
import BlogPostContent from "@/components/BlogPostContent";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

function resolveOGImage(post: { coverImage?: string; title: string; description: string }): string {
  if (post.coverImage && post.coverImage.startsWith("http")) return post.coverImage;
  const params = new URLSearchParams({ title: post.title, description: post.description });
  return `${seoConfig.siteUrl}/api/og?${params.toString()}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Post Not Found" };

  const canonicalUrl = buildCanonicalUrl(`/blog/${slug}`);
  const ogImage = resolveOGImage(post);

  return {
    title: post.title,
    description: post.description,
    keywords: [...seoConfig.keywords.slice(0, 5), ...(post.tags ?? [])],
    authors: [{ name: post.author?.name ?? seoConfig.author.name }],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      siteName: seoConfig.siteName,
      locale: seoConfig.siteLocale,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author?.name ?? seoConfig.author.name],
      tags: post.tags,
      images: [{ url: ogImage, secureUrl: ogImage, width: 1200, height: 630, alt: post.title, type: post.coverImage?.startsWith("http") ? "image/jpeg" : "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      site: seoConfig.twitterHandle,
      creator: seoConfig.twitterHandle,
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

function estimateReadingTime(html: string): number {
  const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const canonicalUrl = buildCanonicalUrl(`/blog/${slug}`);
  const ogImage = resolveOGImage(post);
  const readingTime = estimateReadingTime(post.content);

  const pageJsonLd = buildGraphSchema([
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${canonicalUrl}/#article`,
      headline: post.title,
      description: post.description,
      url: canonicalUrl,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt ?? post.publishedAt,
      author: { "@type": "Person", name: post.author?.name ?? seoConfig.author.name },
      publisher: { "@id": `${seoConfig.siteUrl}/#organization` },
      image: { "@type": "ImageObject", url: ogImage, width: 1200, height: 630 },
      isPartOf: { "@id": `${seoConfig.siteUrl}/#website` },
      keywords: post.tags?.join(", "),
      timeRequired: `PT${readingTime}M`,
      inLanguage: seoConfig.siteLanguage,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    },
    buildWebPageSchema({
      url: canonicalUrl,
      title: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      breadcrumb: [
        { name: "Home", url: seoConfig.siteUrl },
        { name: "Blog", url: buildCanonicalUrl("/blog") },
        { name: post.title, url: canonicalUrl },
      ],
    }),
    buildBreadcrumbSchema([
      { name: "Home", url: seoConfig.siteUrl },
      { name: "Blog", url: buildCanonicalUrl("/blog") },
      { name: post.title, url: canonicalUrl },
    ]),
  ]);

  const publishDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pageJsonLd }} />

      <main style={{ minHeight: "100vh", background: "#050505", color: "#fff" }}>
        {/* Nav */}
        <SiteNav />

        <article itemScope itemType="https://schema.org/Article" style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {post.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", padding: "4px 12px", borderRadius: 50,
                  background: "rgba(182,255,0,0.1)", color: "#B6FF00",
                  border: "1px solid rgba(182,255,0,0.2)",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Header */}
          <header style={{ marginBottom: 40 }}>
            <h1 itemProp="headline" style={{
              fontFamily: "var(--font-anton)", fontSize: "clamp(2rem, 6vw, 3.5rem)",
              fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em",
              lineHeight: 1.1, color: "#fff", marginBottom: 16,
            }}>
              {post.title}
            </h1>
            <p itemProp="description" style={{
              fontSize: "1.15rem", color: "rgba(255,255,255,0.5)", marginBottom: 24,
              fontFamily: "var(--font-inter-tight)", lineHeight: 1.6,
            }}>
              {post.description}
            </p>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              fontSize: "0.82rem", color: "rgba(255,255,255,0.35)",
              fontFamily: "var(--font-inter-tight)",
              padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.06)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              <span itemProp="author" style={{ fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
                {post.author?.name ?? "Fittrybe"}
              </span>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
              <time itemProp="datePublished" dateTime={post.publishedAt}>{publishDate}</time>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
              <span>{readingTime} min read</span>
            </div>
          </header>

          {/* Cover image */}
          {post.coverImage && (
            <div style={{ marginBottom: 40, borderRadius: 16, overflow: "hidden", aspectRatio: "16/9" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                itemProp="image"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          {/* Article body */}
          <div itemProp="articleBody">
            <BlogPostContent html={post.content} />
          </div>

          {/* CTA footer */}
          <div style={{
            marginTop: 64, padding: 32, borderRadius: 16,
            background: "#111", border: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
          }}>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 16, fontFamily: "var(--font-inter-tight)", fontSize: "0.95rem" }}>
              Ready to find local sports sessions near you?
            </p>
            <SmartDownloadLink className="btn-primary">
              Get the App — Find Your Game
            </SmartDownloadLink>
          </div>
        </article>
      </main>
    </>
  );
}
