import * as React from "react";
import type { NextPage } from "next";
import Link from "next/link";
import BasicPageMeta from "@/components/meta/BasicPageMeta";
import NavBar from "@/components/NavBar";
import Footer from "@/components/homepage/footer";
import { useAuth } from "@/components/auth/AuthProvider";

const ContributePage: NextPage = () => {
  const auth = useAuth();
  const { hasRole, isAuthenticated, isConfigured, isReady, login, requiredRole } = auth;

  React.useEffect(() => {
    if (!isReady || !isConfigured || isAuthenticated) {
      return;
    }
    void login("/contribute");
  }, [isAuthenticated, isConfigured, isReady, login]);

  let content: JSX.Element;

  if (!isConfigured) {
    content = (
      <section className="rounded-md border border-lightgray bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold text-almostblack">Contributor Access Needs Configuration</h1>
        <p className="m-0 text-lg leading-8 text-almostblack">
          Add the Keycloak discovery client environment variables before testing contributor login.
        </p>
      </section>
    );
  } else if (!isReady || !isAuthenticated) {
    content = (
      <section className="rounded-md border border-lightgray bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold text-almostblack">Redirecting To Sign In</h1>
        <p className="m-0 text-lg leading-8 text-almostblack">
          You need a contributor account to access the submission area.
        </p>
      </section>
    );
  } else if (!hasRole(requiredRole)) {
    content = (
      <section className="rounded-md border border-[#f1c5c5] bg-[#fff6f6] p-8 shadow-sm">
        <h1 className="mb-4 text-3xl font-bold text-almostblack">Access Restricted</h1>
        <p className="m-0 text-lg leading-8 text-almostblack">
          Your account is signed in, but it does not currently have the <strong>{requiredRole}</strong> role.
        </p>
      </section>
    );
  } else {
    content = (
      <section className="rounded-md bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] md:p-8">
        <div className="mb-6 inline-flex rounded-full bg-lightviolet px-4 py-2 text-sm font-bold uppercase text-frenchviolet">
          Contributor
        </div>
        <h1 className="mb-4 text-4xl font-bold text-almostblack">Contribute Data to Discovery Platform</h1>
        <p className="mb-8 max-w-3xl text-lg leading-8 text-almostblack">
          Start a new contribution, save a draft, or return to submissions that need changes before review.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/contribute/submissions/new"
            className="inline-flex h-12 items-center rounded-md bg-frenchviolet px-6 text-base font-bold text-white no-underline"
          >
            Contribute Data to Discovery Platform
          </Link>
          <Link
            href="/contribute/submissions"
            className="inline-flex h-12 items-center rounded-md border border-lightgray bg-white px-6 text-base font-bold text-almostblack no-underline"
          >
            View My Submissions
          </Link>
        </div>
      </section>
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
        <div className="mx-auto max-w-5xl">{content}</div>
      </main>
      <Footer />
    </>
  );
};

export default ContributePage;
