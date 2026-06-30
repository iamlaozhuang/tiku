# Security Unit A Validation Baseline Test Fixture Repair Task Plan

## Task

- Task id: `security-unit-a-validation-baseline-test-fixture-repair-2026-06-29`
- Branch: `codex/unit-a-dependency-advisory-20260629`
- Human approval: user authorized this exact task and limited the source change to
  `src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`.
- Parent blocker: Unit A dependency advisory remediation cannot close because the full unit gate fails on a pre-existing
  focused unit baseline failure.

## Required Governance Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-unit-a-dependency-package-advisory-remediation.md`

## Scope

Allowed implementation file:

- `src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts`

Allowed governance files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md`

Carried-forward parent Unit A files are present in the same branch and may be validated, committed, merged, and pushed
only if the combined validation passes. This task does not authorize additional package or lockfile edits.

## Root Cause Hypothesis

The repository unit test creates an organization advanced admin session without the service-computed
`adminWorkspaceCapability` now required by the organization AI generation route guard. The route therefore returns
permission-denied code `403011` instead of success code `0`.

## Implementation Plan

1. Reuse the capability shape already used by `admin-ai-generation-local-contract-route.test.ts`.
2. Add a small local helper to the repository test fixture to compute default organization workspace capability from
   `adminRoles` and `organizationPublicId`.
3. Include `adminWorkspaceCapability` only when the fixture represents an organization admin role.
4. Do not change service logic, repository logic, product behavior, package files, DB schema, migrations, scripts,
   Provider configuration, browser/e2e, staging/prod/deploy, release readiness, final Pass, or Cost Calibration.

## Planned Validation

```powershell
corepack pnpm exec vitest run src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts
corepack pnpm run test:unit
corepack pnpm run lint
corepack pnpm run typecheck
corepack pnpm audit --audit-level low
corepack pnpm exec prettier --write --ignore-unknown src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md docs/05-execution-logs/task-plans/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md docs/05-execution-logs/evidence/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md docs/05-execution-logs/audits-reviews/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md docs/05-execution-logs/acceptance/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md
corepack pnpm exec prettier --check --ignore-unknown src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md docs/05-execution-logs/task-plans/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md docs/05-execution-logs/evidence/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md docs/05-execution-logs/audits-reviews/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md docs/05-execution-logs/acceptance/2026-06-29-security-unit-a-validation-baseline-test-fixture-repair.md
git diff --check
git diff --name-only -- e2e drizzle migrations seed scripts playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-unit-a-validation-baseline-test-fixture-repair-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-unit-a-validation-baseline-test-fixture-repair-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-unit-a-validation-baseline-test-fixture-repair-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

If all validation passes, the current branch may be committed locally, fast-forward merged to `master`, pushed to
`origin/master`, and cleaned up. PR, force-push, staging/prod/cloud/deploy, release readiness, final Pass, Cost
Calibration, DB access/mutation, Provider/AI calls/configuration, browser/e2e, env/secret access, and additional package
or lockfile edits remain blocked.
