import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ownerPreviewEmptyBaselineRoleLabels = [
  "personal_standard_student",
  "personal_advanced_student",
  "org_standard_admin",
  "org_advanced_admin",
  "org_standard_employee",
  "org_advanced_employee",
  "content_admin",
  "ops_admin",
] as const;

export type OwnerPreviewEmptyBaselineRoleLabel =
  (typeof ownerPreviewEmptyBaselineRoleLabels)[number];

export type OwnerPreviewEmptyBaselineMode = "dry_run" | "execute";

type OwnerPreviewDatabaseTargetFailureCategory =
  | "database_url_invalid"
  | "database_url_missing"
  | "database_name_not_local_dev"
  | "target_not_local_dev";

export type OwnerPreviewDatabaseTarget =
  | {
      databaseName: string;
      hostClass: "loopback";
      ok: true;
    }
  | {
      failureCategory: OwnerPreviewDatabaseTargetFailureCategory;
      hostClass: "invalid" | "missing" | "remote";
      ok: false;
    };

export type OwnerPreviewEmptyBaselineTableGroup = {
  key:
    | "ai_generation_flow"
    | "content_authoring"
    | "learning_flow"
    | "ops_logs"
    | "rag_content"
    | "volatile_auth_state";
  tables: string[];
};

export type OwnerPreviewEmptyBaselinePlan = {
  preservedBaselineGroups: string[];
  roleLabels: OwnerPreviewEmptyBaselineRoleLabel[];
  truncateTableGroups: OwnerPreviewEmptyBaselineTableGroup[];
};

export type OwnerPreviewRoleSetInspection = {
  distinctPrincipalCount: number;
  extraPrincipalCount: number;
  roleCounts: Record<OwnerPreviewEmptyBaselineRoleLabel, number>;
  totalRoleMatchCount: number;
};

type OwnerPreviewRoleSetEvaluation = {
  ambiguousLabels: OwnerPreviewEmptyBaselineRoleLabel[];
  distinctPrincipalCount: number;
  extraPrincipalCount: number;
  missingLabels: OwnerPreviewEmptyBaselineRoleLabel[];
  ok: boolean;
  totalRoleMatchCount: number;
};

export type OwnerPreviewEmptyBaselineExecutionSummary = {
  clearedTableGroupCount: number;
  preservedRoleCount: number;
  prunedIdentitySkeleton: boolean;
};

export type OwnerPreviewEmptyBaselineDatabaseAdapter = {
  close?: () => Promise<void> | void;
  inspectRoleSet: () => Promise<OwnerPreviewRoleSetInspection>;
  resetToEmptyBaseline: () => Promise<OwnerPreviewEmptyBaselineExecutionSummary>;
};

export type OwnerPreviewEmptyBaselineSummary = {
  databaseTarget?: OwnerPreviewDatabaseTarget;
  execution?: OwnerPreviewEmptyBaselineExecutionSummary;
  failureCategory?: string;
  mode: OwnerPreviewEmptyBaselineMode;
  plan: OwnerPreviewEmptyBaselinePlan;
  roleEvaluation?: OwnerPreviewRoleSetEvaluation;
  status: "blocked" | "dry_run" | "executed";
};

export type OwnerPreviewEmptyBaselineRunResult = {
  status: "blocked" | "dry_run" | "executed";
  summary: OwnerPreviewEmptyBaselineSummary;
};

const localLoopbackHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const localDatabaseNamePattern = /^tiku(?:$|[_-])/i;
const nonLocalDatabaseNamePattern = /(prod|production|staging|cloud)/i;
const databaseUrlEnvKey = "DATABASE" + "_URL";

const ownerPreviewEmptyBaselineTableGroups: OwnerPreviewEmptyBaselineTableGroup[] =
  [
    {
      key: "volatile_auth_state",
      tables: ["auth_session", "auth_verification"],
    },
    {
      key: "learning_flow",
      tables: [
        "answer_record",
        "exam_report",
        "mock_exam",
        "practice",
        "mistake_book",
        "organization_training_answer",
        "organization_training_version",
        "organization_training_source_context",
        "organization_training_draft",
      ],
    },
    {
      key: "ai_generation_flow",
      tables: [
        "admin_ai_generation_formal_adoption",
        "admin_ai_generation_result",
        "admin_ai_generation_task_metadata",
        "personal_ai_generation_result",
        "ai_scoring_attempt",
        "ai_generation_task",
        "ai_call_log",
      ],
    },
    {
      key: "content_authoring",
      tables: [
        "paper_asset",
        "paper_scoring_point",
        "paper_question",
        "question_group",
        "paper_section",
        "paper",
        "question_tag",
        "question_knowledge_node",
        "tag",
        "scoring_point",
        "question_option",
        "question",
        "material",
      ],
    },
    {
      key: "rag_content",
      tables: [
        "knowledge_node_resource",
        "resource",
        "knowledge_node",
        "knowledge_base",
      ],
    },
    {
      key: "ops_logs",
      tables: ["audit_log"],
    },
  ];

