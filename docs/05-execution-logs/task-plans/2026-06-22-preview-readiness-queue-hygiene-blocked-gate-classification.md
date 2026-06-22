# Preview Readiness Queue Hygiene - Blocked Gate Classification

## Task

- Task id: `preview-readiness-queue-hygiene-blocked-gate-classification`
- Scope: docs/state-only queue hygiene.
- User approval: user requested four docs/state-only serial tasks with independent commits.
- Branch: `codex/queue-hygiene-blocked-gate-classification`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`

## Mechanism Input

Active queue blocked tasks:

- 16 total `blocked` tasks.
- 6 `provider_smoke_execution` tasks.
- 10 `high_risk_approval_package` tasks.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files And Actions

- No source code, tests, schemas, migrations, dependency manifests, lockfiles, `.env*`, provider calls, browser/e2e, deployment, or database changes.
- Do not unblock or execute any provider smoke task.
- Do not convert high-risk approval packages into executable tasks.
- Do not alter org_auth runtime, payment, OCR, export, staging/prod, PR, force-push, or Cost Calibration Gate state.

## Plan

1. Classify the 16 blocked tasks by task kind and blocked capability family.
2. Record which blocked tasks are release gates versus local-preview non-blockers.
3. Close this docs/state-only classification task and archive one displaced terminal recovery-window task.
4. Validate queue slimming, project status, next action, formatting, pre-commit hardening, lint, typecheck, and whitespace.
5. Commit this task independently.

## Risk Controls

- Classification-only: no pre-existing blocked task status changes.
- Evidence contains only task IDs and sanitized capability categories.
- Provider/env/deploy/schema/payment execution remains blocked until fresh approval.
