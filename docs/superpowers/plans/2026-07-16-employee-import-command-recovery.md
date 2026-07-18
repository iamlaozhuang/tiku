# Employee Import Command Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以持久 employee import command、逐行终态和 placeholder + versioned rotate 协议静态关闭 F-0115，同时保持 RV-0018 真实 PostgreSQL 验收 pending。

**Architecture:** command service 用 UUID v4 幂等键派生域分离 HMAC，Postgres repository 用 command/row 锁和外层事务 + savepoint 将 employee identity、credential、membership、当前 `org_auth` quota、outcome 与 audit 原子提交。生成凭据创建时只写不可知 placeholder 哈希，独立 issue 动作与登录 session 路径共用 advisory lock，按 revision 原子换新并只返回本次明文。

**Tech Stack:** Next.js 16 Route Handlers、TypeScript 5、React 19、Drizzle ORM/Kit 0.45/0.31、PostgreSQL、Vitest 4、Testing Library、PowerShell governance gates。

## Global Constraints

- 任务固定为 `p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`，WIP=1。
- 权威规格：`docs/superpowers/specs/2026-07-16-employee-import-command-recovery-design.md`。
- 当前 transition anchor：`6bde2f2aec3d71fa0ce138b26f64243861cace6f`。
- 产品代码开始前必须完成本计划 Task 0 的独立 F-0115 scope-correction 治理前置；未通过即停止。
- 只允许通过 P1 `transition_only` 的精确治理提交使用 ancestor checkpoint；其他 `in_progress` SHA 漂移 hard-block。
- schema 只通过 Drizzle schema + `drizzle-kit generate` 生成；禁止手写业务 SQL、`drizzle-kit push`、migrate 或真实数据库连接。
- 不新增、删除或升级依赖；不改 `package.json` 或 lockfile。
- 不执行真实 PostgreSQL、21 项 runtime acceptance、browser/e2e、Provider、P2、PR、force push 或部署。
- command 表不保存 phone、name、`initialPassword`、原始请求、原始文件或可逆 secret。
- API 路径 kebab-case，JSON camelCase，nullable key 不省略，响应保持 `{ code, message, data }`，所有 command 响应 `Cache-Control: no-store`。
- 写权限仅 `ops_admin` / `super_admin`；GET、issue、confirm 仅原发起人或 `super_admin`。
- create/bind 必须显式 `requireCurrentAuthorization: true`。
- 登录创建 session 与 credential issue 必须取得同一个 `pg_advisory_xact_lock(hashtext(authUserId))`，批量按确定顺序加锁。
- TDD 顺序固定为 RED → 最小 GREEN → 聚焦回归；不得先写产品实现。
- 用户明确要求最终只有一个 F-0115 产品提交，故本计划覆盖 `writing-plans` 默认“每任务提交”：Task 1–7 不产生中间 commit，只保留可复核 checkpoint；Task 8 才创建单一产品提交，之后另建 ready 治理提交。
- 已有 `stash@{0}` 不读取、不应用、不删除。

---

## File Structure

### New product files

- `src/db/schema/employee-import.ts`：两张 command/outcome 表、枚举、check constraints、relations。
- `src/db/schema/employee-import.test.ts`：schema 名称、列、索引、check 与 secret-negative contract。
- `src/server/contracts/employee-import-command-contract.ts`：camelCase command/row/manifest DTO 与稳定枚举。
- `src/server/validators/employee-import-command.ts`、`.test.ts`：UUID v4 key、submit/query action body、行结构和 forbidden field 校验。
- `src/server/services/employee-import-command-crypto.ts`、`.test.ts`：域分离 HMAC、placeholder、随机分发密码和受限并发 hash。
- `src/server/repositories/employee-import-command-repository.ts`：repository ports、record types、domain error。
- `src/server/repositories/postgres-employee-import-command-repository.ts`、`.test.ts`：claim、row savepoint、query、issue、confirm 和事务内 audit。
- `src/server/services/employee-import-command-service.ts`、`.test.ts`：提交/恢复、重复行分类、DTO 映射、503 unknown-result 语义。
- `src/server/services/employee-import-command-route.ts`、`.test.ts`：认证、HTTP status、no-store 和四组 handlers。
- `src/app/api/v1/employee-import-commands/route.ts`。
- `src/app/api/v1/employee-import-commands/[publicId]/route.ts`。
- `src/app/api/v1/employee-import-commands/[publicId]/issue-credentials/route.ts`。
- `src/app/api/v1/employee-import-commands/[publicId]/confirm-distribution/route.ts`。
- `src/features/admin/org-auth-redeem/employee-import-command-client.ts`、`.test.ts`：no-store API client。
- `src/features/admin/org-auth-redeem/useEmployeeImportCommand.ts`、`.test.tsx`：客户端恢复/revision/secret 生命周期状态机。
- `src/features/admin/org-auth-redeem/EmployeeImportCommandPanel/EmployeeImportCommandPanel.tsx`、`.test.tsx`：command 与一次性分发展示。
- `tests/unit/p1-employee-import-command-atomicity.test.ts`：静态事务、锁、审计、quota 与无明文 smoke。
- `tests/unit/p1-employee-import-command-migration-source.test.ts`：generated migration/journal/snapshot smoke。

### Generated files

- `drizzle/*_p1_rc_02_employee_import_command_recovery.sql`：由 Drizzle Kit 分配时间戳；命令执行后用唯一 suffix 精确捕获路径。
- `drizzle/meta/*_snapshot.json`：与 journal 新 tag 同时间戳。
- `drizzle/meta/_journal.json`：Drizzle Kit 追加一条 entry。

### Modified files

- `src/db/schema/index.ts`：导出 employee import schema。
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`：导出同事务 create/bind primitives，并强制 current authorization。
- `src/server/services/admin-organization-org-auth-runtime.ts`：`/employees` 与 `/employees/import` 变成 command service 薄适配器，移除 route-level employee audit。
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`：移除同步 `generatedInitialPasswords` contract。
- `src/server/contracts/employee-account-contract.ts`、`src/server/services/employee-account-service.ts` 及测试：移除同步生成 secret 返回；遗留 service 只接受显式 provided password。
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`：组合新 hook/panel，不继续内嵌恢复逻辑。
- `tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts`、`tests/unit/phase-20-ra-01-04-employee-import.test.ts`、`tests/unit/admin-user-org-auth-ops-baseline.test.ts`、`tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`、`tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`：兼容入口与 UI contract 回归。
- 当前 task plan、evidence、audit、批准规格和本实施计划：最终产品提交证据。

## Stable Interfaces

所有后续 Task 必须使用以下名称，不得自行改名：

```ts
export type EmployeeImportCommandActor = {
  publicId: string;
  role: "ops_admin" | "super_admin";
  requestIp: string | null;
};

