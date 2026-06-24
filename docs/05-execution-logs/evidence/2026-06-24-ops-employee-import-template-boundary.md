# Evidence: ops-employee-import-template-boundary-2026-06-24

## Summary

- Task id: `ops-employee-import-template-boundary-2026-06-24`.
- Branch: `codex/ops-employee-import-template-boundary-20260624`.
- Task kind: `implementation_tdd`.
- Status: closed after fast-forward merge to `master` and post-merge validation.
- Scope: operations employee import template/input boundary for forbidden scope fields.
- Non-claim: this evidence does not declare standard/advanced MVP final Pass.

## Approval Boundary

- Approval source: current user approved serial advancement of operations authorization repair tasks on 2026-06-24.
- Approved local actions: task registration, task plan/evidence/audit creation, scoped local implementation, targeted local validation, local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch cleanup if all task gates pass.
- Still blocked: `.env*`, Provider, Cost Calibration, schema/migration/database writes, dependency or lockfile changes, browser/e2e runtime, staging/prod/deploy, payment/external services, PR, force push, and final acceptance Pass.

## SSOT Read List

- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`.
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement/Role/Acceptance Mapping Result

- Requirement Mapping Result: mapped to R14, R15, US-06-03 AC-5/AC-6, `EAA-EMPLOYEE-IMPORT-BINDING-ONLY`, and `EAA-EMPLOYEE-INHERITED-SCOPE-PREVIEW`.
- Role Mapping Result: `ops_admin` and `super_admin` are in scope for the operations employee import mutation; organization admins, employees, students, and `content_admin` are out of scope.
- Acceptance Mapping Result: this task can close local UI/service/test enforcement for forbidden employee import scope fields; full multi-scope runtime entitlement and final MVP Pass remain out of scope.

## Requirement Mapping Result

- R14/R15: in scope.
- US-06-03 AC-5/AC-6: in scope.
- `EAA-EMPLOYEE-IMPORT-BINDING-ONLY` and `EAA-EMPLOYEE-INHERITED-SCOPE-PREVIEW`: in scope for local boundary enforcement.

## Role Mapping Result

- `ops_admin` and `super_admin`: in scope.
- Organization admins, employees, students, and `content_admin`: out of scope for this operations mutation.

## Acceptance Mapping Result

- Local UI preview, submit blocking, parser rejection, targeted unit tests, evidence, and audit review: in scope.
- Runtime entitlement implementation, e2e/browser runtime, schema/migration/database writes, Provider, payment, staging/prod, Cost Calibration, PR, force push, and final MVP Pass: out of scope.

## Current Code Evidence Summary

- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx` now detects forbidden employee import header fields before preview/submission. When the first row is an employee import header containing `profession`, `level`, `edition`, or `orgAuthScopePublicId`, the preview is not ready and submit remains disabled.
- The operations employee import guidance now states that import binds employees to `organization` only and must not include the restricted scope fields.
- `src/server/services/admin-organization-org-auth-runtime.ts` now rejects employee account CSV/TSV headers containing restricted authorization scope fields before creating employee accounts.
- The server rejection returns a redacted rejected-row result with `invalid_row` and does not call the employee account service.

## RED/GREEN Evidence

- RED command: `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts`.
- RED result: failed as expected. UI preview still accepted the restricted-field CSV as one employee row, and service parsing imported one employee instead of rejecting the restricted header.
- GREEN command: same targeted unit command after implementation.
- GREEN result: passed. Output showed `Test Files 2 passed (2)` and `Tests 20 passed (20)`.

## Validation Results

- Initial scoped mechanism validation before source edits:
  - `npx.cmd prettier --write --ignore-unknown ...`: passed; five mechanism files unchanged.
  - `npx.cmd prettier --check --ignore-unknown ...`: passed with `All matched files use Prettier code style!`.
  - `git diff --check`: passed with no whitespace errors.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-employee-import-template-boundary-2026-06-24`: passed for five mechanism files. Output included all files in scope and `Cost Calibration Gate remains blocked`.
- Implementation validation:
  - `npx.cmd prettier --write --ignore-unknown ...`: passed; source files were formatted, docs/tests were unchanged.
  - `npx.cmd prettier --check --ignore-unknown ...`: passed with `All matched files use Prettier code style!`.
  - `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts`: passed. Output showed `Test Files 2 passed (2)` and `Tests 20 passed (20)`.
  - `npm.cmd run lint`: passed.
  - `npm.cmd run typecheck`: passed.
  - `git diff --check`: passed with no whitespace errors.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-employee-import-template-boundary-2026-06-24`: passed. Output showed nine files in scope and `Cost Calibration Gate remains blocked`.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-employee-import-template-boundary-2026-06-24 -SkipRemoteAheadCheck`: passed. Output showed branch `codex/ops-employee-import-template-boundary-20260624`, `master`, `origin/master`, and state SHAs aligned at `45a7f14f3b524052421aa0f26f127ee9a4847b4f`.

## Post-Merge Master Validation Results

- Fast-forward merge target: `master`.
- Implementation commit: `d62d473e079753bbb413d7c509df59c7f7a0a41e`.
- Timestamp: `2026-06-24T10:02:01-07:00`.
- `npx.cmd prettier --check --ignore-unknown ...`: passed on `master` with `All matched files use Prettier code style!`.
- `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts`: passed on `master`. Output showed `Test Files 2 passed (2)` and `Tests 20 passed (20)`.
- `npm.cmd run lint`: passed on `master`.
- `npm.cmd run typecheck`: passed on `master`.
- `git diff --check`: passed on `master` with no whitespace errors.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-employee-import-template-boundary-2026-06-24`: passed on `master` with `filesToScan: 0`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-employee-import-template-boundary-2026-06-24 -SkipRemoteAheadCheck`: passed on `master`. Output showed `master` at `d62d473e079753bbb413d7c509df59c7f7a0a41e`, `origin/master` at `45a7f14f3b524052421aa0f26f127ee9a4847b4f`, and state master SHA as an accepted ancestor.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`: current task pointer and validation status.
- `docs/04-agent-system/state/task-queue.yaml`: task entry, scope, validation commands, and validation status.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-employee-import-template-boundary.md`: SSOT-backed implementation plan.
- `docs/05-execution-logs/evidence/2026-06-24-ops-employee-import-template-boundary.md`: redacted evidence.
- `docs/05-execution-logs/audits-reviews/2026-06-24-ops-employee-import-template-boundary.md`: boundary review.
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`: employee import forbidden-scope-field preview/submit boundary and guidance.
- `src/server/services/admin-organization-org-auth-runtime.ts`: parser-side forbidden-scope-field rejection.
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`: UI regression coverage.
- `tests/unit/phase-20-ra-01-04-employee-import.test.ts`: service parser regression coverage.

## Blocked Remainder

- Multi-scope runtime entitlement, quota calculation, employee inherited-scope preview calculations, schema/migration/database work, dependencies, env/secret, Provider, browser/e2e, staging/prod, payment, external services, PR, force push, Cost Calibration, and final MVP Pass remain blocked.

## Redaction Notes

- Evidence records command status and summaries only.
- Evidence must not contain plaintext `redeem_code`, database rows, credentials, tokens, Authorization headers, provider payloads, prompts, raw generated AI content, private answer text, or full `paper` content.
