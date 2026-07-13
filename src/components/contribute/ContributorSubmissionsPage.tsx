import * as React from "react";
import type { NextPage } from "next";
import BasicPageMeta from "@/components/meta/BasicPageMeta";
import NavBar from "@/components/NavBar";
import Footer from "@/components/homepage/footer";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  ContributorSubmission,
  DatasetSubmissionValues,
  deleteContributorSubmission,
  getContributorSubmission,
  listContributorSubmissions,
  saveContributorSubmission,
  validateSubmissionValues,
  valuesFromSubmission,
} from "@/services/SubmissionService";
import { SubmissionForm, initialSubmissionValues } from "@/components/contribute/SubmissionForm";
import { SubmissionStatusBadge } from "@/components/contribute/SubmissionStatusBadge";
import { ContentCard, NoticeCard } from "@/components/contribute/SectionCard";
import {
  canEditSubmission,
  canRemoveSubmission,
  displayDate,
  lockedSubmissionMessage,
  submissionTitle,
} from "@/components/contribute/submissionDisplay";

function pathSubmissionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  const qid = params.get("id");
  if (qid) {
    return decodeURIComponent(qid);
  }
  const prefix = "/contribute/submissions";
  const pathname = window.location.pathname;
  if (!pathname.startsWith(`${prefix}/`)) {
    return null;
  }
  const segment = pathname.slice(prefix.length + 1).split("/")[0];
  const id = decodeURIComponent(segment).replace(/\.html?$/i, "").replace(/^index$/, "");
  return id || null;
}

