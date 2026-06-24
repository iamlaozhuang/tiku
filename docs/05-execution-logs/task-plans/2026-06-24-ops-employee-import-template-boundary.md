# Task Plan: ops-employee-import-template-boundary-2026-06-24

## Task Metadata

- Task id: `ops-employee-import-template-boundary-2026-06-24`.
- Branch: `codex/ops-employee-import-template-boundary-20260624`.
- Task kind: `implementation_tdd`.
- Execution profile: `local_low_risk_ops_employee_import_template_boundary`.
- Planning skill: `superpowers:writing-plans` used with project path override to `docs/05-execution-logs/task-plans/`.
- TDD skill: `superpowers:test-driven-development` used before source changes.
- Approval source: current user approved serial advancement of the remaining operations authorization repair tasks on 2026-06-24.
- Closeout authorization: materialized to this task from current user serial approval plus standing low-risk Module Run v2 closeout approval.
- Non-claim: this task must not declare standard/advanced MVP final Pass.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`.
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
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

## Requirement Decision Map

- `modules/01-user-auth.md` requires employee import to bind employee accounts to `organization` only; template inputs must not include `profession`, `level`, `edition`, or `orgAuthScopePublicId`.
- `modules/06-admin-ops.md` requires the operations employee import workflow to provide reusable template download or equivalent guidance while keeping the template employee-plus-organization only.
- `epic-06-admin-ops.md` US-06-03 AC-5 and AC-6 require template guidance to exclude restricted scope fields and preview row outcomes with redacted reasons.
- `edition-aware-authorization-requirements.md` requires employee visible scope to be derived from active organization authorization scopes, not from import input.
- `2026-06-24-role-separated-mvp-requirement-alignment.md` maps R14/R15 to this boundary: employee import template/guidance exists, preview is redacted, and scope is inherited from `org_auth_scope`.
- `edition-aware-authorization-acceptance-matrix.md` maps `EAA-EMPLOYEE-IMPORT-BINDING-ONLY` and `EAA-EMPLOYEE-INHERITED-SCOPE-PREVIEW` to this task.
- ADR-007 keeps source authorization scope on authorization records; employee import must not introduce a parallel source of truth.

## Requirement Mapping

- R14: in scope. The UI must provide equivalent template guidance for employee import.
- R15: in scope. Employee import binds employees to organization only and must reject restricted scope fields as input.
- US-06-03 AC-5: in scope. The template guidance and input validator must exclude `profession`, `level`, `edition`, and `orgAuthScopePublicId`.
- US-06-03 AC-6: in scope. Preview/submission must fail safely with redacted, non-sensitive feedback when forbidden template fields are present.
- `EAA-EMPLOYEE-IMPORT-BINDING-ONLY`: in scope for UI and service boundary.
- `EAA-EMPLOYEE-INHERITED-SCOPE-PREVIEW`: in scope for redacted preview boundary only; full quota/scope calculation remains dependent on later runtime auth scope implementation.

## Requirement/Role/Acceptance Mapping Result

- Requirement Mapping Result: mapped to R14, R15, US-06-03 AC-5/AC-6, `EAA-EMPLOYEE-IMPORT-BINDING-ONLY`, and `EAA-EMPLOYEE-INHERITED-SCOPE-PREVIEW`.
- Role Mapping Result: `ops_admin` and `super_admin` may use the operations employee import workflow; organization admins, employees, students, and `content_admin` are out of scope for this operations mutation.
- Acceptance Mapping Result: this task can close the local UI/service/test boundary for forbidden employee import scope fields; multi-scope runtime entitlement and final MVP Pass remain out of scope.

## Requirement Mapping Result

- R14: in scope for template/equivalent guidance.
- R15: in scope for binding-only input enforcement.
- US-06-03 AC-5/AC-6: in scope for forbidden field rejection and redacted preview feedback.
- `EAA-EMPLOYEE-IMPORT-BINDING-ONLY`: in scope.
- `EAA-EMPLOYEE-INHERITED-SCOPE-PREVIEW`: in scope only for preview redaction boundary.

## Role Mapping Result

- `ops_admin` and `super_admin`: in scope for the operations import action.
- Organization admins, employees, students, and `content_admin`: out of scope for this page-level mutation.

## Acceptance Mapping Result

- Local UI preview, submit blocking, service parser rejection, unit tests, evidence, and audit review: in scope.
- Browser/e2e runtime, schema/migration/database changes, external services, Provider, staging/prod, payment, PR, force push, Cost Calibration, and final MVP Pass: out of scope.

## Evidence-Only Sources

- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`.
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`.
- `src/server/services/admin-organization-org-auth-runtime.ts`.
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
- `tests/unit/phase-20-ra-01-04-employee-import.test.ts`.

## Conflict Check

- No requirement conflict was found.
- Current contract already keeps structured legacy employee import rows to `userPublicId` and `organizationPublicId`.
- Current account CSV import accepts `phone`, `name`, `initialPassword`, and `organizationPublicId`; it needs an explicit forbidden-field boundary for scope columns.
- This task does not change authorization source-of-truth, schema, migrations, quota rules, or role permission model.

## Implementation Plan

### Task 1: Register And Gate Task

**Files:**

- Modify: `docs/04-agent-system/state/project-state.yaml`.
- Modify: `docs/04-agent-system/state/task-queue.yaml`.
- Create: `docs/05-execution-logs/task-plans/2026-06-24-ops-employee-import-template-boundary.md`.
- Create: `docs/05-execution-logs/evidence/2026-06-24-ops-employee-import-template-boundary.md`.
- Create: `docs/05-execution-logs/audits-reviews/2026-06-24-ops-employee-import-template-boundary.md`.

- [x] Write task plan with SSOT Read List, mapping result, allowed files, blocked files, and validation commands.
- [x] Update project state and queue entry before code edits.
- [x] Run scoped format and pre-commit hardening before implementation.

### Task 2: Client TDD

**Files:**

- Test: `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
- Modify: `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`.

