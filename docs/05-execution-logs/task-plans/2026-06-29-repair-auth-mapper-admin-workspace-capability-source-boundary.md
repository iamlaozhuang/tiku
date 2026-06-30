# Repair Auth Mapper Admin Workspace Capability Source Boundary Task Plan

## Task

- Task id: `repair-auth-mapper-admin-workspace-capability-source-boundary-2026-06-29`
- Branch: `codex/auth-mapper-source-boundary-repair-20260629`
- Scope: focused source and test repair for auth mapper admin workspace capability source labeling.
- Finding: `unit-b-auth-mapper-001`
- Severity: medium.

## Required Governance Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest Unit B auth mapper source-of-truth review task plan, evidence, audit, acceptance, and traceability
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`

## Authorization And Boundaries

This task consumes `detailSecurityLocalContinuationApproval20260629` for
`local_low_or_medium_confirmed_minimal_source_and_test_repairs`.

Allowed behavior:

- Repair only the auth mapper source boundary that labels role-derived organization capability as service-computed.
- Add or adjust focused unit tests proving the mapper no longer turns role-derived session data into trusted
  `service_computed` `org_auth` advanced capability.
- Update scoped governance docs/state/evidence/audit/acceptance/traceability.

Blocked behavior:

- No DB connection, raw row read, mutation, schema, migration, or seed.
- No Provider/AI call, Provider configuration, prompt, payload, raw AI I/O, or model config change.
- No browser/dev-server/e2e/raw DOM/screenshot/trace.
- No credential, cookie, token, session, localStorage, Authorization header, env, secret, or connection string access or
  evidence.
- No package, lockfile, or dependency change.
- No staging/prod/cloud/deploy, release readiness, final Pass, PR, force-push, or Cost Calibration.

## Allowed Files

- `src/server/mappers/auth-mapper.ts`
- `src/server/mappers/auth-mapper.test.ts`
- `tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md`
- `docs/05-execution-logs/task-plans/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md`
- `docs/05-execution-logs/acceptance/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md`

## Planned Implementation

1. Add a focused mapper test that captures the current RED: an `org_advanced_admin` row without source authorization facts
   must not produce a trusted `service_computed` advanced `org_auth` capability.
2. Change `mapAdminWorkspaceCapabilityToApi` so role-derived organization workspace summaries are explicit
   `session_fallback` summaries with no verified `org_auth` source and no advanced workspace capability.
3. Update the existing organization admin source contract test to expect fallback behavior from session mapper output.
4. Keep downstream guard behavior unchanged: only real `service_computed` `org_auth` summaries remain trusted by route and
   UI access helpers.

## Validation

```powershell
npx.cmd vitest run src/server/mappers/auth-mapper.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts
npm.cmd run lint
npm.cmd run typecheck
npx.cmd prettier --write --ignore-unknown src/server/mappers/auth-mapper.ts src/server/mappers/auth-mapper.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md docs/05-execution-logs/task-plans/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md docs/05-execution-logs/evidence/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md docs/05-execution-logs/acceptance/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md
npx.cmd prettier --check --ignore-unknown src/server/mappers/auth-mapper.ts src/server/mappers/auth-mapper.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md docs/05-execution-logs/task-plans/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md docs/05-execution-logs/evidence/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md docs/05-execution-logs/acceptance/2026-06-29-repair-auth-mapper-admin-workspace-capability-source-boundary.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml src/db drizzle migrations seed e2e scripts playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId repair-auth-mapper-admin-workspace-capability-source-boundary-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId repair-auth-mapper-admin-workspace-capability-source-boundary-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId repair-auth-mapper-admin-workspace-capability-source-boundary-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

If all validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and cleanup of the
merged short branch are approved by the materialized centralized local repair closeout policy.

This is not release readiness, not a final Pass, and not Cost Calibration.
