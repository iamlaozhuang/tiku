# Role-Separated Full 8 Row Post Visible-Label Private Credential Browser Rerun Task Plan

Task id: `role-separated-full-8-row-post-visible-label-private-credential-browser-rerun-2026-06-26`

Branch: `codex/full-8-post-visible-private-rerun-20260626`

## Task Type

Local real-browser runtime rerun with approved local private credential read/input and redacted evidence.

## Approval Boundary

The active goal approves continuing toward full eight-row role-separated browser acceptance, including reading or entering local private credentials with redacted evidence. This task consumes that approval only for local credential use and local browser authentication.

It does not approve source/test changes, DB/seed writes, schema/migration, account mutation, Provider/Cost, staging/prod/cloud/deploy, payment, external services, PR, force-push, or final MVP Pass.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- Role-separated runtime gate remains blocked until all 8 mandatory rows pass fresh redacted runtime observation.
- UI visibility is not an authorization boundary; direct routes must enforce effective authorization and capability checks.
- Advanced learner and organization employee rows must show usable `AI训练`; advanced organization employee must also show assigned `企业训练`.
- Organization admins, content admins, and ops admins must land in separated workspaces and reject unrelated backend surfaces.

## Requirement Mapping

This task maps to the strict role-separated acceptance rows:

- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`
- `org_standard_admin`
- `org_advanced_admin`
- `content_admin`
- `ops_admin`

The expected outcome is an observed browser matrix, not a source repair. If any row fails, evidence records the next smallest repair candidate.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-visible-label-repair-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-25-learner-employee-ai-paper-action-enabled-state-repair.md`
- `docs/05-execution-logs/evidence/2026-06-25-visible-chinese-ui-technical-label-runtime-cleanup-residual-repair.md`
- `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`

## Conflict Check

The latest evidence says the post visible-label full 8 row rerun was blocked because the complete credential set was unavailable under that task's narrower credential discovery scope. Historical evidence and current filesystem state indicate an approved local private role-account file exists under `D:\tiku-local-private\acceptance`. This task resolves that procedural conflict by explicitly allowing that private file as a read-only credential source for local browser login only.

## Allowed Scope

- Read the approved local private role-account file.
- Parse credential values in memory only.
- Enter credentials into the local browser login form only.
- Execute local real-browser role rows against `http://127.0.0.1:3000`.
- Record redacted role labels, route status, visible-entry counts, button enabled counts, HTTP status/code summaries, console issue counts, pass/fail/block status, and next smallest blocker.
- Update this task's task plan, evidence, audit review, project state, and task queue.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch after validation.

## Blocked Scope

- Printing, recording, committing, or summarizing raw credentials, phone numbers, emails, passwords, account ids, tokens, cookies, local/session storage, Authorization headers, raw DB rows, raw public ids, screenshots, traces, raw DOM, Provider payloads, prompts, generated content, private answer content, or full question/paper content.
- Source, test, e2e, package, or lockfile changes.
- DB write, seed write, schema/migration, account mutation, or destructive database action.
- `.env*` read/write unless a later task explicitly approves it.
- Provider/model calls, Provider configuration, Cost Calibration Gate, staging/prod/cloud/deploy, payment, external services, PR, force-push, or final MVP Pass.

## Runtime Plan

1. Confirm Git and local target state.
2. Check the private credential file structure with role labels only.
3. Load the in-app Browser runtime and use isolated login sessions for all 8 rows.
4. For each row, verify landing path, allowed surfaces, denied surfaces, visible logout, console health, and compact route/API counts.
5. Record a strict matrix result and the next smallest repair if any row fails.

## Validation Plan

- `npx.cmd playwright --version`
- `Invoke-WebRequest http://127.0.0.1:3000/login`
- Private credential structure check with role labels only.
- Local real-browser full 8 row rerun with redacted compact matrix.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-role-separated-full-8-row-post-visible-label-private-credential-browser-rerun.md docs/05-execution-logs/evidence/2026-06-26-role-separated-full-8-row-post-visible-label-private-credential-browser-rerun.md docs/05-execution-logs/audits-reviews/2026-06-26-role-separated-full-8-row-post-visible-label-private-credential-browser-rerun.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-full-8-row-post-visible-label-private-credential-browser-rerun-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-separated-full-8-row-post-visible-label-private-credential-browser-rerun-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- The private credential file is missing, malformed, or lacks any mandatory role row.
- Browser login cannot proceed without printing or storing credential values.
- The local target is unavailable and cannot be safely started without exceeding scope.
- Any needed repair requires source, DB/seed/schema/migration, account mutation, Provider/Cost, staging/prod/payment, or external service work.
- Evidence would need to include sensitive material.
