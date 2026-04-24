import * as React from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import BasicPageMeta from "@/components/meta/BasicPageMeta";
import NavBar from "@/components/NavBar";
import Footer from "@/components/homepage/footer";
import { useAuth } from "@/components/auth/AuthProvider";

const ContributePage: NextPage = () => {
  const router = useRouter();
  const auth = useAuth();
  const {
    displayName,
    hasRole,
    isAuthenticated,
    isConfigured,
    isReady,
    login,
    requiredRole,
    signOut,
  } = auth;

  React.useEffect(() => {
    if (!isReady || !isConfigured || isAuthenticated) {
      return;
    }
    void login("/contribute");
  }, [isAuthenticated, isConfigured, isReady, login]);

  let content: JSX.Element;

  if (!isConfigured) {
    content = (
      <div className="rounded-2xl border border-lightgray bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold text-almostblack">Contributor Access Needs Configuration</h1>
        <p className="m-0 text-lg leading-8 text-almostblack">
          Add the Keycloak discovery client environment variables before testing contributor login.
        </p>
      </div>
    );
  } else if (!isReady || !isAuthenticated) {
    content = (
      <div className="rounded-2xl border border-lightgray bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold text-almostblack">Redirecting To Sign In</h1>
        <p className="m-0 text-lg leading-8 text-almostblack">
          You need a contributor account to access the submission area.
        </p>
      </div>
    );
  } else if (!hasRole(requiredRole)) {
    content = (
      <div className="rounded-2xl border border-[#f1c5c5] bg-[#fff6f6] p-8 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold text-almostblack">Access Restricted</h1>
        <p className="m-0 text-lg leading-8 text-almostblack">
          Your account is signed in, but it does not currently have the <strong>{requiredRole}</strong> role.
        </p>
      </div>
    );
  } else {
    content = (
      <div className="rounded-[2rem] bg-white p-8 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
        <div className="mb-3 inline-flex rounded-full bg-lightviolet px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-frenchviolet">
          Contributor
        </div>
        <h1 className="mb-4 text-4xl font-bold text-almostblack">Contributor Access Is Active</h1>
        <p className="mb-6 text-lg leading-8 text-almostblack">
          {displayName} is signed in with the <strong>{requiredRole}</strong> role.
        </p>
        <p className="mb-0 text-lg leading-8 text-almostblack">
          This page is the protected entry point for the future submission form and contributor dashboard. The
          metadata manager remains unchanged for now.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            type="button"
            className="h-12 rounded-md border-none bg-frenchviolet px-6 text-base font-bold text-white"
            onClick={() => router.push("/")}
          >
            Return To Search
          </button>
          <button
            type="button"
            className="h-12 rounded-md border border-lightgray bg-white px-6 text-base font-bold text-almostblack"
            onClick={() => signOut("/")}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <BasicPageMeta
        title="Contribute"
        description="Contributor-only access for SDOH & Place data submission."
      />
      <NavBar />
      <main className="min-h-screen bg-[#f7f4fb] px-6 pb-24 pt-36">
        <div className="mx-auto max-w-4xl">{content}</div>
      </main>
      <Footer />
    </>
  );
};

export default ContributePage;
