import { SolrObject } from "../../../../meta/interface/SolrObject";

const siteSuffix = "Data Discovery, The SDOH & Place Project";
const thumbnailPath = "/logos/data-discovery-share.png";

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Builds the share card for a resource: an HTML version (for email, docs, chat apps that accept rich paste)
 * and a plain-text fallback. Inline styles only, so the card survives being pasted into email clients.
 */
export const buildShareCard = (
  resultItem: SolrObject,
  url: string
): { html: string; text: string } => {
  const title = `${resultItem.title} - ${siteSuffix}`;
  const description = resultItem.description?.[0] || "";
  // absolute URL so the image still loads wherever the card is pasted
  const thumbnail = `${window.location.origin}${thumbnailPath}`;

  const html = `<table cellpadding="0" cellspacing="0" style="max-width:480px;border:1px solid #CAC4D0;border-radius:8px;border-collapse:separate;font-family:Nunito,Arial,sans-serif;color:#1e1e1e;">
  <tr><td style="padding:0;">
    <a href="${escapeHtml(url)}"><img src="${escapeHtml(thumbnail)}" alt="Data Discovery" width="480" style="display:block;width:100%;max-width:480px;height:auto;border-radius:8px 8px 0 0;" /></a>
  </td></tr>
  <tr><td style="padding:12px 16px;">
    <a href="${escapeHtml(url)}" style="color:#7e1cc4;font-weight:bold;font-size:16px;text-decoration:none;">${escapeHtml(title)}</a>
    ${description ? `<p style="margin:8px 0 0;font-size:14px;line-height:1.4;">${escapeHtml(description)}</p>` : ""}
    <p style="margin:8px 0 0;font-size:12px;"><a href="${escapeHtml(url)}" style="color:#79747e;">${escapeHtml(url)}</a></p>
  </td></tr>
</table>`;

  const text = [title, description, url].filter(Boolean).join("\n\n");
  return { html, text };
};

/**
 * Copies the share card to the clipboard as rich HTML, falling back to plain text
 * in browsers without ClipboardItem support.
 */
export const copyShareCard = async (resultItem: SolrObject, url: string): Promise<void> => {
  const { html, text } = buildShareCard(resultItem, url);
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
  } else {
    await navigator.clipboard?.writeText(text);
  }
};
