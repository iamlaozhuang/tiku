# 2026-07-03 Source Landing 8 Role Credential-Backed Local Acceptance Rerun After Content Harness Repair Plan

## Task

- Task ID: `source-landing-8-role-credential-backed-local-acceptance-rerun-after-content-harness-repair-2026-07-03`
- Branch: `codex/source-landing-8-role-credential-backed-local-acceptance-rerun-after-content-harness-repair-2026-07-03`
- Status: closed

## Scope

- Restart the complete local 8-role acceptance from `personal_standard_student`.
- Use credential-backed local login/session proof, then role/workflow supplements.
- Include the repaired `content_admin` resource/RAG positive workflow harness.
- Do not run Provider-bound AI provider smoke, DB-direct tests, browser screenshot/trace capture, staging/prod, Cost
  Calibration, release readiness, final Pass, or production usability checks.

## Command Sequence

Stop on the first fail/block.

1. `npm.cmd exec -- playwright test e2e/credential-backed-8-role-local-acceptance.spec.ts --project=chromium --reporter=line --trace=off`
2. `npm.cmd exec -- playwright test e2e/student-practice-mock-entry.spec.ts --project=chromium --reporter=line --trace=off`
3. `npm.cmd exec -- playwright test e2e/personal-ai-generation-local-request.spec.ts --project=chromium --reporter=line --trace=off`
4. `npm.cmd exec -- playwright test e2e/edition-aware-authorization-local-flow.spec.ts --project=chromium --reporter=line --trace=off`
5. `npm.cmd exec -- playwright test e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts --project=chromium --reporter=line --trace=off`
6. `npm.cmd exec -- playwright test e2e/admin-role-denial-browser.spec.ts --project=chromium --reporter=line --trace=off`
7. `npm.cmd exec -- playwright test e2e/role-separated-account-fixture-supplement.spec.ts --project=chromium --reporter=line --trace=off`
8. `npm.cmd exec -- playwright test e2e/local-full-loop-knowledge-rag-maintenance-smoke.spec.ts --project=chromium --reporter=line --trace=off`

## Reporting Rule

- Primary role order:
  `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, `org_advanced_employee`,
  `org_standard_admin`, `org_advanced_admin`, `content_admin`, `ops_admin`.
- Report credential-backed, route-fulfilled, fixture-first, and Provider-bound coverage separately.
- `super_admin` is not a primary axis.