export type NormalizedEmployeeImportCommandInput = {
  commandKind: "single_create" | "batch_import";
  organizationPublicId: string;
  rows: {
    rowNumber: number;
    phone: string;
    name: string;
    initialPassword: string;
  }[];
};

export type EmployeeImportCommandServiceResult<TData> = {
  httpStatus: 200 | 403 | 404 | 409 | 422 | 503;
  response: ApiResponse<TData | null>;
};

export type PreparedEmployeeCredential = {
  credentialMode: "generated" | "provided";
  passwordHash: string;
};

export type IssuedEmployeeCredential = {
  initialPassword: string;
  passwordHash: string;
};
```

---

### Task 0: Materialize the Approved Scope Through a Separate Governance Gate

**Files:**

- Separate proposed hotfix only; no product file may be changed.
- Create after fresh approval:
  - `docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md`
  - `docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix-design.md`
  - `docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix.md`
  - `docs/05-execution-logs/evidence/2026-07-16-p1-f0115-scope-correction-hotfix.md`
  - `docs/05-execution-logs/audits-reviews/2026-07-16-p1-f0115-scope-correction-hotfix.md`
- Modify after fresh approval:
  - `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
  - `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
  - `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
  - `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
  - `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
  - `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
  - only the F-0115 task block in `docs/04-agent-system/state/task-queue.yaml`

**Interfaces:**

- Consumes: this product plan and the user-approved design/spec.
- Produces: an exact F-0115 task allowlist, `freshApprovalSource`, `schemaMigration: approved_source_generation_only_no_execution`, generated-migration-only boundary, and a one-time `transition_only` governance commit.

- [x] **Step 1: Stop if the new governance hotfix is not explicitly approved**

Required approval text must authorize exactly: F-0115 scope correction; P1/Module guard + smoke changes; fresh approval artifact; queue allowlist/block/capability/acceptance/validation delta; no product code; no database execution; exact one-time ancestor behavior.

Expected before approval: no guard, queue, state, schema, drizzle or product change.

- [x] **Step 2: Create and execute a separate governance plan**

The governance plan must pin:

```text
parent task: p1-remediation-rc-02-employee-creation-atomicity-2026-07-16
base: 6bde2f2aec3d71fa0ce138b26f64243861cace6f
branch: codex/p1-f0115-scope-correction-hotfix
scope mode: transition_only
product changes: forbidden
database/migrate/provider/runtime/P2/PR/force/deploy: forbidden
```

It must adversarially test wrong base, wrong branch, wrong task/status, invalid approval, missing/extra path, partial staging, wrong queue delta, product file, replay and standard in-progress SHA drift.

- [x] **Step 3: Require real hook closeout for the governance commit**

Run the exact hotfix-focused smokes, P1 manual/pre-commit/pre-push, Module pre-commit/pre-push, parser checks, `git diff --check`, then ff-only merge, ordinary `origin/master` push and cleanup under its own approval.

Expected: P1 pre-push emits `p1TransitionScopeMode: transition_only`; Module accepts ancestor checkpoint only in that context.

- [x] **Step 4: Fast-forward the product worktree to the governance tip**

Run:

```powershell
git -C D:\tiku fetch origin master
git -C D:\tiku merge --ff-only origin/master
git merge --ff-only master
git status --short
```

Expected: product worktree retains only its existing spec/evidence/audit/plan changes; queue now permits the exact files in this plan; no product implementation exists yet.

---

### Task 1: Persist Command and Row State With Generated Drizzle Migration Source

**Files:**

- Create: `src/db/schema/employee-import.ts`
- Create: `src/db/schema/employee-import.test.ts`
- Modify: `src/db/schema/index.ts`
- Generate: migration SQL, snapshot and journal entry described above
- Create: `tests/unit/p1-employee-import-command-migration-source.test.ts`

**Interfaces:**

- Consumes: `admin.id`, `organization.id`, `employee.id`.
- Produces: `employeeImportCommand` and `employeeImportRow` Drizzle tables and exported enum value arrays.

- [x] **Step 1: Write the failing schema contract**

```ts
expect(getTableName(employeeImportCommand)).toBe("employee_import_command");
expect(getTableName(employeeImportRow)).toBe("employee_import_row");
expect(employeeImportCommandKindValues).toEqual([
  "single_create",
  "batch_import",
]);
expect(employeeImportStatusValues).toEqual(["processing", "completed"]);
expect(credentialDistributionStatusValues).toEqual([
  "pending",
  "not_required",
  "open",
  "confirmed",
]);
expect(employeeImportRowStatusValues).toEqual([
  "pending",
  "succeeded",
  "rejected",
]);
expect(getColumnNames(employeeImportCommand)).not.toEqual(
  expect.arrayContaining(["phone", "name", "initial_password", "request_body"]),
);
expect(getColumnNames(employeeImportRow)).not.toEqual(
  expect.arrayContaining(["phone", "name", "initial_password", "request_body"]),
);
```

- [x] **Step 2: Run RED**

Run:

```powershell
corepack pnpm@10.15.1 exec vitest run src/db/schema/employee-import.test.ts --maxWorkers=1
```

Expected: FAIL because `./employee-import` does not exist.

- [x] **Step 3: Add exact enums and tables**

Implement these exports and constraints:

```ts
export const employeeImportCommandKindValues = [
  "single_create",
  "batch_import",
] as const;
export const employeeImportStatusValues = ["processing", "completed"] as const;
export const credentialDistributionStatusValues = [
  "pending",
  "not_required",
  "open",
  "confirmed",
] as const;
export const employeeImportRowStatusValues = [
  "pending",
  "succeeded",
  "rejected",
] as const;
export const employeeImportOutcomeKindValues = ["created", "bound"] as const;
export const employeeImportCredentialModeValues = [
  "generated",
  "provided",
  "existing_account",
] as const;
export const employeeImportRejectionReasonValues = [
  "invalid_row",
  "duplicate_phone",
  "organization_not_found",
  "cross_domain_conflict",
  "cross_organization_conflict",
  "disabled_account",
  "current_authorization_insufficient",
  "quota_insufficient",
] as const;
export const employeeImportWarningReasonValues = [
  "initial_password_not_applied_to_existing_user",
] as const;