const preservedBaselineGroups = [
  "owner_preview_role_principals",
  "personal_auth_skeleton",
  "org_auth_skeleton",
  "organization_employee_bindings",
] as const;

const forbiddenEvidencePatterns = [
  /postgres(?:ql)?:\/\//i,
  /\bpassword\b/i,
  /\btoken\b/i,
  /\bcookie\b/i,
  /\bsession\b/i,
  /localstorage/i,
  /authorization_header/i,
  /bearer\s+[a-z0-9._-]+/i,
  /database_url/i,
  /api[_-]?key/i,
  /redeem_code/i,
  /provider_payload/i,
  /raw_ai_output/i,
  /raw_prompt/i,
  /\bemail\b/i,
  /\bphone\b/i,
  /public_id/i,
  /internal_id/i,
];

type OwnerPreviewRoleCountRow = {
  role_count: number | string;
  role_label: OwnerPreviewEmptyBaselineRoleLabel | string;
};

type OwnerPreviewSqlExecutor = {
  unsafe<Row extends Record<string, unknown> = Record<string, unknown>>(
    query: string,
  ): Promise<Row[]>;
};

type QueryableSql = OwnerPreviewSqlExecutor & {
  begin<T>(callback: (sql: OwnerPreviewSqlExecutor) => Promise<T>): Promise<T>;
  end?: () => Promise<void>;
};

export function createOwnerPreviewEmptyBaselinePlan(): OwnerPreviewEmptyBaselinePlan {
  return {
    preservedBaselineGroups: [...preservedBaselineGroups],
    roleLabels: [...ownerPreviewEmptyBaselineRoleLabels],
    truncateTableGroups: ownerPreviewEmptyBaselineTableGroups.map(
      (tableGroup) => ({
        key: tableGroup.key,
        tables: [...tableGroup.tables],
      }),
    ),
  };
}

export function validateOwnerPreviewDatabaseUrl(
  databaseUrl: string | null | undefined,
): OwnerPreviewDatabaseTarget {
  if (!databaseUrl) {
    return {
      failureCategory: "database_url_missing",
      hostClass: "missing",
      ok: false,
    };
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    return {
      failureCategory: "database_url_invalid",
      hostClass: "invalid",
      ok: false,
    };
  }

  const protocol = parsedUrl.protocol.toLowerCase();
  const hostName = parsedUrl.hostname.toLowerCase();
  const databaseName = decodeURIComponent(parsedUrl.pathname).replace(
    /^\/+/,
    "",
  );

  if (!["postgres:", "postgresql:"].includes(protocol)) {
    return {
      failureCategory: "database_url_invalid",
      hostClass: "invalid",
      ok: false,
    };
  }

  if (!localLoopbackHosts.has(hostName)) {
    return {
      failureCategory: "target_not_local_dev",
      hostClass: "remote",
      ok: false,
    };
  }

  if (
    !databaseName ||
    !localDatabaseNamePattern.test(databaseName) ||
    nonLocalDatabaseNamePattern.test(databaseName)
  ) {
    return {
      failureCategory: "database_name_not_local_dev",
      hostClass: "remote",
      ok: false,
    };
  }

  return {
    databaseName,
    hostClass: "loopback",
    ok: true,
  };
}

export function assertOwnerPreviewExecutionAllowed(input: {
  confirmOwnerPreviewEmptyBaseline: boolean;
  databaseTarget: OwnerPreviewDatabaseTarget;
  mode: OwnerPreviewEmptyBaselineMode;
}) {
  if (input.mode === "dry_run") {
    return;
  }

  if (!input.confirmOwnerPreviewEmptyBaseline) {
    throw new Error("owner_preview_confirmation_missing");
  }

  if (!input.databaseTarget.ok) {
    throw new Error(input.databaseTarget.failureCategory);
  }
}

