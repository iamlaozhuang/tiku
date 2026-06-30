# Security Auth Role Boundary Follow-up Candidate Plan

- Task id: `security-auth-role-boundary-followup-candidate-2026-06-30`
- Branch: `codex/security-auth-role-boundary-recheck-20260630`
- Mode: local static and focused unit recheck.
- Default action: no source or test repair unless a current actionable issue is confirmed and a narrower repair scope is materialized first.
- Cost Calibration Gate remains blocked.

## Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest security follow-up approval, remaining inventory, log redaction candidate closeout, Unit B auth role review, Unit B auth mapper review, and auth mapper repair evidence.

Repository `SECURITY.md` was not found by the local policy gate. This is recorded as a proof gap; this task uses `AGENTS.md`, ADRs, state/queue, and existing security evidence as policy basis.

## Goal

Recheck the current auth and role boundary after the already closed organization capability-source and auth mapper repairs. If no current actionable issue is confirmed, close this candidate without source or test changes and recommend the next smallest approved task.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-30-security-auth-role-boundary-followup-candidate.md`
- `docs/05-execution-logs/task-plans/2026-06-30-security-auth-role-boundary-followup-candidate.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-auth-role-boundary-followup-candidate.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-auth-role-boundary-followup-candidate.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-auth-role-boundary-followup-candidate.md`

## Read-only Source/Test Scope

- `src/server/mappers/auth-mapper.ts`
- `src/server/mappers/auth-mapper.test.ts`
- `src/server/contracts/auth-contract.ts`
- `src/server/services/admin-workspace-role-guard-service.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/server/services/organization-analytics-route.ts`
- `src/server/services/organization-analytics-route.test.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`
- `src/features/admin/organization-workspace/admin-organization-workspace-access.ts`
- `tests/unit/admin-workspace-role-guard-contract.test.ts`
- `tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`

## Blocked Files And Actions

- No writes to `src/**`, `tests/**`, `scripts/**`, `src/db/**`, `drizzle/**`, `migrations/**`, `seed/**`, package or lockfiles, `.env*`, e2e outputs, browser traces, or local private input paths.
- No DB connection, raw rows, mutation, schema, migration, seed, or `drizzle-kit push`.
- No Provider/AI call, Provider configuration, model config read/write, prompt payload, or raw AI I/O.
- No browser/dev-server/e2e/raw DOM/screenshot/trace.
- No credential, cookie, token, session, localStorage, Authorization header, env, secret, or connection string access or evidence.
- No staging/prod/cloud/deploy, release readiness, final Pass, Cost Calibration, PR, force-push, or unauthorized dependency change.

## Validation Commands

```powershell
rg -n "security-auth-role-boundary-followup-candidate-2026-06-30|securityFollowupCentralApproval20260630|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-security-auth-role-boundary-followup-candidate.md docs/05-execution-logs/acceptance/2026-06-30-security-auth-role-boundary-followup-candidate.md
rg -n "session_fallback|service_computed|org_auth|effectiveEdition|capability|require.*Capability|resolve.*Admin|createAdminWorkspaceRoleGuard" src/server/mappers/auth-mapper.ts src/server/contracts/auth-contract.ts src/server/services/admin-workspace-role-guard-service.ts src/server/services/organization-training-route.ts src/server/services/organization-analytics-route.ts src/server/services/admin-ai-generation-local-contract-route.ts src/features/admin/organization-workspace/admin-organization-workspace-access.ts src/server/mappers/auth-mapper.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts src/server/services/organization-training-route.test.ts src/server/services/organization-analytics-route.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts
npx.cmd vitest run src/server/mappers/auth-mapper.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts src/server/services/organization-training-route.test.ts src/server/services/organization-analytics-route.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-auth-role-boundary-followup-candidate.md docs/05-execution-logs/task-plans/2026-06-30-security-auth-role-boundary-followup-candidate.md docs/05-execution-logs/evidence/2026-06-30-security-auth-role-boundary-followup-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-security-auth-role-boundary-followup-candidate.md docs/05-execution-logs/acceptance/2026-06-30-security-auth-role-boundary-followup-candidate.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-30-security-auth-role-boundary-followup-candidate.md docs/05-execution-logs/task-plans/2026-06-30-security-auth-role-boundary-followup-candidate.md docs/05-execution-logs/evidence/2026-06-30-security-auth-role-boundary-followup-candidate.md docs/05-execution-logs/audits-reviews/2026-06-30-security-auth-role-boundary-followup-candidate.md docs/05-execution-logs/acceptance/2026-06-30-security-auth-role-boundary-followup-candidate.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-auth-role-boundary-followup-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-auth-role-boundary-followup-candidate-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-auth-role-boundary-followup-candidate-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If declared validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and deletion of the merged `codex/` short branch are approved by `securityFollowupCentralApproval20260630`.

PR creation and force-push remain forbidden.
