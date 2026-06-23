import { expect, test } from "@playwright/test";

type RoleRow =
  | "personal_advanced_student"
  | "org_standard_employee"
  | "org_advanced_employee"
  | "org_standard_admin"
  | "org_advanced_admin"
  | "content_admin"
  | "ops_admin";

type WorkflowLabel =
  | "advanced_entitlement"
  | "standard_employee_training"
  | "advanced_employee_training"
  | "own_organization_standard_admin"
  | "own_organization_advanced_admin"
  | "content_authoring"
  | "system_operations"
  | "student_learning"
  | "admin_console"
  | "content_operations"
  | "organization_admin"
  | "provider_configuration"
  | "cost_controls"
  | "cross_organization_access"
  | "advanced_only_entitlement";

type RoleSeparatedFixture = {
  roleRow: RoleRow;
  fixtureLabel: string;
  actorKind: "student" | "employee" | "organization_admin" | "admin";
  edition: "standard" | "advanced" | "not_applicable";
  organizationBoundary: {
    ownOrganizationOnly: true;
    crossOrganizationAccess: "denied";
  } | null;
  allowedWorkflowLabels: readonly WorkflowLabel[];
  deniedWorkflowLabels: readonly WorkflowLabel[];
};

const approvedFixtureRows = [
  "personal_advanced_student",
  "org_standard_employee",
  "org_advanced_employee",
  "org_standard_admin",
  "org_advanced_admin",
  "content_admin",
  "ops_admin",
] as const satisfies readonly RoleRow[];

const roleSeparatedFixtures = [
  {
    roleRow: "personal_advanced_student",
    fixtureLabel: "fixture-personal-advanced-student",
    actorKind: "student",
    edition: "advanced",
    organizationBoundary: null,
    allowedWorkflowLabels: ["student_learning", "advanced_entitlement"],
    deniedWorkflowLabels: [
      "admin_console",
      "content_operations",
      "system_operations",
      "organization_admin",
      "provider_configuration",
      "cost_controls",
    ],
  },
  {
    roleRow: "org_standard_employee",
    fixtureLabel: "fixture-org-standard-employee",
    actorKind: "employee",
    edition: "standard",
    organizationBoundary: {
      ownOrganizationOnly: true,
      crossOrganizationAccess: "denied",
    },
    allowedWorkflowLabels: ["standard_employee_training", "student_learning"],
    deniedWorkflowLabels: [
      "advanced_only_entitlement",
      "admin_console",
      "content_operations",
      "system_operations",
      "organization_admin",
      "cross_organization_access",
    ],
  },
  {
    roleRow: "org_advanced_employee",
    fixtureLabel: "fixture-org-advanced-employee",
    actorKind: "employee",
    edition: "advanced",
    organizationBoundary: {
      ownOrganizationOnly: true,
      crossOrganizationAccess: "denied",
    },
    allowedWorkflowLabels: [
      "advanced_employee_training",
      "student_learning",
      "advanced_entitlement",
    ],
    deniedWorkflowLabels: [
      "admin_console",
      "content_operations",
      "system_operations",
      "organization_admin",
      "cross_organization_access",
    ],
  },
  {
    roleRow: "org_standard_admin",
    fixtureLabel: "fixture-org-standard-admin",
    actorKind: "organization_admin",
    edition: "standard",
    organizationBoundary: {
      ownOrganizationOnly: true,
      crossOrganizationAccess: "denied",
    },
    allowedWorkflowLabels: ["own_organization_standard_admin"],
    deniedWorkflowLabels: [
      "advanced_only_entitlement",
      "system_operations",
      "provider_configuration",
      "cost_controls",
      "cross_organization_access",
    ],
  },
  {
    roleRow: "org_advanced_admin",
    fixtureLabel: "fixture-org-advanced-admin",
    actorKind: "organization_admin",
    edition: "advanced",
    organizationBoundary: {
      ownOrganizationOnly: true,
      crossOrganizationAccess: "denied",
    },
    allowedWorkflowLabels: [
      "own_organization_advanced_admin",
      "advanced_entitlement",
    ],
    deniedWorkflowLabels: [
      "system_operations",
      "provider_configuration",
      "cost_controls",
      "cross_organization_access",
    ],
  },
  {
    roleRow: "content_admin",
    fixtureLabel: "fixture-content-admin",
    actorKind: "admin",
    edition: "not_applicable",
    organizationBoundary: null,
    allowedWorkflowLabels: ["content_authoring", "content_operations"],
    deniedWorkflowLabels: [
      "system_operations",
      "organization_admin",
      "provider_configuration",
      "cost_controls",
    ],
  },
  {
    roleRow: "ops_admin",
    fixtureLabel: "fixture-ops-admin",
    actorKind: "admin",
    edition: "not_applicable",
    organizationBoundary: null,
    allowedWorkflowLabels: ["system_operations"],
    deniedWorkflowLabels: [
      "content_authoring",
      "content_operations",
      "provider_configuration",
      "cost_controls",
    ],
  },
] as const satisfies readonly RoleSeparatedFixture[];

