# Redeem Code Nullable Deadline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `redeem_code.redeem_deadline_at = null` 成为长期可兑换的唯一领域语义，并在 schema、migration source、API、repository、preview/confirm 和管理端/学员端 UI 全链保持一致。

**Architecture:** 保持既有 route → service → repository → schema 分层；管理端有限日期继续映射为 UTC+8 当日 23:59:59.999，省略或显式 null 映射为长期可兑换。数据库只生成 `DROP NOT NULL` migration source；repository 与 preview model 显式分支 null，禁止远未来哨兵和双重布尔事实。

**Tech Stack:** TypeScript、Next.js 16、React 19、Drizzle ORM / drizzle-kit、PostgreSQL migration source、Vitest、Testing Library、PowerShell governance guards。

## Execution Status

| Task                          | Status                   | Evidence                                                            |
| ----------------------------- | ------------------------ | ------------------------------------------------------------------- |
| 1. Schema 与 migration source | complete                 | RED/GREEN 与独立审查 Approved                                       |
| 2. Admin contracts/service    | complete                 | RED/GREEN 与独立审查 Approved                                       |
| 3. Admin repository           | complete                 | RED/GREEN、review fix 与独立复审 Approved                           |
| 4. Student preview/confirm    | complete                 | RED/GREEN 与独立审查 Approved                                       |
| 5. Admin/student UI           | complete                 | RED/GREEN 与独立审查 Approved                                       |
| 6. 全链 closeout preparation  | complete                 | 全量验证与治理门禁通过；两轮累计独立审查均 Approved                 |
| 7. Migration smoke 可追加链   | complete_pending_step_14 | implementation/reviews complete；pending Step 14 merge/push/cleanup |

Tasks 1-6 的产品提交、`ready_for_closeout` transition、ff-only 合入、普通推送与原 worktree/短分支清理已经完成。Task 7 implementation/reviews 已完成；当前重新建立的 F-0117 worktree 只等待 Step 14 merge/push/cleanup，不得重开产品实现。

## Global Constraints

- 用户批准方案 A；`schemaMigration: approved_source_generation_only_no_execution`。
- 禁止连接或执行数据库；禁止 `drizzle-kit migrate`、`drizzle-kit push`、SQL 执行、backfill、seed。
- 禁止修改 package/lockfile、env、依赖、Provider、browser/runtime、P2、PR、force-push 或 deploy。
- `durationDay` 继续必填且范围为 1..1095；只把兑换截止日改为可选。
- 管理端请求保留现有 `redeemDeadlineDate` transport 字段：omitted 或 null 表示长期；有限 `YYYY-MM-DD` 仍映射为领域 `redeemDeadlineAt`。所有响应继续使用 `redeemDeadlineAt: string | null`。
- 空字符串不得代替 null；空字符串、非法日期和非未来有限日期必须 fail-closed。
- 显式 `status = expired` 始终过期；仅 `unused + non-null past deadline` 可由时间推导为过期。
- expired 筛选排除 null deadline；unused 筛选包含 null deadline；deadline 升降序均 `NULLS LAST`。
- preview canonical facts 必须显式包含 null；confirm 必须使用同一 JIT 过期语义。
- 一次性明文分发、脱敏、edition、并发兑换、幂等和 no-store 边界不得改变。
- WIP=1。项目“一任务一个产品提交”规则优先于通用 frequent-commit 建议；Task 1-5 只做可复核 TDD checkpoint，Task 6 才创建唯一产品提交。
- F-0117 migration smoke 必须允许合法后续 journal entry，同时继续拒绝重复 tag、缺失 predecessor、非相邻 idx、错误 snapshot `prevId` 与额外 schema diff。

## Execution Prerequisite

当前 state/queue 仍记录 `waiting_for_spec_review`。在任何产品 RED 前，必须用用户已授权的独立治理热修物化本次书面批准：

```yaml
currentExecutionGate:
  status: satisfied
  reason: current_user_approved_written_f0117_spec_2026_07_18
  approvalRequestPath: docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md
  resumeAction: execute_f0117_redeem_code_nullable_deadline_plan_red_to_green
```

该治理热修必须另写精确 task plan/authorization/evidence/audit，只能修改 pre-push 编排、P1/Module guards、对应 smoke tests 与上述 state/queue projection；必须通过 P1 `transition_only`，且 Module 只在该已验证治理提交上接受 ancestor checkpoint。其他 `in_progress` SHA drift 继续 hard-block。若此门禁未满足，停止，不执行 Task 1。

## File Structure

