# Org Advanced Analytics Runtime Summary Load Diagnostic Plan

## Task

- Task id: `org-advanced-analytics-runtime-summary-load-diagnostic-2026-06-28`
- Branch: `codex/org-advanced-analytics-runtime-summary-diagnostic-20260628`
- Task kind: `local_runtime_diagnostic`
- Execution profile: `local_read_only_browser_source_db_aggregate_diagnostic`
- Source blocker: `org-advanced-analytics-browser-rerun-after-summary-repair-2026-06-28`
- Pre-task master checkpoint: `76add72cd15afa32caa361a936d374a5fbd6ac02`

## SSOT Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-28-owner-facing-local-experience-batch.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-summary-load-failure-stage-c-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-browser-rerun-after-summary-repair.md`

## Requirement Mapping Result

- Standard owner-facing source: `docs/01-requirements/00-index.md`.
- Advanced authorization source: `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- Mandatory owner-facing checklist:
  `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`.
- Scoped row: `org_advanced_admin.organization_analytics`.
- Prior blocker: `ORG-ADV-ANALYTICS-001`.
- Diagnostic target: determine whether the remaining summary load failure is caused by frontend request state, API
  authorization/session state, service/repository behavior, or local aggregate data/schema state.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-org-advanced-analytics-runtime-summary-load-diagnostic.md`
- `docs/05-execution-logs/task-plans/2026-06-28-org-advanced-analytics-runtime-summary-load-diagnostic.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-runtime-summary-load-diagnostic.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-org-advanced-analytics-runtime-summary-load-diagnostic.md`
- `docs/05-execution-logs/acceptance/2026-06-28-org-advanced-analytics-runtime-summary-load-diagnostic.md`

## Read-Only Inputs

- Requirement, ADR, standards, and prior evidence files listed in `SSOT Read List`.
- Organization analytics route, service, repository, contract, validator, model, and focused unit test files.
- Authorization service files needed to trace session/scope flow.
- Localhost browser route/status/count evidence only.
- Local DB read-only aggregate status/count proof only if needed after source/runtime tracing.

## Blocked Files And Actions

- Source/test edits: blocked in this diagnostic task.
- UI/API mutations: blocked.
- Direct DB write, schema, migration, seed, destructive operation: blocked.
- Provider/model calls, Provider config, prompt, raw AI input/output: blocked.
- Dependency/package/lockfile changes: blocked.
- Credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents, raw DOM, screenshots,
  traces, raw DB rows, internal ids, PII, plaintext `redeem_code`: blocked from evidence.
- Staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration Gate: blocked.

## Root-Cause Plan

1. Confirm the prior blocked symptom and required checklist row.
2. Trace the frontend request path and route/API/service contracts read-only.
3. Reproduce or inspect localhost browser/API status with redacted status/count evidence only.
4. If needed, run local DB read-only aggregate proof for authorization/session/summary state.
5. Record a single root-cause hypothesis with evidence and decide whether the next task is Stage C source/test repair or
   Stage D data/schema alignment planning.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/organization-analytics-admin-entry-surface.test.ts`
- `browser-org-advanced-analytics-runtime-summary-diagnostic-read-only`
- `optional-local-db-read-only-aggregate-proof-if-needed`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-org-advanced-analytics-runtime-summary-load-diagnostic.md docs/05-execution-logs/task-plans/2026-06-28-org-advanced-analytics-runtime-summary-load-diagnostic.md docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-runtime-summary-load-diagnostic.md docs/05-execution-logs/audits-reviews/2026-06-28-org-advanced-analytics-runtime-summary-load-diagnostic.md docs/05-execution-logs/acceptance/2026-06-28-org-advanced-analytics-runtime-summary-load-diagnostic.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId org-advanced-analytics-runtime-summary-load-diagnostic-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId org-advanced-analytics-runtime-summary-load-diagnostic-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId org-advanced-analytics-runtime-summary-load-diagnostic-2026-06-28 -SkipRemoteAheadCheck`

## Closeout Policy

- Local commit: approved by current durable staged local execution authorization.
- Fast-forward merge to `master`: approved by current per-task closeout authorization.
- Push `origin/master`: approved by current per-task closeout authorization.
- Cleanup: delete merged short branch after push.
