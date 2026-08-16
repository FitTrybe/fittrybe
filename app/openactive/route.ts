// app/openactive/route.ts
//
// OpenActive Dataset Site — serves the JSON-LD discovery page
// at https://fittrybe.co.uk/openactive so the OpenActive data
// catalogue can index FitTrybe's RPDE feeds.

import { NextResponse } from "next/server";

const DATASET_URL = "https://fittrybe.co.uk/openactive";
const SESSION_SERIES_URL =
  "https://osyqifrnyhkfyrokfbsi.supabase.co/functions/v1/openactive-session-series";
const SCHEDULED_SESSION_URL =
  "https://osyqifrnyhkfyrokfbsi.supabase.co/functions/v1/openactive-scheduled-sessions";
const DISCUSSION_URL = "https://github.com/FitTrybe/fittrybe/issues";

const jsonLd = {
  "@context": ["https://schema.org/", "https://openactive.io/"],
  "@type": "Dataset",
  "@id": DATASET_URL,
  url: DATASET_URL,
  name: "FitTrybe Sessions",
  description:
    "Open data about sport sessions available on FitTrybe, including basketball, football, tennis, badminton, running, cycling, boxing and swimming. Published using the OpenActive data standards.",
  keywords: [
    "OpenActive",
    "FitTrybe",
    "Sessions",
    "Activities",
    "Sports",
    "Physical Activity",
  ],
  license: "https://creativecommons.org/licenses/by/4.0/",
  distribution: [
    {
      "@type": "DataDownload",
      name: "SessionSeries",
      additionalType: "https://openactive.io/SessionSeries",
      contentUrl: SESSION_SERIES_URL,
      encodingFormat: "application/vnd.openactive.rpde+json; version=1",
      identifier: "SessionSeries",
    },
    {
      "@type": "DataDownload",
      name: "ScheduledSession",
      additionalType: "https://openactive.io/ScheduledSession",
      contentUrl: SCHEDULED_SESSION_URL,
      encodingFormat: "application/vnd.openactive.rpde+json; version=1",
      identifier: "ScheduledSession",
    },
  ],
  discussionUrl: DISCUSSION_URL,
  documentation:
    "https://permalink.openactive.io/dataset-site/open-data-documentation",
  inLanguage: ["en-GB"],
  publisher: {
    "@type": "Organization",
    name: "FitTrybe",
    legalName: "FitTrybe Ltd",
    description:
      "FitTrybe is a UK platform that helps people find and book local sport sessions. Members can browse sessions by activity, venue and time, and organisers can list their own sessions for the community.",
    email: "hello@fittrybe.co.uk",
    telephone: "+44 7424 159414",
    url: "https://fittrybe.co.uk",
    logo: {
      "@type": "ImageObject",
      url: "https://fittrybe.co.uk/icons/Icon-192.png",
    },
  },
  datePublished: "2026-08-08T00:00:00+01:00",
  dateModified: new Date().toISOString(),
  schemaVersion: "https://openactive.io/modelling-opportunity-data/2.0/",
};

function renderHtml(): string {
  const embedded = JSON.stringify(jsonLd, null, 2).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>FitTrybe OpenActive Dataset</title>
<script type="application/ld+json">
${embedded}
</script>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6; color: #1a1a2e; background: #f8f9fa;
    max-width: 800px; margin: 0 auto; padding: 2rem 1.5rem;
  }
  h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
  h2 { font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.75rem; color: #333; }
  p, li { margin-bottom: 0.5rem; }
  ul { padding-left: 1.25rem; }
  a { color: #0066cc; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .badge { display: inline-block; padding: 0.2em 0.6em; border-radius: 4px; font-size: 0.85rem; font-weight: 600; }
  .badge-oa { background: #e8f5e9; color: #2e7d32; }
  .badge-cc { background: #fff3e0; color: #e65100; }
  .feed-card { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1rem; }
  .feed-card h3 { font-size: 1rem; margin-bottom: 0.25rem; }
  .feed-url { font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 0.85rem; background: #f1f3f5; padding: 0.3rem 0.5rem; border-radius: 4px; word-break: break-all; display: block; margin-top: 0.5rem; }
  .attribution { background: #fff3e0; border-left: 4px solid #ff9800; padding: 1rem; margin-top: 2rem; border-radius: 4px; }
  footer { margin-top: 3rem; color: #666; font-size: 0.85rem; }
</style>
</head>
<body>
  <h1>FitTrybe <span class="badge badge-oa">OpenActive</span></h1>
  <p>
    Open data about sport sessions published by
    <a href="https://fittrybe.co.uk">FitTrybe</a>, conforming to the
    <a href="https://openactive.io/">OpenActive</a> data standards.
  </p>

  <h2>Data Feeds</h2>
  <p>
    Two RPDE feeds are published, following the
    <a href="https://openactive.io/realtime-paged-data-exchange/1.0/">Realtime Paged Data Exchange</a>
    specification:
  </p>

  <div class="feed-card">
    <h3>SessionSeries</h3>
    <p>One record per recurring or one off session template, including venue, schedule, pricing and activity type.</p>
    <code class="feed-url"><a href="${SESSION_SERIES_URL}">${SESSION_SERIES_URL}</a></code>
  </div>

  <div class="feed-card">
    <h3>ScheduledSession</h3>
    <p>One record per dated session instance, with live remaining capacity computed from real booking data.</p>
    <code class="feed-url"><a href="${SCHEDULED_SESSION_URL}">${SCHEDULED_SESSION_URL}</a></code>
  </div>

  <h2>Licence <span class="badge badge-cc">CC BY 4.0</span></h2>
  <p>
    This data is published under the
    <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International</a>
    licence. You are free to share and adapt the data for any purpose, provided you give appropriate credit.
  </p>

  <div class="attribution">
    <strong>Attribution statement for data users:</strong><br />
    Contains data from FitTrybe Ltd, licensed under
    <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
  </div>

  <h2>Documentation</h2>
  <ul>
    <li><a href="https://openactive.io/modelling-opportunity-data/2.0/">OpenActive Modelling Opportunity Data (v2.0)</a>, the data model specification</li>
    <li><a href="https://openactive.io/realtime-paged-data-exchange/1.0/">RPDE Specification</a>, the feed transport protocol</li>
    <li><a href="https://developer.openactive.io/">OpenActive Developer Documentation</a>, the getting started guide</li>
    <li><a href="https://openactive.io/activity-list/">Activity List</a>, the controlled vocabulary for sport types</li>
  </ul>

  <h2>Issues and Feedback</h2>
  <p>
    Report data quality issues or feed problems on our
    <a href="${DISCUSSION_URL}">GitHub issues board</a>.
  </p>

  <footer>
    <p>Published by <a href="https://fittrybe.co.uk">FitTrybe Ltd</a> &middot; hello@fittrybe.co.uk &middot; +44 7424 159414</p>
    <p>Dataset published: 2026-08-08</p>
  </footer>
</body>
</html>`;
}

export async function GET() {
  return new NextResponse(renderHtml(), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
