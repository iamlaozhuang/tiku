# Content Admin Review Adoption Local PostgreSQL Route Smoke Approval Package Acceptance

Task id: `content-admin-review-adoption-local-postgres-route-smoke-approval-package-2026-06-27`

Decision: `LOCAL_POSTGRES_ROUTE_SMOKE_APPROVAL_PACKAGE_PREPARED_EXECUTION_BLOCKED`

moduleRunVersion: 2

Cost Calibration Gate remains blocked.

## Scope

This docs/state-only acceptance prepares the future Layer 2 local PostgreSQL-backed route/service smoke for the
content-admin generated-result review adoption path.

No DB access, `.env*` read, browser, dev-server, e2e, Provider, Cost Calibration, real mutation, formal publish,
student-visible runtime, staging/prod/deploy/payment external service, OCR/export, archive/index movement, PR, force
push, release readiness, or final Pass is approved or executed by this package.

## Current Layer Status

| Layer                             | Status after this package                                                                     | Evidence basis                                                                            | Remaining gate                                                                                                                         |
| --------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Layer 1 role/entry/permission     | Complete for local no-regression guard only                                                   | Existing Layer 1 evidence and no source/runtime changes in this task                      | Future role, route, auth, UI, or browser changes must preserve this boundary                                                           |
| Layer 2 business function loop    | Ready for owner decision on true local PostgreSQL-backed route smoke; execution still blocked | Command-contract TDD, injected route-handler smoke, and latest Layer 2 route-smoke rollup | Fresh execution approval for secret-safe local DB handling, one controlled mutation/readback, test-owned target, and redacted evidence |
| Layer 3 Provider/cost/pre-release | Blocked                                                                                       | High-risk consolidation, ADR-006, and Cost Calibration blocked SOP                        | Fresh approval per Provider, Cost Calibration, staging/prod, deploy, payment, OCR, export, and external-service gate                   |

## Future Execution Task

Proposed task id: `content-admin-review-adoption-local-postgres-route-smoke-execution-2026-06-27`

Purpose: execute exactly one local PostgreSQL-backed route/service smoke for one test-owned content-admin generated-result
review target, using the existing runtime path and recording only redacted metadata.

The future execution task is not approved by this package.

## Decision Choice Required Before Execution

The future execution approval must choose exactly one decision path:

| Option | Decision   | Blast radius | What it can prove                                                                             | Extra boundary                                                                               |
| ------ | ---------- | ------------ | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| A      | `rejected` | Lower        | DB-backed route/service decision mutation and redacted readback without formal draft creation | Recommended first if the owner wants minimum DB-backed route proof                           |
| B      | `approved` | Higher       | DB-backed route/service decision plus formal draft metadata path, if source-defined           | Requires explicit formal draft metadata, cleanup/recovery, and no publish/student visibility |

If the owner does not choose one path, execution must stop.

## Test Data Boundary

The future execution task may use exactly one target:

- one existing local `dev` generated-result review target that is already safe, test-owned, and not staging/prod data; or
- one separately approved synthetic/local fixture or setup path created for this smoke; or
- one previously approved local setup artifact if the execution task can prove it is test-owned without exposing raw
  content.

The future execution task must stop before DB connection if:

- no suitable local target exists;
- proving test ownership requires broad scans, raw row dumps, source changes, seed, migration, or secret output;
- the target contains private, production-like, or customer/customer-like data;
- the target cannot be verified without exposing raw generated content.

## Secret-Safe Local DB Handling

The future execution task may only use secret-safe local DB handling after fresh approval.

Allowed when explicitly approved:

- existing runtime-level local `dev` environment resolution for `DATABASE_URL`;
- process-level use of the value by the application/runtime command;
- evidence that records only `local_dev_database_runtime_resolved: true|false` or a failure category.

Blocked even when future execution is approved unless separately stated:

- opening, printing, copying, grepping, echoing, committing, or recording `.env*` contents;
- recording any DB URL, host, username, password, token, secret, cookie, Authorization header, or localStorage value;
- editing `.env.local` or `.env.example`;
- connecting to staging, prod, cloud, payment, external-service, or production-like data;
- raw SQL, `drizzle-kit push`, schema/migration/seed, destructive reset/drop/truncate/delete, raw row dump, or broad scan.

## Single Mutation And Readback Cap

The future execution task may run at most:

- one generated-result review target;
- one content-admin reviewer context;
- one selected review decision, either `approved` or `rejected`;
- one route/service command invocation that performs the selected decision;
- one bounded pre-read of redacted target metadata if required;
- one bounded post-command redacted readback for status, traceability, formal-target status, and audit/action summary.

The cap does not permit batch adoption, retry/adoption loops, Provider retry, AI generation, formal publish,
student-visible exposure, multiple targets, multiple decisions, repeated mutation attempts, or mutation of unrelated
records.

If the first mutation attempt is ambiguous, partially succeeds, or needs a second mutation to make the result acceptable,
the future execution task must stop and record the blocked state instead of retrying.

## Rollback And Recovery Strategy

The future execution task must name one cleanup strategy before mutation:

