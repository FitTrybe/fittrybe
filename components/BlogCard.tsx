import Link from "next/link";
import type { BlogPost } from "@/lib/posts";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const date = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="blog-card"
      style={{ textDecoration: "none", display: "block", height: "100%" }}
    >
      <div style={{
        height: "100%", display: "flex", flexDirection: "column",
        background: "#111", borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden",
        transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s ease, box-shadow 0.4s ease",
      }}>
        {/* Cover image */}
        {post.coverImage ? (
          <div style={{ aspectRatio: "16/9", overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="blog-card-img"
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
              background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
              pointerEvents: "none",
            }} />
          </div>
        ) : (
          <div style={{
            aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(145deg, rgba(182,255,0,0.08) 0%, #0a0a0a 100%)",
          }}>
            <span style={{ fontSize: "3rem", opacity: 0.5 }}>📝</span>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: "20px 20px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag} style={{
                  fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.08em", padding: "3px 10px", borderRadius: 50,
                  background: "rgba(182,255,0,0.1)", color: "#B6FF00",
                  border: "1px solid rgba(182,255,0,0.2)",
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 style={{
            fontFamily: "var(--font-inter-tight)", fontSize: "1rem", fontWeight: 700,
            color: "#fff", marginBottom: 8, lineHeight: 1.4,
            overflow: "hidden", textOverflow: "ellipsis",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {post.title}
          </h2>

          {/* Description */}
          <p style={{
            fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 16,
            fontFamily: "var(--font-inter-tight)",
            overflow: "hidden", textOverflow: "ellipsis",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {post.description}
          </p>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Meta */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-inter-tight)",
          }}>
            <span style={{ fontWeight: 600 }}>{post.author?.name ?? "Fittrybe"}</span>
            <time dateTime={post.publishedAt}>{date}</time>
          </div>
        </div>
      </div>
    </Link>
  );
}
