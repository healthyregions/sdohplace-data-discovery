const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function env(name) {
  if (typeof Deno !== "undefined") {
    return Deno.env.get(name);
  }
  return process.env[name];
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function handleOptions(request) {
  if (request.headers.get("Access-Control-Request-Method")) {
    return new Response(null, { headers: corsHeaders });
  }
  return new Response(null, {
    headers: { Allow: "GET, HEAD, POST, OPTIONS" },
  });
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

function decodeJson(input) {
  return JSON.parse(new TextDecoder().decode(base64UrlDecode(input)));
}

async function verifyJwt(token) {
  const issuer = (env("NEXT_PUBLIC_KEYCLOAK_ISSUER") || env("KEYCLOAK_ISSUER") || "").replace(/\/$/, "");
  const clientId = env("NEXT_PUBLIC_KEYCLOAK_CLIENT_ID") || env("KEYCLOAK_CLIENT_ID") || "";
  const requiredRole = env("NEXT_PUBLIC_KEYCLOAK_REQUIRED_ROLE") || "contributor";
  if (!issuer || !clientId) {
    throw new Error("Keycloak is not configured");
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid bearer token");
  }
  const header = decodeJson(parts[0]);
  const payload = decodeJson(parts[1]);
  if (payload.iss !== issuer) {
    throw new Error("Invalid token issuer");
  }
  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    throw new Error("Bearer token expired");
  }
  const jwksResponse = await fetch(`${issuer}/protocol/openid-connect/certs`);
  if (!jwksResponse.ok) {
    throw new Error("Unable to load Keycloak signing keys");
  }
  const jwks = await jwksResponse.json();
  const jwk = (jwks.keys || []).find((key) => key.kid === header.kid);
  if (!jwk) {
    throw new Error("Bearer token signing key not found");
  }
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    base64UrlDecode(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );
  if (!verified) {
    throw new Error("Invalid bearer token signature");
  }
  const roles = new Set([
    ...((payload.realm_access && payload.realm_access.roles) || []),
    ...(((payload.resource_access || {})[clientId] || {}).roles || []),
  ]);
  if (requiredRole && !roles.has(requiredRole)) {
    throw new Error("Contributor role required");
  }
  return {
    sub: payload.sub || "",
    email: payload.email || "",
    name: payload.name || payload.preferred_username || payload.email || "",
    username: payload.preferred_username || "",
  };
}

async function getUser(request) {
  const authHeader = request.headers.get("Authorization") || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new Error("Bearer token required");
  }
  return verifyJwt(match[1]);
}

function intakeConfig() {
  const baseUrl = (env("INTAKE_API_BASE_URL") || "").replace(/\/$/, "");
  const token = env("INTAKE_API_TOKEN") || "";
  if (!baseUrl) {
    throw new Error("INTAKE_API_BASE_URL is not configured");
  }
  return { baseUrl, token };
}

async function intakeRequest(method, path, body) {
  const { baseUrl, token } = intakeConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message = data.error || text || `Intake API error ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function ownsSubmission(submissionId, user) {
  const submission = await intakeRequest("GET", `/submissions/${encodeURIComponent(submissionId)}`);
  if (!submission) {
    return false;
  }
  if (user.sub && submission.submitter_id === user.sub) {
    return true;
  }
  if (user.email && String(submission.submitter_email || "").toLowerCase() === user.email.toLowerCase()) {
    return true;
  }
  return false;
}

function actionFromRequest(request) {
  const pathname = new URL(request.url).pathname;
  const basePath = "/api/contributor-spatial";
  const rest = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : "";
  return rest.replace(/^\/+/, "").split("/")[0] || "";
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export default async (request) => {
  if (request.method === "OPTIONS") {
    return handleOptions(request);
  }
  let user;
  try {
    user = await getUser(request);
  } catch (error) {
    return jsonResponse({ error: error.message || "Unauthorized" }, 401);
  }
  const action = actionFromRequest(request);
  const url = new URL(request.url);
  try {
    if (action === "status" && request.method === "GET") {
      const submissionId = url.searchParams.get("submission_id") || "";
      const key = url.searchParams.get("key") || "";
      if (!(await ownsSubmission(submissionId, user))) {
        return jsonResponse({ error: "not_owned" }, 404);
      }
      const query = `?submission_id=${encodeURIComponent(submissionId)}&key=${encodeURIComponent(key)}`;
      return jsonResponse(await intakeRequest("GET", `/spatial/status${query}`));
    }
    if ((action === "upload-url" || action === "start") && request.method === "POST") {
      const input = await readJson(request);
      const submissionId = String(input.submission_id || "");
      if (!(await ownsSubmission(submissionId, user))) {
        return jsonResponse({ error: "not_owned" }, 404);
      }
      return jsonResponse(await intakeRequest("POST", `/spatial/${action}`, input));
    }
    return new Response("Method not allowed", {
      status: 405,
      headers: { ...corsHeaders, Allow: "GET, HEAD, POST, OPTIONS" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Spatial request failed";
    const status = message === "not_found" ? 404 : error.status || 502;
    return jsonResponse({ error: message }, status);
  }
};

export const config = {
  path: "/api/contributor-spatial(/.*)?",
};
