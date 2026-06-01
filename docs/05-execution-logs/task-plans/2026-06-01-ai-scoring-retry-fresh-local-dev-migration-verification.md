# AI Scoring Retry Fresh Local Dev Migration Verification Plan

## Summary

- Task id: `phase-21-ai-scoring-retry-fresh-local-dev-migration-verification`
- Branch: `codex/ai-scoring-retry-fresh-local-dev-migration`
- Base: `master`
- Selected option: Option 1, fresh local/dev database target.
- Goal: verify that AI scoring retry persistence migrations work on a fresh local/dev DB target without repairing the drifted DB.

## Startup Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-21-high-risk-tail-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/evidence/2026-06-01-ai-scoring-retry-local-dev-repair-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-01-ai-scoring-retry-local-dev-repair-approval-package-security-review.md`

## Approved Scope

- Update only project state, task queue, task plan, evidence, and audit/review docs.
- Read `.env.local` only as needed to locate a local/dev `DATABASE_URL`.
- Modify `.env.local` only as needed to point local/dev work to a fresh local/dev DB, without printing, copying, committing, or recording any secret value.
- Connect only to local/dev DB for secret-safe identity check, read-only verification, and reviewed Drizzle migration.
- Use project existing Drizzle migration command. Do not use `drizzle-kit push`.

## Stop Conditions

Stop and report a blocked gate if any step requires:

- raw SQL;
- drop, truncate, reset, volume reset, destructive rebuild, or destructive migration;
- migration table repair;
- `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, or `drizzle/**` modification;
- `package.json`, lockfile, dependency, or script modification;
- `.env.example` modification;
- staging/prod/cloud/deploy/real provider/external service;
- force push or unknown worktree/branch deletion.

## Execution Plan

1. Register this fresh queue task and write this plan, security review, and evidence skeleton.
2. Inspect existing project commands/config needed to run Drizzle migrate without changing package or scripts.
3. Secret-safe DB identity check:
   - read only `DATABASE_URL` from `.env.local`;
   - do not print the URL, password, host credential, or raw env line;
   - confirm the target is local/dev and fresh enough for migration verification;
   - stop if the target is not clearly local/dev.
4. Run the reviewed migration command using project existing Drizzle flow.
5. Run read-only post-migration verification for:
   - `ai_scoring_attempt` table exists;
   - `ai_scoring_attempt_status` enum/type exists;
   - migration history exists and is normal;
   - no raw prompts, student answers, model responses, provider payloads, or secrets are queried or recorded.
6. Run declared validation commands, local CI, `git diff --check`, readiness, naming, and quality gate. Because this task touches migration/runtime confidence, run `test:unit`, `test:e2e`, and `build`.
7. Record command results in evidence without secrets.
8. Commit, merge to `master`, push `master`, and clean up the merged branch as explicitly approved by the user.

## Risk Controls

- Evidence must record command names and pass/fail/blocked results, not secret values.
- `.env.local` changes remain uncommitted.
- Fresh DB creation or selection is allowed only if it uses existing non-destructive local/dev tooling and does not require raw SQL.
- If migration exposes a repository migration/schema defect, record the blocked gate and stop instead of expanding scope.
