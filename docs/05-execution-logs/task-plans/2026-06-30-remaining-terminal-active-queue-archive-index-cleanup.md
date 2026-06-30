# Remaining terminal active queue archive index cleanup

Task id: `remaining-terminal-active-queue-archive-index-cleanup-2026-06-30`

## Authorization

- Approval source: `current_user_approved_remaining_terminal_archive_candidate_execution_2026_06_30`
- Branch: `codex/remaining-terminal-archive-cleanup-20260630`
- Scope: docs/state-only archive and index cleanup for the remaining terminal active-queue candidate set needed to clear
  the queue-slimming diagnostic.
- Closeout allowed: local commit, fast-forward merge to `master`, push to `origin/master`, and delete the short branch.

## Required Read Set

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest task plan, evidence, audit, and acceptance packet for `terminal-active-queue-archive-index-cleanup-2026-06-30`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`

## Target Archive Set

The first target was fixed from the queue-slimming diagnostic before this task was materialized. The second target was
materialized before movement because the first cleanup task itself became a terminal recovery-window candidate after the
new current task was inserted.

- `test-acceptance-staging-e2e-runtime-boundary-approval-package-2026-06-29`
- `terminal-active-queue-archive-index-cleanup-2026-06-30`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-remaining-terminal-active-queue-archive-index-cleanup.md`
- `docs/05-execution-logs/evidence/2026-06-30-remaining-terminal-active-queue-archive-index-cleanup.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-remaining-terminal-active-queue-archive-index-cleanup.md`
- `docs/05-execution-logs/acceptance/2026-06-30-remaining-terminal-active-queue-archive-index-cleanup.md`

## Blocked Boundaries

- No source, test, package, lockfile, dependency, schema, migration, seed, or script changes.
- No DB connection, DB mutation, raw DB rows, internal IDs, PII, email, phone, or plaintext `redeem_code` evidence.
- No browser, dev-server, e2e, raw DOM, screenshot, trace, cookie, token, session, or Authorization header evidence.
- No Provider/AI call, Provider configuration, prompt, payload, or raw AI input/output.
- No env, secret, credential, connection string, or `D:/tiku-local-private/**` access.
- No staging/prod/cloud/deploy, PR, force push, release readiness, final Pass, or Cost Calibration.

## Execution Plan

1. Preserve the target task blocks from `task-queue.yaml` and append them to `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`.
2. Remove only those target blocks from the active queue.
3. Update `task-history-index.yaml` with entries for the archived tasks and update archive metadata.
4. Record redacted evidence, audit, and acceptance closeout.
5. Run the declared local docs/governance validation commands before commit and push.
