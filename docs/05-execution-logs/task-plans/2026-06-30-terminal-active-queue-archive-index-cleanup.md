# Terminal active queue archive index cleanup

Task id: `terminal-active-queue-archive-index-cleanup-2026-06-30`

## Authorization

- Approval source: `current_user_requested_archive_current_six_terminal_active_queue_candidates_2026_06_30`
- Branch: `codex/terminal-active-queue-archive-cleanup-20260630`
- Scope: docs/state-only archive and index cleanup for the six pre-materialization terminal active-queue candidates.
- Closeout allowed: local commit, fast-forward merge to `master`, push to `origin/master`, and delete the short branch.

## Required Read Set

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest task plan, evidence, audit, and acceptance packet for `test-acceptance-staging-e2e-runtime-boundary-approval-package-2026-06-29`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`

## Target Archive Set

The target set is fixed from the queue-slimming diagnostic before this task was materialized:

- `blocked-gates-central-fresh-approval-package-2026-06-30`
- `post-blocked-gates-closed-task-archive-index-cleanup-2026-06-30`
- `security-dependency-deprecated-transitive-remediation-gate-2026-06-29`
- `security-dependency-script-binary-policy-gate-2026-06-29`
- `test-acceptance-provider-ai-e2e-runtime-boundary-approval-package-2026-06-29`
- `test-acceptance-db-backed-e2e-runtime-boundary-approval-package-2026-06-29`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-terminal-active-queue-archive-index-cleanup.md`
- `docs/05-execution-logs/evidence/2026-06-30-terminal-active-queue-archive-index-cleanup.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-terminal-active-queue-archive-index-cleanup.md`
- `docs/05-execution-logs/acceptance/2026-06-30-terminal-active-queue-archive-index-cleanup.md`

## Blocked Boundaries

- No source, test, package, lockfile, dependency, schema, migration, seed, or script changes.
- No DB connection, DB mutation, raw DB rows, internal IDs, PII, email, phone, or plaintext `redeem_code` evidence.
- No browser, dev-server, e2e, raw DOM, screenshot, trace, cookie, token, session, or Authorization header evidence.
- No Provider/AI call, Provider configuration, prompt, payload, or raw AI input/output.
- No env, secret, credential, connection string, or `D:/tiku-local-private/**` access.
- No staging/prod/cloud/deploy, PR, force push, release readiness, final Pass, or Cost Calibration.

## Execution Plan

1. Preserve each target task block from `task-queue.yaml` and append it to `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`.
2. Remove only those six target blocks from the active queue.
3. Update `task-history-index.yaml` with an entry for each archived task and update archive metadata.
4. Record redacted evidence, audit, and acceptance closeout.
5. Run the declared local docs/governance validation commands before commit and push.
