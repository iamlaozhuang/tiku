# Security Dependency Public Advisory Lookup Task Plan

## Task

- Task id: `security-dependency-public-advisory-lookup-2026-06-29`
- Branch: `codex/security-dependency-public-advisory-lookup-20260629`
- Goal: check current public CVE/GHSA/advisory status for the scoped dependency set without installing, updating, fixing, refreshing locks, executing scripts, or changing dependencies.
- Non-goals: no dependency install/update/remove/audit fix, no package or lockfile change, no package download, no source/test fix, no browser runtime, no DB connection, no provider/AI call, no release readiness/final Pass/Cost Calibration claim.

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
- `docs/05-execution-logs/task-plans/2026-06-29-security-dependency-deprecated-transitive-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-deprecated-transitive-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-deprecated-transitive-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-dependency-deprecated-transitive-review.md`
- `docs/01-requirements/traceability/2026-06-29-security-dependency-deprecated-transitive-review.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-dependency-install-script-binary-surface-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-install-script-binary-surface-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-install-script-binary-surface-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-dependency-install-script-binary-surface-review.md`
- `docs/01-requirements/traceability/2026-06-29-security-dependency-install-script-binary-surface-review.md`

## Writable Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-dependency-public-advisory-lookup.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-dependency-public-advisory-lookup.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-public-advisory-lookup.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-public-advisory-lookup.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-dependency-public-advisory-lookup.md`

## Read-Only Scope

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- Governance, standards, ADR, SOP, state/queue, predecessor task-plan/evidence/audit/acceptance/traceability files listed above.

## Network Boundary

- Allowed: public, read-only advisory lookup against OSV public advisory database, GitHub Advisory Database public pages, and NVD public pages for CVE cross-reference.
- Blocked: package download, dependency install/update/remove, audit fix, lockfile refresh, private registry access, registry token use, env/secret reading, raw advisory payload evidence, package manager audit commands that create raw JSON evidence, browser runtime, Provider runtime, DB runtime, and release/deploy work.

## Evidence Rules

- Allowed: package name, version, advisory id, public source link, severity, status, count, risk category, follow-up task id, validation command, commit/branch/merge/push/cleanup summary.
- Forbidden: raw advisory JSON/payloads, tokenized URLs, install logs, env values, connection strings, credentials, raw DOM/screenshots/traces, raw DB rows/internal IDs/PII, provider prompts or raw AI input/output, full question/paper/material/resource/chunk content.

## Scoped Package Set

- Direct runtime dependencies from `package.json`.
- Direct development dependencies from `package.json`.
- Prior flagged deprecated transitive packages from `security-dependency-deprecated-transitive-review-2026-06-29`.
- Prior flagged install-script/binary surface packages from `security-dependency-install-script-binary-surface-review-2026-06-29`.

This is not a full 1163-entry transitive audit and must not be described as one.

## Execution Steps

1. Confirm branch, clean base, current `master`/`origin/master` checkpoint, and task-scoped state/queue/task-plan materialization.
2. Build the scoped package/version list from already-read manifest/lockfile context without changing package or lock files.
3. Perform public advisory lookups only under the network boundary above.
4. Record redacted advisory status, source links, severity, counts, limitations, and non-actions.
5. Split any remediation into separately materialized dependency gate tasks requiring fresh approval.
6. Write traceability, evidence, audit/review, and acceptance docs with redacted summaries only.
7. Mark this task closed in `project-state.yaml` and `task-queue.yaml` only after validation passes.
8. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch only under the materialized closeout policy.

## Validation Commands

```powershell
rg -n "OSV|GitHub Advisory|NVD|GHSA|CVE|advisory" docs/05-execution-logs/evidence/2026-06-29-security-dependency-public-advisory-lookup.md docs/01-requirements/traceability/2026-06-29-security-dependency-public-advisory-lookup.md
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-dependency-public-advisory-lookup.md docs/05-execution-logs/task-plans/2026-06-29-security-dependency-public-advisory-lookup.md docs/05-execution-logs/evidence/2026-06-29-security-dependency-public-advisory-lookup.md docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-public-advisory-lookup.md docs/05-execution-logs/acceptance/2026-06-29-security-dependency-public-advisory-lookup.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-dependency-public-advisory-lookup.md docs/05-execution-logs/task-plans/2026-06-29-security-dependency-public-advisory-lookup.md docs/05-execution-logs/evidence/2026-06-29-security-dependency-public-advisory-lookup.md docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-public-advisory-lookup.md docs/05-execution-logs/acceptance/2026-06-29-security-dependency-public-advisory-lookup.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-dependency-public-advisory-lookup-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-dependency-public-advisory-lookup-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-dependency-public-advisory-lookup-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_network_read_only_materialization`.
- Fast-forward merge target: `master`, approved by the same task-scoped closeout policy.
- Push target: `origin/master`, approved by the same task-scoped closeout policy.
- Cleanup: delete short branch after successful merge/push.
