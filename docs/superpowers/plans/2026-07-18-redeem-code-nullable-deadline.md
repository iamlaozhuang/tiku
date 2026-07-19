# Redeem Code Nullable Deadline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `redeem_code.redeem_deadline_at = null` 成为长期可兑换的唯一领域语义，并在 schema、migration source、API、repository、preview/confirm 和管理端/学员端 UI 全链保持一致。

**Architecture:** 保持既有 route → service → repository → schema 分层；管理端有限日期继续映射为 UTC+8 当日 23:59:59.999，省略或显式 null 映射为长期可兑换。数据库只生成 `DROP NOT NULL` migration source；repository 与 preview model 显式分支 null，禁止远未来哨兵和双重布尔事实。

**Tech Stack:** TypeScript、Next.js 16、React 19、Drizzle ORM / drizzle-kit、PostgreSQL migration source、Vitest、Testing Library、PowerShell governance guards。

## Execution Status

| Task                          | Status   | Evidence                                            |
| ----------------------------- | -------- | --------------------------------------------------- |
| 1. Schema 与 migration source | complete | RED/GREEN 与独立审查 Approved                       |
| 2. Admin contracts/service    | complete | RED/GREEN 与独立审查 Approved                       |
| 3. Admin repository           | complete | RED/GREEN、review fix 与独立复审 Approved           |
| 4. Student preview/confirm    | complete | RED/GREEN 与独立审查 Approved                       |
| 5. Admin/student UI           | complete | RED/GREEN 与独立审查 Approved                       |
| 6. 全链 closeout preparation  | complete | 全量验证与治理门禁通过；两轮累计独立审查均 Approved |

本表只记录当前执行进度。唯一产品提交、`ready_for_closeout` transition、合入、推送与清理均尚未执行。

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
