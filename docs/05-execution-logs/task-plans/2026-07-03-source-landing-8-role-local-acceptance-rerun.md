# 2026-07-03 Source Landing 8 Role Local Acceptance Rerun Task Plan

## Task

- Task ID: `source-landing-8-role-local-acceptance-rerun-2026-07-03`
- Branch: `codex/source-landing-8-role-local-acceptance-rerun-2026-07-03`
- Depends on: `repair-student-practice-restart-acceptance-harness-2026-07-03`
- Goal: rerun the full local 8-role acceptance sequence from `personal_standard_student`.

## Execution Rules

- Execute existing local Playwright specs only.
- Record `pass`, `fail`, or `block` honestly.
- Stop on the first defect or blocking fixture gap and split a repair task.
- Do not alter product source, test source, schema, dependencies, env files, Provider settings, DB state directly, staging/prod, or deployment.

## Role Order

1. `personal_standard_student`
2. `personal_advanced_student`
3. `org_standard_employee`
4. `org_advanced_employee`
5. `org_standard_admin`
6. `org_advanced_admin`
7. `content_admin`
8. `ops_admin`

## Planned Commands

```powershell
npm.cmd exec -- playwright test e2e/local-full-loop-baseline-accounts-auth-db.spec.ts --project=chromium --reporter=line --trace=off
npm.cmd exec -- playwright test e2e/student-practice-mock-entry.spec.ts --project=chromium --reporter=line --trace=off
npm.cmd exec -- playwright test e2e/personal-ai-generation-local-request.spec.ts --project=chromium --reporter=line --trace=off
npm.cmd exec -- playwright test e2e/edition-aware-authorization-local-flow.spec.ts --project=chromium --reporter=line --trace=off
npm.cmd exec -- playwright test e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts --project=chromium --reporter=line --trace=off
npm.cmd exec -- playwright test e2e/admin-role-denial-browser.spec.ts --project=chromium --reporter=line --trace=off
```

## Redaction Rules

Evidence may include command names, exit status, role names, route categories, assertion categories, and concise pass/fail/block summaries. Evidence must not include credentials, session values, cookies, auth headers, env values, DB rows, internal ids, PII, plaintext `redeem_code`, Provider payloads, Prompt text, AI input/output, full generated content, full question/paper/material/resource/chunk content, screenshots, traces, or DOM dumps.