export function createOwnerPreviewEmptyBaselineDryRunSummary(input: {
  databaseTarget?: OwnerPreviewDatabaseTarget;
}): OwnerPreviewEmptyBaselineSummary {
  return {
    databaseTarget: input.databaseTarget,
    mode: "dry_run",
    plan: createOwnerPreviewEmptyBaselinePlan(),
    status: "dry_run",
  };
}

export function containsForbiddenOwnerPreviewEvidenceText(text: string) {
  return forbiddenEvidencePatterns.some((pattern) => pattern.test(text));
}

export function renderOwnerPreviewEmptyBaselineSummary(
  summary: OwnerPreviewEmptyBaselineSummary,
) {
  const lines = [
    "ownerPreviewEmptyBaseline",
    `mode=${summary.mode}`,
    `status=${summary.status}`,
    `roleCount=${summary.plan.roleLabels.length}`,
  ];

  if (summary.databaseTarget) {
    lines.push(renderDatabaseTarget(summary.databaseTarget));
  } else {
    lines.push("databaseTarget=not_required");
  }

  for (const roleLabel of summary.plan.roleLabels) {
    lines.push(`role=${roleLabel}`);
  }

  for (const preservedGroup of summary.plan.preservedBaselineGroups) {
    lines.push(`preservedGroup=${preservedGroup}`);
  }

  for (const tableGroup of summary.plan.truncateTableGroups) {
    lines.push(
      `tableGroup=${tableGroup.key} tableCount=${tableGroup.tables.length}`,
    );
  }

  if (summary.roleEvaluation) {
    lines.push(
      `roleValidation=${summary.roleEvaluation.ok ? "pass" : "blocked"}`,
    );
    lines.push(
      `distinctPrincipalCount=${summary.roleEvaluation.distinctPrincipalCount}`,
    );
    lines.push(
      `extraPrincipalCount=${summary.roleEvaluation.extraPrincipalCount}`,
    );

    for (const roleLabel of summary.roleEvaluation.missingLabels) {
      lines.push(`missingRole=${roleLabel}`);
    }

    for (const roleLabel of summary.roleEvaluation.ambiguousLabels) {
      lines.push(`ambiguousRole=${roleLabel}`);
    }
  }

  if (summary.execution) {
    lines.push(
      `clearedTableGroupCount=${summary.execution.clearedTableGroupCount}`,
    );
    lines.push(`preservedRoleCount=${summary.execution.preservedRoleCount}`);
    lines.push(
      `prunedIdentitySkeleton=${summary.execution.prunedIdentitySkeleton}`,
    );
  }

  if (summary.failureCategory) {
    lines.push(`failureCategory=${summary.failureCategory}`);
  }

  return lines.join("\n");
}

export async function runOwnerPreviewEmptyBaseline(input: {
  adapter?: OwnerPreviewEmptyBaselineDatabaseAdapter;
  confirmOwnerPreviewEmptyBaseline: boolean;
  databaseUrl?: string;
  mode: OwnerPreviewEmptyBaselineMode;
}): Promise<OwnerPreviewEmptyBaselineRunResult> {
  if (input.mode === "dry_run") {
    const databaseTarget = input.databaseUrl
      ? validateOwnerPreviewDatabaseUrl(input.databaseUrl)
      : undefined;
    const summary = createOwnerPreviewEmptyBaselineDryRunSummary({
      databaseTarget,
    });

    return { status: "dry_run", summary };
  }

  const databaseTarget = validateOwnerPreviewDatabaseUrl(input.databaseUrl);

  try {
    assertOwnerPreviewExecutionAllowed({
      confirmOwnerPreviewEmptyBaseline: input.confirmOwnerPreviewEmptyBaseline,
      databaseTarget,
      mode: input.mode,
    });
  } catch (error) {
    const summary: OwnerPreviewEmptyBaselineSummary = {
      databaseTarget,
      failureCategory: error instanceof Error ? error.message : "blocked",
      mode: input.mode,
      plan: createOwnerPreviewEmptyBaselinePlan(),
      status: "blocked",
    };

    return { status: "blocked", summary };
  }

  const adapter =
    input.adapter ??
    (await createOwnerPreviewEmptyBaselinePostgresAdapter(input.databaseUrl));

  try {
    const roleInspection = await adapter.inspectRoleSet();
    const roleEvaluation = evaluateRoleSetInspection(roleInspection);

    if (!roleEvaluation.ok) {
      return {
        status: "blocked",
        summary: {
          databaseTarget,
          failureCategory: "role_set_not_exact",
          mode: input.mode,
          plan: createOwnerPreviewEmptyBaselinePlan(),
          roleEvaluation,
          status: "blocked",
        },
      };
    }

    const execution = await adapter.resetToEmptyBaseline();

    return {
      status: "executed",
      summary: {
        databaseTarget,
        execution,
        mode: input.mode,
        plan: createOwnerPreviewEmptyBaselinePlan(),
        roleEvaluation,
        status: "executed",
      },
    };
  } finally {
    await adapter.close?.();
  }
}

