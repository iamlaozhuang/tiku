# Organization Training Advanced Employee Assignment Read-Only Inspection Approval Package Task Plan

Task id: `organization-training-advanced-employee-assignment-readonly-inspection-approval-package-2026-06-25`

## Task Type

Docs-only blocked-gate approval package.

This task prepares the scope for a future read-only local DB/seed/account assignment inspection. It does not execute the
inspection.

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

- `docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-empty-state-source-diagnosis-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-advanced-employee-empty-state-source-diagnosis-repair.md`
- `docs/05-execution-logs/evidence/2026-06-25-organization-training-employee-visible-scope-post-repair-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-employee-visible-scope-post-repair-browser-rerun.md`

## Conflict Check

The source repair evidence shows organization-training visible-scope query repair passed focused tests. The subsequent
browser rerun shows `org_standard_employee` did not enter answer workflow, but `org_advanced_employee` still had no
training row, no number input, and no row action. Evidence and audit review both require stopping for separate approval
before DB/seed/schema/migration/account mutation or data inspection.

There is no product requirement conflict in this task because it only prepares the approval package. Requirement and
traceability sources continue to require advanced organization employees to reach assigned organization-training workflow
when valid assignment and scope data exist.

## Allowed Scope

- Update project state and task queue for this approval package.
- Create task plan, evidence, and audit-review files.
- Define the future read-only diagnostic questions.
- Define redacted evidence fields and blocked fields.
- Validate docs formatting and Module Run v2 gates.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch under the current
  goal closeout approval.

## Blocked Scope

- Actual DB reads or writes.
- Seed reads or writes.
- Account data inspection or mutation.
- Credential document read or credential entry.
- Browser or Playwright runtime execution.
- Source, test, schema, migration, script, package, or lockfile edits.
- `.env*` reads or writes.
- Provider, Cost, staging/prod, payment, external-service, deployment, PR, or force-push work.
- Standard/Advanced MVP final Pass claim.

## Future Approval Request

Request fresh approval for one future task only:

`organization-training-advanced-employee-assignment-readonly-inspection-2026-06-25`

Allowed future inspection questions:

- Does the local dev data contain a published organization-training assignment visible to the `org_advanced_employee`
  account?
- Does the employee account resolve to the expected organization scope after authorization context selection?
- Do assignment publication status and organization scope match the route/repository query expectations after the source
  repairs?

Allowed future evidence fields:

- Command name and pass/fail status.
- Redacted role label.
- Redacted boolean for organization public-id presence.
- Redacted assignment count.
- Redacted publication status counts.
- Redacted scope-match status.
- Conclusion without raw rows.

Blocked future evidence fields:

- Credentials, tokens, cookies, local/session storage, env values, database URLs, raw DB rows, raw account identifiers,
  employee personal data, paper or question content, Provider payloads, prompts, raw generated AI content, screenshots,
  traces, and HTML reports.

## Validation Plan

- `npx.cmd prettier --write --ignore-unknown` on the five allowed docs/state files.
- `npx.cmd prettier --check --ignore-unknown` on the five allowed docs/state files.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-advanced-employee-assignment-readonly-inspection-approval-package-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-advanced-employee-assignment-readonly-inspection-approval-package-2026-06-25 -SkipRemoteAheadCheck`

## Risk Defense

- This package does not exercise the prohibited data surface.
- The future diagnostic is intentionally read-only and narrowed to assignment existence, publication status, and scope
  match.
- Evidence must remain redacted counts/status only.
- If the future inspection shows missing seed/assignment data, any seed repair, schema change, migration, or account
  mutation remains a separate fresh-approval task.
