# Preview Readiness Queue Hygiene - Preview Readiness Refresh

## Task

- Task id: `preview-readiness-queue-hygiene-preview-readiness-refresh`
- Scope: docs/state-only queue hygiene.
- User approval: user requested four docs/state-only serial tasks with independent commits.
- Branch: `codex/queue-hygiene-preview-readiness-refresh`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`

## Mechanism Input

Current local state before this task:

- `queueSlimmingDecision: clean`
- `activeQueueTaskCount: 51`
- `activeQueueNonTerminalCount: 43`
- `activeQueueTerminalCount: 8`
- `archiveCandidateCount: 0`
- `nextActionDecision: seed_proposal_available`
- Coverage matrix summary: 32 use cases, 21 `experience_closed`, 11 `release_blocked`.

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
- Do not claim preview release readiness.
- Do not alter coverage matrix statuses.
- Do not approve seed execution, provider/env access, staging/prod deploy, PR, force-push, or Cost Calibration Gate work.

## Plan

1. Record a project-state preview readiness queue hygiene checkpoint.
2. Close this docs/state-only refresh task and archive one displaced terminal recovery-window task.
3. Validate queue slimming, project status, next action, formatting, pre-commit hardening, lint, typecheck, and whitespace.
4. Commit this task independently.

## Risk Controls

- This checkpoint distinguishes local closure health from preview release readiness.
- Release preparation remains blocked by AP-01 through AP-11 until fresh approval or explicit scoping.
- Evidence contains no provider payload, raw answers, full paper content, secrets, tokens, or database URLs.
