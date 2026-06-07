# Phase 64 Advanced Code-Stage Queue Seeding Plan Task Plan

**Task id:** `phase-64-advanced-code-stage-seeding-plan`

**Date:** 2026-06-07

## Scope

Docs-only planning for Phase 65 advanced edition code-stage queue seeding. This task defines what Phase 65 may seed and what it must not seed.

Phase 64 does not write the planned implementation-planning tasks into `task-queue.yaml`; that is reserved for Phase 65.

## Read Gates

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-56-advanced-edition-coverage-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-56-advanced-edition-coverage-audit.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-63-codex-app-readiness-follow-up.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- Advanced edition source specs and seven detailed implementation plans listed in the seeding plan.

## Allowed Files

- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-64-advanced-code-stage-seeding-plan.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-64-advanced-code-stage-seeding-plan.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-64-advanced-code-stage-seeding-plan.md`

## Blocked Scope

- Actual Phase 65 queue seeding.
- Direct product implementation tasks.
- Product code, tests, scripts, dependencies, package/lockfiles, schema, migrations, env/secret files.
- Provider cost measurement, real provider calls, staging/prod/cloud/deploy, payment, external-service actions.
- Cost Calibration Gate execution or `automation.mode` transition.

## Planning Approach

The plan should seed a conservative Phase 65 boundary:

- maximum ten planned queue entries;
- permitted task kinds: `implementation_planning`, `local_verification`, `security_review`, and `blocked_gate`;
- no direct `implementation` task entries yet;
- no dependency, schema/migration, provider, env/secret, deploy, payment, external-service, or Cost Calibration Gate execution tasks;
- required risk tags for `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log`.

## Validation Plan

- YAML parse and invariant check for the new seeding plan.
- Path existence check for source documents referenced by the plan.
- Anchor checks for task-kind boundary, blocked gates, and required terminology.
- `git diff --check`.
- Scoped Prettier check.
- Agent-system readiness.
- Git completion readiness inventory.

## Expected Outcome

Phase 64 should produce a durable plan that lets Phase 65 safely write pending planning tasks into the queue without implying direct product implementation approval.
