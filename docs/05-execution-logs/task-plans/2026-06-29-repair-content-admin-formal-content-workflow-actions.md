# Repair Content Admin Formal Content Workflow Actions Plan

- Task id: `repair-content-admin-formal-content-workflow-actions-2026-06-29`
- Branch: `codex/repair-content-admin-formal-content-workflow-20260629`
- Status: closed
- Updated at: `2026-06-29T07:20:00-07:00`
- Approval consumed: `current_user_staged_local_execution_stage_c_source_test_repair_and_per_task_closeout_2026_06_28`
- Closeout policy: local commit, fast-forward merge to `master`, push `origin/master`, and short-branch cleanup approved
  for this task only.

## Governance Materialization

Goal: repair the blocked scoped `content_admin` formal content workflow rows by implementing the smallest source/test
changes needed for safe test-owned formal content lifecycle verification and AI draft review/adoption boundary
verification.

Allowed files:

- governance/evidence files listed in the traceability document;
- `src/app/content/**`, `src/features/admin/**`, `src/components/**`, `src/hooks/**`, `src/lib/**`, `src/server/**`;
- `tests/unit/**`.

Blocked files and actions:

- `.env*`, package/lockfiles, DB schema, migrations, seed, scripts, e2e, Playwright reports, test results, `.next`;
- dependency introduction, direct DB access/mutation, schema/migration/seed, Provider execution/configuration, prompt
  execution, Cost Calibration, staging/prod/deploy, PR, force-push, release readiness, final Pass.

DB boundary: no direct DB connection/read/write, no migration/seed/schema change, no raw row evidence.

AI/Provider boundary: no Provider call, no Provider config/credential read/write, no prompt payload, no raw AI IO, no
complete generated content in evidence.

Account/credential boundary: browser rerun may use test-owned localhost login input only. No credential/session/token/
cookie/localStorage/Auth header evidence.

Evidence boundary: role/route/workflow/status/count/test-count/commit summaries only.

## Required Read Confirmation

- Code taste commandments: read.
- ADR directory: read.
- Owner-facing role checklist: read, with `content_admin` formal content and AI draft review rows as mandatory scope.
- Prior blocked evidence/audit: read.

## Execution Plan

1. Inspect content route/source/test ownership inside allowed paths.
2. Add focused RED unit coverage for the currently blocked behaviors where the existing test pattern allows it.
3. Implement the smallest reusable repair, preferring existing content admin and AI generation primitives instead of
   role-specific duplication.
4. Run focused unit tests, then lint/typecheck and formatting/diff gates.
5. Rerun redacted localhost browser verification for `content_admin` only, using no screenshots/raw DOM/traces and no
   Provider calls.
6. Update evidence, audit, acceptance, project-state, and task-queue with redacted results.
7. Commit, fast-forward merge to `master`, push `origin/master`, and clean up the short branch if gates pass.

## Implementation Summary

- Reused the existing content AI formal-adoption route instead of adding a duplicate role-specific path.
- Enabled content AI review buttons for persisted content-side generated-result summaries.
- Added controlled `reviewedDraft` payloads for local reviewed question/paper drafts so adoption can reach the existing
  formal draft adapter without Provider execution or raw AI output.
- Kept direct publish blocked; adoption creates/reuses formal draft metadata only and leaves release/publish gates
  separate.
- Added focused UI test coverage for the content admin review adoption POST and redaction boundary.

## Risk Controls

- If safe cleanup cannot be implemented without DB/schema/seed/dependency changes, record a blocked finding instead of
  widening scope.
- If AI draft adoption requires a real Provider result or raw generated content, keep Provider blocked and verify only
  existing/local draft review state transitions.
- If a formal content mutation would touch unknown or non-test-owned data, do not perform it in browser evidence.
- If validation shows unrelated failures, record failure class and avoid unrelated refactors.

## Planned Validation Commands

- `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts`: RED before implementation, then pass.
- `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts src/server/services/admin-ai-generation-formal-adoption-service.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-paper-ui.test.ts`: pass.
- `npm.cmd run test:unit`: pass after implementation.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npx.cmd prettier --check --ignore-unknown ...`: pass.
- `git diff --check`: pass.
- Module Run v2 hardening/closeout/pre-push gates: pending final run after evidence update.