const auditorFixtureDecision = {
  roleRow: "auditor_if_supported",
  includedInFixtureSupplement: false,
  reason: "owner_excluded_auditor_from_this_fixture_supplement_scope",
} as const;

const forbiddenEvidenceMarkers = [
  "Bearer ",
  "Authorization",
  "cookie",
  "localStorage",
  "password",
  "secret",
  "token",
  "apiKey",
  "databaseUrl",
  "providerRequestPayload",
  "providerResponsePayload",
  "raw prompt",
  "raw answer",
  "raw generated AI content",
] as const;

test.describe("role-separated account test-only fixture supplement", () => {
  test("covers the approved fixture rows and excludes auditor", () => {
    const coveredRows = roleSeparatedFixtures.map((fixture) => fixture.roleRow);

    expect(new Set(coveredRows).size).toBe(approvedFixtureRows.length);
    expect([...coveredRows].sort()).toEqual([...approvedFixtureRows].sort());
    expect(auditorFixtureDecision).toMatchObject({
      includedInFixtureSupplement: false,
      roleRow: "auditor_if_supported",
    });
  });

  test("defines at least one allowed and denied behavior for every role", () => {
    for (const fixture of roleSeparatedFixtures) {
      expect(fixture.allowedWorkflowLabels.length).toBeGreaterThan(0);
      expect(fixture.deniedWorkflowLabels.length).toBeGreaterThan(0);

      const deniedWorkflowLabelSet = new Set<WorkflowLabel>(
        fixture.deniedWorkflowLabels,
      );
      const conflictingWorkflowLabels = fixture.allowedWorkflowLabels.filter(
        (allowedWorkflowLabel) =>
          deniedWorkflowLabelSet.has(allowedWorkflowLabel),
      );

      expect(conflictingWorkflowLabels).toEqual([]);
    }
  });

  test("keeps learners and employees separated from admin privileges", () => {
    for (const roleRow of [
      "personal_advanced_student",
      "org_standard_employee",
      "org_advanced_employee",
    ] as const) {
      const fixture = findFixture(roleRow);

      expect(fixture.deniedWorkflowLabels).toEqual(
        expect.arrayContaining([
          "admin_console",
          "content_operations",
          "system_operations",
          "organization_admin",
        ]),
      );
    }
  });

  test("keeps organization fixtures scoped by organization and edition", () => {
    for (const roleRow of [
      "org_standard_employee",
      "org_advanced_employee",
      "org_standard_admin",
      "org_advanced_admin",
    ] as const) {
      const fixture = findFixture(roleRow);

      expect(fixture.organizationBoundary).toMatchObject({
        crossOrganizationAccess: "denied",
        ownOrganizationOnly: true,
      });
      expect(fixture.deniedWorkflowLabels).toContain(
        "cross_organization_access",
      );
    }

    expect(findFixture("org_standard_employee").deniedWorkflowLabels).toContain(
      "advanced_only_entitlement",
    );
    expect(findFixture("org_standard_admin").deniedWorkflowLabels).toContain(
      "advanced_only_entitlement",
    );
    expect(
      findFixture("org_advanced_employee").allowedWorkflowLabels,
    ).toContain("advanced_entitlement");
    expect(findFixture("org_advanced_admin").allowedWorkflowLabels).toContain(
      "advanced_entitlement",
    );
  });

  test("keeps content and system operations mutually separated", () => {
    const contentAdminFixture = findFixture("content_admin");
    const opsAdminFixture = findFixture("ops_admin");

    expect(contentAdminFixture.allowedWorkflowLabels).toEqual(
      expect.arrayContaining(["content_authoring", "content_operations"]),
    );
    expect(contentAdminFixture.deniedWorkflowLabels).toEqual(
      expect.arrayContaining([
        "system_operations",
        "organization_admin",
        "provider_configuration",
        "cost_controls",
      ]),
    );

    expect(opsAdminFixture.allowedWorkflowLabels).toContain(
      "system_operations",
    );
    expect(opsAdminFixture.deniedWorkflowLabels).toEqual(
      expect.arrayContaining([
        "content_authoring",
        "content_operations",
        "provider_configuration",
        "cost_controls",
      ]),
    );
  });

  test("keeps fixture evidence labels redacted", () => {
    const serializedFixtureContract = JSON.stringify({
      auditorFixtureDecision,
      roleSeparatedFixtures,
    });

    for (const forbiddenEvidenceMarker of forbiddenEvidenceMarkers) {
      expect(serializedFixtureContract).not.toContain(forbiddenEvidenceMarker);
    }
  });
});

function findFixture(roleRow: RoleRow) {
  const matchedFixture = roleSeparatedFixtures.find(
    (fixture) => fixture.roleRow === roleRow,
  );

  if (!matchedFixture) {
    throw new Error(`Missing role-separated fixture row: ${roleRow}`);
  }

  return matchedFixture;
}
