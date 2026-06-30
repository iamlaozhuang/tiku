# Security Package Manager Advisory Remediation Gate Task Plan

## Task

- Task id: `security-package-manager-advisory-remediation-gate-2026-06-29`
- Branch: `codex/package-manager-advisory-remediation-20260629`
- Goal: recheck whether the current declared `pnpm` package-manager version still matches public advisories, then apply the smallest package metadata remediation only if the issue still exists.
- Non-goals: no source/test/script implementation, no lockfile refresh, no dependency install/update/remove/audit fix, no lifecycle script execution, no DB, no Provider/AI, no browser/e2e/dev-server, no staging/prod/cloud/deploy, no release readiness, no final Pass, no Cost Calibration.

## Required Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/open-source-introduction.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-security-dependency-public-advisory-lookup.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-public-advisory-lookup.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-public-advisory-lookup.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-dependency-public-advisory-lookup.md`
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` as read-only dependency context before any package metadata change.

## Writable Scope

- `package.json`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-package-manager-advisory-remediation-gate.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-package-manager-advisory-remediation-gate.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-package-manager-advisory-remediation-gate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-package-manager-advisory-remediation-gate.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-package-manager-advisory-remediation-gate.md`

## Execution Plan

1. Confirm current branch, clean base, and task boundary materialization.
2. Read the current declared `packageManager` version from `package.json`.
3. Query public advisory status for the current `pnpm` version without recording raw advisory JSON.
4. If the current version is not vulnerable, close as no package metadata change needed.
5. If the current version remains vulnerable, update only `package.json` `packageManager` to the smallest public fixed `pnpm` version and recheck advisories.
6. Run local validation and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch only after validation passes.

## Dependency Gate Record

- Package name: `pnpm`
- Current declared version: `10.34.4`
- Change type: upgrade or no-change closure after recheck.
- Purpose: remediate or close prior package-manager advisory matches.
- Import boundary: package-manager metadata only; no application runtime import.
- Open-source compatibility: MIT package-manager tooling.
- Alternative considered: do nothing without recheck.
- Alternative rejection reason: prior evidence recorded high-severity package-manager advisory matches and user explicitly authorized recheck before repair.
- Abandonment risk: low for `pnpm`.
- Security/maintenance risk: package manager controls dependency resolution and lockfile handling.
- Compatibility impact: local developer tooling only; no app runtime bundle impact.
- Validation command: public advisory recheck plus lint, typecheck, unit baseline, formatting, diff, and Module Run v2 gates.
- Human approval: current user authorized `security-package-manager-advisory-remediation-gate-2026-06-29`.

## Validation Commands

```powershell
rg -n packageManager package.json
# public OSV query for current declared pnpm packageManager version
corepack pnpm --version
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npx.cmd prettier --write --ignore-unknown package.json docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-package-manager-advisory-remediation-gate.md docs/05-execution-logs/task-plans/2026-06-29-security-package-manager-advisory-remediation-gate.md docs/05-execution-logs/evidence/2026-06-29-security-package-manager-advisory-remediation-gate.md docs/05-execution-logs/audits-reviews/2026-06-29-security-package-manager-advisory-remediation-gate.md docs/05-execution-logs/acceptance/2026-06-29-security-package-manager-advisory-remediation-gate.md
npx.cmd prettier --check --ignore-unknown package.json docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-package-manager-advisory-remediation-gate.md docs/05-execution-logs/task-plans/2026-06-29-security-package-manager-advisory-remediation-gate.md docs/05-execution-logs/evidence/2026-06-29-security-package-manager-advisory-remediation-gate.md docs/05-execution-logs/audits-reviews/2026-06-29-security-package-manager-advisory-remediation-gate.md docs/05-execution-logs/acceptance/2026-06-29-security-package-manager-advisory-remediation-gate.md
git diff --check
git diff --name-only -- pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src tests scripts drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-package-manager-advisory-remediation-gate-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-package-manager-advisory-remediation-gate-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-package-manager-advisory-remediation-gate-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by current user for this task after validation passes.
- Fast-forward merge target: `master`.
- Push target: `origin/master`.
- Cleanup: delete merged `codex/` branch after successful merge and push.
