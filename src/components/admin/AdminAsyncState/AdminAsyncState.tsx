import type { ComponentPropsWithoutRef } from "react";

export type AdminAsyncStateVariant =
  | "initial-loading"
  | "refreshing"
  | "empty"
  | "filtered-empty"
  | "error"
  | "forbidden"
  | "unauthorized"
  | "edition-unavailable"
  | "missing-context"
  | "conflict";

type AdminAsyncStateSemantics = {
  busy: boolean;
  live: "assertive" | "polite";
  role: "alert" | "status";
};

const adminAsyncStateSemantics = {
  conflict: { busy: false, live: "assertive", role: "alert" },
  "edition-unavailable": {
    busy: false,
    live: "assertive",
    role: "alert",
  },
  empty: { busy: false, live: "polite", role: "status" },
  error: { busy: false, live: "assertive", role: "alert" },
  "filtered-empty": { busy: false, live: "polite", role: "status" },
  forbidden: { busy: false, live: "assertive", role: "alert" },
  "initial-loading": { busy: true, live: "polite", role: "status" },
  "missing-context": { busy: false, live: "assertive", role: "alert" },
  refreshing: { busy: true, live: "polite", role: "status" },
  unauthorized: { busy: false, live: "assertive", role: "alert" },
} satisfies Record<AdminAsyncStateVariant, AdminAsyncStateSemantics>;

type AdminAsyncStateProps = {
  variant: AdminAsyncStateVariant;
} & Omit<
  ComponentPropsWithoutRef<"section">,
  "aria-busy" | "aria-live" | "role"
>;

export function AdminAsyncState({
  children,
  variant,
  ...sectionProps
}: AdminAsyncStateProps) {
  const semantics = adminAsyncStateSemantics[variant];

  return (
    <section
      {...sectionProps}
      aria-busy={semantics.busy || undefined}
      aria-live={semantics.live}
      data-admin-async-state={variant}
      role={semantics.role}
    >
      {children}
    </section>
  );
}
