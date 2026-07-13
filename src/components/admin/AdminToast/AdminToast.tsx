import { AlertTriangle, CheckCircle2, X } from "lucide-react";

export type AdminFeedback = {
  message: string;
  title: string;
  tone: "conflict" | "error" | "success";
};

export function AdminToast({
  feedback,
  onDismiss,
}: {
  feedback: AdminFeedback;
  onDismiss?: () => void;
}) {
  const isSuccess = feedback.tone === "success";

  return (
    <section
      aria-atomic="true"
      aria-live={isSuccess ? "polite" : "assertive"}
      className={`fixed inset-x-4 bottom-4 z-50 flex items-start gap-3 rounded-md border p-4 shadow-lg sm:right-6 sm:left-auto sm:max-w-md ${
        isSuccess
          ? "border-border bg-surface text-text-primary"
          : "border-destructive/40 bg-destructive/10 text-destructive"
      }`}
      data-admin-feedback-tone={feedback.tone}
      role={isSuccess ? "status" : "alert"}
    >
      {isSuccess ? (
        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      ) : (
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{feedback.title}</p>
        <p className="mt-1 text-sm leading-5">{feedback.message}</p>
      </div>
      {onDismiss === undefined ? null : (
        <button
          aria-label="关闭操作反馈"
          className="hover:bg-muted focus-visible:ring-ring inline-flex size-9 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-3"
          type="button"
          onClick={onDismiss}
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </section>
  );
}
