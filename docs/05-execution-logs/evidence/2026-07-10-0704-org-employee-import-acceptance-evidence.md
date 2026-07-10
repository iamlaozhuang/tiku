# 2026-07-10 0704 Org Employee Import Acceptance Evidence

## Scope

- taskId: `0704-org-employee-import-acceptance-2026-07-10`
- branch: `codex/0704-org-employee-import-acceptance`
- mode: validation-only localhost acceptance
- evidence boundary: redacted role labels, route labels, status categories, file paths, command results, and test counts only

## Readiness

- private credential index: metadata-only read pass
- core role labels found: 9
- credential values output: none
- browser/runtime login: not executed
- direct DB connection or mutation: not executed
- provider/staging/prod/deploy/env/secret/Cost Calibration: not executed

## Acceptance Result

Result: `blocked_requires_priority_repair_employee_import_upload_template_preview_contract`.

Validated partial support:

- Operations page exposes an employee import panel.
- Import requires selecting a target organization before submit.
- Existing supported input is pasted CSV/TSV text.
- Existing preview shows format, row count, missing initial-password count, and confirmation readiness.
- Existing guards reject authorization-scope columns in pasted import text.
- Existing result panel shows success/rejection counts, rejection reason categories, and one-time initial-password distribution window.

Confirmed product capability gaps against the 0704 acceptance standard:

- No file-upload control for employee roster documents was found in the inspected operations import component.
- No downloadable reusable import template or template download action was found.
- Preview does not show inherited authorization categories or quota-impact categories for the selected target organization.
- Import result/rejection categories do not cover all required acceptance categories such as insufficient quota, cross-domain conflict, disabled account, or cross-organization conflict.
- The current runtime row limit is below the documented first-release import ceiling.

Decision:

- Stop the serial queue before `0704-personal-redeem-code-acceptance-2026-07-10`.
- Open and complete priority repair task `0704-org-employee-import-template-fix-2026-07-10`.
- Rerun affected validation as `0704-org-employee-import-acceptance-rerun-2026-07-10` before continuing.

## Commands

- metadata-only private credential index preflight
  - result: pass, 9 role labels, credential values output none
- `rg -n 'type="file"|FileReader|URL\.createObjectURL|download=|employee-import-template|下载模板|模板下载' src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
  - result: no matching upload/template-download markers
- `rg -n "employee-import-textarea|employee-import-preview|employee-import-submit|employee-import-organization-select|generatedPasswordRowCount" src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
  - result: existing text-import and basic preview markers found
- `rg -n "quota_insufficient|cross_domain|disabled_account|inherited|继承|额度影响|EmployeeImportRejectedRowDto|duplicate_phone|invalid_row|organization_not_found|user_not_found|employee_create_failed" ...`
  - result: basic rejection categories found; broader import failure categories not represented in import DTO
- `corepack pnpm@10.26.1 vitest run tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts src/server/validators/employee-account.test.ts src/server/services/employee-account-service.test.ts src/server/services/employee-account-route.test.ts`
  - result: pass, 6 files, 34 tests
- `corepack pnpm@10.26.1 typecheck`
  - result: pass
- `corepack pnpm@10.26.1 lint`
  - result: pass
- `git diff --check`
  - result: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-org-employee-import-acceptance-2026-07-10`
  - result: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-org-employee-import-acceptance-2026-07-10 -SkipRemoteAheadCheck`
  - result: pass

## Redaction Review

- Credentials, passwords, sessions, cookies, tokens, localStorage, Authorization headers: not recorded.
- Env values, DB URLs, raw DB rows, internal numeric ids: not recorded.
- Provider payloads, raw prompts, raw AI output: not recorded.
- Full question, paper, material, resource, chunk, employee raw answer, plaintext `redeem_code`: not recorded.
