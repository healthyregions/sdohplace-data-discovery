// Link unfurling for shared resources: when a link like /?show=<resource id> is pasted into
// Slack, email, social media, etc., their crawlers read the Open Graph tags without running
// JavaScript. The site is a static export, so every link would otherwise unfurl as the generic
// "Data Discovery" card. This rewrites the preview tags for the requested resource.

const SITE_SUFFIX = "Data Discovery, The SDOH & Place Project";
const THUMBNAIL_PATH = "/logos/data-discovery-share.png";
const DESCRIPTION_MAX = 200;

function env(name) {
  if (typeof Deno !== "undefined") {
    return Deno.env.get(name);
  }
  return process.env[name];
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(text, max) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : max).replace(/[,.;:]$/, "") + "…";
}

async function fetchResource(id) {
  const solrUrl = env("NEXT_PUBLIC_SOLR_URL");
  if (!solrUrl) return null;
  const params = new URLSearchParams({
    q: `id:"${id}"`,
    fl: "id,dct_title_s,dct_description_sm",
    rows: "1",
    wt: "json",
  });
  const res = await fetch(`${solrUrl.replace(/\/$/, "")}/select?${params}`, {
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) return null;
  const doc = (await res.json())?.response?.docs?.[0];
  if (!doc?.dct_title_s) return null;
  const description = Array.isArray(doc.dct_description_sm) ? doc.dct_description_sm[0] : doc.dct_description_sm;
  return { title: doc.dct_title_s, description: description || "" };
}

/**
 * Replaces the page's preview tags with ones for the given resource.
 * Exported separately so it can be tested without Netlify.
 */
export function applyPreview(html, { title, description, image, url }) {
  const t = escapeHtml(`${title} - ${SITE_SUFFIX}`);
  const d = escapeHtml(truncate(description, DESCRIPTION_MAX));
  const i = escapeHtml(image);
  const u = escapeHtml(url);

  const replaceMeta = (source, property, content) =>
    source.replace(new RegExp(`<meta([^>]*?)property="${property}"([^>]*?)content="[^"]*"([^>]*)>`, "i"),
      `<meta$1property="${property}"$2content="${content}"$3>`);

  let out = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`);
  out = replaceMeta(out, "og:title", t);
  out = replaceMeta(out, "og:description", d);
  out = replaceMeta(out, "og:image", i);
  out = replaceMeta(out, "og:url", u);
  const extra = [
    `<meta property="og:image:width" content="640"/>`,
    `<meta property="og:image:height" content="360"/>`,
    `<meta name="twitter:card" content="summary_large_image"/>`,
    `<meta name="twitter:title" content="${t}"/>`,
    `<meta name="twitter:description" content="${d}"/>`,
    `<meta name="twitter:image" content="${i}"/>`,
  ].join("");
  return out.replace(/<\/head>/i, `${extra}</head>`);
}

export default async (request, context) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("show");
  if (!id || !/^[A-Za-z0-9_-]{1,64}$/.test(id)) return;

  const response = await context.next();
  if (!(response.headers.get("content-type") || "").includes("text/html")) return response;

  const page = await response.text();
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  let html = page;
  try {
    const resource = await fetchResource(id);
    if (resource) {
      html = applyPreview(page, {
        ...resource,
        image: `${url.origin}${THUMBNAIL_PATH}`,
        url: url.toString(),
      });
    }
  } catch (err) {
    console.error("resource-preview failed:", err);
  }
  return new Response(html, { status: response.status, headers });
};

// The route is declared in netlify.toml, not with `export const config`: netlify.toml also loads
// this folder as serverless functions, and an in-file `path` would make that copy take over "/".
