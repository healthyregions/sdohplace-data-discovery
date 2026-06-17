import { ContributorSubmission } from "@/services/SubmissionService";

export function statusLabel(status?: string): string {
  if (!status) {
    return "Draft";
  }
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function statusClass(status?: string): string {
  if (status === "needs_changes") {
    return "border-[#e5b849] bg-[#fff8df] text-[#5e4700]";
  }
  if (status === "approved") {
    return "border-[#bfe3cd] bg-[#f2fff6] text-[#23623a]";
  }
  if (status === "rejected") {
    return "border-[#f1c5c5] bg-[#fff6f6] text-[#7c2222]";
  }
  if (status === "submitted") {
    return "border-[#cfd8ff] bg-[#f5f7ff] text-[#263e8f]";
  }
  return "border-lightgray bg-white text-darkgray";
}

export function submissionTitle(submission: ContributorSubmission): string {
  const payload = submission.payload_json || submission.payload || {};
  const title = payload.title;
  if (typeof title === "string" && title.trim()) {
    return title;
  }
  if (Array.isArray(title) && title.length > 0) {
    return String(title[0]);
  }
  return "Untitled submission";
}

export function displayDate(value?: string): string {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

export function canEditSubmission(status?: string): boolean {
  return !status || status === "draft" || status === "needs_changes" || status === "rejected";
}

export function canRemoveSubmission(status?: string): boolean {
  return !status || status === "draft" || status === "rejected";
}

export function lockedSubmissionMessage(status?: string): string {
  if (status === "submitted") {
    return "This submission is under review and can no longer be edited unless it is returned for changes.";
  }
  if (status === "approved") {
    return "This submission has been approved and can no longer be edited.";
  }
  return "This submission can no longer be edited.";
}
