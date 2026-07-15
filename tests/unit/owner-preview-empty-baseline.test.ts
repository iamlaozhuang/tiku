import { describe, expect, it, vi } from "vitest";

import {
  assertOwnerPreviewExecutionAllowed,
  containsForbiddenOwnerPreviewEvidenceText,
  createOwnerPreviewEmptyBaselineDryRunSummary,
  createOwnerPreviewEmptyBaselinePlan,
  createOwnerPreviewEmptyBaselineSqlAdapter,
  ownerPreviewEmptyBaselineRoleLabels,
  renderOwnerPreviewEmptyBaselineSummary,
  runOwnerPreviewEmptyBaseline,
  validateOwnerPreviewDatabaseUrl,
} from "@/db/owner-preview-empty-baseline";

const databaseUrlProtocol = "postgres" + "://";
const fakeSecret = "fake-secret";

function buildDatabaseUrl(host: string, databaseName = "tiku") {
  return `${databaseUrlProtocol}local_user:${fakeSecret}@${host}:5432/${databaseName}`;
}

describe("owner preview empty baseline reset", () => {
  it("pins the exact eight owner preview role labels without boundary-only roles", () => {
    expect(ownerPreviewEmptyBaselineRoleLabels).toEqual([
      "personal_standard_student",
      "personal_advanced_student",
      "org_standard_admin",
      "org_advanced_admin",
      "org_standard_employee",
      "org_advanced_employee",
      "content_admin",
      "ops_admin",
    ]);
    expect(ownerPreviewEmptyBaselineRoleLabels).not.toContain("anonymous_user");
    expect(ownerPreviewEmptyBaselineRoleLabels).not.toContain(
      "super_admin_boundary",
    );
  });

  it("plans business-content cleanup while preserving the identity and auth skeleton", () => {
    const plan = createOwnerPreviewEmptyBaselinePlan();
    const plannedTables = plan.truncateTableGroups.flatMap(
      (tableGroup) => tableGroup.tables,
    );

    expect(plan.preservedBaselineGroups).toEqual([
      "owner_preview_role_principals",
      "personal_auth_skeleton",
      "org_auth_skeleton",
      "organization_employee_bindings",
    ]);
    expect(plannedTables).toEqual(
      expect.arrayContaining([
        "answer_record",
        "mock_exam",
        "practice",
        "mistake_book",
        "exam_report",
        "paper",
        "question",
        "material",
        "resource",
        "knowledge_base",
        "ai_generation_task",
        "ai_call_log",
        "audit_log",
      ]),
    );
    expect(plannedTables).not.toEqual(
      expect.arrayContaining([
        "auth_user",
        "auth_account",
        "user",
        "admin",
        "organization",
        "employee",
        "personal_auth",
        "org_auth",
      ]),
    );
  });

  it("accepts loopback database targets and rejects remote or ambiguous targets without leaking URLs", () => {
    expect(
      validateOwnerPreviewDatabaseUrl(buildDatabaseUrl("localhost")),
    ).toEqual({
      databaseName: "tiku",
      hostClass: "loopback",
      ok: true,
    });
    expect(
      validateOwnerPreviewDatabaseUrl(buildDatabaseUrl("127.0.0.1")),
    ).toMatchObject({
      databaseName: "tiku",
      hostClass: "loopback",
      ok: true,
    });
    expect(
      validateOwnerPreviewDatabaseUrl(buildDatabaseUrl("db.example.com")),
    ).toEqual({
      failureCategory: "target_not_local_dev",
      hostClass: "remote",
      ok: false,
    });
    expect(validateOwnerPreviewDatabaseUrl("not-a-url")).toEqual({
      failureCategory: "database_url_invalid",
      hostClass: "invalid",
      ok: false,
    });
  });

  it("requires execute mode to include explicit confirmation and a valid local target", () => {
    const target = validateOwnerPreviewDatabaseUrl(
      buildDatabaseUrl("localhost"),
    );

    expect(() =>
      assertOwnerPreviewExecutionAllowed({
        confirmOwnerPreviewEmptyBaseline: false,
        databaseTarget: target,
        mode: "execute",
      }),
    ).toThrow("owner_preview_confirmation_missing");
    expect(() =>
      assertOwnerPreviewExecutionAllowed({
        confirmOwnerPreviewEmptyBaseline: true,
        databaseTarget: target,
        mode: "execute",
      }),
    ).not.toThrow();
    expect(() =>
      assertOwnerPreviewExecutionAllowed({
        confirmOwnerPreviewEmptyBaseline: true,
        databaseTarget: validateOwnerPreviewDatabaseUrl(
          buildDatabaseUrl("db.example.com"),
        ),
        mode: "execute",
      }),
    ).toThrow("target_not_local_dev");
  });

  it("keeps dry-run fully offline and renders only redacted role/table summaries", async () => {
    const adapter = {
      close: vi.fn(),
      inspectRoleSet: vi.fn(),
      resetToEmptyBaseline: vi.fn(),
    };

    const result = await runOwnerPreviewEmptyBaseline({
      adapter,
      confirmOwnerPreviewEmptyBaseline: false,
      databaseUrl: undefined,
      mode: "dry_run",
    });
    const rendered = renderOwnerPreviewEmptyBaselineSummary(result.summary);

    expect(result.status).toBe("dry_run");
    expect(adapter.inspectRoleSet).not.toHaveBeenCalled();
    expect(adapter.resetToEmptyBaseline).not.toHaveBeenCalled();
    expect(rendered).toContain("mode=dry_run");
    expect(rendered).toContain("role=personal_standard_student");
    expect(rendered).toContain("tableGroup=learning_flow");
    expect(containsForbiddenOwnerPreviewEvidenceText(rendered)).toBe(false);
  });

  it("derives organization employee roles from current tree coverage and quota reservations", async () => {
    const capturedQueries: string[] = [];
    const executor = {
      async unsafe(query: string) {
        capturedQueries.push(query);
        return [];
      },
    };
    const sql = {
      ...executor,
      async begin<T>(callback: (transaction: typeof executor) => Promise<T>) {
        return callback(executor);
      },
    };
    const adapter = createOwnerPreviewEmptyBaselineSqlAdapter(sql as never);

    await adapter.inspectRoleSet();

    expect(capturedQueries).toHaveLength(1);
    expect(capturedQueries[0]).toContain("JOIN employee_org_auth eoa");
    expect(capturedQueries[0]).toContain(
      "WITH RECURSIVE organization_ancestor",
    );
    expect(capturedQueries[0]).toContain(
      "oa.auth_scope_type = 'specified_nodes'",
    );
    expect(capturedQueries[0]).toContain(
      "oa.auth_scope_type = 'current_and_descendants'",
    );
    expect(capturedQueries[0]).toContain(
      "tree_integrity.parent_organization_id IS NULL",
    );
  });

  it("blocks execution when role validation is missing or ambiguous and reports labels only", async () => {
    const adapter = {
      close: vi.fn(),
      inspectRoleSet: vi.fn(async () => ({
        distinctPrincipalCount: 7,
        extraPrincipalCount: 1,
        roleCounts: {
          content_admin: 1,
          ops_admin: 1,
          org_advanced_admin: 1,
          org_advanced_employee: 1,
          org_standard_admin: 1,
          org_standard_employee: 1,
          personal_advanced_student: 0,
          personal_standard_student: 2,
        },
        totalRoleMatchCount: 8,
      })),
      resetToEmptyBaseline: vi.fn(),
    };

    const result = await runOwnerPreviewEmptyBaseline({
      adapter,
      confirmOwnerPreviewEmptyBaseline: true,
      databaseUrl: buildDatabaseUrl("127.0.0.1"),
      mode: "execute",
    });
    const rendered = renderOwnerPreviewEmptyBaselineSummary(result.summary);

    expect(result.status).toBe("blocked");
    expect(adapter.inspectRoleSet).toHaveBeenCalledTimes(1);
    expect(adapter.resetToEmptyBaseline).not.toHaveBeenCalled();
    expect(rendered).toContain("failureCategory=role_set_not_exact");
    expect(rendered).toContain("role=personal_advanced_student");
    expect(rendered).toContain("role=personal_standard_student");
    expect(containsForbiddenOwnerPreviewEvidenceText(rendered)).toBe(false);
  });

  it("renders dry-run state counts without sensitive evidence terms", () => {
    const summary = createOwnerPreviewEmptyBaselineDryRunSummary({
      databaseTarget: validateOwnerPreviewDatabaseUrl(
        buildDatabaseUrl("localhost", "tiku_owner_preview"),
      ),
    });
    const rendered = renderOwnerPreviewEmptyBaselineSummary(summary);

    expect(rendered).toContain("databaseName=tiku_owner_preview");
    expect(rendered).toContain("roleCount=8");
    expect(rendered).toContain("preservedGroup=personal_auth_skeleton");
    expect(containsForbiddenOwnerPreviewEvidenceText(rendered)).toBe(false);
  });
});
