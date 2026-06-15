# Task Plan: advanced-organization-training-answer-status-alignment

## Scope

- Task: `advanced-organization-training-answer-status-alignment`
- Branch: `codex/advanced-organization-training-answer-status-alignment`
- Fresh approval: user approved execution in the current 2026-06-15 Codex thread by saying "批准执行".
- Goal: align `organizationTrainingAnswerStatusValues` with the organization training plan before any service, route,
  repository, mapper, API runtime, or UI consumes the status union.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-contract-validation-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-contract-validation-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-answer-status-alignment-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-answer-status-alignment-seeding.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.test.ts`

## Allowed Edits

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-organization-training-answer-status-alignment.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-answer-status-alignment.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-answer-status-alignment.md`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.test.ts`

## Blocked Gates

- No `.env*` read/write/output.
- No DB access, no direct row/private data read, and no private data evidence.
- No provider/model call, provider configuration, provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, route, service, repository, mapper, UI, or API runtime
  changes.
- No formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record` writes.
- No PR and no force push.

## TDD Plan

1. RED: add a unit assertion that `organizationTrainingAnswerStatusValues` is exactly
   `["in_progress", "submitted", "read_only"]`.
2. Verify RED with `npm.cmd run test:unit -- "src/server/validators/organization-training.test.ts"` and confirm the
   failure is caused by the current extra `not_started` status.
3. GREEN: remove `not_started` from `organizationTrainingAnswerStatusValues`.
4. Verify GREEN with the same scoped unit command.
5. Run full declared closeout validation.

## Risk Controls

- If a required product semantic for `not_started` is discovered, stop and report instead of expanding scope.
- Keep evidence redacted: record commands, pass/fail results, and field names only.
- Keep the change pre-runtime: no route/service/repository/schema/API/UI files.
