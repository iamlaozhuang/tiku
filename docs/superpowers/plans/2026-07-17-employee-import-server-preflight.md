# Employee Import Server Preflight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以服务端原始 CSV/TSV 解析、逐行 `new | bind | skip | block` 预检、不可授权的 preview revision 与确认时重新校验，静态关闭 F-0116；同时复用 F-0115 原子 command、幂等恢复和一次性凭据分发。

**Architecture:** 浏览器只提交单建字段或原始 `content + sourceFormat`。validator 负责严格外层结构，纯函数 parser 负责 tabular 语义，repository 用固定次数集合读取生成身份/组织/授权/quota 事实，service 统一映射安全预览并计算 canonical SHA-256 revision。确认先恢复已存在的同幂等 command；新请求则重新解析和 preflight，revision 不同或存在 block 时零写入，匹配后仅把 `new | bind` 行交给现有 F-0115 command，事务层继续承担竞争窗口中的 JIT 校验。

**Tech Stack:** Next.js 16 Route Handlers、TypeScript 5、React 19、Drizzle ORM 0.45、PostgreSQL read model、Vitest 4、Testing Library、PowerShell P1/Module Run v2 guards。

## Global Constraints

- 任务固定为 `p1-remediation-rc-02-employee-import-preflight-2026-07-17`，WIP=1；分支固定为 `codex/p1-rc02-employee-import-preflight`。
- 权威规格为 `docs/superpowers/specs/2026-07-17-employee-import-server-preflight-design.md`；用户已于 2026-07-18 书面回复“批准规格”。
- 当前 transition anchor、`master` 与 `origin/master` 均为 `f6b14825f41a83b3f9dd3994ec9c1936876b12ff`；开始执行时先重新核对，不得凭本计划中的 SHA 继续。
- 本计划写完后，在用户选择执行方式前不得修改产品代码。
- 只允许 task queue `allowedFiles` 中的精确路径；禁止修改 `AGENTS.md`、依赖/lockfile、schema、Drizzle migration、seed、env、e2e 与外部只读审计库。
- 不执行真实数据库、Provider、browser/runtime acceptance、P2、PR、force push 或部署；RV-0018 保持 pending，本任务只声明 static level closure。
- 不新增、删除或升级依赖；不新增持久 preview 表、缓存或 migration。
- API 路径使用 kebab-case，JSON 使用 camelCase，响应保持 `{ code, message, data }`，nullable key 不省略，preview/confirm/GET 全部 `Cache-Control: no-store`。
- preview 与错误响应不得包含完整手机号、`initialPassword`、原始 source、内部自增 id、内部 auth 行、hash 或异常文本。
- preview revision 不是授权凭证；确认始终重新认证、重新解析、重新读取当前组织/身份/授权/quota 事实，最终写入仍由 F-0115 transaction/JIT guard 决定。
- repository preflight 必须是集合读取；禁止按行查询和 N+1。
- TDD 顺序固定为 RED → 最小 GREEN → 聚焦回归；禁止先写实现再补测试。
- 项目要求一个任务一个产品提交，且用户已冻结单提交边界。因此 Task 0–7 只形成可复核 checkpoint，不创建中间 commit；Task 8 创建一个产品提交，随后按既有 P1 流程创建 ready governance commit。
- 只有已经通过 P1 `transition_only` 的精确治理提交可使用 ancestor checkpoint；本任务任何普通 `in_progress` SHA 漂移继续 hard-block。若标准 closeout 无法通过现有守卫，停止并申请独立、精确的治理热修，不得绕过。
- 若正确性需要持久 preview、schema/migration、依赖、真实 DB、Provider/browser、P2、其他 finding 修复或扩大权限，立即停止。

---

## File Structure

### New files

- `src/server/services/employee-import-source-parser.ts`：纯函数 CSV/TSV 状态机、严格 header 与 500 行边界。
- `src/server/services/employee-import-source-parser.test.ts`：BOM、quotes、CRLF、quoted newline、header 与行数对抗矩阵。
- `src/app/api/v1/employee-import-commands/preview/route.ts`：canonical no-store preview Route Handler。
- `src/features/admin/org-auth-redeem/EmployeeCreateActionPanel/EmployeeCreateActionPanel.tsx` 及测试：单建字段、preview 与确认 UI。
- `src/features/admin/org-auth-redeem/EmployeeImportPreflightPanel/EmployeeImportPreflightPanel.tsx` 及测试：原始 source、服务端逐行 preview 与确认 UI。

### Modified product files

