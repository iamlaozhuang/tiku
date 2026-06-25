# Task Plan: role-separated-full-8-row-post-ai-entry-repair-browser-rerun-2026-06-25

## Task Identity

- Task id: `role-separated-full-8-row-post-ai-entry-repair-browser-rerun-2026-06-25`.
- Branch: `codex/full-8-row-post-ai-entry-rerun-20260625`.
- Task kind: `acceptance_runtime_walkthrough`.
- Approval package: `ROLE_SEPARATED_FULL_8_ROW_POST_ORG_ADMIN_REPAIR_RERUN_SCOPE_2026_06_25`.
- Fresh approval source: current user message on 2026-06-25 approving serial execution and pre-approving task 2 operation.
- Credential approval amendment: `current_user_message_allow_input_or_read_credentials_2026_06_25`.
- Non-claim: this task must not declare Standard MVP or Advanced MVP final Pass.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.
- Browser skill documentation for in-app Browser runtime control.

## Requirement Decision Map

- Role-separated runtime acceptance is governed by `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- Advanced edition context and `effectiveEdition` boundaries are governed by ADR-007 and `docs/01-requirements/advanced-edition/00-index.md`.
- This task executes only the already prepared scope package. It does not change requirements or implementation.

## Requirement Mapping

- R5/R6: learner and employee AI/training entries and denial/unavailable behavior.
- R1-R4: backend workspace separation and organization admin standard/advanced boundaries.
- R7/R8: content and ops workspace separation and content AI draft/review entries.
- R9-R15: operations `redeem_code`, `org_auth`, upgrade, multi-scope, and employee import acceptance surfaces remain observation-only where listed in the package.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-post-org-admin-repair-gap-refresh-no-final-pass.md`.
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-post-ai-entry-repair-gap-refresh-no-final-pass.md`.
- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-entry-session-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-private-account-post-repair-browser-rerun.md`.

## Conflict Check

- No requirement conflict was identified.
- The scope package originally required owner-selected credentials. The current user later approved credential input or
  credential reads for this task.
- The amended boundary allows reading/using the approved local private role-account source for authentication only.
- Codex still must not read `.env*`, password managers, browser storage, tokens, cookies, Authorization headers, DB rows,
  or record credential/account values in evidence.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md`.

## Runtime Scope

- Local target only: `http://127.0.0.1:3000` or equivalent local app URL.
- Browser: in-app Browser via Browser plugin, background visibility.
- Rows: all eight role rows from the package.
- Allowed evidence fields: exactly the redacted summary fields listed by the package.
- Credential handling: approved local private role-account credential read/input for authentication only; no credential
  values or account identifiers may be recorded.

## Blocked Scope

- Unapproved credential files, password manager access, token/cookie/localStorage/sessionStorage reads, Authorization
  headers, raw account identifiers, credential values, screenshots/traces/HTML dumps, and raw page dumps.
- DB, seed, schema, migration, account mutation, source/test/e2e/script/package/lockfile edits, `.env*`, Provider, Cost Calibration, staging/prod, payment, external services, PR, force push, and final MVP Pass claims.

## Approach

1. Confirm local target availability without reading env/secrets.
2. Use the in-app Browser in the background.
3. For each row, authenticate using the amended credential approval while keeping all credential values out of evidence.
4. Observe landing, allowed workflows, denied routes, UI-language check, safe action states, logout, and console error/warn count using redacted evidence.
5. Record row result as `pass`, `fail`, or `blocked`; any non-pass keeps the gate blocked.

## Risk Defenses

- Do not inspect browser storage, cookies, Authorization headers, `.env*`, database rows, credential files, screenshots, traces, or raw page dumps.
- Do not click Provider configuration controls or submit data-mutating forms.
- Keep browser evidence to role labels, routes, statuses, and sanitized notes.
- Do not infer final Pass from a local-only rerun.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-full-8-row-post-ai-entry-repair-browser-rerun-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-separated-full-8-row-post-ai-entry-repair-browser-rerun-2026-06-25 -SkipRemoteAheadCheck`

## Evidence And Audit Requirements

- Evidence must include `Requirement Mapping Result`, `Role Mapping Result`, and `Acceptance Mapping Result`.
- Evidence must not include screenshots, traces, raw page dumps, credentials, tokens, cookies, localStorage/sessionStorage,
  database rows, raw Provider payloads, raw generated content, or plaintext `redeem_code`.
- Audit review must distinguish runtime row failures from credential-boundary blocked rows.
