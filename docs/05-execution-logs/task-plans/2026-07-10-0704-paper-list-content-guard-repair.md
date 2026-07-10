# 0704 Paper List Content Guard Repair Task Plan

## Goal

Fix the Stage 4 validation finding where `ops_admin` can read the formal `paper` list through `GET /api/v1/papers`,
while preserving `content_admin` and `super_admin` access and the standard API envelope.

## Trigger

Stage 4 localhost smoke observed:

- `content_admin` can read `questions_list`, `materials_list`, and `papers_list`.
- `super_admin` can read `questions_list`, `materials_list`, and `papers_list`.
- `ops_admin` is denied from `questions_list` and `materials_list`.
- `ops_admin` was unexpectedly allowed on `papers_list`.

Only role labels, route labels, and status categories are recorded. No content payload, account material, session material,
raw DB row, internal id, or raw response body is recorded.

## Required Reads Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md`
- `src/app/api/v1/papers/route.ts`
- `src/server/services/admin-flow-runtime.ts`
- `src/server/services/admin-flow-runtime.test.ts`
- `src/server/services/paper-composition-lifecycle-runtime.ts`
- `tests/unit/phase-9-paper-composition-lifecycle-runtime.test.ts`

## Implementation Plan

1. RED: add an `admin-flow-runtime` unit test proving `ops_admin` receives `Admin permission denied` for paper collection
   reads and the repository list method is not called.
2. GREEN: add the minimal content-read role guard to `admin-flow-runtime` paper collection GET.
3. Rerun the focused admin-flow test.
4. Rerun Stage 4 targeted content tests.
5. Run lint, typecheck, `git diff --check`, scoped Prettier, and Module Run v2 gates.
6. Write redacted repair evidence and adversarial review, then commit, fast-forward merge to `master`, push, and delete the
   repair branch/worktree.

## Boundaries

- Allowed source edits:
  - `src/server/services/admin-flow-runtime.ts`
  - `src/server/services/admin-flow-runtime.test.ts`
- Allowed docs/state edits:
  - this task plan
  - `docs/05-execution-logs/evidence/2026-07-10-0704-paper-list-content-guard-repair-evidence.md`
  - `docs/05-execution-logs/audits-reviews/2026-07-10-0704-paper-list-content-guard-repair-audit.md`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
- Forbidden: package/lockfile, dependency changes, schema/migration/seed, direct DB connection, Provider execution,
  staging/prod/deploy, screenshots, raw DOM, raw content, credentials, cookie/session/token/localStorage/Auth header capture.

## Adversarial Review Focus

- `ops_admin` cannot access content authoring or formal content maintenance list data via `/api/v1/papers`.
- `content_admin` and `super_admin` retain expected access.
- The denial uses the standard `{ code, message, data }` envelope and does not leak stack traces.
- Repository access is skipped on denial.
- No sensitive evidence is written.