export async function createOwnerPreviewEmptyBaselinePostgresAdapter(
  databaseUrl: string | undefined,
): Promise<OwnerPreviewEmptyBaselineDatabaseAdapter> {
  if (!databaseUrl) {
    throw new Error("database_url_missing");
  }

  const postgresModule = await import("postgres");
  const postgresFactory = postgresModule.default;
  const sql = postgresFactory(databaseUrl, {
    connect_timeout: 5,
    idle_timeout: 5,
    max: 1,
  }) as unknown as QueryableSql;

  return createOwnerPreviewEmptyBaselineSqlAdapter(sql);
}

export function createOwnerPreviewEmptyBaselineSqlAdapter(
  sql: QueryableSql,
): OwnerPreviewEmptyBaselineDatabaseAdapter {
  return {
    close: () => sql.end?.(),
    inspectRoleSet: async () => inspectOwnerPreviewRoleSet(sql),
    resetToEmptyBaseline: async () => resetOwnerPreviewEmptyBaseline(sql),
  };
}

export async function runOwnerPreviewEmptyBaselineCli(
  argv = process.argv.slice(2),
  env: NodeJS.ProcessEnv = process.env,
  io: {
    error: (message: string) => void;
    log: (message: string) => void;
  } = console,
) {
  const mode: OwnerPreviewEmptyBaselineMode = argv.includes("--execute")
    ? "execute"
    : "dry_run";
  const confirmOwnerPreviewEmptyBaseline = argv.includes(
    "--confirm-owner-preview-empty-baseline",
  );
  const databaseUrl = mode === "execute" ? env[databaseUrlEnvKey] : undefined;
  const result = await runOwnerPreviewEmptyBaseline({
    confirmOwnerPreviewEmptyBaseline,
    databaseUrl,
    mode,
  });
  const rendered = renderOwnerPreviewEmptyBaselineSummary(result.summary);

  if (containsForbiddenOwnerPreviewEvidenceText(rendered)) {
    io.error("ownerPreviewEmptyBaseline output redaction guard failed.");
    return 2;
  }

  io.log(rendered);

  return result.status === "blocked" ? 1 : 0;
}

function renderDatabaseTarget(databaseTarget: OwnerPreviewDatabaseTarget) {
  if (!databaseTarget.ok) {
    return `databaseTarget=blocked hostClass=${databaseTarget.hostClass} failureCategory=${databaseTarget.failureCategory}`;
  }

  return `databaseTarget=local hostClass=${databaseTarget.hostClass} databaseName=${databaseTarget.databaseName}`;
}

function evaluateRoleSetInspection(
  inspection: OwnerPreviewRoleSetInspection,
): OwnerPreviewRoleSetEvaluation {
  const missingLabels = ownerPreviewEmptyBaselineRoleLabels.filter(
    (roleLabel) => inspection.roleCounts[roleLabel] === 0,
  );
  const ambiguousLabels = ownerPreviewEmptyBaselineRoleLabels.filter(
    (roleLabel) => inspection.roleCounts[roleLabel] > 1,
  );
  const ok =
    missingLabels.length === 0 &&
    ambiguousLabels.length === 0 &&
    inspection.distinctPrincipalCount ===
      ownerPreviewEmptyBaselineRoleLabels.length &&
    inspection.totalRoleMatchCount ===
      ownerPreviewEmptyBaselineRoleLabels.length;

  return {
    ambiguousLabels,
    distinctPrincipalCount: inspection.distinctPrincipalCount,
    extraPrincipalCount: inspection.extraPrincipalCount,
    missingLabels,
    ok,
    totalRoleMatchCount: inspection.totalRoleMatchCount,
  };
}

async function inspectOwnerPreviewRoleSet(sql: OwnerPreviewSqlExecutor) {
  const rows = await sql.unsafe<OwnerPreviewRoleCountRow>(
    createOwnerPreviewRoleInspectionSql(),
  );

  return mapRoleInspectionRows(rows);
}