- `src/db/schema/auth.ts`：唯一 ORM nullable source。
- `src/db/schema/auth.test.ts`：锁定 Drizzle column nullable contract。
- `drizzle/*_p1_rc_02_redeem_code_nullable_deadline.sql`：只含目标列 `DROP NOT NULL`。
- `drizzle/meta/*_snapshot.json`、`drizzle/meta/_journal.json`：Drizzle 线性 metadata。
- `tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`：拒绝夹带 schema drift 或执行型 SQL。
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`：admin generation/list/detail DTO 的 `string | null`。
- `src/server/contracts/authorization-contract.ts`：student preview DTO 的 `string | null`。
- `src/server/services/admin-redeem-code-runtime.ts`：omitted/null/finite/invalid 请求规范化与审计摘要。
- `src/server/repositories/admin-redeem-code-runtime-repository.ts`：nullable 写入/映射、filter/status/sort。
- `src/server/repositories/redeem-code-authorization-repository.ts`：student repository row type nullable。
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`：confirm JIT nullable 过期判断。
- `src/server/models/redeem-code-preview.ts`：preview nullable 判断、DTO 与 version facts。
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`：长期模式输入和 admin 全表面展示。
- `src/features/student/profile/StudentProfileRedeemPage.tsx`：student preview 长期展示。
- 既有聚焦 tests：覆盖 admin service/repository/concurrency、student preview/confirm、route 与两端 UI。

---

### Task 1: Schema 与单列 migration source

**Files:**

- Modify: `src/db/schema/auth.test.ts`
- Modify: `src/db/schema/auth.ts`
- Create: `tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`
- Create: `drizzle/*_p1_rc_02_redeem_code_nullable_deadline.sql`（drizzle-kit 生成唯一 14 位时间戳前缀）
- Create: `drizzle/meta/*_snapshot.json`（与上述 SQL 相同时间戳前缀）
- Modify: `drizzle/meta/_journal.json`

**Interfaces:**

- Consumes: 当前 `redeemCode` Drizzle table 和 `20260717141801` terminal snapshot。
- Produces: `redeemCode.redeem_deadline_at` 推断为 `Date | null`；migration source 只移除该列 NOT NULL。

- [ ] **Step 1: 在 schema test 写 RED**

在 `src/db/schema/auth.test.ts` 增加 helper 与断言：

```ts
function getColumn(
  table: Parameters<typeof getTableConfig>[0],
  columnName: string,
) {
  const column = getTableConfig(table).columns.find(
    (candidate) => candidate.name === columnName,
  );

  expect(column).toBeDefined();
  return column!;
}

it("keeps redeem_code deadline nullable for long-term redemption", () => {
  expect(getColumn(redeemCode, "redeem_deadline_at").notNull).toBe(false);
  expect(getColumn(redeemCode, "duration_day").notNull).toBe(true);
});
```

- [ ] **Step 2: 创建 migration-source RED test**

创建 `tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`：

```ts
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationSuffix = "_p1_rc_02_redeem_code_nullable_deadline.sql";

type Journal = {
  entries: Array<{ idx: number; tag: string }>;
};

type Snapshot = {
  id: string;
  prevId: string;
  tables: Record<string, { columns: Record<string, { notNull: boolean }> }>;
};

function readMigration() {
  const names = readdirSync(resolve(process.cwd(), "drizzle")).filter((name) =>
    name.endsWith(migrationSuffix),
  );
  expect(names).toHaveLength(1);
  const name = names[0]!;
  return {
    name,
    source: readFileSync(resolve(process.cwd(), "drizzle", name), "utf8"),
  };
}

describe("F-0117 redeem_code nullable deadline migration source", () => {
  it("contains exactly the approved DROP NOT NULL statement", () => {
    const { name, source } = readMigration();
    expect(name).toMatch(
      /^\d{14}_p1_rc_02_redeem_code_nullable_deadline\.sql$/u,
    );
    expect(source.replace(/\s+/gu, " ").trim()).toBe(
      'ALTER TABLE "redeem_code" ALTER COLUMN "redeem_deadline_at" DROP NOT NULL;',
    );
    expect(source).not.toMatch(
      /\b(?:INSERT|UPDATE|DELETE|TRUNCATE|DROP TABLE)\b/iu,
    );
  });

  it("changes only redeem_code.redeem_deadline_at in a linear snapshot", () => {
    const { name } = readMigration();
    const tag = name.slice(0, -4);
    const journal = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "drizzle/meta/_journal.json"),
        "utf8",
      ),
    ) as Journal;
    expect(journal.entries.at(-1)?.tag).toBe(tag);

    const current = JSON.parse(
      readFileSync(
        resolve(
          process.cwd(),
          `drizzle/meta/${tag.slice(0, 14)}_snapshot.json`,
        ),
        "utf8",
      ),
    ) as Snapshot;
    const previous = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "drizzle/meta/20260717141801_snapshot.json"),
        "utf8",
      ),
    ) as Snapshot;

    expect(current.prevId).toBe(previous.id);
    expect(current.id).not.toBe(previous.id);
    expect(
      current.tables["public.redeem_code"]!.columns.redeem_deadline_at!.notNull,
    ).toBe(false);

    const normalizedCurrent = structuredClone(current);
    normalizedCurrent.id = previous.id;
    normalizedCurrent.prevId = previous.prevId;
    normalizedCurrent.tables[
      "public.redeem_code"
    ]!.columns.redeem_deadline_at!.notNull = true;
    expect(normalizedCurrent).toEqual(previous);
  });
});
```

- [ ] **Step 3: 运行 RED**

Run:

```powershell
corepack pnpm@11.9.0 exec vitest run src/db/schema/auth.test.ts tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts --maxWorkers=1
```

Expected: schema assertion reports `true` instead of `false`; migration test reports zero matching files。

- [ ] **Step 4: 做最小 schema 修改**

将 `src/db/schema/auth.ts` 的目标列改为：

```ts
redeem_deadline_at: timestamp("redeem_deadline_at", { withTimezone: true }),
```

不得修改 `timestampColumn` helper，否则会把其他 timestamp 一并变为 nullable。

- [ ] **Step 5: 只生成 migration source**

Run:

```powershell
# 进程内注入不可连接的 schema-generation 占位值；变量名和值不写入提交文档。
corepack pnpm@11.9.0 exec drizzle-kit generate --name p1_rc_02_redeem_code_nullable_deadline
# 命令完成后立即清除进程内占位值。
```

Expected: 生成一个 14 位时间戳 SQL、一个 snapshot，并追加 journal；命令不连接数据库。禁止运行任何其他 drizzle 命令。

- [ ] **Step 6: 检查生成物并转 GREEN**

Run:

```powershell
git diff -- src/db/schema/auth.ts drizzle drizzle/meta/_journal.json
corepack pnpm@11.9.0 exec vitest run src/db/schema/auth.test.ts tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts --maxWorkers=1
```

Expected: diff 只有目标列 nullable、单条 SQL 与线性 metadata；2 files PASS。若 SQL 夹带其他 schema drift，立即停止。

### Task 2: Admin contracts 与生成请求规范化

**Files:**

- Modify: `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- Modify: `src/server/services/admin-redeem-code-runtime.ts`
- Modify: `tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
- Modify: `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts`

**Interfaces:**

- Consumes: request `redeemDeadlineDate?: string | null`。
- Produces: repository input `redeemDeadlineAt: Date | null`；generation/list/detail DTO `redeemDeadlineAt: string | null`。

- [ ] **Step 1: 写 omitted/null/empty RED**

在 `phase-11-redeem-code-batch-management-loop.test.ts` 把 fake 映射改为 null-safe，并增加：

```ts
const serializeDeadline = (value: Date | null) => value?.toISOString() ?? null;

it.each([
  ["omitted", {}],
  ["explicit null", { redeemDeadlineDate: null }],
])(
  "creates a long-term batch for %s deadline",
  async (_label, deadlineInput) => {
    const auditInputs: unknown[] = [];
    const { createInputs, repositories } = createAdminRepositories(auditInputs);
    const handlers = createAdminHandlers(repositories);
    const response = await handlers.redeemCodes.POST(
      new Request("http://localhost/api/v1/redeem-codes", {
        method: "POST",
        headers: { authorization: "Bearer admin-session-token" },
        body: JSON.stringify({
          count: 1,
          redeemCodeType: "personal_standard_activation",
          profession: "monopoly",
          level: 3,
          durationDay: 365,
          ...deadlineInput,
        }),
      }),
    );
    const payload = await readJson(response);

    expect(createInputs).toEqual([
      expect.objectContaining({ redeemDeadlineAt: null }),
    ]);
    expect(payload).toMatchObject({
      code: 0,
      data: {
        generation: { redeemDeadlineAt: null },
        redeemCodes: [{ redeemDeadlineAt: null }],
      },
    });
    expect(auditInputs).toEqual([
      expect.objectContaining({
        metadataSummary: expect.stringContaining("deadline=long_term"),
      }),
    ]);
  },
);

it("rejects an empty-string deadline instead of treating it as long-term", async () => {
  const { repositories } = createAdminRepositories();
  const handlers = createAdminHandlers(repositories);
  const response = await handlers.redeemCodes.POST(
    new Request("http://localhost/api/v1/redeem-codes", {
      method: "POST",
      headers: { authorization: "Bearer admin-session-token" },
      body: JSON.stringify({
        count: 1,
        redeemCodeType: "personal_standard_activation",
        profession: "monopoly",
        level: 3,
        durationDay: 365,
        redeemDeadlineDate: "",
      }),
    }),
  );

  await expect(readJson(response)).resolves.toMatchObject({
    code: 422601,
    data: null,
  });
});
```

同步保留一个有限 UTC+8 deadline case，证明原行为不回归。

- [ ] **Step 2: 运行 RED**

Run:

```powershell
corepack pnpm@11.9.0 exec vitest run tests/unit/phase-8-admin-redeem-code-runtime.test.ts tests/unit/phase-11-redeem-code-batch-management-loop.test.ts --maxWorkers=1
```

Expected: omitted/null case 得到默认有限日期或 fake `.toISOString()` 崩溃。

- [ ] **Step 3: 修改 DTO 和 service 类型**

把 admin DTO 中所有 redeem deadline 字段改为：

```ts
redeemDeadlineAt: string | null;
```

把 service request 领域类型改为：

```ts
type RedeemCodeBatchRequest = {
  count: number;
  redeemCodeType: RedeemCodeType;
  profession: Profession;
  level: number;
  durationDay: number;
  redeemDeadlineAt: Date | null;
};
```

以以下分支替换默认 deadline 合成逻辑，并删除未使用的 `createDefaultRedeemDeadlineAt`：

```ts
const hasRedeemDeadline =
  source.redeemDeadlineDate !== undefined && source.redeemDeadlineDate !== null;
const redeemDeadlineAt =
  typeof source.redeemDeadlineDate === "string"
    ? createUtcPlus8EndOfDay(source.redeemDeadlineDate)
    : null;

if (
  hasRedeemDeadline &&
  (typeof source.redeemDeadlineDate !== "string" ||
    redeemDeadlineAt === null ||
    redeemDeadlineAt <= now)
) {
  return {
    success: false,
    response: createErrorResponse(
      ADMIN_AUTH_OPERATION_ERROR_CODES.validationFailed,
      "Redeem code redeemDeadlineDate must be null or a future UTC+8 date.",
    ),
  };
}
```

审计摘要使用：

```ts
const deadlineSummary =
  createdRedeemCodeBatch.generation.redeemDeadlineAt ?? "long_term";
```

并在 template 中记录 `deadline=${deadlineSummary}`。

- [ ] **Step 4: 修复 fake adapter 并转 GREEN**

所有 test fake 使用同一个 null-safe 表达式：

```ts
redeemDeadlineAt: input.redeemDeadlineAt?.toISOString() ?? null,
```

Run:

```powershell
corepack pnpm@11.9.0 exec vitest run tests/unit/phase-8-admin-redeem-code-runtime.test.ts tests/unit/phase-11-redeem-code-batch-management-loop.test.ts --maxWorkers=1
```

Expected: 2 files PASS；omitted/null/empty/finite 四类均有断言。

### Task 3: Admin repository nullable 映射、状态、筛选和排序

**Files:**

- Modify: `src/server/repositories/admin-redeem-code-runtime-repository.ts`
- Modify: `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts`
- Modify: `tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`

**Interfaces:**

- Consumes: `CreateRedeemCodeBatchInput.redeemDeadlineAt: Date | null` 和 nullable Drizzle row。
- Produces: null-safe generation/list/detail；`SQL[]` order expressions 保证 nulls last。

- [ ] **Step 1: 写 repository RED cases**

在 `phase-21-admin-redeem-code-concurrency.test.ts` 增加一个静态不变量测试，精确锁定 repository 使用的 Drizzle nullable 表达式与 null-safe formatter：

```ts
it("keeps nullable redeem deadline status filter and sort semantics explicit", () => {
  const source = readFileSync(
    "src/server/repositories/admin-redeem-code-runtime-repository.ts",
    "utf8",
  );

  expect(source).toContain("isNotNull(redeemCode.redeem_deadline_at)");
  expect(source).toContain("isNull(redeemCode.redeem_deadline_at)");
  expect(source).toContain("lt(redeemCode.redeem_deadline_at, now)");
  expect(source).toContain("gte(redeemCode.redeem_deadline_at, now)");
  expect(source).toContain("asc(isNull(redeemCode.redeem_deadline_at))");
  expect(source).toContain("row.redeem_deadline_at !== null &&");
  expect(source).toContain("value?.toISOString() ?? null");
  expect(source).not.toContain("row.redeem_deadline_at.toISOString()");
});
```

同时把现有 collision test 的 input 与 returned row deadline 改为 null，断言 generation summary 和 item 都返回 `redeemDeadlineAt: null`；有限日期覆盖继续由 phase-11 tests 保留。

- [ ] **Step 2: 运行 RED**

Run:

```powershell
corepack pnpm@11.9.0 exec vitest run tests/unit/phase-11-redeem-code-batch-management-loop.test.ts tests/unit/phase-21-admin-redeem-code-concurrency.test.ts --maxWorkers=1
```

Expected: null row 在 `.toISOString()` 或时间比较处失败，或 DESC 排序未满足 nulls last。

- [ ] **Step 3: 实现 null-safe repository**

增加 Drizzle imports：

```ts
isNotNull,
isNull,
```

定义唯一 formatter：

```ts
function serializeRedeemDeadlineAt(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}
```

把 input 和 status row 类型改为 `Date | null`，并用 formatter 替换所有 deadline `.toISOString()`。

条件必须是：

```ts
if (query.status === "expired") {
  conditions.push(
    or(
      eq(redeemCode.status, "expired"),
      and(
        eq(redeemCode.status, "unused"),
        isNotNull(redeemCode.redeem_deadline_at),
        lt(redeemCode.redeem_deadline_at, now),
      ),
    )!,
  );
} else if (query.status === "unused") {
  conditions.push(
    and(
      eq(redeemCode.status, "unused"),
      or(
        isNull(redeemCode.redeem_deadline_at),
        gte(redeemCode.redeem_deadline_at, now),
      ),
    )!,
  );
}
```

状态必须是：

```ts
return row.status === "unused" &&
  row.redeem_deadline_at !== null &&
  row.redeem_deadline_at < now
  ? "expired"
  : row.status;
```

排序改为复数 expression，并修改调用点为 `.orderBy(...createRedeemCodeOrderBy(query))`：

```ts
function createRedeemCodeOrderBy(query: AdminAuthOperationListQuery): SQL[] {
  if (query.sortBy === "expiresAt") {
    return [
      asc(isNull(redeemCode.redeem_deadline_at)),
      query.sortOrder === "asc"
        ? asc(redeemCode.redeem_deadline_at)
        : desc(redeemCode.redeem_deadline_at),
    ];
  }

  const column =
    query.sortBy === "createdAt"
      ? redeemCode.created_at
      : redeemCode.updated_at;
  return [query.sortOrder === "asc" ? asc(column) : desc(column)];
}
```

- [ ] **Step 4: 转 GREEN 并检查 N+1**

Run:

```powershell
corepack pnpm@11.9.0 exec vitest run tests/unit/phase-11-redeem-code-batch-management-loop.test.ts tests/unit/phase-21-admin-redeem-code-concurrency.test.ts --maxWorkers=1
rg -n "for .*select|for .*query" src/server/repositories/admin-redeem-code-runtime-repository.ts
```

Expected: 2 files PASS；negative scan 不出现新增循环查询。

### Task 4: Student preview version 与 confirm JIT

**Files:**

- Modify: `src/server/contracts/authorization-contract.ts`
- Modify: `src/server/repositories/redeem-code-authorization-repository.ts`
- Modify: `src/server/models/redeem-code-preview.ts`
- Modify: `src/server/repositories/student-authorization-redeem-runtime-repository.ts`
- Modify: `src/server/services/redeem-code-authorization-service.test.ts`
- Modify: `src/server/services/redeem-code-route.test.ts`
- Modify: `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`

**Interfaces:**

- Consumes: `RedeemCodeAuthorizationRow.redeem_deadline_at: Date | null`。
- Produces: preview `redeemDeadlineAt: string | null`；null 与 finite 不同 preview version；confirm null 不过期。

- [ ] **Step 1: 写 preview RED**

在 `redeem-code-authorization-service.test.ts` 增加：

```ts
it("previews a long-term redeem code with an explicit null deadline", async () => {
  const authorizationService = createRedeemCodeAuthorizationService(
    createRepository({
      async previewRedeemCodeForUser() {
        return createPreviewFacts({
          redeemCode: createRedeemCode({ redeem_deadline_at: null }),
        });
      },
    }),
    clock,
    { consume: () => ({ allowed: true }) },
  );

  await expect(
    authorizationService.previewRedeemCode(
      { code: "ABCD2345" },
      { userPublicId: "user_public_123" },
    ),
  ).resolves.toMatchObject({
    code: 0,
    data: {
      redeemDeadlineAt: null,
      previewVersion: expect.stringMatching(/^sha256:[a-f0-9]{64}$/u),
    },
  });
});

it("binds preview version to null versus finite deadline", async () => {
  let redeemDeadlineAt: Date | null = null;
  const authorizationService = createRedeemCodeAuthorizationService(
    createRepository({
      async previewRedeemCodeForUser() {
        return createPreviewFacts({
          redeemCode: createRedeemCode({
            redeem_deadline_at: redeemDeadlineAt,
          }),
        });
      },
    }),
    clock,
    { consume: () => ({ allowed: true }) },
  );
  const readVersion = async () =>
    (
      await authorizationService.previewRedeemCode(
        { code: "ABCD2345" },
        { userPublicId: "user_public_123" },
      )
    ).data?.previewVersion;

  const longTermVersion = await readVersion();
  redeemDeadlineAt = activeDeadline;
  expect(await readVersion()).not.toBe(longTermVersion);
});
```

- [ ] **Step 2: 写 confirm RED**

在 `phase-8-student-authorization-redeem-runtime.test.ts` 增加 null deadline preview → confirm happy path，并保留显式 expired row 拒绝断言：

```ts
const handlers = createHandlers(createStudentSession(), {
  redeemCode: createRedeemCode({ redeem_deadline_at: null }),
});
```

先调用 preview 取得真实 `previewVersion`，再 POST redeem，期望 `code: 0`；另用 `status: "expired", redeem_deadline_at: null` 期望 `410001`。

- [ ] **Step 3: 运行 RED**

Run:

```powershell
corepack pnpm@11.9.0 exec vitest run src/server/services/redeem-code-authorization-service.test.ts src/server/services/redeem-code-route.test.ts tests/unit/phase-8-student-authorization-redeem-runtime.test.ts --maxWorkers=1
```

Expected: model 或 confirm 对 null 做 `<`/`.toISOString()` 时失败。

- [ ] **Step 4: 实现 preview 与 confirm**

类型统一改为：

```ts
redeem_deadline_at: Date | null;
redeemDeadlineAt: string | null;
```

model 定义一次序列化值：

```ts
const redeemDeadlineAt = redeemCode.redeem_deadline_at?.toISOString() ?? null;
```

过期判断改为：

```ts
if (
  redeemCode.status === "expired" ||
  (redeemCode.redeem_deadline_at !== null &&
    redeemCode.redeem_deadline_at < input.checkedAt)
) {
  return { status: "unavailable", reason: "expired" };
}
```

`versionFacts.redeemCode.redeemDeadlineAt` 和 DTO 都使用同一个 `redeemDeadlineAt` 常量。confirm repository 使用同形 JIT 分支：

```ts
if (
  redeemCodeRow.status === "expired" ||
  (redeemCodeRow.redeem_deadline_at !== null &&
    redeemCodeRow.redeem_deadline_at < input.confirmedAt)
) {
  return { status: "expired" };
}
```

- [ ] **Step 5: 转 GREEN**

Run:

```powershell
corepack pnpm@11.9.0 exec vitest run src/server/services/redeem-code-authorization-service.test.ts src/server/services/redeem-code-route.test.ts tests/unit/phase-8-student-authorization-redeem-runtime.test.ts --maxWorkers=1
```

Expected: 3 files PASS；null/finite version 不同，null confirm 成功，explicit expired 仍拒绝。

### Task 5: Admin 与 student UI 长期语义

**Files:**

- Modify: `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- Modify: `src/features/student/profile/StudentProfileRedeemPage.tsx`
- Modify: `tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts`
- Modify: `tests/unit/student-profile-redeem-ui.test.ts`

**Interfaces:**

- Consumes: response `redeemDeadlineAt: string | null`；admin form `isLongTermRedeemable: boolean`。
- Produces: request `redeemDeadlineDate: string | null`；所有用户表面统一显示“长期可兑换”。

- [ ] **Step 1: 写 admin UI RED**

把 test payload 的目标行改为 `redeemDeadlineAt: null`，并在生成 drawer 测试增加：

```ts
fireEvent.click(within(drawer).getByLabelText("长期可兑换（不设截止）"));
expect(
  within(drawer).getByTestId("redeem-code-generation-deadline-input"),
).toBeDisabled();
```

填完其他必填项、触发生成并检查 POST body：

```ts
expect(
  JSON.parse(String((fetchMock.mock.calls.at(-1)?.[1] as RequestInit).body)),
).toMatchObject({
  redeemDeadlineDate: null,
});
```

列表、详情、确认 dialog、distribution summary 均断言“长期可兑换”；有限日期 payload 继续断言格式化日期。

- [ ] **Step 2: 写 student UI RED**

在 `student-profile-redeem-ui.test.ts` 用：

```ts
const longTermPreviewPayload = {
  ...redeemCodePreviewPayload,
  data: {
    ...redeemCodePreviewPayload.data,
    redeemDeadlineAt: null,
  },
};
```

返回该 preview 后断言：

```ts
expect(await screen.findByTestId("redeem-code-confirmation")).toHaveTextContent(
  "兑换截止：长期可兑换",
);
```

- [ ] **Step 3: 运行 RED**

Run:

```powershell
corepack pnpm@11.9.0 exec vitest run tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/student-profile-redeem-ui.test.ts --maxWorkers=1
```

Expected: admin 没有长期 control，student formatter 对 null 类型或运行时失败。

- [ ] **Step 4: 实现 admin form 和统一 formatter**

扩展类型：

```ts
type CreateRedeemCodeInput = {
  count: number;
  durationDay: number;
  level: number;
  profession: Profession;
  redeemCodeType: RedeemCodeType;
  redeemDeadlineDate: string | null;
};

type RedeemCodeGenerationFormState = {
  count: string;
  durationDay: string;
  generationMode: RedeemCodeGenerationMode;
  isLongTermRedeemable: boolean;
  level: string;
  profession: Profession | "";
  redeemCodeType: RedeemCodeType | "";
  redeemDeadlineDate: string;
};
```

默认保持有限日期模式：

```ts
isLongTermRedeemable: false,
```

validation 只在非长期模式要求非空日期；input 使用：

```ts
redeemDeadlineDate: formState.isLongTermRedeemable
  ? null
  : redeemDeadlineDate,
```

表单 control：

```tsx
<label className="border-border bg-background flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
  <input
    checked={formState.isLongTermRedeemable}
    type="checkbox"
    onChange={(event) =>
      updateFormState({ isLongTermRedeemable: event.target.checked })
    }
  />
  <span>长期可兑换（不设截止）</span>
</label>
```

日期 input 增加：

```tsx
disabled={formState.isLongTermRedeemable}
```

admin 定义并在 list/detail/dialog/distribution 共用：

```ts
function formatRedeemDeadline(value: string | null): string {
  return value === null ? "长期可兑换" : formatDate(value);
}
```

- [ ] **Step 5: 实现 student formatter 并转 GREEN**

```ts
function formatRedeemDeadline(value: string | null): string {
  return value === null ? "长期可兑换" : formatChineseDate(value);
}
```

preview JSX 改为：

```tsx
兑换截止：{formatRedeemDeadline(readyPreview.data.redeemDeadlineAt)}
```

Run:

```powershell
corepack pnpm@11.9.0 exec vitest run tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/student-profile-redeem-ui.test.ts --maxWorkers=1
```

Expected: 2 files PASS；长期与有限日期展示均通过，button 保留 active feedback，未新增颜色 magic number。

### Task 6: 全链回归、两轮审查、证据与单一产品提交

**Files:**

- Modify: `docs/05-execution-logs/evidence/2026-07-18-p1-remediation-rc-02-redeem-code-nullable-deadline.md`
- Modify: `docs/05-execution-logs/audits-reviews/2026-07-18-p1-remediation-rc-02-redeem-code-nullable-deadline.md`
- Modify only after all checks: `docs/04-agent-system/state/project-state.yaml`
- Modify only after all checks: `docs/04-agent-system/state/task-queue.yaml`

**Interfaces:**

- Consumes: Tasks 1-5 全部 GREEN。
- Produces: F-0117 static closure 的唯一产品提交、ready-for-closeout transition 和脱敏 evidence/audit。

- [x] **Step 1: 运行最终聚焦矩阵**

Run:

```powershell
corepack pnpm@11.9.0 exec vitest run src/db/schema/auth.test.ts tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts tests/unit/phase-8-admin-redeem-code-runtime.test.ts tests/unit/phase-11-redeem-code-batch-management-loop.test.ts tests/unit/phase-21-admin-redeem-code-concurrency.test.ts tests/unit/phase-8-student-authorization-redeem-runtime.test.ts src/server/services/redeem-code-authorization-service.test.ts src/server/services/redeem-code-route.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/student-profile-redeem-ui.test.ts --maxWorkers=1
```

Expected: 10 files PASS，0 failed。

- [x] **Step 2: 运行完整静态回归**

Run:

```powershell
npm.cmd run test:unit -- --maxWorkers=1
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run format:check
git diff --check
```

Expected: 全部 exit 0。任何 allowlist 外旧 smoke 失败不得通过恢复非空 deadline 合同来绿化；必须停下做精确 scope-correction 评估。

- [x] **Step 3: 在 disposable plain fixture 运行 production build**

从 `D:\tiku` 执行，先确认 fixture 不存在：

```powershell
$source = "D:\tiku\.worktrees\p1-rc02-redeem-code-nullable-deadline"
$fixture = "D:\tiku\.worktrees\f0117-build-fixture"
if (Test-Path -LiteralPath $fixture) { throw "fixture already exists" }
New-Item -ItemType Directory -Path $fixture | Out-Null
git -C $source ls-files --cached --others --exclude-standard | ForEach-Object {
  $destination = Join-Path $fixture $_
  New-Item -ItemType Directory -Path (Split-Path $destination) -Force | Out-Null
  Copy-Item -LiteralPath (Join-Path $source $_) -Destination $destination
}
npm.cmd run build -- .worktrees/f0117-build-fixture
```

Expected: Turbopack compile、TypeScript、static pages 全部完成。清理前验证 `$fixture` 的 resolved path 以 `D:\tiku\.worktrees\` 开头，再用 PowerShell `Remove-Item -LiteralPath $fixture -Recurse -Force`；禁止让 `git worktree remove` 遍历 node_modules junction。

- [x] **Step 4: 执行两轮对抗式复核**

Round 1 必查：nullable 三态、omitted/null/empty、DTO key、filter/status/sort、preview version、confirm JIT、migration exactness、明文脱敏。

Round 2 独立只读复核必须尝试推翻以下结论：

```text
null unused code cannot time-expire
explicit expired still blocks
finite past deadline still expires
null and finite preview versions differ
both deadline sort directions put null last
no database command or connection occurred
durationDay and edition behavior are unchanged
```

发现 blocker 必须先补 RED 再修复；不得只写审查结论。

- [x] **Step 5: 写脱敏 evidence/audit 并运行治理门禁**

Evidence 记录实际命令、test counts、migration 文件名、SQL exact statement、build 结果、两轮 finding/disposition；不得记录真实数据库连接变量名/值或明文 redeem_code。

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18
git diff --check
```

Expected: 全部 pass；schemaMigration 只显示 source-only approval，databaseMutation 保持 blocked。

- [x] **Step 6: 创建唯一产品提交**

确认 `git diff --name-only` 全部命中 queue allowlist，随后：

```powershell
$migration = @(Get-ChildItem drizzle -File -Filter "*_p1_rc_02_redeem_code_nullable_deadline.sql")
if ($migration.Count -ne 1) { throw "expected exactly one F-0117 migration" }
$timestamp = $migration[0].Name.Substring(0, 14)
$snapshot = "drizzle/meta/${timestamp}_snapshot.json"
if (-not (Test-Path -LiteralPath $snapshot -PathType Leaf)) { throw "missing F-0117 snapshot" }
$files = @(
  "docs/superpowers/plans/2026-07-18-redeem-code-nullable-deadline.md",
  "docs/05-execution-logs/evidence/2026-07-18-p1-remediation-rc-02-redeem-code-nullable-deadline.md",
  "docs/05-execution-logs/audits-reviews/2026-07-18-p1-remediation-rc-02-redeem-code-nullable-deadline.md",
  "src/db/schema/auth.ts",
  "src/db/schema/auth.test.ts",
  "drizzle/$($migration[0].Name)",
  $snapshot,
  "drizzle/meta/_journal.json",
  "tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts",
  "tests/unit/p1-employee-import-command-migration-source.test.ts",
  "src/server/contracts/admin-user-org-auth-ops-contract.ts",
  "src/server/contracts/authorization-contract.ts",
  "src/server/services/admin-redeem-code-runtime.ts",
  "src/server/repositories/admin-redeem-code-runtime-repository.ts",
  "src/server/repositories/redeem-code-authorization-repository.ts",
  "src/server/repositories/student-authorization-redeem-runtime-repository.ts",
  "src/server/models/redeem-code-preview.ts",
  "src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx",
  "src/features/student/profile/StudentProfileRedeemPage.tsx",
  "tests/unit/phase-8-admin-redeem-code-runtime.test.ts",
  "tests/unit/phase-11-redeem-code-batch-management-loop.test.ts",
  "tests/unit/phase-21-admin-redeem-code-concurrency.test.ts",
  "tests/unit/phase-8-student-authorization-redeem-runtime.test.ts",
  "src/server/services/redeem-code-authorization-service.test.ts",
  "src/server/services/redeem-code-route.test.ts",
  "tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts",
  "tests/unit/student-profile-redeem-ui.test.ts"
)
$changed = @(git diff --name-only)
$unexpected = @($changed | Where-Object { $_ -notin $files })
if ($unexpected.Count -gt 0) { throw "unexpected paths: $($unexpected -join ', ')" }
git add -- $files
git commit -m "fix(auth): support long-term redeem codes"
```

不得使用 `git add .`。Expected: commit hook 中 P1/P0/Module 与 lint-staged 全部 pass。

- [ ] **Step 7: ready-for-closeout transition**

产品提交完成且 worktree clean 后，只在 state/queue 将 F-0117 `in_progress -> ready_for_closeout`，补齐 evidence/audit final SHA 和 next candidate proposal；不得在 ready transition 混入产品文件。

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18 -SkipRemoteAheadCheck
```

Expected: closeout 与 pre-push pass；随后按 task `closeoutPolicy` 执行 ff-only 合入 `master`、普通 push `origin/master`，安全移除 junction 后清理 worktree/短分支。禁止数据库执行、PR、force-push 或 deploy。

### Task 7: F-0117 migration smoke 可追加链 scope-correction

**Files:**

- Modify: `tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`
- Modify: `docs/05-execution-logs/task-plans/2026-07-18-p1-remediation-rc-02-redeem-code-nullable-deadline-design.md`
- Modify after GREEN only: `docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md`
- Modify after GREEN only: `docs/05-execution-logs/evidence/2026-07-18-p1-remediation-rc-02-redeem-code-nullable-deadline.md`
- Modify after GREEN only: `docs/05-execution-logs/audits-reviews/2026-07-18-p1-remediation-rc-02-redeem-code-nullable-deadline.md`
- Disposable fixture only, never commit: `drizzle/meta/_journal.json` and `drizzle/meta/20260718100413_snapshot.json`

**Interfaces:**

- Consumes: F-0117 migration tag `20260718100413_p1_rc_02_redeem_code_nullable_deadline`、journal 中的实际相邻 entry、对应 timestamped snapshots。
- Produces: 一个只验证 F-0117 局部线性链而不要求其永久为 journal 末项的 migration source smoke；authoritative schema、migration、journal 与 snapshot 零 diff。

- [x] **Step 1: 物化 Task 7 精确范围与停止条件**

在既有 task plan 末尾追加以下 contract；不得改 state/queue 或任何 guard：

```markdown
## Task 7 Closeout Smoke Scope-Correction

- Goal: replace the F-0117 journal-terminal assumption with appendable local-chain validation.
- Allowed files: the approved design addendum, this task plan, existing F-0117 evidence/audit, and `tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts`.
- Blocked files: state/queue, guards/smokes, product/schema/migration/journal/snapshot in the authoritative task worktree, package/lockfile, env, Provider/runtime/browser, P2, PR, deploy.
- Disposable exception: a detached worktree may temporarily mutate journal/snapshot fixtures for RED/GREEN and adversarial mutation checks; those mutations must never enter a diff or commit.
- Stop if a shared helper, new guard capability, state transition, schema/migration edit, database execution, another finding repair, or any non-allowlisted persistent file becomes necessary.
```

Run:

```powershell
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase pre_commit -SkipExternalIntegrityChecks
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18
```

Expected: exact docs-only scope PASS；工作区中没有 test/schema/migration diff。

- [x] **Step 2: 在 disposable worktree 证明旧 terminal 断言 RED**

从已批准规格提交建立 detached fixture：

```powershell
$fixture = "D:\tiku\.worktrees\f0117-migration-smoke-red-fixture"
if (Test-Path -LiteralPath $fixture) { throw "fixture already exists: $fixture" }
git worktree add --detach $fixture e76abf5c2e346d908d9cfccd84c12f032650bc5e
```

仅在 fixture 的 `_journal.json` 中把 F-0117 entry 后追加：

```json
{
  "idx": 34,
  "version": "7",
  "when": 1784394253910,
  "tag": "20260718110413_fixture_later_migration",
  "breakpoints": true
}
```

使用 `apply_patch` 修改 fixture；禁止用 shell 重写 JSON。随后运行：

```powershell
& "D:\tiku\node_modules\.bin\vitest.cmd" run tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts --maxWorkers=1
```

Expected: 1 test PASS、1 test FAIL；失败精确来自 `journal.entries.at(-1)?.tag` 得到 synthetic later tag，证明合法追加会误伤历史 F-0117 smoke。

- [x] **Step 3: 写入最小可追加链实现**

使用 `apply_patch` 将 authoritative task worktree 中的测试完整收敛为以下内容；不得抽取跨文件 helper：

```ts
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const migrationSuffix = "_p1_rc_02_redeem_code_nullable_deadline.sql";

type Journal = {
  entries: Array<{ idx: number; tag: string }>;
};

type Snapshot = {
  id: string;
  prevId: string;
  tables: Record<string, { columns: Record<string, { notNull: boolean }> }>;
};

function readMigration() {
  const names = readdirSync(resolve(process.cwd(), "drizzle")).filter((name) =>
    name.endsWith(migrationSuffix),
  );
  expect(names).toHaveLength(1);
  const name = names[0]!;
  return {
    name,
    source: readFileSync(resolve(process.cwd(), "drizzle", name), "utf8"),
  };
}

function readSnapshot(path: string): Snapshot {
  expect(existsSync(path)).toBe(true);
  return JSON.parse(readFileSync(path, "utf8")) as Snapshot;
}

describe("F-0117 redeem_code nullable deadline migration source", () => {
  it("contains exactly the approved DROP NOT NULL statement", () => {
    const { name, source } = readMigration();
    expect(name).toMatch(
      /^\d{14}_p1_rc_02_redeem_code_nullable_deadline\.sql$/u,
    );
    expect(source.replace(/\s+/gu, " ").trim()).toBe(
      'ALTER TABLE "redeem_code" ALTER COLUMN "redeem_deadline_at" DROP NOT NULL;',
    );
    expect(source).not.toMatch(
      /\b(?:INSERT|UPDATE|DELETE|TRUNCATE|DROP TABLE)\b/iu,
    );
  });

  it("changes only redeem_code.redeem_deadline_at in an appendable linear snapshot chain", () => {
    const { name } = readMigration();
    const tag = name.slice(0, -4);
    const journal = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "drizzle/meta/_journal.json"),
        "utf8",
      ),
    ) as Journal;
    const matchingEntries = journal.entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => entry.tag === tag);

    expect(matchingEntries).toHaveLength(1);
    const currentMatch = matchingEntries[0]!;
    expect(currentMatch.index).toBeGreaterThan(0);

    const previousEntry = journal.entries[currentMatch.index - 1];
    expect(previousEntry).toBeDefined();
    expect(previousEntry!.tag).toMatch(/^\d{14}_/u);
    expect(Number.isSafeInteger(currentMatch.entry.idx)).toBe(true);
    expect(Number.isSafeInteger(previousEntry!.idx)).toBe(true);
    expect(currentMatch.entry.idx).toBe(previousEntry!.idx + 1);

    const current = readSnapshot(
      resolve(process.cwd(), `drizzle/meta/${tag.slice(0, 14)}_snapshot.json`),
    );
    const previous = readSnapshot(
      resolve(
        process.cwd(),
        `drizzle/meta/${previousEntry!.tag.slice(0, 14)}_snapshot.json`,
      ),
    );

    expect(current.prevId).toBe(previous.id);
    expect(current.id).not.toBe(previous.id);
    expect(
      current.tables["public.redeem_code"]!.columns.redeem_deadline_at!.notNull,
    ).toBe(false);

    const normalizedCurrent = structuredClone(current);
    normalizedCurrent.id = previous.id;
    normalizedCurrent.prevId = previous.prevId;
    normalizedCurrent.tables[
      "public.redeem_code"
    ]!.columns.redeem_deadline_at!.notNull = true;
    expect(normalizedCurrent).toEqual(previous);
  });
});
```

- [x] **Step 4: 运行 authoritative 与 later-entry GREEN**

Run in authoritative task worktree:

```powershell
& "D:\tiku\node_modules\.bin\vitest.cmd" run tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts --maxWorkers=1
```

Expected: 1 file / 2 tests PASS。

在 Step 2 fixture 中用 `apply_patch` 对同一测试文件应用 Step 3 的完整变更，再运行同一命令。Expected: synthetic later entry 保留时仍为 1 file / 2 tests PASS；fixture journal/snapshot 不得复制回 authoritative worktree。

- [x] **Step 5: 验证 duplicate tag fail-closed**

在 fixture 中临时把 synthetic entry 的 tag 改为 `20260718100413_p1_rc_02_redeem_code_nullable_deadline`，运行目标测试。

Expected: FAIL，`matchingEntries` 实际长度为 2。随后用 `apply_patch` 恢复 synthetic tag，并确认测试重新 PASS。

- [x] **Step 6: 验证 missing predecessor 与 non-adjacent idx fail-closed**

先用 `apply_patch` 临时删除 fixture journal 中完整的 idx 32 employee-import entry，运行目标测试。

Expected: FAIL，F-0117 idx 33 不等于新的直接前项 idx 31 + 1。恢复 idx 32 entry 后，再把 F-0117 `idx` 临时改为 35 并重跑。

Expected: FAIL，35 不等于 32 + 1。恢复 idx 33 后确认目标测试 PASS。

Reviewer amendment：journal 是运行时 JSON 边界，current 与 previous `idx` 必须先分别通过 `Number.isSafeInteger` 再执行相邻算术。双字符串 idx 变异已证明旧候选会因字符串拼接错误 PASS，修复后 fail closed；独立 reviewer 追加的浮点 idx 变异同样 fail closed。恢复安全整数并保留 later entry 后继续 2/2 PASS。

- [x] **Step 7: 验证错误 `prevId` fail-closed**

在 fixture `drizzle/meta/20260718100413_snapshot.json` 中临时把：

```json
"prevId": "6fda46fa-a6b4-464b-8f84-a049d7d0ece2"
```

改为：

```json
"prevId": "00000000-0000-0000-0000-000000000000"
```

Expected: 目标测试 FAIL，错误值不等于 previous snapshot id。恢复原值后确认 PASS。

- [x] **Step 8: 验证额外 snapshot diff fail-closed**

在同一 fixture snapshot 中临时把顶层：

```json
"dialect": "postgresql"
```

改为：

```json
"dialect": "fixture"
```

Expected: 目标测试 FAIL，normalized current 不等于 previous snapshot。恢复 `postgresql` 后确认 PASS。

- [x] **Step 9: 清理 disposable fixture 并核验 authoritative 精确 diff**

```powershell
$fixture = "D:\tiku\.worktrees\f0117-migration-smoke-red-fixture"
$resolvedFixture = [System.IO.Path]::GetFullPath($fixture)
$resolvedRoot = [System.IO.Path]::GetFullPath("D:\tiku\.worktrees\")
if (-not $resolvedFixture.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "unsafe fixture path: $resolvedFixture"
}
git worktree remove --force $resolvedFixture
git worktree prune
git status --short
git diff --name-only
```

Expected: fixture 不再出现在 `git worktree list`；authoritative diff 只含 Step 1 计划文档与目标 test，不含 journal/snapshot/schema/product/guard。

- [x] **Step 10: 写脱敏 evidence/audit 并更新 addendum 状态**

Evidence 必须记录：旧测试在 later-entry fixture 中 RED、候选测试在同 fixture GREEN；duplicate tag、missing predecessor、numeric idx gap、string/float invalid idx、wrong `prevId`、extra snapshot drift 六类负向 mutation 均 fail-closed；合法 later-entry 是正常通过路径；并记录正常目标测试结果、完整回归命令/计数、两轮 review findings/disposition、无数据库执行声明。不得记录明文 redeem_code、secret、连接字符串或 fixture snapshot 全文。

Audit 必须逐项复核：唯一 tag、predecessor 存在、相邻 idx、动态 previous snapshot、`prevId`、全 snapshot diff、后续 entry 可追加、authoritative migration metadata 零 diff、权限边界未扩大。规格状态只从“等待书面规格复核”更新为“书面规格已批准；Task 7 已验证”且不得重写原产品设计语义。

- [x] **Step 11: 运行 closeout full validation**

```powershell
& "D:\tiku\node_modules\.bin\vitest.cmd" run tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts --maxWorkers=1
npm.cmd run test:unit -- --maxWorkers=1
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run format:check
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual -SkipExternalIntegrityChecks
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase pre_commit -SkipExternalIntegrityChecks
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18
git diff --check
```

Expected: 全部 exit 0；full unit 0 failed，build 完成全部 static pages。若任何旧测试因合法 later migration 失败，不得恢复 terminal 假设或旧 nullable transport 合同。

- [x] **Step 12: 执行两轮对抗式复核**

Round 1 由主线程逐项对照规格、计划、exact diff、mutation evidence 和完整门禁，确认没有越界或弱化。Round 2 由未参与实现的独立 reviewer Subagent 尝试证明：后续 entry 被错误忽略、重复 tag 被接受、idx gap 或 string/float invalid idx 被接受、wrong `prevId` 被接受、额外 schema diff 被规范化掩盖，或 authoritative metadata 被改动。

Expected: 两轮均为 Approved 且无 Critical/Important；任何 blocker 必须补 RED 后修复并重跑受影响门禁。

- [x] **Step 13: 创建单一 Task 7 实现提交**

```powershell
$expected = @(
  "docs/superpowers/specs/2026-07-18-redeem-code-nullable-deadline-design.md",
  "docs/05-execution-logs/task-plans/2026-07-18-p1-remediation-rc-02-redeem-code-nullable-deadline-design.md",
  "docs/05-execution-logs/evidence/2026-07-18-p1-remediation-rc-02-redeem-code-nullable-deadline.md",
  "docs/05-execution-logs/audits-reviews/2026-07-18-p1-remediation-rc-02-redeem-code-nullable-deadline.md",
  "tests/unit/p1-redeem-code-nullable-deadline-migration-source.test.ts"
)
$changed = @(git diff --name-only)
$unexpected = @($changed | Where-Object { $_ -notin $expected })
if ($unexpected.Count -gt 0) { throw "unexpected paths: $($unexpected -join ', ')" }
if (@($changed).Count -ne $expected.Count) { throw "expected exact Task 7 file set" }
git add -- $expected
git commit -m "test(p1): make F-0117 migration smoke appendable"
```

Expected: hook 中 P1/P0/Module 与 lint-staged PASS；commit 精确包含 5 个文件。禁止 `git add .`。

- [ ] **Step 14: ff-only 合入、普通推送并清理隔离资源**

在 `D:\tiku` 先确认 master worktree clean、`master` 是 implementation branch 的祖先、`origin/master` 仍为执行开始时记录的 SHA；任一不满足立即停止。然后：

```powershell
git merge --ff-only codex/p1-rc02-redeem-code-nullable-deadline
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18 -SkipRemoteAheadCheck
git push origin master:master
```

Expected: push hook PASS，`master == origin/master`。确认 task worktree clean 且 resolved path 位于 `D:\tiku\.worktrees\` 后，执行 `git worktree remove`；确认 branch 已合入后执行 `git branch -d codex/p1-rc02-redeem-code-nullable-deadline`。不得 force-push、PR、deploy 或数据库执行。

## Task 7 Whole-Branch Review-Fix Commit Separation

整分支复审的第二个 Important 指出：治理状态对齐不应通过 amend 扩大 Step 13 的实现提交文件集。该 finding 成立，已按无损拆分处置：

- 原 exact-5 实现提交 `f01469c21` 已恢复，父提交仍为 `12e675087`；其测试、规格、任务计划、evidence 与 audit 树保持不变。
- Step 13 的 implementation file set 仍严格是其列出的 5 个文件。整分支 review 后发生的 implementation plan、evidence、audit 状态对齐属于独立 docs-only review-fix，不属于 Step 13 implementation file set。
- docs-only review-fix 精确包含本 implementation plan、既有 evidence 与既有 audit；不修改 test/spec/task-plan、authoritative metadata、guards、state/queue 或 blocked surfaces。
- 本节只记录提交边界修复，不预先声称整分支最终 Approved。整分支最终复审仍 pending；Step 14 merge/push/cleanup 仍未执行。