export const employeeImportCommandKindEnum = pgEnum(
  "employee_import_command_kind",
  employeeImportCommandKindValues,
);
export const employeeImportStatusEnum = pgEnum(
  "employee_import_status",
  employeeImportStatusValues,
);
export const credentialDistributionStatusEnum = pgEnum(
  "credential_distribution_status",
  credentialDistributionStatusValues,
);
export const employeeImportRowStatusEnum = pgEnum(
  "employee_import_row_status",
  employeeImportRowStatusValues,
);
export const employeeImportOutcomeKindEnum = pgEnum(
  "employee_import_outcome_kind",
  employeeImportOutcomeKindValues,
);
export const employeeImportCredentialModeEnum = pgEnum(
  "employee_import_credential_mode",
  employeeImportCredentialModeValues,
);
export const employeeImportRejectionReasonEnum = pgEnum(
  "employee_import_rejection_reason",
  employeeImportRejectionReasonValues,
);
export const employeeImportWarningReasonEnum = pgEnum(
  "employee_import_warning_reason",
  employeeImportWarningReasonValues,
);

export const employeeImportCommand = pgTable(
  "employee_import_command",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    actor_admin_id: bigint("actor_admin_id", { mode: "number" })
      .notNull()
      .references(() => admin.id, { onDelete: "restrict" }),
    organization_id: bigint("organization_id", { mode: "number" })
      .notNull()
      .references(() => organization.id, { onDelete: "restrict" }),
    command_kind: employeeImportCommandKindEnum("command_kind").notNull(),
    idempotency_scope_hash: text("idempotency_scope_hash").notNull(),
    request_hash: text("request_hash").notNull(),
    row_count: integer("row_count").notNull(),
    employee_import_status: employeeImportStatusEnum("employee_import_status")
      .default("processing")
      .notNull(),
    credential_distribution_status: credentialDistributionStatusEnum(
      "credential_distribution_status",
    )
      .default("pending")
      .notNull(),
    credential_revision: integer("credential_revision").default(0).notNull(),
    current_issue_public_id: text("current_issue_public_id"),
    completed_at: timestamp("completed_at", { withTimezone: true }),
    distribution_confirmed_at: timestamp("distribution_confirmed_at", {
      withTimezone: true,
    }),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_employee_import_command_public_id").on(table.public_id),
    uniqueIndex("udx_employee_import_command_idempotency_scope_hash").on(
      table.idempotency_scope_hash,
    ),
    index("idx_employee_import_command_actor_admin_id").on(
      table.actor_admin_id,
    ),
    index("idx_employee_import_command_organization_id").on(
      table.organization_id,
    ),
    check(
      "chk_employee_import_command_row_count",
      sql`${table.row_count} between 1 and 500
        and (${table.command_kind} <> 'single_create' or ${table.row_count} = 1)`,
    ),
    check(
      "chk_employee_import_command_credential_revision",
      sql`${table.credential_revision} >= 0`,
    ),
    check(
      "chk_employee_import_command_state",
      sql`(
        ${table.employee_import_status} = 'processing'
        and ${table.completed_at} is null
        and ${table.credential_distribution_status} = 'pending'
        and ${table.credential_revision} = 0
        and ${table.current_issue_public_id} is null
        and ${table.distribution_confirmed_at} is null
      ) or (
        ${table.employee_import_status} = 'completed'
        and ${table.completed_at} is not null
        and ${table.credential_distribution_status} <> 'pending'
      )`,
    ),
    check(
      "chk_employee_import_command_distribution_state",
      sql`(
        ${table.credential_distribution_status} = 'pending'
        and ${table.employee_import_status} = 'processing'
        and ${table.credential_revision} = 0
        and ${table.current_issue_public_id} is null
        and ${table.distribution_confirmed_at} is null
      ) or (
        ${table.credential_distribution_status} = 'not_required'
        and ${table.employee_import_status} = 'completed'
        and ${table.credential_revision} = 0
        and ${table.current_issue_public_id} is null
        and ${table.distribution_confirmed_at} is null
      ) or (
        ${table.credential_distribution_status} = 'open'
        and ${table.employee_import_status} = 'completed'
        and ${table.distribution_confirmed_at} is null
        and (
          (${table.credential_revision} = 0 and ${table.current_issue_public_id} is null)
          or
          (${table.credential_revision} > 0 and ${table.current_issue_public_id} is not null)
        )
      ) or (
        ${table.credential_distribution_status} = 'confirmed'
        and ${table.employee_import_status} = 'completed'
        and ${table.credential_revision} > 0
        and ${table.current_issue_public_id} is not null
        and ${table.distribution_confirmed_at} is not null
      )`,
    ),
  ],
);
```

Add the row table exactly as follows:

```ts
export const employeeImportRow = pgTable(
  "employee_import_row",
  {
    id: idColumn(),
    public_id: text("public_id").notNull(),
    employee_import_command_id: bigint("employee_import_command_id", {
      mode: "number",
    })
      .notNull()
      .references(() => employeeImportCommand.id, { onDelete: "cascade" }),
    row_number: integer("row_number").notNull(),
    row_request_hash: text("row_request_hash").notNull(),
    employee_import_row_status: employeeImportRowStatusEnum(
      "employee_import_row_status",
    )
      .default("pending")
      .notNull(),
    outcome_kind: employeeImportOutcomeKindEnum("outcome_kind"),
    rejection_reason: employeeImportRejectionReasonEnum("rejection_reason"),
    warning_reason: employeeImportWarningReasonEnum("warning_reason"),
    credential_mode: employeeImportCredentialModeEnum("credential_mode"),
    employee_id: bigint("employee_id", { mode: "number" }).references(
      () => employee.id,
      { onDelete: "restrict" },
    ),
    credential_updated_at: timestamp("credential_updated_at", {
      withTimezone: true,
    }),
    created_at: createdAtColumn(),
    updated_at: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex("udx_employee_import_row_public_id").on(table.public_id),
    uniqueIndex(
      "udx_employee_import_row_employee_import_command_id_row_number",
    ).on(table.employee_import_command_id, table.row_number),
    index("idx_employee_import_row_employee_import_command_id").on(
      table.employee_import_command_id,
    ),
    index("idx_employee_import_row_employee_id").on(table.employee_id),
    check("chk_employee_import_row_number", sql`${table.row_number} > 0`),
    check(
      "chk_employee_import_row_state",
      sql`(
        ${table.employee_import_row_status} = 'pending'
        and ${table.outcome_kind} is null
        and ${table.rejection_reason} is null
        and ${table.warning_reason} is null
        and ${table.credential_mode} is null
        and ${table.employee_id} is null
        and ${table.credential_updated_at} is null
      ) or (
        ${table.employee_import_row_status} = 'rejected'
        and ${table.outcome_kind} is null
        and ${table.rejection_reason} is not null
        and ${table.warning_reason} is null
        and ${table.credential_mode} is null
        and ${table.employee_id} is null
        and ${table.credential_updated_at} is null
      ) or (
        ${table.employee_import_row_status} = 'succeeded'
        and ${table.outcome_kind} is not null
        and ${table.rejection_reason} is null
        and ${table.credential_mode} is not null
        and ${table.employee_id} is not null
        and (
          ${table.warning_reason} is null
          or (
            ${table.outcome_kind} = 'bound'
            and ${table.credential_mode} = 'existing_account'
          )
        )
        and (
          (${table.credential_mode} = 'generated' and ${table.credential_updated_at} is not null)
          or
          (${table.credential_mode} <> 'generated' and ${table.credential_updated_at} is null)
        )
      )`,
    ),
  ],
);
```

Export both schemas from `src/db/schema/index.ts`.

- [x] **Step 4: Run schema GREEN**

Run the Step 2 command.

Expected: PASS.

- [x] **Step 5: Generate migration source without connecting to a database**

```powershell
$env:DATABASE_URL = "postgresql://tiku_plan_only:tiku_plan_only@127.0.0.1:5432/tiku_plan_only"
corepack pnpm@10.15.1 exec drizzle-kit generate --name p1_rc_02_employee_import_command_recovery
Remove-Item Env:DATABASE_URL
$migration = @(Get-ChildItem drizzle -Filter "*_p1_rc_02_employee_import_command_recovery.sql")
if ($migration.Count -ne 1) { throw "Expected exactly one generated migration." }
$migrationPath = $migration[0].FullName
$migrationPath
```

Expected: one SQL file, one matching snapshot and one journal entry. The command must not attempt a network connection. If generated diff includes unrelated tables, stop and repair schema drift before proceeding.

- [x] **Step 6: Add migration-source RED/GREEN smoke**

The test must resolve the unique suffix and assert table creation, enum/check/index/FK names, absence of phone/name/password/request columns, journal tag and matching snapshot:

```ts
const migrationName = readdirSync(drizzleDirectory).find((name) =>
  name.endsWith("_p1_rc_02_employee_import_command_recovery.sql"),
);
expect(migrationName).toBeDefined();
expect(source).toContain('CREATE TABLE "employee_import_command"');
expect(source).toContain('CREATE TABLE "employee_import_row"');
expect(source).not.toMatch(
  /"employee_import_(?:command|row)"[\s\S]*"(?:phone|name|initial_password|request_body)"/u,
);
```

Run:

```powershell
corepack pnpm@10.15.1 exec vitest run src/db/schema/employee-import.test.ts tests/unit/p1-employee-import-command-migration-source.test.ts --maxWorkers=1
```

Expected: PASS.

---

### Task 2: Freeze DTO, Validation, HMAC and Credential Preparation Contracts

**Files:**

- Create: `src/server/contracts/employee-import-command-contract.ts`
- Create: `src/server/validators/employee-import-command.ts`
- Create: `src/server/validators/employee-import-command.test.ts`
- Create: `src/server/services/employee-import-command-crypto.ts`
- Create: `src/server/services/employee-import-command-crypto.test.ts`

**Interfaces:**

- Produces: DTOs and stable functions `normalizeEmployeeImportCommandInput`, `normalizeCredentialIssueInput`, `normalizeDistributionConfirmationInput`, `createEmployeeImportCommandHashes`, `prepareEmployeeCreationCredential`, `prepareIssuedEmployeeCredential`.

- [x] **Step 1: Write validator and hash RED tests**

Cover:

```ts
expect(normalizeIdempotencyKey("00000000-0000-4000-8000-000000000001")).toEqual(
  { success: true, value: "00000000-0000-4000-8000-000000000001" },
);
expect(normalizeIdempotencyKey("not-a-v4")).toEqual({
  success: false,
  message: "Idempotency-Key must be a UUID v4.",
});
expect(
  normalizeEmployeeImportCommandInput({
    commandKind: "single_create",
    organizationPublicId: "organization-public-001",
    rows: [{ phone: "13900000001", name: "Employee", initialPassword: null }],
  }),
).toMatchObject({
  success: true,
  value: { rows: [{ rowNumber: 1, initialPassword: "" }] },
});
```

Also assert 0/501 rows, single_create with two rows, non-string cells and any extra row key such as `edition`/`orgAuthScopePublicId` fail outer validation; invalid phone/password strings remain rows so repository can persist `invalid_row` outcome.

Hash tests must prove same actor/org/key/normalized request is stable and changes for actor, org, kind, order, phone, name or password; output begins `v1:` and never contains raw values.

- [x] **Step 2: Run RED**

```powershell
corepack pnpm@10.15.1 exec vitest run src/server/validators/employee-import-command.test.ts src/server/services/employee-import-command-crypto.test.ts --maxWorkers=1
```

Expected: FAIL because both modules are absent.

- [x] **Step 3: Implement exact public DTOs**

```ts
export type EmployeeImportCommandRowDto = {
  publicId: string;
  rowNumber: number;
  status: "pending" | "succeeded" | "rejected";
  outcomeKind: "created" | "bound" | null;
  rejectionReason:
    | "invalid_row"
    | "duplicate_phone"
    | "organization_not_found"
    | "cross_domain_conflict"
    | "cross_organization_conflict"
    | "disabled_account"
    | "current_authorization_insufficient"
    | "quota_insufficient"
    | null;
  warningReason: "initial_password_not_applied_to_existing_user" | null;
  credentialMode: "generated" | "provided" | "existing_account" | null;
  employeePublicId: string | null;
};

