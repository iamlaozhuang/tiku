# Security Dev Toolchain Advisory Remediation Gate Task Plan

## Task

- Task id: `security-dev-toolchain-advisory-remediation-gate-2026-06-29`
- Branch: `codex/security-dev-toolchain-advisory-remediation-20260629`
- Goal: recheck whether current Vite/esbuild/toolchain versions still match public advisories, then apply the smallest package or lockfile remediation only if the current repository remains vulnerable.
- Non-goals: no source/test/script implementation, no DB, no Provider/AI, no browser/e2e/dev-server, no staging/prod/cloud/deploy, no release readiness, no final Pass, no Cost Calibration.

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
- `docs/05-execution-logs/task-plans/2026-06-29-security-package-manager-advisory-remediation-gate.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-package-manager-advisory-remediation-gate.md`
- `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`

## Writable Scope

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md`

## Execution Plan

1. Confirm current branch, clean base, and task boundary materialization.
2. Derive current `vite`, `esbuild`, `vitest`, and `@vitejs/plugin-react` versions from package metadata and lockfile.
3. Query public OSV and registry metadata for the current candidate versions without recording raw advisory JSON.
4. If current versions are outside affected ranges, close as no package or lockfile change needed.
5. If current versions remain vulnerable, apply only the smallest version override or package metadata change needed, then refresh lockfile with lifecycle scripts disabled.
6. Run local validation and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch only after validation passes.

## Dependency Gate Record

- Package names: `vite`, `esbuild`, `vitest`, `@vitejs/plugin-react`.
- Current versions: verify from `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` before remediation.
- Change type: upgrade, override, lockfile refresh, or no-change closure after recheck.
- Purpose: remediate or close prior Vite/esbuild dev-toolchain advisory matches.
- Import boundary: development toolchain and test runner only; no application runtime import boundary change.
- Open-source compatibility: MIT development tooling packages.
- Alternative considered: do nothing without recheck.
- Alternative rejection reason: predecessor evidence recorded Vite/esbuild advisory matches and the user explicitly authorized this gate.
- Abandonment risk: low for the Vite/esbuild toolchain.
- Security/maintenance risk: dev-server and build toolchain advisories can affect local development and test execution surfaces.
- Compatibility impact: local developer tooling and test runner lockfile resolution only; no source runtime behavior change.
- Validation command: public advisory recheck plus lint, typecheck, unit baseline, formatting, diff, and Module Run v2 gates.
- Human approval: current user authorized `security-dev-toolchain-advisory-remediation-gate-2026-06-29`.

## Validation Commands

```powershell
rg -n "vite|esbuild|vitest|@vitejs/plugin-react|overrides" package.json pnpm-lock.yaml pnpm-workspace.yaml
# public OSV query for current Vite/esbuild/toolchain candidate versions
npm.cmd view vite@current version
npm.cmd view esbuild@current version
# conditional only if remediation is required:
corepack pnpm install --lockfile-only --ignore-scripts
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test:unit
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md docs/05-execution-logs/task-plans/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md docs/05-execution-logs/evidence/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md docs/05-execution-logs/audits-reviews/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md docs/05-execution-logs/acceptance/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md
npx.cmd prettier --check --ignore-unknown package.json pnpm-lock.yaml pnpm-workspace.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md docs/05-execution-logs/task-plans/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md docs/05-execution-logs/evidence/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md docs/05-execution-logs/audits-reviews/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md docs/05-execution-logs/acceptance/2026-06-29-security-dev-toolchain-advisory-remediation-gate.md
git diff --check
git diff --name-only -- package-lock.yaml package-lock.json src tests scripts drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-dev-toolchain-advisory-remediation-gate-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-dev-toolchain-advisory-remediation-gate-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-dev-toolchain-advisory-remediation-gate-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by current user for this task after validation passes.
- Fast-forward merge target: `master`.
- Push target: `origin/master`.
- Cleanup: delete merged `codex/` branch after successful merge and push.