- `src/server/contracts/employee-import-command-contract.ts`：transport union、preflight DTO、稳定 reason 与 confirmation result。
- `src/server/validators/employee-import-command.ts` 及测试：preview/confirm 严格 union validator 与 revision 校验。
- `src/server/repositories/employee-import-command-repository.ts`：集合 preflight port 与幂等 command 只读恢复 port。
- `src/server/repositories/postgres-employee-import-command-repository.ts` 及测试：固定次数 read-only facts 查询；保留原 command transaction。
- `src/server/services/employee-import-command-service.ts` 及测试：preview、revision、stale/block 零写入、幂等恢复、F-0115 handoff。
- `src/server/services/employee-import-command-route.ts` 及测试：preview handler、status/code/no-store/auth。
- `src/app/api/v1/employee-import-commands/route.ts`：继续导出 canonical confirm POST。
- `src/server/services/admin-organization-org-auth-runtime.ts`：遗留 `/employees` 和 `/employees/import` 只做 transport 适配，不再解析 CSV/TSV。
- `src/features/admin/org-auth-redeem/employee-import-command-client.ts` 及测试：preview 与 raw-source confirm client。
- `src/features/admin/org-auth-redeem/useEmployeeImportCommand.ts` 及测试：preview-before-confirm、stale 刷新和敏感内存清理。
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`：移除浏览器 parser/授权近似，组合两个 action panel。
- allowlist 中的 phase-20、admin baseline、phase-8、phase-11、P1 atomicity smoke：更新兼容合同与防退化断言。

### Governance/evidence files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-17-p1-remediation-rc-02-employee-import-preflight-design.md`
- `docs/05-execution-logs/evidence/2026-07-17-p1-remediation-rc-02-employee-import-preflight.md`
- `docs/05-execution-logs/audits-reviews/2026-07-17-p1-remediation-rc-02-employee-import-preflight.md`
- `docs/superpowers/specs/2026-07-17-employee-import-server-preflight-design.md`
- 本实施计划。

## Stable Interfaces

后续 Task 使用以下名称与语义；如实现中发现类型无法表达已批准规格，先更新本计划并复核，不得静默漂移。

```ts
export type EmployeeImportSourceFormat = "csv" | "tsv";

export type EmployeeImportPreflightInput =
  | {
      commandKind: "single_create";
      organizationPublicId: string;
      phone: string;
      name: string;
      initialPassword?: string | null;
    }
  | {
      commandKind: "batch_import";
      organizationPublicId: string;
      sourceFormat: EmployeeImportSourceFormat;
      content: string;
    };

export type EmployeeImportCommandConfirmationInput =
  EmployeeImportPreflightInput & {
    expectedPreviewRevision: string;
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

export type EmployeeImportPreflightReason =
  | "invalid_row"
  | "duplicate_phone"
  | "organization_not_found"
  | "cross_domain_conflict"
  | "cross_organization_conflict"
  | "disabled_account"
  | "current_authorization_insufficient"
  | "quota_insufficient";

export type EmployeeImportPreflightRowDto = {
  rowNumber: number;
  maskedPhone: string;
  name: string;
  outcome: "new" | "bind" | "skip" | "block";
  redactedReason: EmployeeImportPreflightReason | null;
  credentialMode: "generated" | "provided" | "existing_account" | null;
  inheritedAuthorizationSummary: {
    status: "available" | "unavailable";
    activeScopeCount: number;
    effectiveEdition: "standard" | "advanced" | null;
  };
  quotaImpact: {
    status: "available" | "insufficient" | "not_required" | "unavailable";
    requiredSeatCount: 0 | 1;
    availableSeatCount: number | null;
  };
};

export type EmployeeImportPreflightDto = {
  previewRevision: string;
  commandKind: "single_create" | "batch_import";
  organizationPublicId: string;
  rowCount: number;
  counts: { new: number; bind: number; skip: number; block: number };
  canConfirm: boolean;
  confirmDisabledReason: "blocked_rows" | "no_action_required" | null;
  rows: EmployeeImportPreflightRowDto[];
};

export type EmployeeImportCommandConfirmationResult =
  | EmployeeImportCommandDto
  | EmployeeImportPreflightDto;
```

Repository 只返回服务端内部事实，不返回 DTO：

```ts
export type EmployeeImportPreflightIdentityState =
  | "absent"
  | "personal_active"
  | "employee_same_organization"
  | "employee_other_organization"
  | "disabled_user"
  | "admin_phone_conflict";

export type PreflightEmployeeImportRowsInput = {
  actor: EmployeeImportCommandActor;
  organizationPublicId: string;
  rows: { rowNumber: number; phone: string }[];
};

export type EmployeeImportPreflightFacts = {
  organizationStatus: "active" | "not_found";
  authorization: {
    status: "available" | "unavailable";
    activeScopeCount: number;
    effectiveEdition: "standard" | "advanced" | null;
    availableSeatCount: number | null;
  };
  rows: {
    rowNumber: number;
    identityState: EmployeeImportPreflightIdentityState;
  }[];
};

export type FindClaimedEmployeeImportCommandInput = {
  actor: EmployeeImportCommandActor;
  idempotencyScopeHash: string;
};
```

