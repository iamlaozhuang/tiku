# Detail UI Tokenized Layout Primitive Candidates Task Plan

## Task

- Task id: `detail-ui-tokenized-layout-primitive-candidates-2026-06-29`
- Branch: `codex/ui-tokenized-layout-primitives-20260629`
- Source story: `seeded_by_detail_ui_ux_token_state_inventory_2026_06_29`
- Finding id: `ui-inv-001`
- Target closure item: centralize one repeated admin filter-grid layout class behind a scoped layout primitive and focused
  unit coverage.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-detail-ui-ux-token-state-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-detail-ui-ux-token-state-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-detail-ui-ux-token-state-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-detail-ui-ux-token-state-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md`

## Authorization And Scope

This task is a low-risk local UI detail repair after task-specific materialization. It may edit only the named admin
layout primitive source file, two named admin baseline component files, one focused unit test file, and scoped
governance docs/state/evidence files.

The task must not change design tokens, package manifests, lockfiles, runtime configuration, database files, migrations,
seed files, e2e specs, scripts, or any release/deployment state.

## Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md`
- `docs/05-execution-logs/task-plans/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md`
- `docs/05-execution-logs/evidence/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md`
- `docs/05-execution-logs/acceptance/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md`
- `src/components/admin/admin-layout-primitives.ts`
- `src/components/admin/CommonInteraction/AdminCommonInteractionBaseline.tsx`
- `src/components/admin/UserOrgAuthOps/AdminUserOrgAuthOpsBaseline.tsx`
- `tests/unit/admin-layout-primitives-ui.test.ts`

## Blocked Files And Actions

- No source/test changes outside the writable files above.
- No design token changes.
- No package or lockfile changes.
- No `.env*`, secrets, connection strings, real credentials, cookies, tokens, sessions, localStorage, or Authorization
  header access or evidence.
- No DB connection, raw row read, mutation, schema, migration, seed, or destructive operation.
- No Provider/AI call, Provider configuration, prompt, payload, raw AI input/output, or Cost Calibration.
- No browser runtime, dev server, raw DOM, screenshots, traces, e2e execution, staging, prod, cloud, deployment, release
  readiness, final Pass, PR, or force-push.

## Evidence Redaction

Allowed evidence is limited to file paths, component paths, layout primitive names, risk category, severity, status,
counts, validation command names, branch/commit/merge/push/cleanup status, and redacted summaries. Evidence must not
include credential/token/session/cookie/Auth-header values, raw exception payloads, raw DB rows, internal IDs, PII, env
content, Provider payloads, prompts, raw AI I/O, raw DOM, screenshots, traces, or complete
question/paper/material/resource/chunk content.

## Plan

1. Materialize this task in state, queue, and this task plan before source/test edits.
2. Add a focused unit test that expects both admin baseline filter panels to consume the shared layout primitive.
3. Run the focused unit test to capture RED before implementation.
4. Add the shared `adminFilterGridPanelClassName` primitive and replace the two duplicated inline class strings.
5. Run GREEN focused unit validation, typecheck, lint, scoped formatting, diff checks, and Module Run v2 gates.
6. Write redacted traceability, evidence, audit review, and acceptance docs.
7. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch if all gates pass.

## Planned Validation

```powershell
npx.cmd vitest run tests/unit/admin-layout-primitives-ui.test.ts
npm.cmd run typecheck
npm.cmd run lint
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md docs/05-execution-logs/task-plans/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md docs/05-execution-logs/evidence/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md docs/05-execution-logs/audits-reviews/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md docs/05-execution-logs/acceptance/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md src/components/admin/admin-layout-primitives.ts src/components/admin/CommonInteraction/AdminCommonInteractionBaseline.tsx src/components/admin/UserOrgAuthOps/AdminUserOrgAuthOpsBaseline.tsx tests/unit/admin-layout-primitives-ui.test.ts
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md docs/05-execution-logs/task-plans/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md docs/05-execution-logs/evidence/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md docs/05-execution-logs/audits-reviews/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md docs/05-execution-logs/acceptance/2026-06-29-detail-ui-tokenized-layout-primitive-candidates.md src/components/admin/admin-layout-primitives.ts src/components/admin/CommonInteraction/AdminCommonInteractionBaseline.tsx src/components/admin/UserOrgAuthOps/AdminUserOrgAuthOpsBaseline.tsx tests/unit/admin-layout-primitives-ui.test.ts
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml src/db drizzle migrations seed scripts e2e playwright-report test-results .next
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId detail-ui-tokenized-layout-primitive-candidates-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId detail-ui-tokenized-layout-primitive-candidates-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId detail-ui-tokenized-layout-primitive-candidates-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

Local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup are approved for this
task after validation passes. Release/deploy/runtime/DB/Provider/dependency/Cost Calibration gates remain blocked.

## Initial Status

- Status: `in_progress_materialized`.
- Source/test edits are limited to the writable files listed above.
- DB, Provider/AI, browser/dev server/e2e, release readiness, final Pass, and Cost Calibration remain blocked.
