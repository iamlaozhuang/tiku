# Organization Training Advanced Employee Published Assignment Local Alignment Task Plan

Task id: `organization-training-advanced-employee-published-assignment-local-alignment-2026-06-25`

## Fresh Approval

User approved on 2026-06-25: create or align a published organization-training assignment for the unmatched advanced
employee's current organization, then run a focused browser rerun as the next task.

## Task Type

Local current-schema DB targeted assignment alignment. This task may write one local organization-training assignment
version row if the precheck still finds exactly one active-session advanced employee whose current organization has no
published organization-training.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-assignment-readonly-inspection.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-advanced-employee-assignment-readonly-inspection.md`

## Conflict Check

The prior read-only inspection found current-schema DB data alignment for most active-session advanced employees, but
one active-session advanced employee lacked a visible published organization-training because that employee's current
organization had no published organization-training version. This task targets only that local data gap and does not
alter source behavior.

## Allowed Scope

- Read local current-schema DB aggregate state.
- Insert a published `organization_training_version` for the unmatched current organization by copying training metadata
  from an existing published version with the same `profession` and `level`, and binding it to that organization's
  advanced org authorization.
- Record only redacted pre/post counts and status.
- Update task plan/evidence/audit plus state/queue.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Blocked Scope

- Schema/migration/Drizzle changes.
- Account creation, password reset, disablement, authorization mutation, employee mutation, or user mutation.
- Raw DB rows, public ids, account identifiers, credentials, database URLs, tokens, cookies, local/session storage,
  screenshots, traces, Provider payloads, prompts, raw generated AI content, paper/question content, or employee personal
  data in evidence.
- `.env*` reads or writes.
- Browser/runtime rerun in this task.
- Source/test/package/lockfile edits.
- Provider, Cost, staging/prod, payment, external-service, deploy, PR, force-push, or final Pass work.

## Validation Plan

- Run precheck aggregate against local current-schema DB.
- Execute guarded local SQL only when the precheck still finds exactly one unmatched active-session advanced employee and
  at least one same-profession/same-level source version.
- Run postcheck aggregate against local current-schema DB.
- `npx.cmd prettier --write --ignore-unknown` on this task's five docs/state files.
- `npx.cmd prettier --check --ignore-unknown` on this task's five docs/state files.
- `git diff --check`
- Module Run v2 pre-commit hardening and pre-push readiness.

## Rollback Boundary

The guarded SQL commits only after postcheck proves the active-session unmatched advanced employee count is zero. Any
additional rollback or destructive cleanup would require separate approval.
