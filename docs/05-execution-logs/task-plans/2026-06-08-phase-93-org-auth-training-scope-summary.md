# Phase 93 Org Auth Training Scope Summary Task Plan

**Task id:** `phase-93-org-auth-training-scope-summary`

**Branch:** `codex/phase-93-org-auth-training-scope-summary`

**Task kind:** `implementation`

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Phase 91 and Phase 92 local contract code and evidence

## Approved Scope

- Allowed product files:
  - `src/server/models/**`
  - `src/server/contracts/**`
  - `src/server/validators/**`
  - `src/server/services/**`
  - corresponding `*.test.ts`
- Allowed governance files:
  - this task plan
  - Phase 93 evidence
  - Phase 93 audit review
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`

## Blocked Scope

- dependency, package, or lockfile changes
- schema, migration, `src/db/schema/**`, or `drizzle/**` changes
- `scripts/**` or `e2e/**` changes
- repository, API route, or Server Action work
- provider, env/secret, staging/prod/cloud/deploy, payment, or external-service work
- real `authorization` permission model changes
- Cost Calibration Gate execution

## Objective

Create a local-only `org_auth` training scope summary read-model contract for service-layer consumers. The contract summarizes organization authorization scope, quota occupancy, and `paper` / `mock_exam` context without exposing DB rows, auto-increment ids, training content, or sensitive evidence.

## Implementation Plan

1. Add focused RED tests for `org_auth` training scope summary service and validator.
2. Add model types for local `org_auth` training scope summary input.
3. Add contract DTO types for quota, covered `organization` references, training scope, redacted `redeem_code`, `audit_log`, and `ai_call_log` references.
4. Add validator pure function that normalizes public references and rejects missing `org_auth`, invalid quota, invalid `auth_scope_type`, invalid `profession`, and empty specified organization scope.
5. Add service pure function that builds the local read-model response with `runtimeStatus: "local_contract_only"` and `contentAccessStatus: "scope_only"`.
6. Update state and task queue for Phase 93.
7. Write evidence and audit review.
8. Run required validation commands before commit.

## Test Plan

- `npm.cmd run test:unit -- src/server/services/org-auth-training-scope-summary-service.test.ts src/server/validators/org-auth-training-scope-summary.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped Prettier check for Phase 93 files
- required anchor check for `authorization`, `org_auth`, `organization`, `employee`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, `ai_call_log`, `scope_only`, `local_contract_only`, `redacted`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Stop if the implementation requires repository/database access, route handlers, Server Actions, schema/migration, dependency changes, provider/env/secret/staging/prod/cloud/deploy/payment/external-service work, `authorization` permission changes, Cost Calibration Gate execution, or evidence containing sensitive data.
- Return only public identifiers and redacted references.
- Do not return DB rows, numeric ids, organization private contact data, training content, prompt/model output, plaintext `redeem_code`, secrets, or tokens.
