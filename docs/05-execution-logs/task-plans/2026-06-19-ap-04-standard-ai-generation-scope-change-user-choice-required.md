# AP-04 Standard AI Generation Scope Change User Choice Required Task Plan

## Task

- Task id: `ap-04-standard-ai-generation-scope-change-user-choice-required`
- Branch: `codex/ap-04-standard-ai-generation-scope-change-user-choice-required`
- Source story: user requested AP-04 product-scope user-choice-required package.
- Use case: `UC-FUTURE-STANDARD-AI-GENERATION-NON-GOAL`
- Approval package: `AP-04-STANDARD-AI-GENERATION-USER-CHOICE`

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-04-standard-ai-generation-scope-decision-detailing.md`

## Scope

Allowed files:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-19-ap-04-standard-ai-generation-scope-change-user-choice-required.md`
- `docs/05-execution-logs/evidence/2026-06-19-ap-04-standard-ai-generation-scope-change-user-choice-required.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-04-standard-ai-generation-scope-change-user-choice-required.md`

## Explicit Non-Goals

- No product scope change.
- No source, API, UI, test, e2e, or script change.
- No provider/model call, raw prompt, raw response, or raw model output.
- No Cost Calibration Gate.
- No `.env*` access.
- No DB read or write.
- No schema, migration, dependency, package, or lockfile change.
- No payment/external-service execution.
- No staging/prod/cloud/deploy.
- No formal adoption, PR, force push, destructive DB operation, or sensitive evidence collection.

## Product Choice Boundary

The existing AP-04 decision detailing exposed these options:

- A: keep standard edition AI generation as non-goal.
- B: add limited standard AI generation later.
- C: convert into advanced-only upsell.
- D: revisit after release readiness.

This task does not choose an option. It records that the selected option is `none` and that AP-04 remains blocked until
the owner chooses an option. Non-A options require a separate fresh approval with exact allowed files, commands, product
boundary, provider/cost/env boundary, validation, rollback, redaction, and stop conditions.

## Execution Plan

1. Confirm clean `master` aligned with `origin/master`.
2. Create the AP-04 short branch.
3. Seed `ap-04-standard-ai-generation-scope-change-user-choice-required` as a closed docs-state task.
4. Add evidence and audit review that preserve `future_non_goal_for_standard`.
5. Update project-state and coverage matrix so AP-04 no longer appears as an unseeded automated task.
6. Run scoped Prettier, `git diff --check`, lint, typecheck, and Module Run v2 gates.
7. Commit locally, fast-forward merge to `master`, rerun master gates, push `origin/master`, and delete the merged short
   branch.

## Stop Conditions

- Any request to select B, C, or D without a separate exact-scope fresh approval.
- Any need to edit product source, tests, e2e, scripts, schema, migrations, package files, lockfiles, provider config,
  DB data, or runtime behavior.
- Any request to run provider/model calls, Cost Calibration Gate, formal adoption, staging/prod/deploy, PR, force push,
  or sensitive evidence collection.
