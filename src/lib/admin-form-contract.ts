export type AdminFormIssue = Readonly<{
  field: string;
  message: string;
}>;

export type AdminFormDirtyState = Readonly<{
  isDirty: boolean;
  status: "clean" | "dirty";
}>;

export function readAdminFieldError(
  issues: readonly AdminFormIssue[],
  field: string,
): string | null {
  return issues.find((issue) => issue.field === field)?.message ?? null;
}

export function focusFirstAdminFormIssue(
  form: ParentNode,
  issues: readonly AdminFormIssue[],
): HTMLElement | null {
  const fieldTargets = Array.from(
    form.querySelectorAll<HTMLElement>("[data-field]"),
  );
  const target = issues.reduce<HTMLElement | null>((matchedTarget, issue) => {
    if (matchedTarget !== null) {
      return matchedTarget;
    }

    return (
      fieldTargets.find(
        (candidate) =>
          candidate.dataset.field === issue.field &&
          !candidate.hasAttribute("disabled"),
      ) ?? null
    );
  }, null);

  target?.focus();
  return target;
}

export function getAdminFormDirtyState(
  baselineFingerprint: string,
  currentFingerprint: string,
): AdminFormDirtyState {
  const isDirty = baselineFingerprint !== currentFingerprint;

  return {
    isDirty,
    status: isDirty ? "dirty" : "clean",
  };
}