`EmployeeImportCommandService` 增加 `preview`，`submit` 返回 confirmation union：

为保持仅执行 confirm 的 legacy adapter/test double 静态兼容，基础
`EmployeeImportCommandService` 上的 `preview` port 可选；canonical route 与工厂返回值使用
`EmployeeImportCommandServiceWithPreview` 交叉类型将该 port 收紧为必需。生产 preview route
缺少此 port 时不能构造，未降低运行时门禁。

```ts
export type EmployeeImportCommandService = {
  preview(input: {
    actor: EmployeeImportCommandActor;
    body: unknown;
  }): Promise<EmployeeImportCommandServiceResult<EmployeeImportPreflightDto>>;
  submit(input: {
    actor: EmployeeImportCommandActor;
    idempotencyKey: unknown;
    body: unknown;
  }): Promise<
    EmployeeImportCommandServiceResult<EmployeeImportCommandConfirmationResult>
  >;
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

Revision canonical payload 固定为版本化对象，并包含密码输入的不可逆摘要影响，防止预览后替换密码：

```ts
const revisionPayload = {
  version: 1,
  actorPublicId,
  commandKind,
  organizationPublicId,
  rows: normalizedRows,
  preflightRows: safeSemanticRows,
};
const previewRevision = createHash("sha256")
  .update(JSON.stringify(revisionPayload))
  .digest("hex");
```

`previewRevision` 只返回 digest；canonical payload、phone、password 永不返回或记录。

---

### Task 0: Materialize Written Spec Approval and Recheck Scope

**Files:**

- Modify: `docs/superpowers/specs/2026-07-17-employee-import-server-preflight-design.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Modify: current task plan/evidence/audit paths listed above

**Interfaces:** 将已发生的书面批准物化为 `currentExecutionGate: satisfied`，不扩大 allowlist/capability。

- [ ] **Step 1: Recover from repository truth**

Run:

```powershell
git status --short
git rev-parse HEAD
git rev-parse master
git rev-parse origin/master
```

Expected: 除本实施计划外无未提交改动；四个 SHA 均为 `f6b14825f41a83b3f9dd3994ec9c1936876b12ff`。任何其他不明改动或 SHA 漂移都停止。

- [ ] **Step 2: Record approval without changing scope**

Set spec status to `方案 A 已获用户批准，书面规格已于 2026-07-18 复核通过`。Set queue gate to:

```yaml
currentExecutionGate:
  status: satisfied
  reason: current_user_approved_written_f0116_spec_2026_07_18
  approvalRequestPath: docs/superpowers/specs/2026-07-17-employee-import-server-preflight-design.md
  resumeAction: execute_f0116_employee_import_server_preflight_plan_red_to_green
```

Update project-state resume action and evidence/audit approval ledger only; keep task `status: in_progress`、`executionStage: scope_frozen`、all capabilities and blocked files unchanged.

- [ ] **Step 3: Run scope-only checks**

```powershell
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual
```

Expected: PASS；checkpoint only，no commit。

---

### Task 1: Freeze Transport Contracts and Strict Validators

**Files:**

- Modify: `src/server/contracts/employee-import-command-contract.ts`
- Modify: `src/server/validators/employee-import-command.ts`
- Modify: `src/server/validators/employee-import-command.test.ts`

**Interfaces:** Produces `EmployeeImportPreflightInput`、`EmployeeImportCommandConfirmationInput`、preflight DTO/reasons and exact union normalizers。

- [ ] **Step 1: Write failing validator tests**

Cover exact single/batch preview bodies, confirm revision, null optional password, 64-char lowercase revision, null-prototype objects, sparse arrays, inherited/symbol/unknown fields, batch `rows`, single `content`, forbidden nested objects and prototype pollution.

```ts
expect(
  normalizeEmployeeImportPreflightInput({
    commandKind: "batch_import",
    organizationPublicId: "org-1",
    sourceFormat: "csv",
    content: "phone,name\n13900000000,A",
  }),
).toEqual({ success: true, value: expect.any(Object) });

expect(
  normalizeEmployeeImportCommandConfirmationInput({
    commandKind: "single_create",
    organizationPublicId: "org-1",
    phone: "13900000000",
    name: "A",
    expectedPreviewRevision: "a".repeat(64),
  }),
).toEqual({ success: true, value: expect.any(Object) });
```

