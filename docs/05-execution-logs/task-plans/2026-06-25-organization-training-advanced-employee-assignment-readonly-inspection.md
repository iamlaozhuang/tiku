# Organization Training Advanced Employee Assignment Read-Only Inspection Task Plan

Task id: `organization-training-advanced-employee-assignment-readonly-inspection-2026-06-25`

## Task Type

Read-only local diagnostic with redacted evidence.

## Fresh Approval

User approved this task on 2026-06-25:

`批准执行 organization-training-advanced-employee-assignment-readonly-inspection-2026-06-25，仅限本地只读 DB/seed/account assignment inspection，证据脱敏 counts/status，不允许写入、schema/migration、账号变更或 raw rows。`

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-assignment-readonly-inspection-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-advanced-employee-assignment-readonly-inspection-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-25-organization-training-employee-visible-scope-post-repair-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-employee-visible-scope-post-repair-browser-rerun.md`

## Read-Only Code/Data Shape Sources

- `compose.yaml`
- `src/db/dev-seed.ts`
- `src/db/schema/auth.ts`
- `src/db/schema/organization-training.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-service.ts`

## Conflict Check

The browser rerun shows `org_advanced_employee` can discover the `企业训练` entry, but the organization-training page has
no training row, no number input, and no row action. The preceding source repair made the repository include employee
visible organization scope when checking `publish_scope_snapshot.organizationPublicIds`.

This task resolves whether the remaining blocker is data/assignment state rather than source behavior. It does not
modify data.

## Allowed Scope

- Read local schema/source/seed definitions needed to understand the query shape.
- Execute local Docker Compose PostgreSQL read-only aggregate/status queries.
- Inspect local account/authorization/assignment state only as redacted counts/status.
- Update task queue, project state, task plan, evidence, and audit review.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Blocked Scope

- Any database write, seed write, account mutation, authorization mutation, assignment mutation, schema/migration, or
  Drizzle change.
- Raw DB rows, raw account identifiers, credentials, tokens, cookies, env values, database URLs, local/session storage,
  screenshots, traces, HTML reports, Provider payloads, prompts, raw generated AI content, paper/question content, or
  employee personal data in evidence.
- `.env*` reads or writes.
- Browser/runtime rerun.
- Source/test/package/lockfile edits.
- Provider, Cost, staging/prod, payment, external-service, deploy, PR, or force-push work.
- Standard/Advanced MVP final Pass claim.

## Inspection Questions

- Does local data contain active employee accounts with effective advanced organization authorization?
- Does the advanced employee effective organization scope have any published organization-training version whose
  publish-scope snapshot intersects that scope?
- Does the training-visible-list equivalent aggregate return any answerable row for advanced organization employees?
- If no answerable row exists, is the gap due to missing active advanced org authorization, missing published training,
  or scope mismatch?

## Validation Plan

- Run the approved read-only DB/account/assignment aggregate inspection.
- `npx.cmd prettier --write --ignore-unknown` on this task's five docs/state files.
- `npx.cmd prettier --check --ignore-unknown` on this task's five docs/state files.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-advanced-employee-assignment-readonly-inspection-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-advanced-employee-assignment-readonly-inspection-2026-06-25 -SkipRemoteAheadCheck`

## Risk Defense

- The SQL is executed in a read-only transaction and reports aggregate counts/status only.
- The evidence does not include raw rows, identifiers, credentials, database URLs, or personal data.
- If the read-only inspection indicates a data repair is needed, that repair remains a separate approval-gated task.
