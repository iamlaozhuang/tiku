# Phase 67 Automation Readiness Scorecard Task Plan

**Task id:** `phase-67-automation-readiness-scorecard`

**Date:** 2026-06-07

## Scope

Docs-only automation readiness scorecard after Phase 59-66. This task evaluates whether the project can proceed to a final mode transition proposal/audit. It does not change `automation.mode`.

## Read Gates

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/04-agent-system/sop/automation-readiness-scorecard-and-mode-transition-governance.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-65-advanced-code-stage-queue-seeding-execution.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-66-local-implementation-readiness-gate.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-07-phase-67-automation-readiness-scorecard.md`
- `docs/05-execution-logs/evidence/2026-06-07-phase-67-automation-readiness-scorecard.md`
- `docs/05-execution-logs/audits-reviews/2026-06-07-phase-67-automation-readiness-scorecard.md`

## Blocked Scope

- Changing `automation.mode`.
- Seeding additional code-stage tasks.
- Product code, tests, scripts, dependencies, package/lockfiles, schema, migrations, env/secret files.
- Provider cost measurement, real provider calls, staging/prod/cloud/deploy, payment, external-service actions.
- Cost Calibration Gate execution.

## Scorecard Approach

Score the required dimensions:

- governance stack;
- task queue health;
- project state health;
- Git closeout health;
- validation health;
- evidence hygiene;
- tool readiness;
- recovery readiness;
- risk gate isolation;
- approval clarity.

## Validation Plan

- `git diff --check`.
- Scoped Prettier check.
- Anchor checks for scorecard sections, verdict, mode label, blocked gates, and project terms.
- Agent-system readiness.
- Git completion readiness inventory.

## Expected Outcome

Phase 67 should recommend whether Phase 68 can create the final mode transition proposal/audit for `local_auto_candidate`, while preserving `semi_auto` until explicit approval.
