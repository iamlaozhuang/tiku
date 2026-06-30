# Local Security Static Inventory Refresh Task Plan

## Task

- Task id: `local-security-static-inventory-refresh-2026-06-30`
- Branch: `codex/local-security-static-inventory-refresh-20260630`
- Goal: refresh the local static security inventory using docs/state and source-read-only review, then split any
  confirmed candidates into future scoped tasks without repairing source in this task.
- Result: `pass_local_security_static_inventory_refreshed_candidates_split_no_runtime_or_source_repair`
- Non-goals: no source/test/package edits, no DB connection or mutation, no schema/migration/seed, no Provider/AI call
  or configuration, no env/secret/credential access, no browser/e2e/dev server, no staging/prod/cloud/deploy, no release
  readiness, no final Pass, no Cost Calibration, no PR, and no force-push.

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest post detail/security next scope approval package task plan, evidence, audit review, and acceptance.
- `codex-security:security-scan` skill guidance for discipline only; the exhaustive scan workflow is not executed in
  this task because the approved scope is a governance static inventory, not a full scan artifact workflow.

## Writable Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-local-security-static-inventory-refresh.md`
- `docs/05-execution-logs/task-plans/2026-06-30-local-security-static-inventory-refresh.md`
- `docs/05-execution-logs/evidence/2026-06-30-local-security-static-inventory-refresh.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-local-security-static-inventory-refresh.md`
- `docs/05-execution-logs/acceptance/2026-06-30-local-security-static-inventory-refresh.md`

## Read-Only Source Scope

- `src/app/**`
- `src/server/**`
- `src/features/**`
- `src/components/**`
- `tests/unit/**`

## Boundaries

- Source/test/package writes: blocked.
- DB: no database connection, no raw rows, no mutation, no schema/migration/seed, no `drizzle-kit push`.
- AI/Provider: no Provider call, no Provider configuration, no model config read/write, no prompt payload, no raw AI I/O.
- Browser: no browser runtime, no dev server, no e2e, no raw DOM, no screenshots, no traces.
- Credentials: no env, secrets, connection strings, account credentials, cookies, tokens, sessions, localStorage, or
  Authorization headers.
- Release: no staging/prod/cloud/deploy, no release readiness, no final Pass, no Cost Calibration.
- Dependencies: no package or lockfile change, no install/update/remove/audit-fix, no registry lookup, no lifecycle
  script.
- Evidence: task IDs, file paths, surface categories, statuses, counts, candidate task summaries, validation commands,
  and commit/branch/merge/push/cleanup summaries only.

## Inventory Plan

1. Confirm this task is materialized in state, queue, and task plan.
2. Map static surfaces across API, services, repositories, validators, mappers, UI-facing features, and focused tests.
3. Review only file paths, boundary patterns, and redacted risk categories; do not record raw payloads or sensitive data.
4. Classify outcomes as closed/noop, candidate task split, fresh approval required, or still blocked.
5. Produce traceability, evidence, audit review, and acceptance.
6. Run declared validation, then commit, fast-forward merge, push, and cleanup if validation passes.

## Inventory Outcome

- `sourceReadOnlyPathCount`: 987
- `apiEnvelopeSurfaceFileCount`: 43
- `authRoleSurfaceFileCount`: 497
- `browserStorageAuthHeaderSurfaceFileCount`: 411
- `redactionAuditSurfaceFileCount`: 425
- `aiProviderSurfaceFileCount`: 248
- `dbQueryConstructionSurfaceFileCount`: 181

Candidate task split:

- `security-provider-metadata-redaction-allowlist-repair-2026-06-30`
- `security-log-list-query-filter-boundary-hardening-2026-06-30`
- `security-local-automation-session-storage-boundary-review-2026-06-30`

Next recommended task: `security-provider-metadata-redaction-allowlist-repair-2026-06-30`.

## Validation Commands

```powershell
rg -n "local-security-static-inventory-refresh-2026-06-30|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-local-security-static-inventory-refresh.md docs/05-execution-logs/acceptance/2026-06-30-local-security-static-inventory-refresh.md
rg -n "sourceReadOnly: true|noRuntimeExecution: true|candidateTaskSplit|staticInventoryRefresh" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-local-security-static-inventory-refresh.md docs/01-requirements/traceability/2026-06-30-local-security-static-inventory-refresh.md
powershell.exe -NoProfile -Command '$paths = @("src/app","src/server","src/features","src/components","tests/unit") | Where-Object { Test-Path -LiteralPath $_ }; (rg --files @paths | Measure-Object).Count'
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-local-security-static-inventory-refresh.md docs/05-execution-logs/task-plans/2026-06-30-local-security-static-inventory-refresh.md docs/05-execution-logs/evidence/2026-06-30-local-security-static-inventory-refresh.md docs/05-execution-logs/audits-reviews/2026-06-30-local-security-static-inventory-refresh.md docs/05-execution-logs/acceptance/2026-06-30-local-security-static-inventory-refresh.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-local-security-static-inventory-refresh.md docs/05-execution-logs/task-plans/2026-06-30-local-security-static-inventory-refresh.md docs/05-execution-logs/evidence/2026-06-30-local-security-static-inventory-refresh.md docs/05-execution-logs/audits-reviews/2026-06-30-local-security-static-inventory-refresh.md docs/05-execution-logs/acceptance/2026-06-30-local-security-static-inventory-refresh.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env package-lock.yaml package-lock.json
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-security-static-inventory-refresh-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId local-security-static-inventory-refresh-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-security-static-inventory-refresh-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of the merged
short branch are approved by `current_user_message_follow_recommendation_2026_06_30`.

This is not release readiness, not a final Pass, and not Cost Calibration.
