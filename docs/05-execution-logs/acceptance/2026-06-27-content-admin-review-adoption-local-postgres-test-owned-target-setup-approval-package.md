# Content Admin Review Adoption Local PostgreSQL Test-Owned Target Setup Approval Package Acceptance

Task id:
`content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package-2026-06-27`

Decision: `TEST_OWNED_TARGET_SETUP_SELECTION_APPROVAL_PACKAGE_PREPARED_EXECUTION_BLOCKED`

moduleRunVersion: 2

Cost Calibration Gate remains blocked.

## Scope

This docs/state-only acceptance prepares the future Layer 2 local PostgreSQL test-owned target setup/selection step for
the content-admin generated-result review adoption path.

No DB access, `.env*` read, browser, dev-server, e2e, Provider, Cost Calibration, target creation/selection execution,
real mutation, formal publish, student-visible runtime, staging/prod/deploy/payment external service, OCR/export,
archive/index movement, PR, force push, release readiness, or final Pass is approved or executed by this package.

## Current Layer Status

| Layer                             | Status after this package                                                                                     | Evidence basis                                                     | Remaining gate                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| Layer 1 role/entry/permission     | Complete for local no-regression guard only                                                                   | Existing Layer 1 evidence and no source/runtime changes here       | Future role, route, auth, UI, or browser changes must preserve existing boundaries                     |
| Layer 2 business function loop    | PostgreSQL route path reached previously; mutation/readback still blocked until target setup/selection is run | Latest PostgreSQL route smoke found no single test-owned target    | Fresh execution approval for one safe test-owned target setup/selection and one `rejected` route smoke |
| Layer 3 Provider/cost/pre-release | Blocked                                                                                                       | ADR-006 and high-risk/Cost Calibration blocked gates remain active | Fresh approval for Provider, Cost Calibration, staging/prod, deploy, payment, OCR/export, external     |

## Accepted Package Content

Accepted docs-only outcomes:

- target setup/selection boundary defined;
- single mutation cap defined for future execution;
- rollback/recovery options defined;
- redaction rules defined;
- copyable future approval text prepared;
- state and queue updated without approving execution.

## Future Execution Task

Recommended proposed task id:
`content-admin-review-adoption-local-postgres-test-owned-target-setup-execution-2026-06-27`

Purpose: use exactly one approved local dev test-owned generated-result review target, then execute at most one
`rejected` route/service review command and one redacted readback.

The future execution task is not approved by this package.

## Stop Conditions For Future Execution

Future execution must stop before runtime or mutation if it encounters:

- no fresh execution approval;
- no single target source;
- unclear test ownership;
- need to expose raw generated content or raw DB rows;
- need to read, print, copy, or record `.env*`, credentials, tokens, cookies, Authorization headers, DB URLs, or
  localStorage;
- need for Provider, Cost Calibration, staging/prod/deploy/payment external service, OCR/export;
- need for schema, migration, seed, destructive DB operation, raw SQL, broad data export, raw row dump, or broad scan;
- need for browser/dev-server/e2e without separate approval;
- need for formal publish or student-visible runtime;
- need for multiple mutations, batch operation, retry/adoption loop, or unbounded rollback.

## Copyable Future Execution Approval Text

### Option A: Target Setup/Selection Then Rejected Smoke

```text
我 fresh approve 一个 Layer 2 local PostgreSQL test-owned target setup/selection + rejected route/runtime smoke 执行任务：
content-admin-review-adoption-local-postgres-test-owned-target-setup-execution-2026-06-27。
本次只允许在本地 dev 使用一个 test-owned content_admin generated-result review target，并且只允许 `rejected` 决策。
允许通过既有 runtime 数据库配置使用 `.env.local` 中的 `DATABASE_URL`，但禁止打开、输出、复制、记录或提交任何 `.env*`
内容、secret、token、DB URL 或凭据值。允许二选一：使用我提供的一个已知 test-owned target 做一次 targeted
脱敏 pre-read，或通过一个既有 app-level 本地路径创建/准备一个 synthetic test-owned review target；随后最多执行一次
rejected route/service command 和一次脱敏 post-readback。不得 Provider、seed、migration、destructive DB、raw SQL、
raw row dump、broad scan、第二目标、第二次 mutation 或 retry loop。证据只能记录角色标签、决策、pass/fail/blocked、
计数、脱敏状态、target ownership 分类、formal target 状态类别和红线确认。
不批准浏览器/dev-server/e2e、Provider、Cost Calibration、schema/migration/seed/destructive DB、formal publish、
student-visible runtime、staging/prod/deploy/payment external service、OCR/export、PR、force push、release readiness 或
final Pass。
```

### Option B: Owner-Supplied Target Selection Only

```text
我 fresh approve 一个 Layer 2 local PostgreSQL owner-supplied test-owned target selection + rejected route/runtime smoke
执行任务：
content-admin-review-adoption-local-postgres-test-owned-target-selection-execution-2026-06-27。
我会在对话中提供一个已知 test-owned generated-result review target 引用；Codex 只能对这个单一 target 执行一次 targeted
脱敏 pre-read、一次 `rejected` route/service command 和一次脱敏 post-readback。允许通过既有 runtime 数据库配置使用
`.env.local` 中的 `DATABASE_URL`，但禁止打开、输出、复制、记录或提交任何 `.env*` 内容、secret、token、DB URL 或凭据值。
不得创建数据、seed、migration、destructive DB、raw SQL、raw row dump、broad scan、第二目标、第二次 mutation 或 retry loop。
证据只能记录角色标签、决策、pass/fail/blocked、计数、脱敏状态、target ownership 分类、formal target 状态类别和红线确认。
不批准浏览器/dev-server/e2e、Provider、Cost Calibration、schema/migration/seed/destructive DB、formal publish、
student-visible runtime、staging/prod/deploy/payment external service、OCR/export、PR、force push、release readiness 或
final Pass。
```

## Explicit Non-Claims

- No source/test/product code changed.
- No browser/dev-server/e2e was run.
- No DB connection, DB read/write, seed, migration, rollback, destructive operation, raw row dump, broad scan, target
  setup/selection execution, or real mutation was run.
- No credential, token, `.env*`, cookie, localStorage, Authorization header, or DB URL was read or recorded.
- No Provider call/configuration or Cost Calibration was run.
- No formal publish or student-visible runtime was run.
- No staging/prod/deploy/payment external service/OCR/export/archive/index movement was run.
- No PR or force push was run.
- No release readiness, production readiness, final Pass, Layer 2 runtime closure, or Layer 3 readiness is claimed.

## Validation

Scoped Prettier, `git diff --check`, project status diagnostic, pre-commit hardening, module closeout readiness, and
pre-push readiness passed.
