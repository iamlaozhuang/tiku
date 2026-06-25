# Organization Training Advanced Employee Visible-List 500 Runtime Diagnostic Repair Task Plan

Task id: `organization-training-advanced-employee-visible-list-500-runtime-diagnostic-repair-2026-06-25`

## Fresh Approval

User approved on 2026-06-25:

- Diagnose `org_advanced_employee` organization-training visible-list HTTP 500 with local read-only runtime/account/assignment inspection.
- If the blocker is confirmed as a source defect, perform the smallest source repair plus focused unit and browser rerun.
- DB writes, seed writes, schema, migration, account mutation, Provider/Cost, staging/prod, payment, and external service work still require separate approval.

## Task Type

Local diagnostic-first source repair, bounded by root-cause evidence.

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

## Evidence Inputs

- `docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-assignment-readonly-inspection.md`
- `docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-published-assignment-local-alignment.md`
- `docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-post-assignment-focused-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-advanced-employee-post-assignment-focused-browser-rerun.md`

## Allowed Scope

- Read local private role account credentials and input them only into local browser login or local diagnostic helpers.
- Local read-only DB/runtime/account/assignment inspection with redacted counts/status only.
- Local source repair only if the diagnostic proves a source defect.
- Focused unit tests for the repaired service/repository/mapper/route behavior.
- Focused local browser rerun for `org_advanced_employee` and, where needed, `org_standard_employee` denial regression.
- Update task plan, evidence, audit-review, project state, and task queue.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Blocked Scope

- DB writes, seed writes, schema changes, migrations, Drizzle schema changes, or account/user/employee/authorization mutation.
- Reading or writing `.env*`.
- Provider calls or Provider configuration.
- Cost Calibration Gate, staging/prod/cloud/deploy, payment, external services, PR, force-push, or final MVP Pass claim.
- Dependency, package, or lockfile changes.
- Full eight-row browser rerun unless a later approved task starts it.
- Evidence containing raw credentials, phone numbers, passwords, tokens, cookies, local/session storage, Authorization headers, raw DB rows, raw public ids, raw DOM dumps, screenshots, traces, Provider payloads, prompts, generated content, or private answer content.

## Diagnostic Plan

1. Reproduce or isolate the visible-list 500 in a redacted local path.
2. Trace the route handler, service, repository, and mapper path before changing code.
3. Inspect local assignment/account/runtime state with read-only transactions and count/status outputs only.
4. Form a single root-cause hypothesis and prove it against code or runtime evidence.
5. If source-caused, add the smallest failing focused test first, then implement one repair.
6. Rerun focused unit validation and focused browser/runtime verification.

## Validation Plan

- `npx.cmd playwright --version`
- Local read-only diagnostic commands with redacted count/status output.
- Focused unit test command for any repaired source surface.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --check --ignore-unknown` on changed source/docs/state files.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-advanced-employee-visible-list-500-runtime-diagnostic-repair-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-advanced-employee-visible-list-500-runtime-diagnostic-repair-2026-06-25 -SkipRemoteAheadCheck`
