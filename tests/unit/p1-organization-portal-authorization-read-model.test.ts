import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function readSource(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function readBetween(source: string, startMarker: string, endMarker: string) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  return source.slice(start, end);
}

describe("F-0119 organization portal authorization read model", () => {
  it("exposes a plural authorization support projection", () => {
    const contract = readSource(
      "src/server/contracts/organization-portal-overview-contract.ts",
    );
    const overviewDto = readBetween(
      contract,
      "export type OrganizationPortalOverviewDto",
      "};",
    );

    expect(overviewDto).toContain(
      "authorizations: OrganizationPortalAuthorizationDto[]",
    );
    expect(overviewDto).not.toContain(
      "authorization: OrganizationPortalAuthorizationDto | null",
    );
    expect(contract).toContain('AuthStatus | "not_started"');
  });

  it("does not accept the session-selected authorization id as repository input", () => {
    const service = readSource(
      "src/server/services/organization-portal-overview-service.ts",
    );
    const repositoryInput = readBetween(
      service,
      "export type OrganizationPortalOverviewRepositoryInput",
      "};",
    );
    const repositoryCall = readBetween(
      service,
      "const overview = await repository.readOverview",
      "if (overview === null)",
    );

    expect(repositoryInput).not.toContain("authorizationPublicId");
    expect(repositoryCall).not.toContain("authorizationPublicId");
  });

  it("loads every covering authorization and its coverage count in one set-based query", () => {
    const repository = readSource(
      "src/server/repositories/organization-portal-overview-repository.ts",
    );
    const authorizationReader = readBetween(
      repository,
      "async function readAuthorizationOverviews",
      "function createLocalRuntimeDatabase",
    );

    expect(authorizationReader).toContain("countDistinct(organization.id)");
    expect(authorizationReader).toContain(
      "createOrgAuthCoversOrganizationCondition",
    );
    expect(authorizationReader).toContain("return rows.map");
    expect(authorizationReader).toContain("bool_or");
    expect(authorizationReader).not.toContain("authUpgrade.id,\n");
    expect(authorizationReader).not.toContain("authIdentityCondition");
    expect(authorizationReader).not.toContain("activeFallbackCondition");
    expect(authorizationReader).not.toContain(".limit(1)");
  });

  it("renders every current and historical authorization row", () => {
    const page = readSource(
      "src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx",
    );
    const authorizationCard = readBetween(
      page,
      "function AuthorizationOverviewCard",
      "function MetricBlock",
    );

    expect(page).toContain("authorizations={overviewData.authorizations}");
    expect(authorizationCard).toContain("authorizations.map");
    expect(authorizationCard).toContain("authorization.status");
    expect(authorizationCard).toContain("authorization.accountQuota");
    expect(authorizationCard).toContain("authorization.expiresAt");
    expect(page).toContain('not_started: "待生效"');
  });
});
