# Security Unit A Dependency Package Advisory Remediation Task Plan

## Task

- Task id: `security-unit-a-dependency-package-advisory-remediation-2026-06-29`
- Branch: `codex/unit-a-dependency-advisory-20260629`
- Human approval: user authorized `Unit A: dependency/package advisory remediation`.
- Target closure item: remediate Unit A dependency and package advisory surface with isolated package and lockfile
  changes.

## Required Governance Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/**`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest Unit A approval decision package and blocked remainder evidence
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-public-advisory-lookup.md`

## Authorization And Scope

This task may change `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` only for Unit A dependency/package
advisory remediation. It may also update scoped governance docs/state/evidence files for this task.

This task must not change source, tests, e2e, scripts, DB schema, migrations, seeds, env files, runtime configuration,
Provider configuration, browser/e2e artifacts, staging/prod/cloud/deploy state, release readiness, final Pass, or Cost
Calibration.

## Dependency Gate Record

- human approval: current user message authorized Unit A dependency/package advisory remediation.
- Package manager change:
  - Package name: `pnpm`
  - Version range: `10.34.4` or newer safe patch only if required by package manager resolution
  - Change type: upgrade package manager metadata
  - Purpose: remediate public `pnpm@10.33.4` advisory matches
  - Import boundary: package manager metadata only, no runtime import
  - OSS terms compatibility: MIT-compatible package manager ecosystem
  - Alternative considered: keep `pnpm@10.33.4` and record blocker
  - Alternative rejected reason: public advisory lookup found high-priority advisory matches fixed in 10.34.x ranges
  - Abandonment risk: low
  - Security or maintenance risk: reduced by moving to fixed patch range
  - Compatibility impact: local package manager alignment required for Windows and CI
  - Bundle/runtime impact: none
  - Validation command: `corepack pnpm install --lockfile-only --ignore-scripts`,
    `corepack pnpm audit --audit-level moderate`,
    `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test:unit`
- Toolchain transitive change:
  - Package names: `vite`, `esbuild`
  - Version range: fixed ranges from public advisory lookup if lockfile update or overrides are needed
  - Change type: transitive update or override only if needed
  - Purpose: remediate dev toolchain advisory matches without source/runtime changes
  - Import boundary: dev toolchain only, no application import boundary change
  - OSS terms compatibility: MIT-compatible toolchain ecosystem
  - Alternative considered: defer toolchain advisories to separate fresh unit
  - Alternative rejected reason: user authorized Unit A covering dependency/package advisory remediation
  - Abandonment risk: low
  - Security or maintenance risk: reduced if lockfile resolves to fixed versions
  - Compatibility impact: local test toolchain may change Vite/esbuild patch behavior
  - Bundle/runtime impact: none expected for production app dependencies
  - Validation command: lint, typecheck, unit tests, and public audit validation

## Execution Steps

1. Confirm clean branch and task-scoped materialization.
2. Update package manager metadata from `pnpm@10.33.4` to a fixed 10.34.x range.
3. Refresh the lockfile with scripts disabled and no source/runtime changes.
4. If Vite/esbuild advisories remain, use the smallest package/lockfile-only remediation path.
5. Run public audit validation and local quality gates.
6. If a gate fails, reproduce narrowly and compare against the current `master` baseline before treating it as a Unit A
   regression.
7. Write redacted traceability, evidence, audit review, and acceptance docs.
8. Mark state/queue closed only after validation passes.
9. Commit the dependency package remediation as an isolated commit, fast-forward merge to `master`, push `origin/master`,
   and delete the short branch if validation passes.

## Planned Validation

```powershell
corepack pnpm install --lockfile-only --ignore-scripts
corepack pnpm install --ignore-scripts
corepack pnpm audit --audit-level moderate
corepack pnpm audit --audit-level low
corepack pnpm run lint
corepack pnpm run typecheck
corepack pnpm run test:unit
corepack pnpm exec vitest run src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts
npx.cmd prettier --write --ignore-unknown package.json pnpm-lock.yaml pnpm-workspace.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md docs/05-execution-logs/task-plans/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md docs/05-execution-logs/evidence/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md docs/05-execution-logs/audits-reviews/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md docs/05-execution-logs/acceptance/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md
npx.cmd prettier --check --ignore-unknown package.json pnpm-lock.yaml pnpm-workspace.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md docs/05-execution-logs/task-plans/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md docs/05-execution-logs/evidence/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md docs/05-execution-logs/audits-reviews/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md docs/05-execution-logs/acceptance/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md
git diff --check
git diff --name-only -- src tests e2e drizzle migrations seed scripts playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-unit-a-dependency-package-advisory-remediation-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-unit-a-dependency-package-advisory-remediation-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-unit-a-dependency-package-advisory-remediation-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

Local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup are approved by the
fresh Unit A human approval after validation passes. PR, force-push, staging/prod/cloud/deploy, release readiness, final
Pass, Cost Calibration, DB, Provider, browser/e2e, source/test/script/schema/migration/seed changes remain blocked.

## Actual Execution Update

- Dependency/package remediation was implemented in `package.json` and `pnpm-lock.yaml` only.
- Public audit validation reached `corepack pnpm audit --audit-level low` with no known vulnerabilities.
- `corepack pnpm run lint` passed after syncing local dependencies with scripts disabled.
- `corepack pnpm run typecheck` passed after syncing local dependencies with scripts disabled.
- `corepack pnpm run test:unit` failed with one focused unit baseline failure:
  `src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`.
- The same focused failure was reproduced on an isolated `master` worktree before Unit A dependency changes, so it is
  recorded as a pre-existing baseline blocker rather than a Unit A dependency regression.
- Closeout is blocked: no commit, no fast-forward merge, no push, no release/deploy/readiness/final Pass/Cost
  Calibration.

## Blocked Closeout

- Blocker: full unit gate fails because the repository test fixture for the organization advanced admin AI paper local
  contract receives permission-denied code `403011` instead of success code `0`.
- Root-cause hypothesis from code inspection: the repository test helper does not provide the service-computed
  `adminWorkspaceCapability` now required by the organization AI generation route guard.
- Next minimal task candidate:
  `security-unit-a-validation-baseline-test-fixture-repair-2026-06-29_requires_fresh_source_test_approval`.
