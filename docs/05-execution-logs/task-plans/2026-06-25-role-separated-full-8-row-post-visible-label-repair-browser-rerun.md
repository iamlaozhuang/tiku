# Role-Separated Full 8 Row Post Visible-Label Repair Browser Rerun Plan

Task id: `role-separated-full-8-row-post-visible-label-repair-browser-rerun-2026-06-25`

Branch: `codex/full-8-row-post-visible-label-rerun-20260625`

## Fresh Approval

The active goal approves continuing with local role-separated browser validation until the full eight-row role matrix
passes. Local private credentials may be read or input only for this local browser rerun, and evidence must stay fully
redacted. Provider/Cost, staging/prod, payment, and external services remain blocked without separate approval.

## Task Type

Local real-browser runtime rerun for the strict role-separated eight-row matrix after the visible-label display repair.

## SSOT Read List

- `AGENTS.md`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Evidence Inputs

- `docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-25-learner-employee-ai-paper-action-enabled-state-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-25-visible-chinese-ui-technical-label-runtime-cleanup-residual-repair.md`.
- `.agent/l6-owner-preview-test-accounts.md`.

## Allowed Scope

- Read local private role account credentials and input them into the local browser login form.
- If no dedicated credential file is found, perform a targeted `.env*` credential-key scan only for local role login
  values. Do not print or record values, and do not use Provider, DB, staging/prod, payment, or external-service secrets.
- Execute local real-browser observation against `http://127.0.0.1:3000`.
- Record only role labels, paths, HTTP status/code pairs, visible counts, boolean technical-label checks, and
  pass/fail/blocker summaries.
- Update task plan, evidence, audit-review, project state, and task queue.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch.

## Blocked Scope

- Source/test/package/lockfile edits.
- DB writes, seed writes, schema/migration, account/user/employee/authorization mutation.
- Clicking actions that submit forms or create answer/content/authorization records.
- Provider calls/configuration, Cost Calibration, staging/prod/cloud/deploy, payment, external services, PRs,
  force-push, or final MVP Pass claim.
- Evidence containing raw credentials, phone numbers, emails, passwords, tokens, cookies, local/session storage,
  Authorization headers, raw DB rows, raw public ids, raw DOM, screenshots, traces, Provider payloads, prompts,
  generated content, or private answer content.

## Runtime Matrix

| Row                         | Primary expected behavior                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `personal_standard_student` | Learner home only; no advanced AI training; direct advanced AI route denied/unavailable.       |
| `personal_advanced_student` | Learner home with discoverable AI training and usable or safely gated learner AI actions.      |
| `org_standard_employee`     | Learner home only; no AI training and no organization training; direct advanced routes denied. |
| `org_advanced_employee`     | Learner home with AI training and assigned organization training visible.                      |
| `org_standard_admin`        | Organization workspace; employee/auth only; no training/organization AI.                       |
| `org_advanced_admin`        | Organization workspace; employee/auth, training, analytics, and organization AI entries.       |
| `content_admin`             | Content workspace; content AI entries; ops/global auth surfaces denied.                        |
| `ops_admin`                 | Ops workspace; operations entries; content authoring surfaces denied.                          |

## Validation Plan

1. Confirm local dev server `/login` is reachable.
2. Locate or parse local role credentials without printing credential values.
3. Execute browser observation for all eight role rows.
4. Record redacted path/status/count/token-boolean evidence.
5. Run `npx.cmd playwright --version`, scoped Prettier check, `git diff --check`, and Module Run v2 pre-commit/pre-push
   readiness.

No Standard/Advanced MVP final Pass will be claimed by this task.
