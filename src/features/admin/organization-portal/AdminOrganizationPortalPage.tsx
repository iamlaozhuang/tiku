"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpenCheck,
  Building2,
  FileText,
  ShieldCheck,
  WandSparkles,
} from "lucide-react";

import type { AuthContextDto } from "@/server/contracts/auth-contract";

import {
  AdminErrorState,
  AdminLoadingState,
  AdminUnauthorizedState,
  fetchAdminApi,
  getStoredSessionToken,
  isAdminContext,
  isUnauthorizedResponse,
} from "../content-admin-runtime";

type AdminOrganizationPortalLoadState =
  | "loading"
  | "ready"
  | "unauthorized"
  | "error";

type OrganizationPortalDestination = {
  description: string;
  href: string;
  icon: React.ReactNode;
  label: string;
  stateLabel: string;
  testId: string;
};

const organizationPortalDestinations: OrganizationPortalDestination[] = [
  {
    description:
      "Create organization training drafts, bind metadata-only sources, publish versions, and copy versions through local routes.",
    href: "/organization/organization-training",
    icon: <BookOpenCheck aria-hidden="true" className="size-4" />,
    label: "Organization Training",
    stateLabel: "Local admin flow ready",
    testId: "organization-portal-destination-training",
  },
  {
    description:
      "Load aggregate-only dashboard summaries for the organization analytics local entry.",
    href: "/organization/organization-analytics",
    icon: <BarChart3 aria-hidden="true" className="size-4" />,
    label: "Organization Analytics",
    stateLabel: "Summary-only entry ready",
    testId: "organization-portal-destination-analytics",
  },
  {
    description:
      "Prepare organization-owned AI question drafts without writing platform formal question records.",
    href: "/organization/ai-question-generation",
    icon: <WandSparkles aria-hidden="true" className="size-4" />,
    label: "AI出题",
    stateLabel: "Advanced organization only",
    testId: "organization-portal-destination-ai-question-generation",
  },
  {
    description:
      "Prepare organization-owned AI paper drafts without publishing formal paper records.",
    href: "/organization/ai-paper-generation",
    icon: <FileText aria-hidden="true" className="size-4" />,
    label: "AI组卷",
    stateLabel: "Advanced organization only",
    testId: "organization-portal-destination-ai-paper-generation",
  },
];

function hasAdvancedOrganizationAdminRole(adminRoles: readonly string[]) {
  return (
    adminRoles.includes("org_advanced_admin") ||
    adminRoles.includes("super_admin")
  );
}

export function AdminOrganizationPortalPage() {
  const [loadState, setLoadState] =
    useState<AdminOrganizationPortalLoadState>("loading");
  const [organizationPublicId, setOrganizationPublicId] = useState<
    string | null
  >(null);
  const [adminRoles, setAdminRoles] = useState<readonly string[]>([]);

  useEffect(() => {
    let isActive = true;

    async function loadAdminSession() {
      const sessionToken = getStoredSessionToken();

      try {
        const sessionResponse = await fetchAdminApi<AuthContextDto>(
          "/api/v1/sessions",
          sessionToken,
        );

        if (!isActive) {
          return;
        }

        if (
          isUnauthorizedResponse(sessionResponse) ||
          sessionResponse.code !== 0 ||
          sessionResponse.data === null ||
          !isAdminContext(sessionResponse.data)
        ) {
          setLoadState("unauthorized");
          return;
        }

        setOrganizationPublicId(sessionResponse.data.user.organizationPublicId);
        setAdminRoles(sessionResponse.data.user.adminRoles ?? []);
        setLoadState("ready");
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadAdminSession();

    return () => {
      isActive = false;
    };
  }, []);

  if (loadState === "loading") {
    return <AdminLoadingState label="Loading organization portal" />;
  }

  if (loadState === "unauthorized") {
    return <AdminUnauthorizedState />;
  }

  if (loadState === "error") {
    return (
      <AdminErrorState
        title="Organization portal unavailable"
        description="Refresh the page or sign in again before opening the organization portal."
      />
    );
  }

  const visibleDestinations = hasAdvancedOrganizationAdminRole(adminRoles)
    ? organizationPortalDestinations
    : [];

  return (
    <section className="space-y-6" data-testid="organization-portal-shell">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">
            Organization Admin
          </p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            Organization Portal
          </h1>
          <p className="text-text-secondary max-w-2xl text-sm leading-6">
            Local entry point for organization training and aggregate analytics
            surfaces that are already supported in this workspace.
          </p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-md">
          <ShieldCheck aria-hidden="true" className="size-5" />
        </div>
      </header>

      <section className="bg-surface border-border rounded-md border p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-muted text-text-primary flex size-10 items-center justify-center rounded-md">
              <Building2 aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h2 className="text-text-primary text-base font-semibold">
                Active organization scope
              </h2>
              <p className="text-text-secondary text-sm">
                {organizationPublicId ?? "Organization scope is not set"}
              </p>
            </div>
          </div>
          <span className="bg-success/10 text-success rounded-md px-3 py-1 text-xs font-medium">
            local shell
          </span>
        </div>
      </section>

      <nav
        aria-label="Organization portal destinations"
        className="grid gap-4 lg:grid-cols-2"
      >
        {visibleDestinations.map((destination) => (
          <PortalDestinationLink
            destination={destination}
            key={destination.href}
          />
        ))}
      </nav>
    </section>
  );
}

function PortalDestinationLink({
  destination,
}: {
  destination: OrganizationPortalDestination;
}) {
  return (
    <Link
      className="bg-surface border-border hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 grid gap-4 rounded-md border p-4 shadow-sm transition-all outline-none focus-visible:ring-3 active:scale-[0.98]"
      data-testid={destination.testId}
      href={destination.href}
    >
      <span className="text-text-primary flex items-center gap-2 text-base font-semibold">
        {destination.icon}
        {destination.label}
      </span>
      <span className="text-text-secondary text-sm leading-6">
        {destination.description}
      </span>
      <span className="bg-secondary text-secondary-foreground w-fit rounded-md px-3 py-1 text-xs font-medium">
        {destination.stateLabel}
      </span>
    </Link>
  );
}
