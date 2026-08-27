export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
  refreshExpiresAt?: number;
  user: {
    sub?: string;
    name?: string;
    email?: string;
    preferredUsername?: string;
  };
  roles: string[];
};

type PendingLogin = {
  state: string;
  codeVerifier: string;
  returnTo: string;
};

type JwtPayload = {
  sub?: string;
  name?: string;
  email?: string;
  preferred_username?: string;
  exp?: number;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
};

const AUTH_SESSION_KEY = "sdohplace.auth.session";
const AUTH_PENDING_KEY = "sdohplace.auth.pending";
const AUTH_LOGOUT_KEY = "sdohplace.auth.logout";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

function parseJwt(token: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length < 2) {
    throw new Error("Invalid token");
  }
  return JSON.parse(base64UrlDecode(parts[1]));
}

function getRoles(payload: JwtPayload, clientId: string): string[] {
  const roleSet = new Set<string>();
  for (const role of payload.realm_access?.roles ?? []) {
    roleSet.add(role);
  }
  for (const role of payload.resource_access?.[clientId]?.roles ?? []) {
    roleSet.add(role);
  }
  return Array.from(roleSet);
}

function randomString(length = 96): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  const bytes = new Uint8Array(digest);
  const base64 = btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

const LOGOUT_NOTICE_TTL_MS = 60000;

function writeLogoutNotice(): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(AUTH_LOGOUT_KEY, String(Date.now()));
}

function clearLogoutNotice(): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(AUTH_LOGOUT_KEY);
}

function readJson<T>(key: string): T | null {
  if (!isBrowser()) {
    return null;
  }
  const value = window.sessionStorage.getItem(key);
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!isBrowser()) {
    return;
  }
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

function removeItem(key: string): void {
  if (!isBrowser()) {
    return;
  }
  window.sessionStorage.removeItem(key);
}

function currentOrigin(): string {
  if (!isBrowser()) {
    return "";
  }
  return window.location.origin;
}

function normalizePath(path: string | undefined, fallback: string): string {
  if (!path) {
    return fallback;
  }
  return path.startsWith("/") ? path : `/${path}`;
}

export function getAuthConfig() {
  const issuer = (process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER || "").replace(/\/$/, "");
  const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "";
  const scope = process.env.NEXT_PUBLIC_KEYCLOAK_SCOPE || "openid profile email roles";
  const requiredRole = process.env.NEXT_PUBLIC_KEYCLOAK_REQUIRED_ROLE || "contributor";
  const redirectPath = normalizePath(
    process.env.NEXT_PUBLIC_KEYCLOAK_REDIRECT_PATH,
    "/sign-in",
  );
  const postLogoutRedirectPath = normalizePath(
    process.env.NEXT_PUBLIC_KEYCLOAK_POST_LOGOUT_REDIRECT_PATH,
    "/",
  );
  const isConfigured = Boolean(issuer && clientId);

  return {
    issuer,
    clientId,
    scope,
    requiredRole,
    redirectPath,
    postLogoutRedirectPath,
    isConfigured,
    authorizationEndpoint: issuer
      ? `${issuer}/protocol/openid-connect/auth`
      : "",
    tokenEndpoint: issuer
      ? `${issuer}/protocol/openid-connect/token`
      : "",
    logoutEndpoint: issuer
      ? `${issuer}/protocol/openid-connect/logout`
      : "",
  };
}

function getRedirectUri(): string {
  const { redirectPath } = getAuthConfig();
  return `${currentOrigin()}${redirectPath}`;
}

function getPostLogoutRedirectUri(returnTo?: string): string {
  const { postLogoutRedirectPath } = getAuthConfig();
  const targetPath = normalizePath(returnTo, postLogoutRedirectPath);
  return `${currentOrigin()}${targetPath}`;
}

export function readStoredSession(): AuthSession | null {
  return readJson<AuthSession>(AUTH_SESSION_KEY);
}

export function storeSession(session: AuthSession): void {
  writeJson(AUTH_SESSION_KEY, session);
}

export function clearStoredSession(): void {
  removeItem(AUTH_SESSION_KEY);
}

function readPendingLogin(): PendingLogin | null {
  return readJson<PendingLogin>(AUTH_PENDING_KEY);
}

function storePendingLogin(pendingLogin: PendingLogin): void {
  writeJson(AUTH_PENDING_KEY, pendingLogin);
}