- [ ] **Step 2: Run RED**

```powershell
corepack pnpm@10.15.1 exec vitest run src/server/validators/employee-import-command.test.ts --maxWorkers=1
```

Expected: FAIL because the new normalizers/types do not exist.

- [ ] **Step 3: Implement exact union normalization**

Use separate key lists for single preview, batch preview, single confirm and batch confirm. Outer validation trims organization/single fields but does not parse or normalize batch source content. Keep `normalizeEmployeeImportCommandInput` as an internal normalized-row guard for the F-0115 executor; do not expose `rows` as the new transport.

- [ ] **Step 4: Run GREEN**

Run Step 2. Expected: PASS.

- [ ] **Step 5: Checkpoint without commit**

```powershell
git diff --check
git diff -- src/server/contracts/employee-import-command-contract.ts src/server/validators/employee-import-command.ts src/server/validators/employee-import-command.test.ts
```

Expected: exact task scope only.

---

### Task 2: Implement the Server-Owned CSV/TSV Parser

**Files:**

- Create: `src/server/services/employee-import-source-parser.ts`
- Create: `src/server/services/employee-import-source-parser.test.ts`

**Interfaces:**

```ts
export type EmployeeImportSourceParseResult =
  | { success: true; rows: NormalizedEmployeeImportCommandInput["rows"] }
  | {
      success: false;
      reason:
        | "empty_source"
        | "malformed_quote"
        | "missing_required_header"
        | "duplicate_header"
        | "unknown_header"
        | "invalid_column_count"
        | "empty_data"
        | "row_limit_exceeded";
      message: string;
    };

export function parseEmployeeImportSource(input: {
  content: string;
  sourceFormat: EmployeeImportSourceFormat;
}): EmployeeImportSourceParseResult;
```

- [ ] **Step 1: Write the adversarial parser matrix**

RED cases must include UTF-8 BOM, CSV/TSV, quoted comma/tab, `""` escape, quoted CR/LF, CRLF, whitespace after closing quote, illegal character after closing quote, quote inside unquoted cell, unclosed quote, empty source/data, exact `phone`/`name` plus optional `initialPassword`, missing/duplicate/unknown/authorization-scope headers, ragged rows, 500 pass and 501 fail.

Assert quoted newline creates one logical data row and does not shift later logical `rowNumber`.

- [ ] **Step 2: Run RED**

```powershell
corepack pnpm@10.15.1 exec vitest run src/server/services/employee-import-source-parser.test.ts --maxWorkers=1
```

Expected: FAIL because parser file is absent.

- [ ] **Step 3: Implement one-pass finite-state parsing**

Use states `unquoted | quoted | quote_closed`; the selected `sourceFormat` owns the delimiter. Remove BOM only from the first header cell. Trim unquoted outer whitespace, preserve quoted content, ignore wholly empty logical records, require every data record to have the header column count, and stop after observing row 501.

Header policy is fail-closed: after BOM/outer trim, only canonical `phone`、`name`、`initialPassword` are accepted; duplicates and every other column, including authorization fields, are rejected as `unknown_header` or `duplicate_header`.

- [ ] **Step 4: Run GREEN and mutation-oriented edge rerun**

Run Step 2 twice: once normally and once with `--reporter=verbose`. Expected: PASS, stable logical row numbers.

---

### Task 3: Add Set-Based Read-Only Preflight Facts and Idempotency Recovery

**Files:**

- Modify: `src/server/repositories/employee-import-command-repository.ts`
- Modify: `src/server/repositories/postgres-employee-import-command-repository.ts`
- Modify: `src/server/repositories/postgres-employee-import-command-repository.test.ts`
- Modify: `tests/unit/p1-employee-import-command-atomicity.test.ts`

**Interfaces:** Add `preflightRows(input)` and `findClaimedCommand(input)` to the repository port. `findClaimedCommand` returns `{ command, requestHash } | null` under the same actor visibility policy without inserting or updating anything.

- [ ] **Step 1: Write repository RED tests**

Prove:

- actor role is checked before facts are returned;
- target organization missing/disabled is `not_found` without leaking ids;
- unique valid phones are read with `inArray`, not one query per row;
- absent, personal active, same-org employee, other-org employee, disabled user and admin conflict map to stable identity states;
- current active org authorization, effective edition and minimum available quota are read as one target summary;
- 500 rows do not increase query count with row count;
- preflight emits no insert/update/delete/audit;
- idempotency lookup distinguishes absent, same request, mismatched request and hidden other-actor command.

- [ ] **Step 2: Run RED**