function mapRoleInspectionRows(
  rows: OwnerPreviewRoleCountRow[],
): OwnerPreviewRoleSetInspection {
  const roleCounts = ownerPreviewEmptyBaselineRoleLabels.reduce(
    (result, roleLabel) => {
      result[roleLabel] = 0;
      return result;
    },
    {} as Record<OwnerPreviewEmptyBaselineRoleLabel, number>,
  );
  let distinctPrincipalCount = 0;
  let extraPrincipalCount = 0;
  let totalRoleMatchCount = 0;

  for (const row of rows) {
    const roleCount = Number(row.role_count);

    if (row.role_label === "__distinct_principal_count") {
      distinctPrincipalCount = roleCount;
      continue;
    }

    if (row.role_label === "__extra_principal_count") {
      extraPrincipalCount = roleCount;
      continue;
    }

    if (row.role_label === "__total_role_match_count") {
      totalRoleMatchCount = roleCount;
      continue;
    }

    if (isOwnerPreviewRoleLabel(row.role_label)) {
      roleCounts[row.role_label] = roleCount;
    }
  }

  return {
    distinctPrincipalCount,
    extraPrincipalCount,
    roleCounts,
    totalRoleMatchCount,
  };
}

async function resetOwnerPreviewEmptyBaseline(
  sql: QueryableSql,
): Promise<OwnerPreviewEmptyBaselineExecutionSummary> {
  const plan = createOwnerPreviewEmptyBaselinePlan();
  const tablesToTruncate = plan.truncateTableGroups.flatMap(
    (tableGroup) => tableGroup.tables,
  );

  await sql.begin(async (transaction) => {
    const roleInspection = await inspectOwnerPreviewRoleSet(transaction);
    const roleEvaluation = evaluateRoleSetInspection(roleInspection);

    if (!roleEvaluation.ok) {
      throw new Error("role_set_not_exact");
    }

    await transaction.unsafe(createKeepRolePrincipalsSql());
    await transaction.unsafe(createKeepIdentitySkeletonSql());
    await transaction.unsafe(createTruncateTablesSql(tablesToTruncate));
    await transaction.unsafe(createPruneIdentitySkeletonSql());
  });

  return {
    clearedTableGroupCount: plan.truncateTableGroups.length,
    preservedRoleCount: ownerPreviewEmptyBaselineRoleLabels.length,
    prunedIdentitySkeleton: true,
  };
}

function createTruncateTablesSql(tables: string[]) {
  return `TRUNCATE TABLE ${tables.map(quoteIdentifier).join(", ")} RESTART IDENTITY CASCADE`;
}

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function isOwnerPreviewRoleLabel(
  value: string,
): value is OwnerPreviewEmptyBaselineRoleLabel {
  return ownerPreviewEmptyBaselineRoleLabels.some(
    (roleLabel) => roleLabel === value,
  );
}