function clearPendingLogin(): void {
  removeItem(AUTH_PENDING_KEY);
}

export function consumeLogoutNotice(): boolean {
  if (!isBrowser()) {
    return false;
  }
  const raw = window.localStorage.getItem(AUTH_LOGOUT_KEY);
  if (!raw) {
    return false;
  }
  clearLogoutNotice();
  const stampedAt = Number(raw);
  return Number.isFinite(stampedAt) && Date.now() - stampedAt < LOGOUT_NOTICE_TTL_MS;
}

function buildSession(tokenResponse: {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
}): AuthSession {
  const payload = parseJwt(tokenResponse.access_token);
  const { clientId } = getAuthConfig();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = payload.exp ?? now + (tokenResponse.expires_in ?? 300);
  const refreshExpiresAt = tokenResponse.refresh_expires_in
    ? now + tokenResponse.refresh_expires_in
    : undefined;

  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    idToken: tokenResponse.id_token,
    expiresAt,
    refreshExpiresAt,
    user: {
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      preferredUsername: payload.preferred_username,
    },
    roles: getRoles(payload, clientId),
  };
}

async function tokenRequest(
  body: Record<string, string>,
): Promise<{
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
}> {
  const { tokenEndpoint, clientId, isConfigured } = getAuthConfig();
  if (!isConfigured) {
    throw new Error("Keycloak is not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    ...body,
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || "Token exchange failed");
  }

  return response.json();
}

export async function startLogin(returnTo = "/contribute"): Promise<void> {
  const {
    authorizationEndpoint,
    clientId,
    scope,
    isConfigured,
  } = getAuthConfig();

  if (!isConfigured) {
    throw new Error("Keycloak is not configured");
  }

  const state = randomString(24);
  const codeVerifier = randomString(64);
  const codeChallenge = await sha256Base64Url(codeVerifier);

  storePendingLogin({
    state,
    codeVerifier,
    returnTo,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  window.location.assign(`${authorizationEndpoint}?${params.toString()}`);
}

export async function completeLogin(code: string, state: string): Promise<{
  session: AuthSession;
  returnTo: string;
}> {
  const pendingLogin = readPendingLogin();
  if (!pendingLogin) {
    throw new Error("No login request found in browser session");
  }
  if (pendingLogin.state !== state) {
    clearPendingLogin();
    throw new Error("State mismatch during sign-in");
  }

  const tokenResponse = await tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(),
    code_verifier: pendingLogin.codeVerifier,
  });

  const session = buildSession(tokenResponse);
  storeSession(session);
  clearPendingLogin();

  return {
    session,
    returnTo: pendingLogin.returnTo || "/contribute",
  };
}

export async function refreshSession(session: AuthSession): Promise<AuthSession> {
  if (!session.refreshToken) {
    throw new Error("No refresh token available");
  }

  const tokenResponse = await tokenRequest({
    grant_type: "refresh_token",
    refresh_token: session.refreshToken,
  });

  const nextSession = buildSession(tokenResponse);
  storeSession(nextSession);
  return nextSession;
}

export function isSessionActive(session: AuthSession | null): boolean {
  if (!session) {
    return false;
  }
  return session.expiresAt > Math.floor(Date.now() / 1000);
}

export function hasRole(
  session: AuthSession | null,
  role: string | undefined,
): boolean {
  if (!session || !role) {
    return false;
  }
  return session.roles.includes(role);
}

export function getDisplayName(session: AuthSession | null): string {
  if (!session) {
    return "";
  }
  return (
    session.user.name ||
    session.user.preferredUsername ||
    session.user.email ||
    "Contributor"
  );
}

export function logout(session: AuthSession | null, returnTo?: string): void {
  const { logoutEndpoint, clientId, isConfigured } = getAuthConfig();
  const postLogoutRedirectUri = getPostLogoutRedirectUri(returnTo);

  clearStoredSession();
  clearPendingLogin();
  // Allow the sign-in page to show a "You have been signed out" message after the round trip through Keycloak
  writeLogoutNotice();

  if (!isConfigured) {
    window.location.assign(postLogoutRedirectUri);
    return;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    post_logout_redirect_uri: postLogoutRedirectUri,
  });

  if (session?.idToken) {
    params.set("id_token_hint", session.idToken);
  }

  window.location.assign(`${logoutEndpoint}?${params.toString()}`);
}
