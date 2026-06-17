const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, PATCH, DELETE, OPTIONS",
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
    headers: { Allow: "GET, HEAD, POST, PATCH, DELETE, OPTIONS" },
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

function normalizeItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  for (const key of ["items", "results", "submissions", "data"]) {
    if (Array.isArray(payload && payload[key])) {
      return payload[key];
    }
  }
  return [];
}

function ownsSubmission(submission, user) {
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

function submissionIdFromRequest(request) {
  const pathname = new URL(request.url).pathname;
  const basePath = "/api/contributor-submissions";
  const rest = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : "";
  const raw = rest.replace(/^\/+/, "").split("/")[0];
  const id = decodeURIComponent(raw).replace(/\.html?$/i, "");
  return id && id !== "index" ? id : "";
}

function contributorBody(user, input, fallbackStatus) {
  const inputPayload = input.payload_json || input.payload || {};
  const payloadJson =
    inputPayload && typeof inputPayload === "object" && !Array.isArray(inputPayload)
      ? inputPayload
      : {};
  payloadJson.contrubution_source = "contributor";
  return {
    status: input.status || fallbackStatus,
    submitter_email: user.email,
    submitter_name: user.name,
    submitter_username: user.username,
    submitter_id: user.sub,
    payload_json: payloadJson,
    source: "sdohplace-data-discovery",
  };
}

function canContributorEdit(status) {
  return !status || status === "draft" || status === "needs_changes" || status === "rejected";
}

function canContributorRemove(status) {
  return !status || status === "draft" || status === "rejected";
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

  const submissionId = submissionIdFromRequest(request);

  try {
    if (!submissionId && request.method === "GET") {
      const payload = await intakeRequest("GET", "/submissions");
      const items = normalizeItems(payload)
        .filter((item) => ownsSubmission(item, user))
        .filter((item) => item.status !== "deleted")
        .sort((a, b) => String(b.updated_at || b.submitted_at || "").localeCompare(String(a.updated_at || a.submitted_at || "")));
      return jsonResponse({ items });
    }

    if (!submissionId && request.method === "POST") {
      const input = await readJson(request);
      const created = await intakeRequest("POST", "/submissions", contributorBody(user, input, "draft"));
      return jsonResponse(created, 201);
    }

    if (submissionId && request.method === "GET") {
      const submission = await intakeRequest("GET", `/submissions/${encodeURIComponent(submissionId)}`);
      if (!ownsSubmission(submission, user) || submission.status === "deleted") {
        return jsonResponse({ error: "not_found" }, 404);
      }
      return jsonResponse(submission);
    }

    if (submissionId && request.method === "PATCH") {
      const submission = await intakeRequest("GET", `/submissions/${encodeURIComponent(submissionId)}`);
      if (!ownsSubmission(submission, user) || submission.status === "deleted") {
        return jsonResponse({ error: "not_found" }, 404);
      }
      if (!canContributorEdit(submission.status)) {
        return jsonResponse({ error: "This submission can no longer be edited." }, 409);
      }
      const input = await readJson(request);
      const updated = await intakeRequest(
        "PATCH",
        `/submissions/${encodeURIComponent(submissionId)}`,
        contributorBody(user, input, submission.status || "draft")
      );
      return jsonResponse(updated);
    }

    if (submissionId && request.method === "DELETE") {
      const submission = await intakeRequest("GET", `/submissions/${encodeURIComponent(submissionId)}`);
      if (!ownsSubmission(submission, user) || submission.status === "deleted") {
        return jsonResponse({ error: "not_found" }, 404);
      }
      if (!canContributorRemove(submission.status)) {
        return jsonResponse({ error: "This submission can no longer be removed." }, 409);
      }
      try {
        await intakeRequest("DELETE", `/submissions/${encodeURIComponent(submissionId)}`);
        return jsonResponse({ deleted: true, soft_deleted: false });
      } catch (error) {
        if (error.status !== 405) {
          throw error;
        }
        await intakeRequest("PATCH", `/submissions/${encodeURIComponent(submissionId)}`, {
          status: "deleted",
        });
        return jsonResponse({ deleted: true, soft_deleted: true });
      }
    }

    return new Response("Method not allowed", {
      status: 405,
      headers: { ...corsHeaders, Allow: "GET, HEAD, POST, PATCH, DELETE, OPTIONS" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submission request failed";
    const status = message === "not_found" ? 404 : 502;
    return jsonResponse({ error: message }, status);
  }
};