function createOwnerPreviewRoleMatchesSql() {
  return `
WITH RECURSIVE organization_ancestor AS (
  SELECT
    o.id AS descendant_organization_id,
    o.id AS ancestor_organization_id,
    o.parent_organization_id,
    ARRAY[o.id]::bigint[] AS visited_organization_ids,
    0 AS ancestor_depth
  FROM organization o

  UNION ALL

  SELECT
    organization_ancestor.descendant_organization_id,
    parent_organization.id AS ancestor_organization_id,
    parent_organization.parent_organization_id,
    organization_ancestor.visited_organization_ids || parent_organization.id,
    organization_ancestor.ancestor_depth + 1
  FROM organization_ancestor
  JOIN organization parent_organization
    ON parent_organization.id = organization_ancestor.parent_organization_id
  WHERE organization_ancestor.ancestor_depth < 3
    AND NOT parent_organization.id = ANY(organization_ancestor.visited_organization_ids)
),
active_personal_auth AS (
  SELECT
    pa.id,
    pa.user_id,
    CASE
      WHEN pa.edition = 'advanced' OR au.id IS NOT NULL THEN 'advanced'
      ELSE 'standard'
    END AS effective_edition
  FROM personal_auth pa
  LEFT JOIN auth_upgrade au
    ON au.personal_auth_id = pa.id
   AND au.status = 'active'
   AND au.target_edition = 'advanced'
   AND now() >= au.starts_at
   AND now() < au.expires_at
  WHERE pa.status = 'active'
    AND now() >= pa.starts_at
    AND now() < pa.expires_at
),
active_org_auth AS (
  SELECT
    oa.id,
    oa.auth_scope_type,
    oa.purchaser_organization_id,
    CASE
      WHEN oa.edition = 'advanced' OR au.id IS NOT NULL THEN 'advanced'
      ELSE 'standard'
    END AS effective_edition
  FROM org_auth oa
  LEFT JOIN auth_upgrade au
    ON au.org_auth_id = oa.id
   AND au.status = 'active'
   AND au.target_edition = 'advanced'
   AND now() >= au.starts_at
   AND now() < au.expires_at
  WHERE oa.status = 'active'
    AND now() >= oa.starts_at
    AND now() < oa.expires_at
),
role_matches AS (
  SELECT DISTINCT
    'personal_standard_student'::text AS role_label,
    u.auth_user_id AS role_principal
  FROM "user" u
  JOIN student st ON st.user_id = u.id
  JOIN active_personal_auth pa ON pa.user_id = u.id
  WHERE u.status = 'active'
    AND u.user_type = 'personal'
    AND u.auth_user_id IS NOT NULL
    AND pa.effective_edition = 'standard'

  UNION ALL

  SELECT DISTINCT
    'personal_advanced_student'::text AS role_label,
    u.auth_user_id AS role_principal
  FROM "user" u
  JOIN student st ON st.user_id = u.id
  JOIN active_personal_auth pa ON pa.user_id = u.id
  WHERE u.status = 'active'
    AND u.user_type = 'personal'
    AND u.auth_user_id IS NOT NULL
    AND pa.effective_edition = 'advanced'

  UNION ALL

  SELECT DISTINCT
    'org_standard_employee'::text AS role_label,
    u.auth_user_id AS role_principal
  FROM "user" u
  JOIN employee e ON e.user_id = u.id
  JOIN organization employee_organization
    ON employee_organization.id = e.organization_id
   AND employee_organization.status = 'active'
  JOIN employee_org_auth eoa ON eoa.employee_id = e.id
  JOIN active_org_auth oa ON oa.id = eoa.org_auth_id
  WHERE u.status = 'active'
    AND u.user_type = 'employee'
    AND u.auth_user_id IS NOT NULL
    AND oa.effective_edition = 'standard'
    AND (
      (
        oa.auth_scope_type = 'specified_nodes'
        AND EXISTS (
          SELECT 1
          FROM org_auth_organization oao
          WHERE oao.org_auth_id = oa.id
            AND oao.organization_id = e.organization_id
        )
      )
      OR (
        oa.auth_scope_type = 'current_and_descendants'
        AND EXISTS (
          SELECT 1
          FROM organization_ancestor
          WHERE descendant_organization_id = e.organization_id
            AND ancestor_organization_id = oa.purchaser_organization_id
            AND EXISTS (
              SELECT 1
              FROM organization_ancestor tree_integrity
              WHERE tree_integrity.descendant_organization_id = e.organization_id
                AND tree_integrity.parent_organization_id IS NULL
            )
        )
      )
    )

  UNION ALL

  SELECT DISTINCT
    'org_advanced_employee'::text AS role_label,
    u.auth_user_id AS role_principal
  FROM "user" u
  JOIN employee e ON e.user_id = u.id
  JOIN organization employee_organization
    ON employee_organization.id = e.organization_id
   AND employee_organization.status = 'active'
  JOIN employee_org_auth eoa ON eoa.employee_id = e.id
  JOIN active_org_auth oa ON oa.id = eoa.org_auth_id
  WHERE u.status = 'active'
    AND u.user_type = 'employee'
    AND u.auth_user_id IS NOT NULL
    AND oa.effective_edition = 'advanced'
    AND (
      (
        oa.auth_scope_type = 'specified_nodes'
        AND EXISTS (
          SELECT 1
          FROM org_auth_organization oao
          WHERE oao.org_auth_id = oa.id
            AND oao.organization_id = e.organization_id
        )
      )
      OR (
        oa.auth_scope_type = 'current_and_descendants'
        AND EXISTS (
          SELECT 1
          FROM organization_ancestor
          WHERE descendant_organization_id = e.organization_id
            AND ancestor_organization_id = oa.purchaser_organization_id
            AND EXISTS (
              SELECT 1
              FROM organization_ancestor tree_integrity
              WHERE tree_integrity.descendant_organization_id = e.organization_id
                AND tree_integrity.parent_organization_id IS NULL
            )
        )
      )
    )

  UNION ALL

  SELECT DISTINCT 'org_standard_admin'::text AS role_label, a.auth_user_id
  FROM admin a
  WHERE a.status = 'active'
    AND a.admin_role = 'org_standard_admin'
    AND a.auth_user_id IS NOT NULL

  UNION ALL

  SELECT DISTINCT 'org_advanced_admin'::text AS role_label, a.auth_user_id
  FROM admin a
  WHERE a.status = 'active'
    AND a.admin_role = 'org_advanced_admin'
    AND a.auth_user_id IS NOT NULL

  UNION ALL

  SELECT DISTINCT 'content_admin'::text AS role_label, a.auth_user_id
  FROM admin a
  WHERE a.status = 'active'
    AND a.admin_role = 'content_admin'
    AND a.auth_user_id IS NOT NULL

  UNION ALL

  SELECT DISTINCT 'ops_admin'::text AS role_label, a.auth_user_id
  FROM admin a
  WHERE a.status = 'active'
    AND a.admin_role = 'ops_admin'
    AND a.auth_user_id IS NOT NULL
)
SELECT role_label, role_principal
FROM role_matches`;
}