```powershell
corepack pnpm@10.15.1 exec vitest run src/server/repositories/postgres-employee-import-command-repository.test.ts tests/unit/p1-employee-import-command-atomicity.test.ts --maxWorkers=1
```

Expected: new port/method assertions FAIL.

- [ ] **Step 3: Implement fixed-query preflight**

Resolve actor and organization once. Read current authorization/quota once. Deduplicate phone values and fetch admin/user/employee identity facts with set queries. Re-associate facts by `rowNumber` in memory. Do not lock mutation rows and do not return database ids from the repository boundary.

The repository must not decide `new | bind | skip | block`; it only supplies facts. Service owns input validation, duplicate-row policy, deterministic quota allocation and redaction.

- [ ] **Step 4: Implement read-only command recovery**

Lookup by `idempotency_scope_hash`, apply existing owner/super-admin visibility, and return the persisted `request_hash` plus mapped command. This path exists so a lost successful confirm response can recover the original command even though current preflight facts now classify those employees as `skip`.

- [ ] **Step 5: Run GREEN and N+1 static scan**

Run Step 2 plus:

```powershell
rg -n "preflightRows|inArray\(|\.insert\(|\.update\(|\.delete\(" src/server/repositories/postgres-employee-import-command-repository.ts
```

Expected: tests PASS; inspected preflight slice contains set reads and no write.

---

### Task 4: Build Unified Preview, Revision and Safe Confirmation

**Files:**

- Modify: `src/server/services/employee-import-command-service.ts`
- Modify: `src/server/services/employee-import-command-service.test.ts`

**Interfaces:** Implements `preview`; extends `submit` to confirmation union while keeping F-0115 execution and credential methods intact.

- [ ] **Step 1: Write service RED tests**

Cover both single and batch sources; invalid/duplicate rows; all repository identity states; organization/auth/quota blocks; deterministic quota allocation in ascending source row; masked phones; nullable DTO keys; canonical revision stability; input/name/password/fact/revision changes; stale 409 code `409608`; blocked 422 code `422602`; no-action 422 code `422603`; unknown 503 redaction; zero `claimCommand/processRow` on stale/block/no-action; post-preflight race delegated to F-0115; and secret-negative JSON scans.

Add the critical recovery test:

```ts
it("recovers a previously claimed matching command before current facts can stale the preview", async () => {
  // findClaimedCommand returns the original matching request.
  // preflightRows, claimCommand and processRow must not run.
  // result is the existing EmployeeImportCommandDto.
});
```

- [ ] **Step 2: Run RED**

```powershell
corepack pnpm@10.15.1 exec vitest run src/server/services/employee-import-command-service.test.ts --maxWorkers=1
```

Expected: preview/revision/recovery cases FAIL.

- [ ] **Step 3: Normalize both source kinds through one function**

Single create becomes one normalized row with `rowNumber: 1`; batch uses Task 2 parser. Reuse `normalizeCreateEmployeeAccountInput` for row validity. Duplicate normalized phones block every occurrence before repository outcome mapping.

- [ ] **Step 4: Map facts to safe outcomes**

In ascending row order:

1. invalid/duplicate/organization/auth conflicts become `block`;
2. `employee_same_organization` becomes `skip` with zero quota;
3. `personal_active` becomes `bind`; `absent` becomes `new`;
4. `new | bind` each consume one available seat in preview order; exhausted rows become `block/quota_insufficient`;
5. full phones/passwords remain only in normalized in-memory input; DTO uses `maskPhoneForDisplay` and stable redacted reasons.

`canConfirm` is true only when `block === 0` and `new + bind > 0`. A skip-only preview remains successful and reviewable but cannot create an empty F-0115 command.

- [ ] **Step 5: Compute revision from semantic facts**

Use the Stable Interfaces canonical payload. Sort only by `rowNumber`; do not sort source rows by phone/name. Include normalized password input in the digest payload so any password change stales confirmation, but never expose/log the payload.

- [ ] **Step 6: Confirm in safe order**

Algorithm:

1. validate idempotency key and confirmation transport;
2. normalize source and compute existing F-0115 request hashes;
3. call read-only `findClaimedCommand`; matching request returns existing command, mismatch returns existing `409601`;
4. when no command exists, rerun preflight;
5. revision mismatch returns `409608` with latest safe preview and zero writes;
6. block returns `422602`; skip-only returns `422603`; both return latest safe preview and zero writes;
7. filter actionable `new | bind` rows while preserving original source `rowNumber`，并按原行号绑定 full-request row HMAC，再调用既有 claim/process executor；这样混合 `skip` 后的响应丢失恢复仍能精确定位 pending 行；
8. any fact change after preflight remains a row-level F-0115 rejection/partial result, never a bypass.

