# docs-health-followup-queue-seeding Task Plan

## Task

- Task id: `docs-health-followup-queue-seeding`
- Branch: `codex/docs-health-followup-queue-seeding`
- Task kind: `docs_state_queue`
- Date: 2026-06-12
- Source: user-approved serial implementation plan for health audit closeout and follow-up repairs

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-health-audit-local-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-health-audit-local-baseline.md`

## Scope

Allowed files:

- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-docs-health-followup-queue-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-12-docs-health-followup-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-docs-health-followup-queue-seeding.md`

Blocked work:

- No `src/**`, `tests/**`, `e2e/**`, `package.json`, lockfile, schema, migration, env/secret, provider, deploy, payment, external-service, PR, force-push, or Cost Calibration Gate work.

## Approach

- Append pending follow-up tasks for the health audit repair sequence.
- Record task-scoped `closeoutPolicy` for local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup, using the user's fresh approval in this turn.
- Keep each follow-up task independently reviewable with explicit allowed files, blocked files, and validation commands.

## Validation Commands

- `node .\node_modules\prettier\bin\prettier.cjs --write --ignore-unknown docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-12-docs-health-followup-queue-seeding.md docs\05-execution-logs\evidence\2026-06-12-docs-health-followup-queue-seeding.md docs\05-execution-logs\audits-reviews\2026-06-12-docs-health-followup-queue-seeding.md`
- `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-12-docs-health-followup-queue-seeding.md docs\05-execution-logs\evidence\2026-06-12-docs-health-followup-queue-seeding.md docs\05-execution-logs\audits-reviews\2026-06-12-docs-health-followup-queue-seeding.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`

## Stop Conditions

- Stop if queue changes exceed the approved follow-up repair sequence.
- Stop if validation requires product code, dependencies, schema/migration, env/secret, provider, deploy, payment, external-service, e2e, PR, force-push, or Cost Calibration Gate work.
