# Security Dependency Deprecated Transitive Review Task Plan

## Task

- Task id: `security-dependency-deprecated-transitive-review-2026-06-29`
- Branch: `codex/security-dependency-deprecated-transitive-review-20260629`
- Goal: review deprecated transitive dependency entries already present in `pnpm-lock.yaml` and split any remediation into separately gated tasks.
- Non-goals: no dependency install, no package or lockfile change, no public advisory lookup, no source/test fix, no browser runtime, no DB connection, no provider/AI call, no release readiness/final Pass/Cost Calibration claim.

## Required Governance Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/open-source-introduction.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/01-requirements/traceability/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-db-migration-policy-reconciliation.md`

## Writable Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-dependency-deprecated-transitive-review.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-dependency-deprecated-transitive-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-deprecated-transitive-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-deprecated-transitive-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-dependency-deprecated-transitive-review.md`

## Read-Only Scope

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- Governance, standards, ADR, SOP, state/queue, predecessor task-plan/evidence/audit/acceptance/traceability files listed above.

## Blocked Scope

- `.env*`, credentials, cookies, tokens, sessions, localStorage, Authorization headers, connection strings, registry tokens, private package registry URLs.
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` modification.
- Dependency install/update/remove/audit fix/package manager mutation.
- Network advisory lookup, registry metadata lookup, package download.
- Source, test, migration, seed, drizzle, schema, browser, provider, AI runtime, staging/prod/cloud, release deployment.

## Evidence Rules

- Allowed: package name, version, dependency area, deprecated status, risk category, severity, follow-up task id, validation command, commit/branch/merge/push/cleanup summary.
- Forbidden: raw advisory payloads, install logs with tokens, env values, connection strings, credentials, raw DOM/screenshots/traces, raw DB rows/internal IDs/PII, provider prompts or raw AI input/output, full question/paper/material/resource/chunk content.

## Execution Steps

1. Confirm branch, clean base, current `master`/`origin/master` checkpoint, and task-scoped state/queue materialization.
2. Inspect `pnpm-lock.yaml` for existing `deprecated:` entries without changing it.
3. Map deprecated entries to local manifest context using `package.json` and `pnpm-workspace.yaml` read-only only.
4. Classify risk from local evidence only and explicitly defer current CVE/GHSA status to the separately materialized public advisory lookup task.
5. Write traceability, evidence, audit/review, and acceptance docs with redacted summaries only.
6. Mark this task closed in `project-state.yaml` and `task-queue.yaml` only after validation passes.
7. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch only under the materialized closeout policy.

## Validation Commands

```powershell
rg -n "deprecated:" pnpm-lock.yaml
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-dependency-deprecated-transitive-review.md docs/05-execution-logs/task-plans/2026-06-29-security-dependency-deprecated-transitive-review.md docs/05-execution-logs/evidence/2026-06-29-security-dependency-deprecated-transitive-review.md docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-deprecated-transitive-review.md docs/05-execution-logs/acceptance/2026-06-29-security-dependency-deprecated-transitive-review.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-dependency-deprecated-transitive-review.md docs/05-execution-logs/task-plans/2026-06-29-security-dependency-deprecated-transitive-review.md docs/05-execution-logs/evidence/2026-06-29-security-dependency-deprecated-transitive-review.md docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-deprecated-transitive-review.md docs/05-execution-logs/acceptance/2026-06-29-security-dependency-deprecated-transitive-review.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-dependency-deprecated-transitive-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-dependency-deprecated-transitive-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-dependency-deprecated-transitive-review-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_materialization`.
- Fast-forward merge target: `master`, approved by the same task-scoped closeout policy.
- Push target: `origin/master`, approved by the same task-scoped closeout policy.
- Cleanup: delete short branch after successful merge/push.