- [ ] **Step 7: Run GREEN and legacy F-0115 regression**

```powershell
corepack pnpm@10.15.1 exec vitest run src/server/services/employee-import-command-service.test.ts tests/unit/p1-employee-import-command-atomicity.test.ts --maxWorkers=1
```

Expected: PASS; existing issue/confirm-distribution and response-loss cases remain green.

---

### Task 5: Expose Canonical Preview/Confirm and Thin Legacy Adapters

**Files:**

- Modify: `src/server/services/employee-import-command-route.ts`
- Modify: `src/server/services/employee-import-command-route.test.ts`
- Create: `src/app/api/v1/employee-import-commands/preview/route.ts`
- Modify: `src/app/api/v1/employee-import-commands/route.ts`
- Modify: `src/server/services/admin-organization-org-auth-runtime.ts`
- Modify: `tests/unit/phase-20-ra-01-04-employee-import.test.ts`
- Modify: `tests/unit/phase-11-system-ops-user-management-loop.test.ts`

**Interfaces:** `routeHandlers.preview.POST` delegates to `service.preview`; collection POST delegates to revision-bound `service.submit`.

- [ ] **Step 1: Write route and compatibility RED tests**

Assert preview/confirm: 401 missing session, 403 content_admin, ops/super pass, 422 malformed source, stale `409608` with safe preview, idempotency mismatch `409601`, redacted 503, standard envelope and no-store. Serialize every preview/error and assert absence of raw phone/password/source/internal ids.

Legacy `/employees` POST must forward canonical single fields plus `expectedPreviewRevision`; `/employees/import` must forward raw content/sourceFormat/organization plus revision without `split`, delimiter parser or `rows` reconstruction.

- [ ] **Step 2: Run RED**

```powershell
corepack pnpm@10.15.1 exec vitest run src/server/services/employee-import-command-route.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts tests/unit/phase-11-system-ops-user-management-loop.test.ts --maxWorkers=1
```

Expected: preview handler absent and legacy parser assertions FAIL.

- [ ] **Step 3: Implement shared route execution**

Reuse `resolveEmployeeImportCommandActor` and `createNoStoreJsonResponse`. Add:

```ts
preview: {
  async POST(request: Request): Promise<Response> {
    return execute(request, async (actor) =>
      commandService.preview({ actor, body: await readRequestJson(request) }),
    );
  },
},
```

Await request JSON exactly once. Preserve current item/issue/distribution handlers.

- [ ] **Step 4: Replace legacy business parsing with transport mapping**

Delete `parseDelimitedLine`、header normalization、forbidden header approximation and `parseEmployeeAccountImportContent` from `admin-organization-org-auth-runtime.ts`. The legacy routes may rename `targetOrganizationPublicId` to canonical `organizationPublicId`; they must not inspect source rows.

- [ ] **Step 5: Run GREEN and parser ownership scan**

Run Step 2 plus:

```powershell
rg -n "parseDelimited|split\(/\\r\?\\n|headerIndexByName" src/server/services/admin-organization-org-auth-runtime.ts src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx
```

Expected after Task 7: no business parser remains outside `employee-import-source-parser.ts`.

---

### Task 6: Add Preview-First Client and Hook State Machine

**Files:**

- Modify: `src/features/admin/org-auth-redeem/employee-import-command-client.ts`
- Modify: `src/features/admin/org-auth-redeem/employee-import-command-client.test.ts`
- Modify: `src/features/admin/org-auth-redeem/useEmployeeImportCommand.ts`
- Modify: `src/features/admin/org-auth-redeem/useEmployeeImportCommand.test.tsx`

**Interfaces:** Client adds `preview(sessionToken, input)` and submit accepts original input + `expectedPreviewRevision`. Hook exposes `preview`, `confirmPreview`, `invalidatePreview`, current preview, status and disabled reason.

- [ ] **Step 1: Write client/hook RED tests**

Prove:

- preview posts raw `content` unchanged to `/preview`, no idempotency header, no retry that can change UI ordering;
- confirm uses the exact reviewed source fields + revision and one UUID v4 idempotency key;
- editing organization/source/single fields invalidates preview and disables confirm;
- 409 adopts latest safe preview but does not auto-confirm;
- skip-only and blocked previews cannot confirm;
- lost confirm response reuses the same key/input and recovers existing command;
- close/unmount/session change clears raw source, single password, preview and submitted input references;
- URL/history continue to contain only command public id and idempotency key, never source/password/phone.

- [ ] **Step 2: Run RED**

```powershell
corepack pnpm@10.15.1 exec vitest run src/features/admin/org-auth-redeem/employee-import-command-client.test.ts src/features/admin/org-auth-redeem/useEmployeeImportCommand.test.tsx --maxWorkers=1
```

