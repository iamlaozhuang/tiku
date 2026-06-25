# Organization Training Advanced Employee Post-Assignment Focused Browser Rerun Task Plan

Task id: `organization-training-advanced-employee-post-assignment-focused-browser-rerun-2026-06-25`

## Fresh Approval

User approved on 2026-06-25: after creating or aligning the unmatched advanced employee's published
organization-training assignment, run the focused browser rerun.

## Task Type

Local real-browser focused rerun for two employee rows:

- `org_standard_employee`
- `org_advanced_employee`

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

## Evidence Inputs

- `docs/05-execution-logs/evidence/2026-06-25-organization-training-employee-visible-scope-post-repair-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-assignment-readonly-inspection.md`
- `docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-published-assignment-local-alignment.md`

## Allowed Scope

- Read local private role account credentials for the two employee rows and input them into the local browser login form.
- Execute local real-browser workflow against `http://127.0.0.1:3000`.
- Record only redacted route/status/count evidence.
- Update task plan/evidence/audit plus state/queue.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Blocked Scope

- Full eight-row rerun.
- DB/seed/schema/migration/Drizzle reads or writes.
- Account creation, password reset, disablement, authorization mutation, employee mutation, or user mutation.
- Raw credentials, phone numbers, passwords, tokens, cookies, local/session storage, Authorization headers, raw DOM dumps,
  screenshots, traces, raw DB rows, public id inventories, Provider payloads, prompts, generated content, raw answer text,
  or private answer content in evidence.
- Source/test/package/lockfile edits.
- `.env*` reads or writes.
- Provider, Cost, staging/prod, payment, external-service, deploy, PR, force-push, or final Pass work.

## Runtime Matrix

| Row                     | Expected result                                                                 |
| ----------------------- | ------------------------------------------------------------------------------- |
| `org_standard_employee` | Login lands on `/home`; direct `/organization-training` does not enter workflow |
| `org_advanced_employee` | Login lands on `/home`; direct `/organization-training` shows answer workflow   |

## Validation Plan

- Confirm local dev server `/login` is reachable.
- Use real browser automation to log in and out for both employee rows.
- For `org_standard_employee`, record that no answer workflow is entered.
- For `org_advanced_employee`, record training row count, numeric input count, row action count, and answer API status.
- `npx.cmd prettier --write --ignore-unknown` on this task's five docs/state files.
- `npx.cmd prettier --check --ignore-unknown` on this task's five docs/state files.
- `git diff --check`
- Module Run v2 pre-commit hardening and pre-push readiness.
