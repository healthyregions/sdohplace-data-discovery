"use client";

import * as React from "react";
import {
  AuthSession,
  clearStoredSession,
  completeLogin,
  getAuthConfig,
  getDisplayName,
  hasRole,
  isSessionActive,
  logout,
  readStoredSession,
  refreshSession,
  startLogin,
} from "@/lib/auth";

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  session: AuthSession | null;
  displayName: string;
  login: (returnTo?: string) => Promise<void>;
  finishLogin: (code: string, state: string) => Promise<{ session: AuthSession; returnTo: string }>;
  signOut: (returnTo?: string) => void;
  hasRole: (role?: string) => boolean;
  requiredRole: string;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const config = getAuthConfig();
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const storedSession = readStoredSession();
      if (!storedSession) {
        if (!cancelled) {
          setSession(null);
          setIsReady(true);
        }
        return;
      }

      if (isSessionActive(storedSession)) {
        if (!cancelled) {
          setSession(storedSession);
          setIsReady(true);
        }
        return;
      }

      try {
        const nextSession = await refreshSession(storedSession);
        if (!cancelled) {
          setSession(nextSession);
        }
      } catch {
        clearStoredSession();
        if (!cancelled) {
          setSession(null);
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (!session) {
      return;
    }

    const refreshAt = Math.max((session.expiresAt * 1000) - Date.now() - 60000, 5000);
    const timeoutId = window.setTimeout(async () => {
      try {
        const nextSession = await refreshSession(session);
        setSession(nextSession);
      } catch {
        clearStoredSession();
        setSession(null);
      }
    }, refreshAt);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [session]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated: Boolean(session),
      isConfigured: config.isConfigured,
      session,
      displayName: getDisplayName(session),
      login: async (returnTo?: string) => {
        await startLogin(returnTo);
      },
      finishLogin: async (code: string, state: string) => {
        const result = await completeLogin(code, state);
        setSession(result.session);
        return result;
      },
      signOut: (returnTo?: string) => {
        logout(session, returnTo);
      },
      hasRole: (role?: string) => hasRole(session, role),
      requiredRole: config.requiredRole,
    }),
    [config.isConfigured, config.requiredRole, isReady, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
