# Phase 14 Local E2E Baseline Diagnostics Evidence

**Task id:** `phase-14-local-e2e-baseline-diagnostics`

**Branch/worktree:** `codex/phase-14-local-e2e-baseline-diagnostics` / `.worktrees/phase-14-local-e2e-baseline-diagnostics`

**Date:** 2026-05-26

## Scope

Read-only local diagnostics for three full e2e baseline blockers:

- Student profile authorization API loading failure.
- `mistake_book` AI explanation response not OK.
- Role-based content readiness empty JSON response.

No implementation, test, script, schema, dependency, lockfile, env, seed reset, migration, deploy, staging/prod/cloud, or real provider change was made.

## Actual Checked Files

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `e2e/local-business-flow.spec.ts`
- `e2e/student-practice-mock-entry.spec.ts`
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `src/server/repositories/runtime-database.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`

## Reproduction Log

- `D:\tiku\node_modules\.bin\playwright.cmd test e2e/local-business-flow.spec.ts`: failed. Current failure is `Response.json()` empty response inside the in-page student flow fetch chain.
- `D:\tiku\node_modules\.bin\playwright.cmd test e2e/student-practice-mock-entry.spec.ts`: passed in isolation, 1 test.
- `D:\tiku\node_modules\.bin\playwright.cmd test e2e/role-based-acceptance/role-based-full-flow.spec.ts`: failed at step 3, Content Ops Readiness. Preflight and System Ops readiness passed; failure is `Response.json()` empty response during paper creation readiness.

The diagnostics worktree has no local `node_modules`, so commands reused the existing root dependency binary from `D:\tiku\node_modules` while keeping the working directory in the diagnostics worktree. No dependency install was run.

## Findings

### Root Cause

The stable root cause is local Postgres connection exhaustion in the running Next dev server:

- Local dev server stderr repeatedly reports Postgres error code `53300`: `sorry, too many clients already`.
- The same error appears across unrelated surfaces: auth session lookup, admin organization lists, redeem code lists, student paper authorization scope lookup, paper list, paper creation audit logging, and mock exam route session resolution.
- When these unhandled database errors occur inside route handlers, the browser-side tests receive a 500/empty response and then fail on `response.json()` with `Unexpected end of JSON input`.

### Why It Hits Several E2E Paths

- Student profile page loads `/api/v1/sessions`, `/api/v1/authorizations`, and `/api/v1/personal-auths` concurrently. If any one of these hits connection exhaustion, `StudentProfileRedeemPage` sets `loadState` to `error`, producing the observed "个人中心加载失败" state.
- `mistake_book` AI explanation writes `ai_call_log`. It passed in the isolated diagnostic rerun, but prior full-suite failure and unit output showed the same connection-exhaustion pattern around AI call logging. This classifies it as order/load-sensitive rather than a deterministic `mistake_book` behavior bug.
- Role-based content readiness creates material/question/paper resources and appends audit logs. The failing run reached `POST /api/v1/papers`, then the dev server logged a failed `audit_log` insert with `sorry, too many clients already`, causing the in-page `response.json()` parse failure.
- Local business flow performs a long sequence of practice/mock/student/admin requests. The current diagnostic failure moved from profile to the in-page student flow fetch chain, and the dev server log shows `POST /api/v1/mock-exams/.../submit` 500 after session lookup failed with the same Postgres connection error.

### Code Pattern That Explains Connection Pressure

Read-only code inspection found many runtime modules creating independent postgres-js pools with `max: 5`:

- `src/server/repositories/runtime-database.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`
- plus several feature-specific runtime repositories.

Each module caches its own database instance locally, not through one process-wide shared pool. In Next dev, multiple route modules plus hot reload/test sequencing can accumulate enough pools to exceed the local Postgres connection limit.

### Classification

| Symptom                                           | Classification                                                                  | Evidence                                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Student profile authorization API loading failure | Local DB connection exhaustion surfaced through concurrent profile API loads    | Profile fetch uses `Promise.all`; stderr shows auth/session and authorization-adjacent queries failing with `53300`.           |
| `mistake_book` AI explanation response not OK     | Intermittent local DB connection exhaustion, likely around `ai_call_log` append | Isolated rerun passed; previous failing run aligned with `appendAiCallLog` / connection exhaustion.                            |
| Role-based content readiness empty JSON response  | Local DB connection exhaustion during content mutation/audit logging            | Role-based rerun failed at paper readiness; stderr shows `POST /api/v1/papers 500` and `audit_log` insert failed with `53300`. |

## Recommended Next Task

Open a separate implementation task for local runtime database connection management and route error-shape hardening.

Suggested scope:

- Consolidate local runtime database creation behind a process-wide shared postgres-js client or pool registry.
- Ensure all route handlers return standard `{ code, message, data }` JSON even when unexpected repository errors occur.
- Add targeted tests for route error envelopes and local e2e stability.

This should be a code task, not part of the read-only diagnostics task, and should preserve the existing forbidden scope: no `.env.local` / `.env.example` reads or modifications, no staging/prod/cloud/real provider, no dependency changes, no schema/migration changes unless separately approved.

## Command Results

- `D:\tiku\node_modules\.bin\playwright.cmd test e2e/local-business-flow.spec.ts`: fail, empty JSON response in student flow fetch chain.
- `D:\tiku\node_modules\.bin\playwright.cmd test e2e/student-practice-mock-entry.spec.ts`: pass, 1 test.
- `D:\tiku\node_modules\.bin\playwright.cmd test e2e/role-based-acceptance/role-based-full-flow.spec.ts`: fail, empty JSON response during Content Ops Readiness paper creation.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; branch has no upstream and local `master` remains ahead of `origin/master` from prior unpushed Phase 14 docs commits.
- `git diff --check`: pass.

## Forbidden Scope Self-Check

- No source, test, script, schema, migration, package, lockfile, `.env.local`, or `.env.example` change was made.
- No staging, production, cloud, deploy, or real provider access was used.
- No destructive seed reset, data cleanup, or migration was run.
- No secret, token, Authorization header, database URL, raw prompt, raw answer, raw model response, raw provider payload, full paper, full textbook, OCR full text, or customer-like private data is recorded.

## 品味合规自检 Checklist

- 1. 视觉：本任务未改 UI。
- 2. 状态：本任务只记录现有 error/loading 状态触发条件，未改状态逻辑。
- 3. 交互：本任务未改交互。
- 4. Tailwind：本任务未改样式类。
- 5. N+1：本任务未改数据库查询。
- 6. Schema：本任务未改 schema、migration 或 SQL。
- 7. API：诊断指出异常路径未稳定返回标准 JSON，作为后续修复建议；本任务未改 API。
- 8. 注释：本任务未改代码注释。
- 9. 命名：诊断使用既有 `mistake_book`, `ai_call_log`, `authorization`, `paper`, `audit_log` 等术语。
- 10. 不可变：本任务未改运行时代码状态。