Expected: preview API/state methods absent.

- [ ] **Step 3: Implement client methods**

Every call uses `credentials: "same-origin"` and `cache: "no-store"`. Only confirm submit sets `Idempotency-Key`. Keep current one-retry policy only for an unknown confirm transport result with the identical key/body; preview, issue and distribution confirm do not auto-retry.

- [ ] **Step 4: Extend the hook state immutably**

Add preview statuses such as `previewing | preview_ready | preview_stale` without overloading credential distribution status. Store source only in React/ref memory. `confirmPreview` must capture the currently reviewed input and revision atomically; any input edit calls `invalidatePreview` before another preview.

On error data, narrow by `"previewRevision" in data`; on success data, narrow by `"publicId" in data`. Never treat a 409 preview as a command.

- [ ] **Step 5: Run GREEN and sensitive persistence scan**

Run Step 2 plus:

```powershell
rg -n "localStorage|sessionStorage|replaceState|URLSearchParams" src/features/admin/org-auth-redeem/useEmployeeImportCommand.ts src/features/admin/org-auth-redeem/employee-import-command-client.ts
```

Expected: tests PASS; inspected persistence contains only recovery identifiers.

---

### Task 7: Replace Browser Preview With Two Compositional Action Panels

**Files:**

- Create: `src/features/admin/org-auth-redeem/EmployeeCreateActionPanel/EmployeeCreateActionPanel.tsx`
- Create: corresponding test
- Create: `src/features/admin/org-auth-redeem/EmployeeImportPreflightPanel/EmployeeImportPreflightPanel.tsx`
- Create: corresponding test
- Modify: `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- Modify: `tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- Modify: `tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts`

**Interfaces:** 两个 panel 接收受控字段、server preview、loading/error/disabled state 与 callbacks；不得自行解析 source 或读取 orgAuth list 估算结果。

- [ ] **Step 1: Write panel/page RED tests**

Assert employee view has reachable `单个创建员工` and `批量导入员工` actions. Both drawers require preview before confirmation. Batch upload/paste sends the byte-preserving JS string and explicit `csv | tsv`; quoted rows are not parsed in browser. Preview renders counts、masked phone、name、outcome、redacted reason、authorization/quota summary. Block/no-action/stale/permission/loading/empty/error states show an explanation next to disabled confirm.

- [ ] **Step 2: Run RED**

```powershell
corepack pnpm@10.15.1 exec vitest run src/features/admin/org-auth-redeem/EmployeeCreateActionPanel/EmployeeCreateActionPanel.test.tsx src/features/admin/org-auth-redeem/EmployeeImportPreflightPanel/EmployeeImportPreflightPanel.test.tsx tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts --maxWorkers=1
```

Expected: panel files absent; page still performs local parsing/approximation.

- [ ] **Step 3: Implement stateless panels**

Use existing tokens/classes only. Batch panel has explicit source-format selector; file upload may set it from `.csv`/`.tsv` filename but may not inspect cell content. Render rows with stable keys from `rowNumber`; no full phone/password is available to render.

- [ ] **Step 4: Make the page compositional**

Remove `parseEmployeeImportDelimitedRows`、`buildEmployeeImportInput`、`buildEmployeeImportPreview`、local header sets and `summarizeEmployeeImportTargetAuth`. Replace the single import drawer boolean with explicit action-drawer state. Wire both panels to the same hook preview/confirm path and keep `EmployeeImportCommandPanel` for final command/credential distribution.

Changing any controlled input clears its prior preview. Closing either drawer calls `clearPlaintext` and clears page-owned source/password state.

- [ ] **Step 5: Run GREEN and page ownership scan**

Run Step 2 plus:

```powershell
rg -n "parseEmployeeImport|buildEmployeeImportPreview|summarizeEmployeeImportTargetAuth|headerIndexByName" src/features/admin/org-auth-redeem
```

Expected: no browser-owned business parser or authorization/quota approximation remains.

---

### Task 8: Full Verification, Two Adversarial Reviews and Closeout

**Files:**

- Modify: current task plan/evidence/audit
- Modify at ready stage: project-state/task-queue only
- No new product scope

**Interfaces:** Produces one reviewable product commit, one exact ready transition, ff-only merge, authorized `origin/master` push and cleanup only after remote equality.

- [x] **Step 1: Run the exact focused suite**