function createOwnerPreviewRoleInspectionSql() {
  const roleMatchesSql = createOwnerPreviewRoleMatchesSql();

  return `
WITH role_matches AS (
  ${roleMatchesSql}
),
role_counts AS (
  SELECT role_label, count(*)::integer AS role_count
  FROM role_matches
  GROUP BY role_label
),
active_principals AS (
  SELECT DISTINCT auth_user_id AS role_principal
  FROM "user"
  WHERE status = 'active'
    AND auth_user_id IS NOT NULL

  UNION

  SELECT DISTINCT auth_user_id AS role_principal
  FROM admin
  WHERE status = 'active'
    AND auth_user_id IS NOT NULL
)
SELECT role_label, role_count
FROM role_counts

UNION ALL

SELECT '__distinct_principal_count'::text AS role_label,
  count(DISTINCT role_principal)::integer AS role_count
FROM role_matches

UNION ALL

SELECT '__total_role_match_count'::text AS role_label,
  count(*)::integer AS role_count
FROM role_matches

UNION ALL

SELECT '__extra_principal_count'::text AS role_label,
  count(*)::integer AS role_count
FROM active_principals ap
WHERE NOT EXISTS (
  SELECT 1 FROM role_matches rm WHERE rm.role_principal = ap.role_principal
)`;
}

function createKeepRolePrincipalsSql() {
  return `
CREATE TEMP TABLE owner_preview_keep_auth_user (
  auth_user_id text PRIMARY KEY
) ON COMMIT DROP;

INSERT INTO owner_preview_keep_auth_user (auth_user_id)
SELECT DISTINCT role_principal
FROM (${createOwnerPreviewRoleMatchesSql()}) role_matches`;
}