- [x] Add a failing unit test that pastes CSV headers containing `profession`, `level`, `edition`, and `orgAuthScopePublicId`; expected result is preview blocked and no `/api/v1/employees/import` call.
- [x] Run the targeted unit test and record the expected failure.
- [x] Implement minimal client helper logic to detect forbidden header fields, update preview state, disable submit, and show equivalent template guidance.
- [x] Rerun the targeted unit test and record the pass.

### Task 3: Service TDD

**Files:**

- Test: `tests/unit/phase-20-ra-01-04-employee-import.test.ts`.
- Modify: `src/server/services/admin-organization-org-auth-runtime.ts`.

- [x] Add a failing service unit test that posts account CSV content with a restricted scope header and expects no employee account service calls plus a redacted rejected row.
- [x] Run the targeted service unit test and record the expected failure.
- [x] Implement minimal parser-side header rejection for restricted employee import scope fields.
- [x] Rerun the targeted service unit test and record the pass.

### Task 4: Validation And Closeout

**Files:**

- Modify: `docs/05-execution-logs/evidence/2026-06-24-ops-employee-import-template-boundary.md`.
- Modify: `docs/05-execution-logs/audits-reviews/2026-06-24-ops-employee-import-template-boundary.md`.
- Modify: `docs/04-agent-system/state/project-state.yaml`.
- Modify: `docs/04-agent-system/state/task-queue.yaml`.

- [x] Run scoped Prettier check/write as needed.
- [x] Run `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts`.
- [x] Run `npm.cmd run lint`.
- [x] Run `npm.cmd run typecheck`.
- [x] Run `git diff --check`.
- [x] Run Module Run v2 pre-commit hardening.
- [x] Run Module Run v2 pre-push readiness.
- [x] Update evidence/audit/state/queue with redacted results.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-employee-import-template-boundary.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-employee-import-template-boundary.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-ops-employee-import-template-boundary.md`.
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`.
- `src/server/services/admin-organization-org-auth-runtime.ts`.
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
- `tests/unit/phase-20-ra-01-04-employee-import.test.ts`.

## Blocked Files And Work

- No `.env*`, package, lockfile, dependency, schema, migration, database write, Provider, Cost Calibration, e2e/browser runtime, staging/prod/deploy, payment, external-service, PR, force push, or final MVP Pass work.
- No plaintext `redeem_code`, token, password, Authorization header, database URL, raw DB row, provider payload, prompt, raw generated AI content, private answer text, or full `paper` content in evidence.
- No authorization model expansion beyond this employee import template/input boundary.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-ops-employee-import-template-boundary.md docs/05-execution-logs/evidence/2026-06-24-ops-employee-import-template-boundary.md docs/05-execution-logs/audits-reviews/2026-06-24-ops-employee-import-template-boundary.md src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx src/server/services/admin-organization-org-auth-runtime.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts`
- `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-employee-import-template-boundary-2026-06-24`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-employee-import-template-boundary-2026-06-24 -SkipRemoteAheadCheck`

## Stop Conditions

- Stop if the fix requires schema/migration/database writes, dependency changes, `.env*`, Provider, payment, external service, staging/prod, e2e/browser runtime, PR, force push, Cost Calibration, or final acceptance Pass.
- Stop if evidence would need sensitive values or runtime data.
