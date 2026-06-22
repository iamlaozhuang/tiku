# Preview Readiness Queue Hygiene - Ready For Closeout Review

## Task

- Task id: `preview-readiness-queue-hygiene-ready-for-closeout-review`
- Scope: docs/state-only queue hygiene.
- User approval: user requested four docs/state-only serial tasks with independent commits.
- Branch: `codex/queue-hygiene-ready-closeout-review`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`

## Mechanism Input

After terminal archive hygiene, active queue diagnostics report:

- `queueSlimmingDecision: clean`
- `activeQueueTaskCount: 51`
- `activeQueueNonTerminalCount: 43`
- `activeQueueTerminalCount: 8`
- `archiveCandidateCount: 0`

The remaining active non-terminal set includes 27 `ready_for_closeout` task packets.

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
- Do not change the status of pre-existing `ready_for_closeout` tasks.
- Do not infer approval for high-risk closeout, schema, provider, deploy, PR, or force-push work.

## Plan

1. Inventory all active `ready_for_closeout` tasks by `taskKind`, phase, closeout policy metadata, and approval metadata.
2. Record the classification in evidence and in the task packet for this docs/state-only task.
3. Close this task locally and archive one displaced terminal recovery-window task to preserve the 8-task terminal window.
4. Validate queue slimming, next-action diagnostics, formatting, pre-commit hardening, lint, typecheck, and whitespace.
5. Commit this task independently.

## Risk Controls

- This review is classification-only for pre-existing `ready_for_closeout` tasks.
- Missing `closeoutPolicy` is recorded as metadata debt, not silently repaired.
- Sensitive evidence and raw business content remain out of docs/evidence.