```powershell
corepack pnpm@10.15.1 exec vitest run src/server/validators/employee-import-command.test.ts src/server/services/employee-import-source-parser.test.ts src/server/repositories/postgres-employee-import-command-repository.test.ts src/server/services/employee-import-command-service.test.ts src/server/services/employee-import-command-route.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts src/features/admin/org-auth-redeem/employee-import-command-client.test.ts src/features/admin/org-auth-redeem/useEmployeeImportCommand.test.tsx src/features/admin/org-auth-redeem/EmployeeCreateActionPanel/EmployeeCreateActionPanel.test.tsx src/features/admin/org-auth-redeem/EmployeeImportPreflightPanel/EmployeeImportPreflightPanel.test.tsx tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/phase-11-system-ops-user-management-loop.test.ts tests/unit/p1-employee-import-command-atomicity.test.ts --maxWorkers=1
```

Expected: every named file PASS.

- [x] **Step 2: Run full static regression**

```powershell
npm.cmd run test:unit -- --maxWorkers=1
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run format:check
npm.cmd run build
git diff --check
```

Expected: all exit 0. Do not substitute browser/e2e or real DB claims.

- [x] **Step 3: Perform Round 1 adversarial review**

Attack parser ambiguity, duplicate/unknown headers, quoted newline row numbering, 500/501 boundary, N+1, identity classification, deterministic quota allocation, revision canonicalization, stale/block zero-write, skip-only handling, lost-response idempotency recovery, post-preflight races, role boundaries and response redaction. Close every blocker before recording `Result: pass`.

- [x] **Step 4: Perform independent Round 2 review**

Use the task-approved independent reviewer under the chosen execution mode. Review from the approved spec rather than Round 1 notes. Specifically search for raw phone/password/source persistence, preview-as-authorization, legacy route bypass, hidden browser parsing, actor/idempotency confusion, F-0115 atomicity regression and scope creep. RV-0018 remains pending.

- [x] **Step 5: Finalize evidence/audit and taste checklist**

Evidence records exact command outputs, test counts, changed-file inventory, RED/GREEN checkpoints, secret-negative scans, query-count proof, both reviews, static-only limitation and unchanged blocked capabilities. Audit records no unresolved blocker and no runtime/database proof claim.

- [x] **Step 6: Run governance gates**

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-employee-import-preflight-2026-07-17
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-02-employee-import-preflight-2026-07-17
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-02-employee-import-preflight-2026-07-17 -SkipRemoteAheadCheck
```

Expected: all pass without skip/bypass. If ordinary `in_progress` SHA drift is rejected, preserve the hard block and stop; do not claim the earlier transition-only ancestor permission applies.

- [ ] **Step 7: Create the single product commit**

Stage only the exact task allowlist, inspect `git diff --cached --name-status`, run the real pre-commit hook, then:

```powershell
git commit -m "fix(employee): add server-owned import preflight"
```

Expected: one product commit; no Task 0–7 intermediate commit.

- [ ] **Step 8: Create the ready governance commit**

Update only state/queue/evidence/audit to `ready_for_closeout` with the product SHA and verification/review facts. Run transition and Module guards. If the exact transition is accepted, commit:

```powershell
git commit -m "chore(p1): ready employee import preflight"
```

Any request for ancestor handling outside an emitted P1 `transition_only` context is a stop condition requiring separate approval.

- [ ] **Step 9: ff-only merge, real pre-push, authorized push and cleanup**

From `D:\tiku`:

```powershell
git merge --ff-only codex/p1-rc02-employee-import-preflight
git push origin master
```

After live `master == origin/master` and fresh-master focused/required guards pass, remove only verified `D:\tiku\.worktrees\p1-rc02-employee-import-preflight` and the merged short branch. Then run the delegated mechanism-speedup task before materializing the next P1 finding, as required by the current Goal flow constraint.

---

## Plan Self-Review Checklist

- [x] Every approved design section maps to a task: source/parser (1–2), set facts (3), preview/revision/confirm (4), routes (5), client state (6), UI (7), evidence/review/closeout (8).
- [x] Stable type names are consistent across contract, validator, repository, service, client, hook and panels.
- [x] The response-loss path recovers an existing idempotent command before current facts can invalidate the old preview.
- [x] `skip` is a persisted-free preview no-op; skip-only cannot create an invalid empty command.
- [x] Stale、block and no-action paths are explicitly zero-write; post-preflight races remain under F-0115 JIT transaction checks.
- [x] No browser business parser or orgAuth/quota approximation remains after Task 7.
- [x] No schema、migration、dependency、database、Provider、browser/runtime、P2、PR、force push or deploy action is introduced.
- [x] RV-0018 remains pending and static closure is stated explicitly.
- [x] Single product commit and ready governance transition respect project Git isolation; other `in_progress` SHA drift remains hard-blocked.
- [x] 本计划不存在未决占位项或未决类型/接口。
