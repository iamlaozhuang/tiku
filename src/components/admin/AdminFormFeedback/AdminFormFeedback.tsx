import type { AdminFormIssue } from "@/lib/admin-form-contract";

export function AdminFieldError({
  id,
  message,
}: {
  id: string;
  message: string | null;
}) {
  return message === null ? null : (
    <span className="text-destructive text-xs" id={id}>
      {message}
    </span>
  );
}

export function AdminFormErrorSummary({
  issues,
}: {
  issues: readonly AdminFormIssue[];
}) {
  return issues.length === 0 ? null : (
    <div
      className="border-destructive/40 bg-destructive/5 rounded-md border p-3"
      role="alert"
    >
      <p className="text-destructive text-sm font-medium">
        请修正以下内容后再保存
      </p>
      <ul className="text-text-secondary mt-2 list-disc space-y-1 pl-5 text-xs">
        {issues.map((issue, index) => (
          <li key={`${issue.field}-${index}`}>{issue.message}</li>
        ))}
      </ul>
    </div>
  );
}

export function AdminFormDisabledReason({
  id,
  reason,
}: {
  id: string;
  reason: string | null;
}) {
  return reason === null ? null : (
    <p
      aria-live="polite"
      className="text-text-secondary text-xs"
      id={id}
      role="status"
    >
      {reason}
    </p>
  );
}