export type EmployeeImportCommandDto = {
  publicId: string;
  commandKind: "single_create" | "batch_import";
  organizationPublicId: string;
  status: "processing" | "completed";
  credentialDistributionStatus:
    | "pending"
    | "not_required"
    | "open"
    | "confirmed";
  credentialRevision: number;
  currentIssuePublicId: string | null;
  rowCount: number;
  counts: { pending: number; succeeded: number; rejected: number };
  rows: EmployeeImportCommandRowDto[];
  completedAt: string | null;
  distributionConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeCredentialManifestDto = {
  issuePublicId: string;
  credentialRevision: number;
  rows: {
    rowPublicId: string;
    rowNumber: number;
    employeePublicId: string;
    phone: string;
    name: string;
    initialPassword: string;
  }[];
};
```

- [x] **Step 4: Implement domain-separated HMAC and credential preparation**

```ts
function hmac(idempotencyKey: string, value: string): string {
  return `v1:${createHmac("sha256", idempotencyKey)
    .update(value, "utf8")
    .digest("base64url")}`;
}

export function createEmployeeImportCommandHashes(input: {
  actorPublicId: string;
  idempotencyKey: string;
  command: NormalizedEmployeeImportCommandInput;
}) {
  const canonicalRequest = JSON.stringify(input.command);
  return {
    idempotencyScopeHash: hmac(
      input.idempotencyKey,
      `employee-import-scope:v1\0${input.actorPublicId}\0${input.command.organizationPublicId}`,
    ),
    requestHash: hmac(
      input.idempotencyKey,
      `employee-import-request:v1\0${canonicalRequest}`,
    ),
    rowHashes: input.command.rows.map((row) =>
      hmac(
        input.idempotencyKey,
        `employee-import-row:v1\0${JSON.stringify(row)}`,
      ),
    ),
  };
}
```

`prepareEmployeeCreationCredential` hashes either the supplied password or an unknowable `randomBytes(32).toString("base64url") + "A1"` placeholder and returns no plaintext. `prepareIssuedEmployeeCredential` generates the 12-character policy-compliant password and returns plaintext/hash only to the current call. Both accept injected random/hash functions for deterministic tests.

- [x] **Step 5: Run GREEN and secret-negative scan**

Run the Step 2 command, then:

```powershell
rg -n "phone|name|initialPassword" src/db/schema/employee-import.ts
```

Expected: tests PASS; schema scan returns no secret-bearing column.

---

### Task 3: Make Row Processing Transactional and Recoverable

**Files:**

- Create: `src/server/repositories/employee-import-command-repository.ts`
- Create: `src/server/repositories/postgres-employee-import-command-repository.ts`
- Create: `src/server/repositories/postgres-employee-import-command-repository.test.ts`
- Modify: `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- Create: `tests/unit/p1-employee-import-command-atomicity.test.ts`

**Interfaces:**

- Consumes: Task 1 tables, Task 2 normalized inputs/hashes/credential material.
- Produces: `EmployeeImportCommandRepository` with `claimCommand`, `processRow`, `findCommand`, `listIssueTargets`, `issueCredentials` and `confirmDistribution`.

- [x] **Step 1: Define repository port and RED fakes**

```ts
export type EmployeeImportCommandRepository = {
  claimCommand(
    input: ClaimEmployeeImportCommandInput,
  ): Promise<EmployeeImportCommandRecord>;
  processRow(input: ProcessEmployeeImportRowInput): Promise<void>;
  findCommand(
    input: FindEmployeeImportCommandInput,
  ): Promise<EmployeeImportCommandRecord | null>;
  listIssueTargets(
    input: FindEmployeeImportCommandInput,
  ): Promise<EmployeeCredentialIssueTargetSet>;
  issueCredentials(
    input: IssueEmployeeCredentialsInput,
  ): Promise<EmployeeCredentialIssueResult>;
  confirmDistribution(
    input: ConfirmEmployeeCredentialDistributionInput,
  ): Promise<EmployeeImportCommandRecord>;
};

export class EmployeeImportCommandError extends Error {
  constructor(
    readonly reason:
      | "actor_forbidden"
      | "command_not_found"
      | "idempotency_request_mismatch"
      | "credential_distribution_closed"
      | "credential_revision_stale"
      | "credential_manifest_stale"
      | "active_session"
      | "account_state_changed"
      | "credential_baseline_changed",
  ) {
    super(reason);
  }
}
```

Write tests that inject failure after auth_user, auth_account, user, employee, quota, outcome and audit. The fake transaction log must remain empty after each thrown unknown failure; deterministic rejection must contain only row outcome + redacted audit.

- [x] **Step 2: Run repository RED**

```powershell
corepack pnpm@10.15.1 exec vitest run src/server/repositories/postgres-employee-import-command-repository.test.ts tests/unit/p1-employee-import-command-atomicity.test.ts --maxWorkers=1
```

Expected: FAIL because repository modules are absent.

- [x] **Step 3: Export transaction primitives and force current authorization**

Export `AdminOrganizationOrgAuthRuntimeDatabase`, `createEmployeeAccountWithDatabase` and `bindEmployeeAccountWithDatabase`. Change both quota calls to:

```ts
const reservationResult = await reserveEmployeeOrgAuthQuota(database, {
  employeeId: employeeRow.id,
  organizationId: organizationRow.id,
  requireCurrentAuthorization: true,
});
```

Do not add another outer transaction around these functions; the command repository owns it.

- [x] **Step 4: Implement command claim as one transaction**

Inside one `database.transaction`:

1. Resolve active actor admin and organization.
2. `insert(employeeImportCommand).onConflictDoNothing` on `idempotency_scope_hash`.
3. If inserted, insert all row shells and `employee.import_command.started` audit.
4. If conflict, read existing command and compare `request_hash`; mismatch throws `idempotency_request_mismatch`.
5. Return rows ordered by `row_number` with no N+1 query.

No raw key or row content is passed to `values(...)`.

- [x] **Step 5: Implement row transaction with a rollback savepoint**

The required ownership shape is:

```ts
await database.transaction(async (transaction) => {
  const command = await lockCommand(transaction, input.commandPublicId);
  const row = await lockRow(transaction, command.id, input.rowNumber);

  if (row.employee_import_row_status !== "pending") return;
  assertRowHash(row, input.rowRequestHash);

  let terminalOutcome: TerminalEmployeeImportRowOutcome;

  if (input.prevalidatedRejectionReason !== null) {
    terminalOutcome = rejected(input.prevalidatedRejectionReason);
  } else {
    try {
      terminalOutcome = await transaction.transaction(async (savepoint) =>
        mutateEmployeeAccountWithinSavepoint(savepoint, input),
      );
    } catch (error) {
      const reason = mapDeterministicEmployeeMutationError(error);
      if (reason === null) throw error;
      terminalOutcome = rejected(reason);
    }
  }

  await writeTerminalOutcome(transaction, row.id, terminalOutcome);
  await insertRowAudit(transaction, command, row, terminalOutcome);
  await finalizeCommandWhenNoPendingRows(transaction, command.id);
});
```

The nested transaction/savepoint is mandatory: catching `EmployeeAccountMutationError` in the outer transaction would otherwise commit identity rows created before a quota failure.

- [x] **Step 6: Implement account resolution under the existing phone lock**

Within the savepoint:

```text
admin phone conflict   -> cross_domain_conflict
no user                -> create primitive with prepared hash
active personal user   -> bind primitive; credential_mode existing_account
disabled personal user -> disabled_account
existing employee      -> cross_organization_conflict
```

If an existing learner receives `initialPassword`, set `warning_reason = initial_password_not_applied_to_existing_user` and never write that password. For generated create, read `auth_account.updated_at` after insert and store it in `credential_updated_at`.

- [x] **Step 7: Make completion atomic**

`finalizeCommandWhenNoPendingRows` must count pending rows inside the command lock. On zero pending:

```ts
const credentialDistributionStatus =
  generatedSucceededCount > 0 ? "open" : "not_required";
```

Update `employee_import_status=completed`, `completed_at` and distribution status, then write `employee.import_command.completed` audit in the same outer transaction. Audit insertion failure rolls back the row business mutation and completion transition.

- [x] **Step 8: Run GREEN plus atomicity static smoke**

Run Step 2 and assert the static smoke finds:

```text
database.transaction
transaction.transaction
requireCurrentAuthorization: true (twice)
employeeImportRow outcome write
auditLog insert inside repository
no appendEmployeeAuditLog around create/import routes
```

Expected: PASS.

---

### Task 4: Implement Submit, Replay, Query and Unknown-Result Semantics

**Files:**

- Create: `src/server/services/employee-import-command-service.ts`
- Create: `src/server/services/employee-import-command-service.test.ts`

**Interfaces:**

- Consumes: Task 2 validator/crypto and Task 3 repository.
- Produces: `EmployeeImportCommandService` methods `submit`, `get`, `issueCredentials`, `confirmDistribution`.

- [x] **Step 1: Write service RED tests**

The fake repository tests must cover:

- same key/request resumes and processes only pending rows;
- within the same actor/organization/key scope, kind/order/phone/name/password change maps to HTTP 409;
- actor or organization change derives an independent HMAC scope and does not match the existing command;
- duplicate phones all persist `duplicate_phone`;
- Nth-row deterministic rejection continues;
- Nth-row unknown throw returns 503 and does not process later rows in that call;
- replay after simulated commit-ack loss reads the terminal row and does not call `processRow` again;
- 500-row bound;
- GET returns nullable keys and no phone/name/password/hash.

- [x] **Step 2: Run RED**

```powershell
corepack pnpm@10.15.1 exec vitest run src/server/services/employee-import-command-service.test.ts --maxWorkers=1
```

Expected: FAIL because the service does not exist.

- [x] **Step 3: Implement submit orchestration**

```ts
export type EmployeeImportCommandService = {
  submit(input: {
    actor: EmployeeImportCommandActor;
    idempotencyKey: unknown;
    body: unknown;
  }): Promise<EmployeeImportCommandServiceResult<EmployeeImportCommandDto>>;
  get(input: {
    actor: EmployeeImportCommandActor;
    commandPublicId: string;
  }): Promise<EmployeeImportCommandServiceResult<EmployeeImportCommandDto>>;
  issueCredentials(input: {
    actor: EmployeeImportCommandActor;
    commandPublicId: string;
    body: unknown;
  }): Promise<
    EmployeeImportCommandServiceResult<EmployeeCredentialManifestDto>
  >;
  confirmDistribution(input: {
    actor: EmployeeImportCommandActor;
    commandPublicId: string;
    body: unknown;
  }): Promise<EmployeeImportCommandServiceResult<EmployeeImportCommandDto>>;
};
```

Submit algorithm:

1. Normalize key/body; outer invalid maps to 422.
2. Compute HMACs.
3. Claim/recover command.
4. Precompute duplicate-phone and invalid-row rejections.
5. Prepare pending-row hashes outside DB locks with max concurrency 4.
6. Process rows in ascending `rowNumber`.
7. On unknown error return 503 without changing it to rejected.
8. Re-read command and map Dates to ISO/null DTO.

- [x] **Step 4: Map errors to stable status/envelope**

```ts
const errorMap = {
  actor_forbidden: [403, 403601, "Employee import command is forbidden."],
  command_not_found: [404, 404601, "Employee import command does not exist."],
  idempotency_request_mismatch: [409, 409601, "Idempotency request mismatch."],
  credential_revision_stale: [409, 409602, "Credential revision is stale."],
  credential_manifest_stale: [409, 409603, "Credential manifest is stale."],
  credential_distribution_closed: [
    409,
    409604,
    "Credential distribution is closed.",
  ],
  active_session: [409, 409605, "Employee session is active."],
  account_state_changed: [409, 409606, "Employee account state changed."],
  credential_baseline_changed: [409, 409607, "Employee credential changed."],
} as const;
```

Unknown repository errors map to HTTP 503/code `503601`/`data: null` without including `error.message`.

- [x] **Step 5: Run GREEN**

Run Step 2.

Expected: PASS.

---

### Task 5: Rotate and Confirm Credentials With Revision and Session Locks

**Files:**

- Modify: Task 3 repository implementation/tests
- Modify: Task 4 service/tests
- Modify: `src/server/auth/local-session-runtime.test.ts` only if the focused lock contract needs a cross-module static assertion; do not change login runtime behavior.

**Interfaces:**

- Consumes: `listIssueTargets`, `prepareIssuedEmployeeCredential`.
- Produces: atomic `issueCredentials` and idempotent `confirmDistribution`.

- [x] **Step 1: Write issue/confirm RED tests**

Cover:

- first issue rotates every generated row and increments revision 0→1;
- second explicit issue at expected revision 1 rotates again and old hashes disappear;
- concurrent expected revision has one success and one `credential_revision_stale`;
- active session, disabled/unbound/transferred employee, target-set mismatch, ordinary reset baseline mismatch and confirmed state all produce whole-batch 409/zero update;
- audit failure rolls back every password/revision/session/baseline update;
- response-loss simulation advances GET revision but returns no plaintext from GET;
- same manifest confirmation replay succeeds; old manifest fails; confirmed closes issue.

- [x] **Step 2: Run RED**

```powershell
corepack pnpm@10.15.1 exec vitest run src/server/repositories/postgres-employee-import-command-repository.test.ts src/server/services/employee-import-command-service.test.ts src/server/auth/local-session-runtime.test.ts --maxWorkers=1
```

Expected: new issue/confirm cases FAIL.

- [x] **Step 3: Implement deterministic shared locking**

Inside the issue transaction:

```ts
const targets = await lockAndListGeneratedTargets(transaction, command.id);
for (const target of [...targets].sort((a, b) =>
  a.authUserId.localeCompare(b.authUserId),
)) {
  await transaction.execute(
    sql`select pg_advisory_xact_lock(hashtext(${target.authUserId}))`,
  );
}
```

Only after all advisory locks are held, re-read account/session/employee state. This must match `assertAccountCanCreateSession` in `local-session-runtime.ts`.

- [x] **Step 4: Implement all-or-none issue**

Validate exact prepared target set, expected revision, open status, active employee, original organization, credential baseline and absence of unexpired session. Then in the same transaction:

1. update every credential hash and `auth_account.updated_at`;
2. delete all target sessions;
3. update every row `credential_updated_at`;
4. increment command revision;
5. set new `current_issue_public_id`;
6. insert redacted `employee.credentials_issued` audit.

Return only row/employee/phone/name metadata. The service pairs it with in-memory plaintext by row public id and masks phone before producing the manifest.

- [x] **Step 5: Implement confirm**

Lock command and target account rows, verify revision/current manifest/baseline, then set `confirmed`/`distribution_confirmed_at` and insert audit. If already confirmed with the same manifest/revision, return existing command; any older pair returns `credential_manifest_stale`.

- [x] **Step 6: Run GREEN**

Run Step 2.

Expected: PASS.

---

### Task 6: Expose Canonical Routes and Convert Legacy Endpoints to Thin Adapters

**Files:**

- Create: `src/server/services/employee-import-command-route.ts` and test
- Create: four `src/app/api/v1/employee-import-commands/**/route.ts` files
- Modify: `src/server/services/admin-organization-org-auth-runtime.ts`
- Modify: `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- Modify: `src/server/contracts/employee-account-contract.ts`
- Modify: `src/server/services/employee-account-service.ts` and tests
- Modify: affected phase-20/phase-8/admin baseline tests

**Interfaces:**

- Consumes: Task 4 service.
- Produces: canonical four-action API plus compatible `/employees` and `/employees/import` submit adapters.

- [x] **Step 1: Write route RED tests**

Assert:

- missing/invalid session 401;
- `content_admin` 403;
- malformed/missing `Idempotency-Key` 422;
- ops/super submit 200;
- GET/issue/confirm visibility rules;
- 409 and 503 use matching HTTP status and envelope;
- every response includes `Cache-Control: no-store`;
- request/response/audit serialization never contains raw password except successful issue manifest.

- [x] **Step 2: Run RED**

```powershell
corepack pnpm@10.15.1 exec vitest run src/server/services/employee-import-command-route.test.ts tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts --maxWorkers=1
```

Expected: canonical route tests fail; legacy tests still observe old DTO.

- [x] **Step 3: Implement canonical handler factory**

```ts
function createNoStoreJsonResponse<TData>(
  result: EmployeeImportCommandServiceResult<TData>,
): Response {
  return Response.json(result.response, {
    status: result.httpStatus,
    headers: { "Cache-Control": "no-store" },
  });
}

export function createEmployeeImportCommandRouteHandlers(options = {}) {
  return {
    collection: { POST: submitHandler },
    item: { GET: getHandler },
    issueCredentials: { POST: issueHandler },
    confirmDistribution: { POST: confirmHandler },
  };
}
```

Resolve the authenticated admin once per request and select only `ops_admin`/`super_admin`.

- [x] **Step 4: Wire exact app routes**

Each app route instantiates the same handler tree and exports only its required method. Dynamic routes pass `context.params.publicId` unchanged.

- [x] **Step 5: Convert legacy submit routes**

`/api/v1/employees` POST maps the old body to:

```ts
{
  commandKind: "single_create",
  organizationPublicId,
  rows: [{ phone, name, initialPassword }],
}
```

`/api/v1/employees/import` POST retains CSV/TSV parsing but maps ordered raw rows to `batch_import`. Both require the same `Idempotency-Key` and return `EmployeeImportCommandDto`. Remove `importEmployeeAccounts`, `mapEmployeeAccountImportFailureReason` and create/import calls to `appendEmployeeAuditLog`.

Both legacy adapters must use the same `createNoStoreJsonResponse` helper as canonical routes; a compatibility path must not re-enable caching.

- [x] **Step 6: Remove synchronous generated-secret contracts**

Remove `EmployeeInitialPasswordDistributionRowDto` and `generatedInitialPasswords`. The legacy `EmployeeAccountService` must no longer generate/return a secret; missing password on that non-production legacy service returns its validation error so it cannot create an unreachable account.

- [x] **Step 7: Run GREEN and route inventory smoke**

Run Step 2 plus:

```powershell
rg -n "generatedInitialPassword|generatedInitialPasswords" src tests
rg -n "appendEmployeeAuditLog" src/server/services/admin-organization-org-auth-runtime.ts
```

Expected: focused tests PASS; first scan has no results; second scan has no create/import audit call.

---

### Task 7: Replace the Synchronous UI With a Recoverable Command State Machine

**Files:**

- Create: client, hook and panel files/tests listed in File Structure
- Modify: `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- Modify: affected UI contract tests

**Interfaces:**

- Consumes: Task 6 API.
- Produces: submit/replay/query/issue/confirm UX with transient plaintext only.

- [x] **Step 1: Write client/hook/panel RED tests**

Tests must prove:

- submit creates UUID v4 and sends `Idempotency-Key`;
- POST transport/503 auto-retries once with identical key/body;
- issue never auto-retries;
- URL stores only `employeeImportCommand=<publicId>`;
- `history.state` may retain only the idempotency key, never CSV rows/password;
- completed command clears input/key memory;
- refresh GET returns command without secrets;
- pending recovery requires re-upload and rejects changed payload through server 409;
- late manifest revision is discarded;
- reissue replaces and clears previous manifest;
- close/unmount/confirm clears plaintext;
- active-session/baseline/conflict states disable unsafe actions.

- [x] **Step 2: Run RED**

```powershell
corepack pnpm@10.15.1 exec vitest run src/features/admin/org-auth-redeem/employee-import-command-client.test.ts src/features/admin/org-auth-redeem/useEmployeeImportCommand.test.tsx src/features/admin/org-auth-redeem/EmployeeImportCommandPanel/EmployeeImportCommandPanel.test.tsx tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts --maxWorkers=1
```

Expected: new modules missing and old UI still expects synchronous password array.

- [x] **Step 3: Implement no-store client**

All calls use `credentials: "same-origin"`, bearer header, `cache: "no-store"` and parsed `ApiResponse`. Only submit accepts an idempotency header. Issue/confirm do not auto-retry at the client layer.

- [x] **Step 4: Implement hook state and cleanup**

```ts
type EmployeeImportCommandUiState = {
  status:
    | "idle"
    | "submitting"
    | "processing"
    | "open"
    | "confirmed"
    | "conflict"
    | "error";
  command: EmployeeImportCommandDto | null;
  manifest: EmployeeCredentialManifestDto | null;
  idempotencyKey: string | null;
  submittedInput: EmployeeImportInput | null;
  highestCredentialRevision: number;
};
```

Use an unmount cleanup that overwrites manifest/submitted input/key references with null. On command completion, clear provided-password input before allowing issue. Persist no row body or password outside React memory.

- [x] **Step 5: Implement issue response-loss rule**

On issue transport/503 failure, immediately GET:

```text
revision unchanged -> show “可重新发起换新”，do not auto issue
revision advanced  -> show “上一版响应丢失，需显式换新分发”
```

Accept a manifest only when its revision is greater than `highestCredentialRevision`; clear the older manifest before starting the next explicit issue.

- [x] **Step 6: Extract panel and keep page compositional**

Move result counts, rejections, credential cards, copy controls, revision badge and confirm button into `EmployeeImportCommandPanel`. Keep `AdminOrgAuthRedeemPage` responsible only for preview/drawer composition, hook wiring, employee list refresh and toast.

Use existing design tokens/classes; add no literal colors, spacing magic numbers or JS theme checks.

- [x] **Step 7: Run GREEN and plaintext persistence scan**

Run Step 2 plus:

```powershell
rg -n "localStorage|sessionStorage|URLSearchParams|replaceState" src/features/admin/org-auth-redeem/useEmployeeImportCommand.ts src/features/admin/org-auth-redeem/employee-import-command-client.ts
```

Expected: tests PASS; inspected matches store only command public id/idempotency key, never row/password content.

---

### Task 8: Full Verification, Two Adversarial Reviews and Single-Commit Closeout

**Files:**

- Modify: task evidence and audit.
- Modify at ready stage: project state/task queue only for `ready_for_closeout`.
- No new product scope.

**Interfaces:**

- Consumes: Tasks 1–7.
- Produces: one product commit, one ready governance commit, ff-only master merge, authorized push and cleanup.

- [x] **Step 1: Run the exact focused suite**

```powershell
corepack pnpm@10.15.1 exec vitest run src/db/schema/employee-import.test.ts src/server/validators/employee-import-command.test.ts src/server/services/employee-import-command-crypto.test.ts src/server/repositories/postgres-employee-import-command-repository.test.ts src/server/services/employee-import-command-service.test.ts src/server/services/employee-import-command-route.test.ts src/server/auth/local-session-runtime.test.ts src/features/admin/org-auth-redeem/employee-import-command-client.test.ts src/features/admin/org-auth-redeem/useEmployeeImportCommand.test.tsx src/features/admin/org-auth-redeem/EmployeeImportCommandPanel/EmployeeImportCommandPanel.test.tsx tests/unit/p1-employee-import-command-atomicity.test.ts tests/unit/p1-employee-import-command-migration-source.test.ts tests/unit/p0-rc-02-organization-scope-quota-employee.test.ts tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-11-system-ops-user-management-loop.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts --maxWorkers=1
```

Expected: PASS for every named file.

- [x] **Step 2: Run full static regression**

```powershell
npm.cmd run test:unit -- --maxWorkers=1
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run format:check
npm.cmd run build
git diff --check
```

Expected: all exit 0. Do not run `npm test` because browser/e2e is outside this Goal.

- [ ] **Step 3: Run governance gates**

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-employee-creation-atomicity-2026-07-16
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-02-employee-creation-atomicity-2026-07-16
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-02-employee-creation-atomicity-2026-07-16 -SkipRemoteAheadCheck
```

Expected: all pass without skip/bypass; product SHA drift is evaluated as standard, not transition-only.

- [x] **Step 4: Perform Round 1 adversarial review**

Review requirement/transaction coverage against every spec completion criterion. Inject or statically prove failure at claim audit, each identity write, quota, row outcome, completion audit, each credential update, session revoke, revision update and confirm audit. Verify savepoint rollback prevents caught deterministic errors from committing partial identity.

Record `Result: pass` only when all blockers are closed.

- [x] **Step 5: Perform independent Round 2 review**

Use a fresh reviewer only if the user-approved execution mode permits subagents; otherwise perform a fresh-context inline review. Attack HMAC privacy, replay, wrong payload, actor/super visibility, raw-secret persistence, login/issue shared locks, multi-lock order, late response, reset baseline, active session, audit redaction, migration source and scope.

Record `Result: pass` only with no unresolved finding. RV-0018 remains explicitly pending.

- [x] **Step 6: Finalize evidence and taste checklist**

Evidence must include exact command output, test counts, generated migration paths, changed-file inventory, Round 1/2, secret-negative scans, no runtime/database proof claim and `Cost Calibration Gate remains blocked`.

Taste checklist must confirm all ten commandments, especially no magic color/spacing, no giant new page logic, standard API envelope, no N+1 result query, no plaintext persistence and explicit current authorization.

- [ ] **Step 7: Create the single product commit**

Stage only the exact product allowlist plus spec/plan/task plan/evidence/audit and generated migration artifacts. Run real pre-commit, then:

```powershell
git commit -m "fix(employee): add recoverable import command"
```

Expected: one product commit; no intermediate Task 1–7 commit exists.

- [ ] **Step 8: Create ready governance commit**

Update state/queue/evidence/audit to `ready_for_closeout` with product SHA and all checkpoint evidence. Stage only governance files, run guards and commit:

```powershell
git commit -m "chore(p1): ready employee import command recovery"
```

- [ ] **Step 9: ff-only merge, real pre-push, authorized push and cleanup**

From `D:\tiku`:

```powershell
git merge --ff-only codex/p1-rc02-employee-creation-atomicity
git push origin master
```

After live remote/local/master equality and fresh-master focused + required guards pass, remove only the verified `D:\tiku\.worktrees\p1-rc02-employee-creation-atomicity` worktree and merged short branch. Preserve the existing recovery stash.

Expected: task closeout checkpoints all pass; only then materialize the next JIT P1 task.

---

## Plan Self-Review Checklist

- [x] Every design section maps to a Task: data model (1), HMAC/validation (2), row transaction (3), replay/query (4), issue/confirm (5), routes/adapters (6), UI (7), verification/closeout (8).
- [x] Type names in Tasks 2–7 match Stable Interfaces exactly.
- [x] No step stores phone/name/password/request payload in command tables.
- [x] No step catches deterministic repository errors without a savepoint.
- [x] No step claims RV-0018 or real database behavior closed.
- [x] No product task starts before the separate exact governance gate.
- [x] Final history remains one product commit plus ready governance commit.
