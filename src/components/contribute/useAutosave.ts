import * as React from "react";
import { DatasetSubmissionValues } from "@/services/SubmissionService";

export const AUTOSAVE_BACKSTOP_MS = 20 * 60 * 1000;
export type AutosaveState = "idle" | "saving" | "saved" | "error";

export function hasMeaningfulContent(values: DatasetSubmissionValues): boolean {
  return Boolean(values.title.trim() || values.description.trim() || values.creator.trim());
}

type UseAutosaveOptions = {
  values: DatasetSubmissionValues;
  enabled: boolean;
  submissionId?: string;
  onSave: () => Promise<void>;
};

export function useAutosave({ values, enabled, submissionId, onSave }: UseAutosaveOptions) {
  const [state, setState] = React.useState<AutosaveState>("idle");
  const [savedAt, setSavedAt] = React.useState<Date | null>(null);
  const savedSnapshotRef = React.useRef<string>(JSON.stringify(values));
  const valuesRef = React.useRef(values);
  const inFlightRef = React.useRef(false);
  const onSaveRef = React.useRef(onSave);

  valuesRef.current = values;
  onSaveRef.current = onSave;

  const isDirty = React.useCallback(() => {
    return JSON.stringify(valuesRef.current) !== savedSnapshotRef.current;
  }, []);
  const markSaved = React.useCallback((snapshot: DatasetSubmissionValues) => {
    savedSnapshotRef.current = JSON.stringify(snapshot);
  }, []);
  const flush = React.useCallback(async () => {
    if (!enabled || inFlightRef.current || !isDirty()) {
      return;
    }
    if (!submissionId && !hasMeaningfulContent(valuesRef.current)) {
      return;
    }
    const snapshot = valuesRef.current;
    inFlightRef.current = true;
    setState("saving");
    try {
      await onSaveRef.current();
      markSaved(snapshot);
      setState("saved");
      setSavedAt(new Date());
    } catch {
      setState("error");
    } finally {
      inFlightRef.current = false;
    }
  }, [enabled, isDirty, markSaved, submissionId]);

  React.useEffect(() => {
    if (!enabled) {
      return;
    }
    const intervalId = window.setInterval(() => {
      void flush();
    }, AUTOSAVE_BACKSTOP_MS);
    return () => window.clearInterval(intervalId);
  }, [enabled, flush]);

  return { state, savedAt, flush, markSaved, isDirty };
}
