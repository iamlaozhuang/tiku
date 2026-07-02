# Post Archive Recovery Smoke Plan

## Task

- Task id: `post-archive-recovery-smoke-2026-07-02`
- Branch: `codex/post-archive-recovery-smoke-2026-07-02`
- User approval: current user approved executing the post-archive recovery smoke, then committing, merging, pushing, cleaning the short branch, and preparing the next-thread prompt.
- Scope: read-only recovery smoke after the first July task queue and execution-log archive batch.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/execution-log-index.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-07.yaml`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/execution-log-archival-and-index-governance.md`
- `docs/05-execution-logs/evidence/2026-07-02-queue-and-execution-log-archive-first-batch.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-queue-and-execution-log-archive-first-batch.md`

## Implementation Steps

1. Materialize this task in `project-state.yaml` and `task-queue.yaml`.
2. Run a read-only recovery smoke from active state files through `task-history-index.yaml` and `execution-log-index.yaml`.
3. Sample 3 archived AI-generation tasks from the first July archive batch and verify each can resolve:
   - archived task queue block;
   - archived task plan;
   - archived evidence;
   - archived audit review;
   - task-history index entry;
   - execution-log index entries.
4. Count current active queue terminal/non-terminal tasks.
5. Count active execution-log Markdown files remaining in task plan, evidence, and audit review directories.
6. Record only redacted counts, paths, statuses, and pass/fail categories.
7. Write evidence and audit review.
8. Run scoped formatting, `git diff --check`, Module Run v2 pre-commit, closeout, and pre-push gates.
9. Commit, fast-forward merge to `master`, push `origin/master`, delete the merged short branch, and provide the next-thread prompt.

## Stop Conditions

- Any sampled archived task cannot resolve through both task-history and execution-log indexes.
- Any sampled archive path is missing.
- Any active non-terminal task depends on the archived first-batch candidates without index resolution.
- Any change would be needed to archive files, indexes, product source, tests, scripts, dependencies, schema, DB, Provider, browser, staging/prod, deploy, payment, Cost Calibration, release readiness, final Pass, or production usability.
- Evidence would need to expose protected data.

## Evidence Rules

Record only counts, task ids, relative paths, status categories, branch/commit facts, and validation summaries. Do not record credentials, cookies, tokens, Authorization headers, `.env*` values, DB rows, internal ids, PII, Provider payloads, prompts, AI raw text, full question/paper/material/resource/chunk content, or raw runtime artifacts.
