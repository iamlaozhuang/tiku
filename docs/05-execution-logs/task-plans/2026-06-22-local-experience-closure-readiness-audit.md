# Task Plan: Local Experience Closure Readiness Audit

## Task

- taskId: `local-experience-closure-readiness-audit-2026-06-22`
- branch: `codex/local-experience-closure-readiness-audit-20260622`
- executionProfile: `local_experience_audit`
- scope: docs/state-only chain readiness audit for selected local experience chains.

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-system-architecture.md`
- `docs/02-architecture/adr/adr-002-backend-layering-and-api-conventions.md`
- `docs/02-architecture/adr/adr-003-ai-rag-and-provider-boundary.md`
- `docs/02-architecture/adr/adr-004-environment-and-deployment-boundary.md`
- `docs/02-architecture/adr/adr-005-staging-production-isolation.md`
- `docs/02-architecture/adr/adr-006-ai-sdk-installation-baseline.md`
- `docs/02-architecture/adr/adr-007-auth-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`

## User Direction

The user requested this serial order:

1. Process `module-run-v2-personal-ai-local-ui-browser-planning` approval.
2. Run queue hygiene / archive follow-up.
3. Enter Local Experience Closure readiness audit by experience chain without rushing new business code.
4. Return to preview owner acceptance planning with Web-only, Provider off, synthetic data, and AP-01 through AP-11 gates.

Steps 1 and 2 are already closed and pushed before this task. This task executes step 3 and performs a read-only preview
mainline recheck for step 4 only if current state already contains the preview planning packets.

## Target Chains

- `organization-training-experience`
- `ops-governance-experience`
- `retention-recovery-experience`

## Implementation Plan

1. Record a task-scoped docs/state audit entry in `task-queue.yaml`.
2. Add a project-state checkpoint that classifies each target chain without changing product code or coverage row status.
3. Add a coverage-matrix checkpoint noting that this audit does not mutate the row summary counts.
4. If the new closed audit task displaces an older terminal task from the active recovery window, archive only that
   displaced terminal task and update `task-history-index.yaml`.
5. Write evidence and audit review with validation outputs and blocked gates.
6. Validate with queue/status diagnostics, scoped Prettier, lint, typecheck, diff check, and Module Run v2 hardening gates.

## Risk Boundary

Blocked for this task:

- product source or test changes
- dev server, Browser, Playwright runtime, or e2e execution
- Provider/model calls, prompt/provider payloads, raw generated content
- env/secret reads or writes
- schema, migration, seed, database connection, or data mutation
- dependency/package/lockfile changes
- deploy, PR, force push, payment, external service
- org_auth runtime behavior changes
- raw employee answer, full paper content, plaintext redeem_code, token, DB URL, raw audit row, or raw ai_call_log evidence
- Cost Calibration Gate

## Queue Hygiene Addendum

The first post-edit project status diagnostic reported one terminal archive candidate:
`batch-280-ops-governance-and-retention-operations-facing-authorization-and-quota-go`. The task was already closed and
had been displaced by the active terminal recovery window. This plan permits archiving exactly that terminal task as part
of the same docs/state closeout to keep bridge and queue diagnostics clean.
