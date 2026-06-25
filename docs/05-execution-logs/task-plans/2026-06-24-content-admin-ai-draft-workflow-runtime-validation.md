# Task Plan: content-admin-ai-draft-workflow-runtime-validation-2026-06-24

## Task Metadata

- Task id: `content-admin-ai-draft-workflow-runtime-validation-2026-06-24`.
- Branch: `codex/content-admin-ai-draft-runtime-20260624`.
- Task kind: `acceptance_runtime_walkthrough`.
- Execution profile: `local_content_admin_ai_draft_workflow_runtime_validation`.
- Approval consumed: current user chat approval on 2026-06-24 to serially advance the recommended next task under
  mechanism governance.
- Non-claim: this task does not declare standard/advanced MVP final Pass.

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
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-role-separated-mvp-post-repair-gap-analysis.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-post-repair-runtime-rerun-closeout-state-reconciliation.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-post-repair-runtime-rerun-closeout-state-reconciliation.md`.

## Requirement Decision Map

- R7 from the 2026-06-24 role-separated MVP alignment requires content backend `AI出题` and `AI组卷` draft/review
  entries.
- US-06-15 requires discoverable content backend AI draft/review entries, no direct formal `question` or `paper` writes,
  governed review/adoption, and redacted evidence.
- The 2026-06-21 content_admin AI decision and 2026-06-23 advanced AI clarification require isolated draft/review
  output before any formal adoption.
- ADR-004, ADR-005, ADR-006, and ADR-007 continue to block env/secret, staging/prod, Provider, schema/migration, and
  Cost Calibration work unless separately approved.

## Requirement Mapping

- Requirement: content_admin must be able to discover content backend AI question and AI `paper` generation entries.
- Runtime validation target: visible navigation or direct local route must lead to a draft/review or blocked/unavailable
  workflow state, not a direct formal write or publish flow.
- Redaction target: evidence records route labels, visible workflow status, pass/fail/blocked summaries, Chinese UI
  language findings, and boundary results only.

## Role Mapping Result

- In-scope role row: `content_admin`.
- Sampled denied boundaries, if session and UI state permit: operations global `redeem_code`/`org_auth`, organization
  backend, and Provider/cost surfaces.
- Out-of-scope rows: learner, employee, organization admin, and ops_admin role rows.

## Acceptance Mapping Result

- Allowed result vocabulary: `pass`, `fail`, or `blocked`.
- This task may validate content_admin AI draft workflow usability only.
- It must not upgrade the full role-separated gate or claim final Pass.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-24-role-separated-mvp-post-repair-gap-analysis.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-post-repair-runtime-rerun-closeout-state-reconciliation.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-post-repair-runtime-rerun-closeout-state-reconciliation.md`.

## Conflict Check

- Requirement sources agree that entries are required and output must be draft/review only.
- Historical runtime evidence observed content_admin entries and routes as reachable, but did not exercise the workflow
  enough to prove usability.
- The local Browser is currently on `/login`; Codex must not enter credentials. If login is needed, laozhuang must enter
  content_admin credentials manually before observation continues.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md`.
- `docs/05-execution-logs/evidence/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md`.

## Blocked Files And Work

- No product source, tests, e2e, scripts, schema, migration, database read/write, seed, package, lockfile, `.env*`,
  Provider call/configuration, prompt/provider payload handling, raw generated content persistence, Cost Calibration,
  staging/prod/cloud/deploy, payment, external service, PR, force push, screenshot evidence, browser storage inspection,
  raw HTML/page dump, credential entry by Codex, credential document access, account mutation, formal `question` or
  `paper` write, publish action, or final Pass claim.

## Runtime Approach

1. Use the in-app Browser only after this plan and allowed range are registered.
2. Confirm the app is local-only at `http://127.0.0.1:3000` or `http://localhost:3000`; do not start a dev server.
3. If the Browser is at login, stop and ask laozhuang to log in as `content_admin`; do not enter or inspect
   credentials.
4. Observe content backend navigation for `AI出题` and `AI组卷`.
5. Open `AI出题` and `AI组卷` draft/review routes or visible entries.
6. Interact only with safe visible controls needed to determine whether the flow is usable or clearly blocked; do not
   submit any action that would call a real Provider, persist generated content, adopt formal content, publish, or write
   database state.
7. Record Chinese UI language findings, including any visible technical English labels.
8. If session and UI state permit, sample denied boundaries for ops/organization surfaces without entering credentials.
9. Do not capture screenshots, raw HTML, storage, cookies, tokens, or credentials in evidence.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md docs/05-execution-logs/evidence/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md docs/05-execution-logs/audits-reviews/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md docs/05-execution-logs/evidence/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md docs/05-execution-logs/audits-reviews/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-ai-draft-workflow-runtime-validation-2026-06-24`

## Stop Conditions

- Stop if content_admin login is needed and laozhuang has not entered credentials manually.
- Stop before any action that would trigger a real Provider call, formal content write, adoption, publish, schema/database
  change, account mutation, credential access, browser storage inspection, raw screenshot/HTML evidence, or final Pass
  claim.
- Stop if observed UI requires hidden/unpublished routes only.
- Stop if validation fails three times with the same blocker.