function navigate(submissionId: string | null): void {
  let url: string;
  if (!submissionId) {
    url = "/contribute/submissions/";
  } else if (submissionId === "new") {
    url = "/contribute/submissions/new/";
  } else {
    url = `/contribute/submissions/?id=${encodeURIComponent(submissionId)}`;
  }
  window.history.pushState(null, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

type MessageBoxVariant = "error" | "success" | "warning" | "locked" | "loading";

const messageBoxClasses: Record<MessageBoxVariant, string> = {
  error: "border-[#f1c5c5] bg-[#fff6f6] text-almostblack",
  success: "border-[#bfe3cd] bg-[#f2fff6] text-[#23623a]",
  warning: "border-[#e5b849] bg-[#fff8df] text-almostblack",
  locked: "border-lightgray bg-[#fbfbfd] text-almostblack",
  loading: "border-lightgray bg-white text-darkgray",
};

function MessageBox({
  variant,
  className,
  children,
}: {
  variant: MessageBoxVariant;
  className?: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className={`${className ? `${className} ` : ""}rounded-md border p-4 text-base ${messageBoxClasses[variant]}`}>
      {children}
    </div>
  );
}

function AuthNotice({
  kind,
  requiredRole,
}: {
  kind: "config" | "loading" | "role";
  requiredRole: string;
}): JSX.Element {
  if (kind === "config") {
    return (
      <NoticeCard>
        <h1 className="mb-4 text-3xl font-bold text-almostblack">Contributor Access Needs Configuration</h1>
        <p className="m-0 text-lg leading-8 text-almostblack">
          Add the Keycloak discovery client environment variables before testing contributor login.
        </p>
      </NoticeCard>
    );
  }
  if (kind === "role") {
    return (
      <NoticeCard tone="alert">
        <h1 className="mb-4 text-3xl font-bold text-almostblack">Access Restricted</h1>
        <p className="m-0 text-lg leading-8 text-almostblack">
          Your account is signed in, but it does not currently have the <strong>{requiredRole}</strong> role.
        </p>
      </NoticeCard>
    );
  }
  return (
    <NoticeCard>
      <h1 className="mb-4 text-3xl font-bold text-almostblack">Loading Submissions</h1>
      <p className="m-0 text-lg leading-8 text-almostblack">Preparing your contributor workspace.</p>
    </NoticeCard>
  );
}

function SubmissionList({
  submissions,
  isLoading,
  error,
  onRefresh,
}: {
  submissions: ContributorSubmission[];
  isLoading: boolean;
  error: string;
  onRefresh: () => void;
}): JSX.Element {
  return (
    <ContentCard>
      <div className="mb-6 flex flex-col gap-4 border-b border-lightgray pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-3 inline-flex rounded-full bg-lightviolet px-4 py-2 text-sm font-bold uppercase text-frenchviolet">
            Contributor
          </div>
          <h1 className="mb-2 text-4xl font-bold text-almostblack">My Submissions</h1>
          <p className="m-0 text-lg leading-8 text-almostblack">Continue drafts and update records returned for changes.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex h-12 items-center rounded-md bg-frenchviolet px-6 text-base font-bold text-white no-underline"
            onClick={() => navigate("new")}
          >
            New Contribution
          </button>
          <button
            type="button"
            className="h-12 rounded-md border border-lightgray bg-white px-6 text-base font-bold text-almostblack"
            onClick={onRefresh}
          >
            Refresh
          </button>
        </div>
      </div>

      {error && <MessageBox variant="error" className="mb-6">{error}</MessageBox>}
      {isLoading && <MessageBox variant="loading">Loading submissions...</MessageBox>}
      {!isLoading && submissions.length === 0 && (
        <div className="rounded-md border border-lightgray bg-[#fbfbfd] p-6 text-base text-almostblack">
          No submissions yet.
        </div>
      )}
      {!isLoading && submissions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-base">
            <thead>
              <tr className="border-b border-lightgray text-sm uppercase text-darkgray">
                <th className="py-3 pr-4">Title</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Updated</th>
                <th className="py-3 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id} className="border-b border-lightgray">
                  <td className="py-4 pr-4 font-bold text-almostblack">{submissionTitle(submission)}</td>
                  <td className="py-4 pr-4">
                    <SubmissionStatusBadge status={submission.status} />
                  </td>
                  <td className="py-4 pr-4 text-darkgray">{displayDate(submission.updated_at || submission.submitted_at)}</td>
                  <td className="py-4 pr-4">
                    <button
                      type="button"
                      className="font-bold text-frenchviolet no-underline"
                      onClick={() => navigate(submission.id)}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ContentCard>
  );
}

function SubmissionDetail({
  submissionId,
  session,
}: {
  submissionId: string;
  session: ReturnType<typeof useAuth>["session"];
}): JSX.Element {
  const isNew = submissionId === "new";
  const [submission, setSubmission] = React.useState<ContributorSubmission | null>(null);
  const savedIdRef = React.useRef<string | undefined>(undefined);
  const [values, setValues] = React.useState<DatasetSubmissionValues>(initialSubmissionValues);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(!isNew);
  const [loadError, setLoadError] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function loadSubmission() {
      if (isNew) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setLoadError("");
      setMessage("");
      try {
        const loaded = await getContributorSubmission(submissionId, session);
        if (!cancelled) {
          setSubmission(loaded);
          setValues(valuesFromSubmission(loaded));
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Submission could not be loaded.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }
    void loadSubmission();
    return () => {
      cancelled = true;
    };
  }, [isNew, session, submissionId]);

  const save = React.useCallback(
    async (nextStatus: "draft" | "submitted") => {
      if (isSaving) return;
      setErrors([]);
      setMessage("");
      if (nextStatus === "submitted") {
        const nextErrors = validateSubmissionValues(values);
        if (nextErrors.length > 0) {
          setErrors(nextErrors);
          return;
        }
      }
      setIsSaving(true);
      try {
        const resolvedId = savedIdRef.current || (isNew ? undefined : submission?.id || submissionId);
        const saved = await saveContributorSubmission(values, session, {
          submissionId: resolvedId,
          status: nextStatus,
        });
        setSubmission(saved);
        if (saved.id) {
          savedIdRef.current = saved.id;
          if (isNew && typeof window !== "undefined") {
            window.history.replaceState(null, "", `/contribute/submissions/?id=${encodeURIComponent(saved.id)}`);
          }
        }
        setMessage(nextStatus === "draft" ? "Draft saved." : "Submission sent for review.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Submission could not be saved.");
      } finally {
        setIsSaving(false);
      }
    },
    [isNew, isSaving, session, submission, submissionId, values],
  );

  const currentSubmissionId = savedIdRef.current || submission?.id || (!isNew ? submissionId : undefined);
  const editable = isNew || canEditSubmission(submission?.status);
  const removable = Boolean(currentSubmissionId && canRemoveSubmission(submission?.status));

  const remove = React.useCallback(async () => {
    if (!currentSubmissionId || isRemoving || typeof window === "undefined") {
      return;
    }
    if (!window.confirm("Remove this submission?")) {
      return;
    }
    setErrors([]);
    setMessage("");
    setIsRemoving(true);
    try {
      await deleteContributorSubmission(currentSubmissionId, session);
      navigate(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Submission could not be removed.");
    } finally {
      setIsRemoving(false);
    }
  }, [currentSubmissionId, isRemoving, session]);

  if (isLoading) {
    return (
      <ContentCard padding="large">
        <h1 className="mb-4 text-3xl font-bold text-almostblack">Loading Submission</h1>
        <p className="m-0 text-lg leading-8 text-almostblack">Retrieving your saved record.</p>
      </ContentCard>
    );
  }

  if (loadError) {
    return (
      <ContentCard padding="large">
        <button
          type="button"
          className="mb-6 inline-block font-bold text-frenchviolet"
          onClick={() => navigate(null)}
        >
          Back to my submissions
        </button>
        <MessageBox variant="error">{loadError}</MessageBox>
      </ContentCard>
    );
  }

  return (
    <ContentCard>
      <div className="mb-6 flex flex-col gap-3 border-b border-lightgray pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <button
            type="button"
            className="mb-4 inline-block font-bold text-frenchviolet no-underline"
            onClick={() => navigate(null)}
          >
            Back to my submissions
          </button>
          <h1 className="mb-3 text-4xl font-bold text-almostblack">
            {isNew ? "New Data Contribution" : values.title || "Edit Submission"}
          </h1>
          <SubmissionStatusBadge status={isNew ? undefined : submission?.status} />
        </div>
      </div>

      {(submission?.status === "needs_changes" || submission?.status === "rejected") && submission.review_notes && (
        <MessageBox variant="warning" className="mb-6">
          <strong>Manager comments:</strong>
          <p className="mb-0 mt-2 whitespace-pre-line">{submission.review_notes}</p>
        </MessageBox>
      )}
      {!editable && (
        <MessageBox variant="locked" className="mb-6">
          {lockedSubmissionMessage(submission?.status)}
        </MessageBox>
      )}
      {errors.length > 0 && (
        <MessageBox variant="error" className="mb-6">
          <ul className="m-0 pl-5">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </MessageBox>
      )}
      {!editable ? (
        <div className="grid gap-6 text-base text-almostblack">
          <p className="m-0">
            To make a new version, start a new contribution from your submissions list.
          </p>
          {removable && (
            <button
              type="button"
              className="h-12 w-fit rounded-md border border-[#c83f49] bg-white px-6 text-base font-bold text-[#a6232f] disabled:opacity-60"
              disabled={isRemoving}
              onClick={() => void remove()}
            >
              {isRemoving ? "Removing..." : "Remove"}
            </button>
          )}
        </div>
      ) : (
        <>
          <SubmissionForm
            values={values}
            isSaving={isSaving}
            isRemoving={isRemoving}
            submitLabel={submission?.status === "needs_changes" || submission?.status === "rejected" ? "Resubmit for Review" : "Submit for Review"}
            onChange={setValues}
            onRemove={removable ? () => void remove() : undefined}
            onSaveDraft={() => void save("draft")}
            onSubmit={() => void save("submitted")}
            onClear={isNew ? () => setValues(initialSubmissionValues) : undefined}
          />
        </>
      )}
      {message && (
        <MessageBox
          variant={message.toLowerCase().includes("could not") || message.toLowerCase().includes("failed") ? "error" : "success"}
          className="mt-6"
        >
          {message}
        </MessageBox>
      )}
    </ContentCard>
  );
}

const ContributorSubmissionsPage: NextPage = () => {
  const auth = useAuth();
  const { hasRole, isAuthenticated, isConfigured, isReady, login, requiredRole, session } = auth;
  const [submissionId, setSubmissionId] = React.useState<string | null>(null);
  const [submissions, setSubmissions] = React.useState<ContributorSubmission[]>([]);
  const [isLoadingList, setIsLoadingList] = React.useState(false);
  const [listError, setListError] = React.useState("");

  React.useEffect(() => {
    setSubmissionId(pathSubmissionId());
    const handleNavigation = () => setSubmissionId(pathSubmissionId());
    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  React.useEffect(() => {
    if (!isReady || !isConfigured || isAuthenticated) {
      return;
    }
    const returnTo = typeof window === "undefined"
      ? "/contribute/submissions/"
      : `${window.location.pathname}${window.location.search}${window.location.hash}`;
    void login(returnTo);
  }, [isAuthenticated, isConfigured, isReady, login]);

  const loadList = React.useCallback(async () => {
    if (!session) {
      return;
    }
    setIsLoadingList(true);
    setListError("");
    try {
      setSubmissions(await listContributorSubmissions(session));
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Submissions could not be loaded.");
    } finally {
      setIsLoadingList(false);
    }
  }, [session]);

  React.useEffect(() => {
    if (!isReady || !isAuthenticated || !hasRole(requiredRole) || submissionId) {
      return;
    }
    void loadList();
  }, [hasRole, isAuthenticated, isReady, loadList, requiredRole, submissionId]);

  let content: JSX.Element;
  if (!isConfigured) {
    content = <AuthNotice kind="config" requiredRole={requiredRole} />;
  } else if (!isReady || !isAuthenticated) {
    content = <AuthNotice kind="loading" requiredRole={requiredRole} />;
  } else if (!hasRole(requiredRole)) {
    content = <AuthNotice kind="role" requiredRole={requiredRole} />;
  } else if (submissionId) {
    content = <SubmissionDetail submissionId={submissionId} session={session} />;
  } else {
    content = (
      <SubmissionList
        submissions={submissions}
        isLoading={isLoadingList}
        error={listError}
        onRefresh={() => void loadList()}
      />
    );
  }

  return (
    <>
      <BasicPageMeta
        title="My Contributions"
        description="Contributor submissions for SDOH & Place data discovery."
      />
      <NavBar />
      <main className="min-h-screen bg-[#f7f4fb] px-6 pb-24 pt-36">
        <div className="mx-auto max-w-6xl">{content}</div>
      </main>
      <Footer />
    </>
  );
};

export default ContributorSubmissionsPage;
