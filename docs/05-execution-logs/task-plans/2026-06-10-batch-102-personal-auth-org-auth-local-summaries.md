# Batch 102 Personal Auth And Org Auth Local Summaries Implementation Plan

**Task id:** `batch-102-authorization-and-access-personal-auth-and-org-auth-local-summaries`

**Branch:** `codex/batch-102-owner-recovery`

**Task kind:** `implementation`

**Goal:** Add a local-only `authorization` read model that summarizes `personal_auth` and `org_auth` sources separately without changing schema, dependencies, provider behavior, or real permission enforcement.

**Architecture:** Follow ADR-002 layering. Model files define local input, validators normalize public-reference-only data, contracts define camelCase DTOs, and services map validated input into the standard `{ code, message, data }` response envelope.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- Relevant Module Run v2 SOPs under `docs/04-agent-system/sop/`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-69-advanced-authorization-context-implementation-planning.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-69-advanced-authorization-context-implementation-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-69-advanced-authorization-context-implementation-planning.md`
- `docs/05-execution-logs/task-plans/2026-06-10-batch-101-authorization-read-model-display-contracts.md`
- `docs/05-execution-logs/evidence/batch-101-authorization-and-access-authorization-read-model-and-display-contrac.md`
- `docs/05-execution-logs/audits-reviews/batch-101-authorization-and-access-authorization-read-model-and-display-contrac.md`
- Existing `authorization-*summary` model, contract, validator, service, and test files.

## Scope

Allowed implementation files:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked surfaces:

- `.env.local`, `.env.example`
- `package.json`, lockfiles
- `src/db/schema/**`, `drizzle/**`
- Provider calls, env/secret reads, staging/prod/cloud/deploy, payment, external-service work
- Cost Calibration Gate

## Implementation Steps

1. Add failing focused tests for a new local `personal_auth` / `org_auth` summary read model.
2. Validate that the DTO uses camelCase fields, public ids only, `null` for optional organization references, and no auto-increment ids or plaintext `redeem_code`.
3. Add model, contract, validator, and service files following existing summary patterns.
4. Run focused tests until GREEN.
5. Run task validation commands with existing local tooling only.
6. Write evidence and audit review.

## Risk Defenses

- Keep `personal_auth` and `org_auth` distinct in both counts and source references.
- Do not expose numeric ids, plaintext `redeem_code`, prompt text, provider payloads, secrets, tokens, full `paper` content, or employee private answer detail.
- Do not claim real permission behavior, persistence, production enablement, or quota enforcement.
- Use standard API envelope and camelCase DTO fields.
- Cost Calibration Gate remains blocked.

## Stop Conditions

Stop before editing further if the implementation requires schema/migration work, dependency changes, provider/env/secret access, staging/prod/cloud/deploy work, real permission model changes, external services, Cost Calibration Gate execution, or files outside the allowed task scope.

## Owner Recovery Closeout Addendum

This Lane A recovery is authorized by the 2026-06-10 user instruction for `batch-102` owner recovery / closeout.

Serial recovery plan:

1. Re-check run registry, task queue, project state, evidence, audit, and c7f9 changed files.
2. Keep all edits within `batch-102` allowed files.
3. Re-run the focused local gates with the existing `D:\tiku\node_modules` only.
4. Record the broad baseline failure as advisory baseline evidence because it is outside this task's allowed file scope.
5. If focused gates and closeout readiness pass, create the Lane A local commit, fast-forward merge to `master`, push `origin/master`, and only then mark the stale active registry safe for cleanup.
6. If closeout readiness does not pass, stop and convert the registry to stopped/manual-required owner recovery without deleting the dirty owner worktree.
