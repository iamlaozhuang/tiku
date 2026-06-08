# Phase 87 Authorization Context Read Model Contract Implementation Plan

**Task id:** `phase-87-authorization-context-read-model-contract`

**Branch:** `codex/phase-87-authorization-context-read-model-contract`

**Task kind:** `implementation`

## Approval Boundary

The user explicitly approved Phase 87 as a low-risk, narrow code implementation slice for `advanced-authorization-context-read-model-contract`.

Allowed source files:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- corresponding `*.test.ts`

Allowed docs/state files:

- `docs/05-execution-logs/task-plans/2026-06-07-phase-87-authorization-context-read-model-contract.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-87-authorization-context-read-model-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-87-authorization-context-read-model-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files and actions:

- `.env.local`, `.env.example`
- `package.json`, `pnpm-lock.yaml`, `package-lock.yaml`, `package-lock.json`
- `src/db/schema/**`, `drizzle/**`, `scripts/**`, `e2e/**`
- dependency, schema, migration, provider, env/secret, staging/prod/cloud/deploy, payment, external-service work
- real `authorization` permission model changes, roles, permissions, quota rules, repository access, API routes, or Server Actions
- Cost Calibration Gate execution

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-85-first-implementation-slice-approval-draft.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-86-human-approval-checklist.md`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-69-advanced-authorization-context-implementation-planning.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-69-advanced-authorization-context-implementation-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-69-advanced-authorization-context-implementation-planning.md`
- Existing adjacent files under `src/server/contracts`, `src/server/models`, `src/server/validators`, and `src/server/services`

## Implementation Approach

Create a local-only advanced `authorization` context read-model that is testable in the service layer and does not access persistence.

Planned files:

- Create `src/server/models/authorization-context.ts` for local input snapshots and read-model types.
- Create `src/server/contracts/authorization-context-contract.ts` for camelCase service/API-facing DTOs.
- Create `src/server/validators/authorization-context.ts` for pure input normalization.
- Create `src/server/services/authorization-context-service.ts` for pure construction logic.
- Create focused tests next to the validator and service.

Behavior scope:

- Accept `personal_auth` or `org_auth` source snapshots.
- Fail when no usable `authorization` exists.
- Return only public ids and redacted references.
- Never expose numeric `id` fields.
- Never return cleartext `redeem_code`.
- Treat `paper` and `mock_exam` only as scope/context references.
- Treat `audit_log` and `ai_call_log` only as redacted log references.

## TDD Plan

1. Add service tests for `personal_auth`, `org_auth`, missing `authorization`, no numeric ids, no cleartext `redeem_code`, `paper`/`mock_exam` scope-only, and redacted `audit_log`/`ai_call_log`.
2. Add validator tests for normalized minimal valid input and invalid input.
3. Run focused tests and confirm RED due to missing modules.
4. Implement the smallest pure models, contract, validator, and service logic to pass.
5. Run focused tests again and then broad validation gates.

## Validation Commands

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- src/server/services/authorization-context-service.test.ts src/server/validators/authorization-context.test.ts`
- `git diff --check`
- scoped Prettier check for changed files
- required anchor check for Phase 87 evidence/audit/plan and source files
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Evidence And Review

Evidence must record:

- changed files;
- validation command output summaries;
- blocked gate statement;
- redaction check;
- residual gaps;
- no provider/env/secret/staging/prod/cloud/deploy/payment/external-service action;
- no dependency, schema, migration, repository, route, Server Action, or permission model change.

Audit review must confirm:

- scope matches approval;
- architecture boundary is preserved;
- public-facing objects use camelCase;
- no DB rows, numeric ids, plaintext `redeem_code`, full `paper`, raw answer, prompt, provider payload, or secret is exposed;
- Cost Calibration Gate remains blocked.

## Stop Conditions

Stop and report if implementation requires repository/database access, route handlers, Server Actions, schema/migration changes, dependency changes, package/lockfile changes, provider/env/secret/staging/prod/cloud/deploy/payment/external-service work, Cost Calibration Gate execution, or evidence that would reveal sensitive content.
