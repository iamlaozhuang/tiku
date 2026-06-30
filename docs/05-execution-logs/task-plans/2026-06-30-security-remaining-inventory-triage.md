# Security Remaining Inventory Triage Task Plan

## Task

- Task id: `security-remaining-inventory-triage-2026-06-30`
- Branch: `codex/security-remaining-inventory-triage-20260630`
- Goal: recheck the remaining security and detail optimization inventory, split executable follow-up tasks, and recommend
  the next smallest safe task.
- Mode: bounded parent-agent inventory triage, not an exhaustive Codex Security repository scan.
- Non-goals: no source/test/script/package change, no DB connection or mutation, no schema/migration/seed, no
  Provider/AI call or configuration, no env/secret/credential access, no browser/e2e/dev server, no staging/prod/cloud,
  no deployment, no release readiness, no final Pass, no Cost Calibration, no PR, no force-push.

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/open-source-introduction.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest task plan, evidence, audit, and acceptance for
  `security-followup-approval-materialization-2026-06-30`

## Writable Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-security-remaining-inventory-triage.md`
- `docs/05-execution-logs/task-plans/2026-06-30-security-remaining-inventory-triage.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-remaining-inventory-triage.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-remaining-inventory-triage.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-remaining-inventory-triage.md`

## Read-only Scope

- Governance, requirements, ADR, standards, redacted evidence/audit/acceptance/task-plan documents.
- `src/**`, `tests/**`, and `scripts/**` for static file-path and boundary review only.
- `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` for dependency/supply-chain inventory only.

## Boundaries

- DB: no database connection, no raw rows, no mutation, no schema/migration/seed, no `drizzle-kit push`.
- AI/Provider: no Provider call, no Provider configuration, no model config read/write, no prompt payload, no raw AI I/O.
- Browser: no browser runtime, no dev server, no e2e, no raw DOM, no screenshots, no traces.
- Credentials: no env, secrets, connection strings, account credentials, cookies, tokens, sessions, localStorage, or
  Authorization headers.
- Evidence: record only task ids, file paths, module names, risk categories, severity, status, counts, validation
  commands, commit/branch/merge/push/cleanup summaries, and redacted expected/observed summaries.
- Dependencies: no package or lockfile change, no install/update/remove/audit fix, no package-manager resolution, no
  lifecycle script.

## Inventory Buckets

- UI/UX detail optimization.
- Permission and role boundary.
- API contract and input validation.
- Data redaction and logs.
- AI/Provider boundary.
- DB/schema/migration risk.
- Dependency and supply-chain risk.
- Test and acceptance regression risk.

## Execution Plan

1. Confirm the centralized 1-9 approval is materialized and release/deploy/final/cost gates remain blocked.
2. Run bounded read-only static inventory using `rg` and file lists.
3. Record redacted bucket-level findings with severity and status, without raw sensitive content.
4. Split remaining follow-up work into executable task candidates with expected authorization needs.
5. Recommend the next smallest safe task.
6. Run scoped formatting, diff, blocked-path diff, and Module Run v2 validation.
7. If validation passes, commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short
   branch under `securityFollowupCentralApproval20260630`.

## Validation Commands

```powershell
rg -n "security-remaining-inventory-triage-2026-06-30|securityFollowupCentralApproval20260630|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-security-remaining-inventory-triage.md docs/05-execution-logs/acceptance/2026-06-30-security-remaining-inventory-triage.md
powershell.exe -NoProfile -Command "rg --files src tests scripts docs/05-execution-logs docs/01-requirements package.json pnpm-lock.yaml pnpm-workspace.yaml | Measure-Object"
powershell.exe -NoProfile -Command "rg -n 'authorization|permission|role|effectiveEdition|redeem_code|audit_log|ai_call_log|model_provider|prompt_template|drizzle|migrate|seed|sortBy|pageSize|console\.|logger|redact' src tests scripts docs/05-execution-logs | Measure-Object"
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-remaining-inventory-triage.md docs/05-execution-logs/task-plans/2026-06-30-security-remaining-inventory-triage.md docs/05-execution-logs/evidence/2026-06-30-security-remaining-inventory-triage.md docs/05-execution-logs/audits-reviews/2026-06-30-security-remaining-inventory-triage.md docs/05-execution-logs/acceptance/2026-06-30-security-remaining-inventory-triage.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-remaining-inventory-triage.md docs/05-execution-logs/task-plans/2026-06-30-security-remaining-inventory-triage.md docs/05-execution-logs/evidence/2026-06-30-security-remaining-inventory-triage.md docs/05-execution-logs/audits-reviews/2026-06-30-security-remaining-inventory-triage.md docs/05-execution-logs/acceptance/2026-06-30-security-remaining-inventory-triage.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-remaining-inventory-triage-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-remaining-inventory-triage-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-remaining-inventory-triage-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of the merged
short branch are approved by `securityFollowupCentralApproval20260630`.

This is not release readiness, not a final Pass, and not Cost Calibration.
