# Role-Separated Full 8 Row Post Org-Training Visible-List Repair Browser Rerun Task Plan

Task id: `role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun-2026-06-25`

## Fresh Approval

The active goal and prior user approval allow continuing to full eight-row role-separated browser rerun after the focused
organization-training visible-list repair passes. Credentials may be read/input locally with redacted evidence only.

## Task Type

Local real-browser runtime rerun for the strict role-separated eight-row matrix.

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
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Evidence Inputs

- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-visible-list-500-runtime-diagnostic-repair.md`

## Allowed Scope

- Read local private role account credentials and input them into the local browser login form.
- Execute local real-browser observation against `http://127.0.0.1:3000`.
- Record only role labels, paths, HTTP status/code pairs, visible counts, and pass/fail/blocker summaries.
- Update task plan, evidence, audit-review, project state, and task queue.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Blocked Scope

- Source/test/package/lockfile edits.
- DB writes, seed writes, schema/migration, account/user/employee/authorization mutation.
- Clicking actions that submit forms or create answer/content/authorization records.
- `.env*` reads or writes.
- Provider, Cost, staging/prod, payment, external service, deploy, PR, force-push, or final MVP Pass claim.
- Evidence containing raw credentials, phone numbers, passwords, tokens, cookies, local/session storage, Authorization
  headers, raw DB rows, raw public ids, raw DOM, screenshots, traces, Provider payloads, prompts, generated content, or
  private answer content.

## Runtime Matrix

| Row                         | Primary expected behavior                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| `personal_standard_student` | Learner home only; no advanced `AI训练`; direct advanced AI route denied/unavailable       |
| `personal_advanced_student` | Learner home with discoverable `AI训练` and learner AI local/gated workflow entry          |
| `org_standard_employee`     | Learner home only; no `AI训练` and no `企业训练`; direct organization-training unavailable |
| `org_advanced_employee`     | Learner home with `AI训练` and assigned `企业训练`; organization-training visible-list OK  |
| `org_standard_admin`        | Organization workspace; employee/auth only; no training/organization AI                    |
| `org_advanced_admin`        | Organization workspace; employee/auth, training, and organization AI entries               |
| `content_admin`             | Content workspace; content AI entries; ops/global auth surfaces denied                     |
| `ops_admin`                 | Ops workspace; operations entries; content authoring surfaces denied                       |

## Validation Plan

- Confirm local dev server `/login` is reachable.
- Execute browser observation for all 8 role rows using local private credentials.
- Record only redacted paths/status/counts.
- `npx.cmd prettier --check --ignore-unknown` on this task's docs/state files.
- `git diff --check`
- Module Run v2 pre-commit hardening and pre-push readiness.
