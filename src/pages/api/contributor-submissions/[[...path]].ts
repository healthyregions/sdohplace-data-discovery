import type { NextApiRequest, NextApiResponse } from "next";

// Dev-only proxy to the intake API. In production, the Netlify edge function
// at netlify/edge-functions/contributor-submissions.js handles these requests.
const INTAKE_BASE = (process.env.INTAKE_API_BASE_URL || "http://localhost:9090").replace(/\/$/, "");
const INTAKE_TOKEN = process.env.INTAKE_API_TOKEN || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const segments = (req.query.path as string[] | undefined) || [];
  const intakePath = segments.length > 0 ? `/${segments.join("/")}` : "";
  const url = `${INTAKE_BASE}/submissions${intakePath}`;

  const upstreamHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (INTAKE_TOKEN) {
    upstreamHeaders["Authorization"] = `Bearer ${INTAKE_TOKEN}`;
  }

  const hasBody = req.method === "POST" || req.method === "PATCH";
  const upstream = await fetch(url, {
    method: req.method,
    headers: upstreamHeaders,
    ...(hasBody ? { body: JSON.stringify(req.body) } : {}),
  });

  const text = await upstream.text();
  if (upstream.status === 204) {
    res.status(204).end();
    return;
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text || `Intake API error ${upstream.status}` };
  }

  res.status(upstream.status).json(data);
}
