# content-organization-ai-generation-admin-local-contract-loop-focused-browser-rerun-2026-06-26

## Objective

Run a focused local real-browser rerun after the admin local AI generation contract source repair.

Rows:

- `content_admin`
- `org_advanced_admin`
- `org_standard_admin`

Validate visible entries, direct route behavior, submit behavior, redacted local contract summary rendering, and denied or unavailable paths. This task does not declare MVP final Pass.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-26-content-organization-ai-generation-admin-local-contract-loop-source-repair.md`
- `docs/05-execution-logs/evidence/2026-06-26-role-separated-full-8-row-post-visible-label-private-credential-browser-rerun.md`

## Approved Scope

- Use `http://127.0.0.1:3000` local browser runtime.
- Read the approved local private role-account file for authentication only.
- Parse credentials in memory only and input them into the local login form.
- Record only redacted role labels, route status categories, API status/code summaries, visible-entry booleans, submit/summary booleans, and blocked-scope booleans.
- Update task plan, evidence, audit review, project state, and task queue.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch after validation.

## Blocked Scope

- Source, tests, e2e, package, lockfile, DB, seed, schema, migration, account mutation, and script edits.
- `.env*` read/write.
- Provider/model calls, Provider configuration, Cost Calibration, staging/prod/cloud/deploy, payment, and external services.
- Printing or recording raw credentials, account identifiers, passwords, tokens, cookies, browser storage, Authorization headers, raw DB rows, raw public ids, raw DOM, screenshots, traces, Provider payloads, prompts, generated content, private answer content, or full question/paper content.
- Formal `question` or `paper` write.
- PR, force push, and MVP final Pass claim.

## QA Inventory

- `content_admin`
  - Login succeeds and lands in content workspace.
  - Content AI question and paper entry routes are reachable.
  - Submit action calls the content local contract route.
  - Summary renders `accepted`, `local_contract_only`, `summary_only`, and Provider blocked status.
  - Organization and ops routes remain denied.
- `org_advanced_admin`
  - Login succeeds and lands in organization portal.
  - Organization AI question and paper entry routes are reachable.
  - Submit action calls the organization local contract route.
  - Summary renders `accepted`, `local_contract_only`, `summary_only`, and Provider blocked status.
  - Content and ops routes remain denied.
- `org_standard_admin`
  - Login succeeds and lands in organization portal.
  - Organization AI generation entry is absent from visible navigation or portal actions.
  - Direct organization AI question and paper routes render unavailable or denied state with no submit action.
  - Direct organization local contract POST returns permission denied status/code summary.
  - Content and ops routes remain denied.

## Validation Plan

- `npx.cmd playwright --version`
- `Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/login -TimeoutSec 8`
- Approved private credential structure check with role labels only.
- Local real-browser focused rerun for the three rows with redacted compact matrix.
- `npx.cmd prettier --write --ignore-unknown ...`
- `npx.cmd prettier --check --ignore-unknown ...`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-organization-ai-generation-admin-local-contract-loop-focused-browser-rerun-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-organization-ai-generation-admin-local-contract-loop-focused-browser-rerun-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Credential source is missing, malformed, or lacks any required role.
- Browser login cannot proceed without printing or storing credential values.
- Local target is unavailable and cannot be safely used within this scope.
- Any failed row requires source, DB/seed/schema/migration, account mutation, Provider/Cost, staging/prod/payment, or external-service repair.
- Evidence would require sensitive material.