function createKeepIdentitySkeletonSql() {
  return `
CREATE TEMP TABLE owner_preview_keep_user (
  id bigint PRIMARY KEY
) ON COMMIT DROP;

INSERT INTO owner_preview_keep_user (id)
SELECT id
FROM "user"
WHERE auth_user_id IN (
  SELECT auth_user_id FROM owner_preview_keep_auth_user
);

CREATE TEMP TABLE owner_preview_keep_admin (
  id bigint PRIMARY KEY
) ON COMMIT DROP;

INSERT INTO owner_preview_keep_admin (id)
SELECT id
FROM admin
WHERE auth_user_id IN (
  SELECT auth_user_id FROM owner_preview_keep_auth_user
);

CREATE TEMP TABLE owner_preview_keep_organization (
  id bigint PRIMARY KEY
) ON COMMIT DROP;

INSERT INTO owner_preview_keep_organization (id)
SELECT DISTINCT e.organization_id
FROM employee e
JOIN owner_preview_keep_user ku ON ku.id = e.user_id

UNION

SELECT DISTINCT ao.organization_id
FROM admin_organization ao
JOIN owner_preview_keep_admin ka ON ka.id = ao.admin_id;

CREATE TEMP TABLE owner_preview_keep_org_auth (
  id bigint PRIMARY KEY
) ON COMMIT DROP;

WITH RECURSIVE organization_ancestor AS (
  SELECT
    o.id AS descendant_organization_id,
    o.id AS ancestor_organization_id,
    o.parent_organization_id,
    ARRAY[o.id]::bigint[] AS visited_organization_ids,
    0 AS ancestor_depth
  FROM organization o

  UNION ALL

  SELECT
    organization_ancestor.descendant_organization_id,
    parent_organization.id AS ancestor_organization_id,
    parent_organization.parent_organization_id,
    organization_ancestor.visited_organization_ids || parent_organization.id,
    organization_ancestor.ancestor_depth + 1
  FROM organization_ancestor
  JOIN organization parent_organization
    ON parent_organization.id = organization_ancestor.parent_organization_id
  WHERE organization_ancestor.ancestor_depth < 3
    AND NOT parent_organization.id = ANY(organization_ancestor.visited_organization_ids)
)
INSERT INTO owner_preview_keep_org_auth (id)
SELECT DISTINCT oa.id
FROM org_auth oa
WHERE EXISTS (
  SELECT 1
  FROM owner_preview_keep_organization keep_organization
  WHERE (
      oa.auth_scope_type = 'specified_nodes'
      AND EXISTS (
        SELECT 1
        FROM org_auth_organization oao
        WHERE oao.org_auth_id = oa.id
          AND oao.organization_id = keep_organization.id
      )
    )
    OR (
      oa.auth_scope_type = 'current_and_descendants'
      AND EXISTS (
        SELECT 1
        FROM organization_ancestor
        WHERE descendant_organization_id = keep_organization.id
          AND ancestor_organization_id = oa.purchaser_organization_id
          AND EXISTS (
            SELECT 1
            FROM organization_ancestor tree_integrity
            WHERE tree_integrity.descendant_organization_id = keep_organization.id
              AND tree_integrity.parent_organization_id IS NULL
          )
      )
    )
)`;
}

function createPruneIdentitySkeletonSql() {
  return `
DELETE FROM auth_upgrade
WHERE (
    personal_auth_id IS NOT NULL
    AND personal_auth_id NOT IN (
      SELECT id FROM personal_auth
      WHERE user_id IN (SELECT id FROM owner_preview_keep_user)
    )
  )
  OR (
    org_auth_id IS NOT NULL
    AND org_auth_id NOT IN (SELECT id FROM owner_preview_keep_org_auth)
  )
  OR (
    operator_admin_id IS NOT NULL
    AND operator_admin_id NOT IN (SELECT id FROM owner_preview_keep_admin)
  );

DELETE FROM org_auth_organization
WHERE org_auth_id NOT IN (SELECT id FROM owner_preview_keep_org_auth)
   OR organization_id NOT IN (SELECT id FROM owner_preview_keep_organization);

DELETE FROM personal_auth
WHERE user_id NOT IN (SELECT id FROM owner_preview_keep_user);

DELETE FROM redeem_code
WHERE id NOT IN (
  SELECT redeem_code_id
  FROM personal_auth
)
AND id NOT IN (
  SELECT redeem_code_id
  FROM auth_upgrade
  WHERE redeem_code_id IS NOT NULL
);

DELETE FROM admin_organization
WHERE admin_id NOT IN (SELECT id FROM owner_preview_keep_admin)
   OR organization_id NOT IN (SELECT id FROM owner_preview_keep_organization);

DELETE FROM employee
WHERE user_id NOT IN (SELECT id FROM owner_preview_keep_user)
   OR organization_id NOT IN (SELECT id FROM owner_preview_keep_organization);

DELETE FROM student
WHERE user_id NOT IN (SELECT id FROM owner_preview_keep_user);

DELETE FROM org_auth
WHERE id NOT IN (SELECT id FROM owner_preview_keep_org_auth);

DELETE FROM admin
WHERE id NOT IN (SELECT id FROM owner_preview_keep_admin);

DELETE FROM "user"
WHERE id NOT IN (SELECT id FROM owner_preview_keep_user);

DELETE FROM organization
WHERE id NOT IN (SELECT id FROM owner_preview_keep_organization);

DELETE FROM auth_account
WHERE user_id NOT IN (
  SELECT auth_user_id FROM owner_preview_keep_auth_user
);

DELETE FROM auth_user
WHERE id NOT IN (
  SELECT auth_user_id FROM owner_preview_keep_auth_user
)`;
}

const isDirectRun =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  runOwnerPreviewEmptyBaselineCli().then((exitCode) => {
    process.exitCode = exitCode;
  });
}
