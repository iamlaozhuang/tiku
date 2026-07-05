# 2026-07-05 Full-chain Post-acceptance Queue Cleanup Plan

## Scope

- Task id: `full-chain-post-acceptance-queue-cleanup-2026-07-05`
- Branch: `codex/full-chain-post-acceptance-queue-cleanup-2026-07-05`
- Status: closed, closeout gates passed
- Task kind: docs-only task-queue archive/index cleanup

This task runs a narrow queue cleanup batch after the local full-chain acceptance rollup. It moves exactly five terminal
task blocks from the active `task-queue.yaml` into the July task-queue archive and adds lookup entries to
`task-history-index.yaml`.

It does not move execution-log files, delete evidence, rewrite historical task semantics, start browser/runtime, connect
to DB, read private files, edit product source/tests, change schema/migration/seed/dependency files, call Provider,
touch staging/prod, run Cost Calibration, or claim release readiness, final Pass, Provider readiness, staging readiness,
production usability, or production readiness.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/execution-log-archival-and-index-governance.md`
- `docs/05-execution-logs/acceptance/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`

## Exact Queue Cleanup Batch

Archive these terminal task ids only:

1. `full-chain-scenario-12-advanced-org-admin-analytics-training-rerun-after-activity-provisioning-2026-07-05`
2. `full-chain-scenario-12-advanced-employee-activity-provisioning-2026-07-05`
3. `full-chain-scenario-12-prepush-status-alignment-2026-07-05`
4. `full-chain-scenario-12-advanced-org-admin-analytics-training-preflight-2026-07-05`
5. `full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair-2026-07-05`

## Execution Plan

1. Materialize this plan, evidence, audit, acceptance note, state, and queue task packet.
2. Run queue slimming diagnostic and record redacted aggregate counts.
3. Preserve each exact task block and append it to `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`.
4. Remove those exact task blocks from active `task-queue.yaml`.
5. Add one `task-history-index.yaml` entry for each moved task id.
6. Verify the five task ids no longer appear in active queue task blocks and do appear in archive/index.
7. Run scoped Prettier, `git diff --check`, blocked path diff, Module Run v2 pre-commit, and pre-push readiness.
8. Commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, then prepare the Provider/Cost/staging consideration package only if still appropriate.

## Evidence Rules

Allowed evidence: task id, branch, exact file paths, exact task ids moved, aggregate before/after counts, command
names/results, pass/fail/block, and redacted summaries.

Forbidden evidence: credentials, account private values, phone, email, connection strings, tokens, sessions, cookies,
localStorage, Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payloads, raw
Prompt, raw AI I/O, full material/question/paper/training content, raw employee answers, plaintext card values, or
private fixture contents.