- `test_owned_state_can_remain`: post-smoke state may remain as a local test artifact because the target is test-owned;
- `source_defined_non_destructive_reversal`: an existing app-level non-destructive reversal/archive/disable path is
  explicitly approved in the future task;
- `disposable_fixture_cleanup`: a separately approved disposable fixture setup includes cleanup without raw SQL or
  destructive DB work.

If none applies, the future execution task must stop before DB write.

For `approved` path, the approval must additionally state whether formal draft metadata may be created and whether that
local artifact can remain. Formal publish and student-visible runtime remain blocked in all cases.

## Redaction Rules

Future evidence may record only:

- command name or route/service label, not full payload;
- environment classification `local_dev`, not DB URL or host;
- role label `content_admin`;
- selected decision kind `approved` or `rejected`;
- pass/fail/blocked result;
- count summaries such as `targetCount: 1`, `mutationCount: 1`, `readbackCount: 1`;
- masked public reference if needed, never a full inventory;
- redacted before/after metadata categories, not values;
- redacted `audit_log` action category and traceability status.

Future evidence must not record credentials, `.env*`, tokens, cookies, localStorage, Authorization headers, DB URLs, DB
rows, SQL output, raw prompts, raw Provider payloads, raw generated output, screenshots, traces, page text dumps, full
`paper`, full `material`, private answer text, plaintext `redeem_code`, or public identifier inventories.

## Stop Conditions For Future Execution

The future execution task must stop before runtime or before mutation if it encounters:

- no fresh execution approval;
- no explicit decision choice between `approved` and `rejected`;
- unclear route/service surface;
- need to manually read, print, copy, or record `.env*`, credentials, tokens, cookies, Authorization headers, DB URLs, or
  localStorage;
- need for Provider call/configuration, Cost Calibration, staging/prod/deploy/payment external service, OCR/export;
- need for schema, migration, seed, destructive DB operation, broad data export, or raw row dump;
- need for browser/dev-server/e2e without separate approval;
- need for formal publish or student-visible runtime;
- need for multiple mutations, batch operation, retry/adoption loop, or unbounded rollback;
- inability to keep evidence redacted.

## Copyable Future Execution Approval Text

### Option A: Lower-Risk Rejected DB-Backed Smoke

```text
我 fresh approve 一个 Layer 2 local PostgreSQL-backed route/runtime smoke 执行任务：
content-admin-review-adoption-local-postgres-route-smoke-execution-2026-06-27。
本次只允许选择 `rejected` 决策。允许在本地 dev 中通过既有 runtime 数据库配置使用 `.env.local` 中的 `DATABASE_URL`，
但禁止打开、输出、复制、记录或提交任何 `.env*` 内容、secret、token、DB URL 或凭据值。仅允许对一个 test-owned
content_admin generated-result review target 执行一次 rejected route/service command，并进行最多一次脱敏 pre-read 和一次
脱敏 post-readback；不得 seed/migration/destructive DB/raw row dump/broad scan。证据只能记录角色标签、决策、pass/fail、
计数、脱敏状态和红线确认。
不批准浏览器/dev-server/e2e、Provider、Cost Calibration、schema/migration/seed/destructive DB、formal publish、
student-visible runtime、staging/prod/deploy/payment external service、OCR/export、PR、force push、release readiness 或
final Pass。
```

### Option B: Higher-Risk Approved DB-Backed Smoke

```text
我 fresh approve 一个 Layer 2 local PostgreSQL-backed approved route/runtime smoke 执行任务：
content-admin-review-adoption-local-postgres-route-smoke-execution-2026-06-27。
本次只允许选择 `approved` 决策。允许在本地 dev 中通过既有 runtime 数据库配置使用 `.env.local` 中的 `DATABASE_URL`，
但禁止打开、输出、复制、记录或提交任何 `.env*` 内容、secret、token、DB URL 或凭据值。仅允许对一个 test-owned
content_admin generated-result review target 执行一次 approved route/service command，并进行最多一次脱敏 pre-read 和一次
脱敏 post-readback；若 source-defined approved path 创建 formal draft metadata，只允许本地测试草稿元数据，不允许 publish
或 student-visible runtime。不得 seed/migration/destructive DB/raw row dump/broad scan。证据只能记录角色标签、决策、
pass/fail、计数、formal draft metadata 状态类别、脱敏状态和红线确认。
不批准浏览器/dev-server/e2e、Provider、Cost Calibration、schema/migration/seed/destructive DB、formal publish、
student-visible runtime、staging/prod/deploy/payment external service、OCR/export、PR、force push、release readiness 或
final Pass。
```

## Explicit Non-Claims

- No source/test/product code changed.
- No browser/dev-server/e2e was run.
- No DB connection, DB read/write, seed, migration, rollback, destructive operation, raw row dump, broad scan, or real
  mutation was run.
- No credential, token, `.env*`, cookie, localStorage, Authorization header, or DB URL was read or recorded.
- No Provider call/configuration or Cost Calibration was run.
- No formal publish or student-visible runtime was run.
- No staging/prod/deploy/payment external service/OCR/export/archive/index movement was run.
- No PR or force push was run.
- No release readiness, production readiness, final Pass, Layer 2 runtime closure, or Layer 3 readiness is claimed.
