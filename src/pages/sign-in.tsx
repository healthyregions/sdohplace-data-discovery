import * as React from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import BasicPageMeta from "@/components/meta/BasicPageMeta";
import { useAuth } from "@/components/auth/AuthProvider";
import { consumeLogoutNotice } from "@/lib/auth";

const SignInPage: NextPage = () => {
  const router = useRouter();
  const {
    finishLogin,
    isAuthenticated,
    isReady,
    login,
  } = useAuth();
  const [status, setStatus] = React.useState<"idle" | "processing" | "error">("idle");
  const [message, setMessage] = React.useState("");
  const handledCallback = React.useRef(false);

  React.useEffect(() => {
    if (!router.isReady || !isReady) {
      return;
    }

    const code = router.query.code;
    const state = router.query.state;
    const error = router.query.error;
    const errorDescription = router.query.error_description;
    const logout = router.query.logout;
    const hasLogoutNotice = consumeLogoutNotice();

    if (typeof error === "string") {
      setStatus("error");
      setMessage(errorDescription?.toString() || error);
      return;
    }

    if (typeof code === "string" && typeof state === "string") {
      if (handledCallback.current) {
        return;
      }
      handledCallback.current = true;
      setStatus("processing");
      setMessage("Completing sign-in...");
      void finishLogin(code, state)
        .then(({ returnTo }) => {
          void router.replace(returnTo || "/contribute");
        })
        .catch((signInError: Error) => {
          handledCallback.current = false;
          setStatus("error");
          setMessage(signInError.message);
        });
      return;
    }

    if (typeof logout === "string" || hasLogoutNotice) {
      setStatus("idle");
      setMessage("You have been signed out.");
      return;
    }

    if (isAuthenticated) {
      void router.replace("/contribute");
      return;
    }

    setStatus("processing");
    setMessage("Redirecting to Keycloak...");
    void login("/contribute").catch((signInError: Error) => {
      setStatus("error");
      setMessage(signInError.message);
    });
  }, [finishLogin, isAuthenticated, isReady, login, router, router.isReady, router.query]);

  return (
    <>
      <BasicPageMeta
        title="Sign In"
        description="Sign in to the SDOH & Place Data Discovery experience."
      />
      <main className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-[28rem] text-center">
          <div className="font-fredoka text-4xl text-frenchviolet">SDOH &amp; Place</div>
          <p className="mt-6 mb-0 text-l leading-7 text-almostblack">
            {status === "error" || status === "idle" ? message : "Redirecting to the Keycloak sign-in page..."}
          </p>
        </div>
      </main>
    </>
  );
};

export default SignInPage;
