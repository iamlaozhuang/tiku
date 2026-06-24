# Task Plan: ops-auth-runtime-validation-redacted-2026-06-24

## Task Metadata

- Task id: `ops-auth-runtime-validation-redacted-2026-06-24`.
- Branch: `codex/ops-auth-runtime-validation-redacted-20260624`.
- Task kind: `runtime_validation_redacted_with_fixture_repair`.
- Execution profile: `local_ops_authorization_role_runtime_validation_redacted_fixture_repair`.
- Planning skill: `superpowers:writing-plans` used with project path override to `docs/05-execution-logs/task-plans/`.
- Approval source: current user approved serial advancement of the remaining operations authorization repair tasks on 2026-06-24.
- Closeout authorization: materialized to this task from current user serial approval plus standing low-risk Module Run v2 closeout approval.
- Non-claim: this task records redacted local validation only and must not declare standard/advanced MVP final Pass.
- Fixture repair scope: after initial validation, two historical unit fixtures were allowed for test-only alignment with the already-active explicit `edition` and `profession/level` input gates. Production source remains blocked.

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

- `2026-06-24-role-separated-mvp-requirement-alignment.md` requires strict role-separated runtime observation after implementation and keeps the overall gate blocked until required allow/deny behavior passes with redacted evidence.
- R1/R2/R8 require backend workspaces to be separated by role and `ops_admin` to be denied from content authoring surfaces.
- R11/R12/R13 require `org_auth` edition selection, manual upgrade semantics, and multi-scope bundle direction to remain governed by authorization source-of-truth rules.
- R14/R15 require employee import template/guidance and binding-only scope enforcement.
- `edition-aware-authorization-acceptance-matrix.md` requires operations `redeem_code`, `org_auth`, employee import, and redacted audit/evidence behaviors to be validated without exposing sensitive payloads.
- ADR-002 keeps runtime behavior behind service/route contracts; ADR-007 keeps `edition` source and computed `effectiveEdition` semantics out of UI-only state.

## Requirement Mapping

- R1/R2/R8: in scope through role/workspace and direct route denial unit anchors.
- R11/R12/R13: in scope through operations authorization runtime and UI unit anchors; multi-scope remains design-only and not declared runtime Pass.
- R14/R15: in scope through employee import runtime and UI unit anchors.
- `EAA-OPS-REDEEM-SINGLE`, `EAA-OPS-REDEEM-SPECIFIED-QUANTITY`, `EAA-ORG-CREATE-STANDARD-ADVANCED-SELECTOR`, `EAA-ORG-MANUAL-UPGRADE-ENTRY`, `EAA-EMPLOYEE-IMPORT-BINDING-ONLY`, and `EAA-REDACTED-AUDIT`: in scope for local unit validation evidence.

## Requirement/Role/Acceptance Mapping Result

- Requirement Mapping Result: mapped to R1/R2/R8/R11/R12/R13/R14/R15 and the operations authorization acceptance rows listed above.
- Role Mapping Result: validates local evidence for `ops_admin`, `content_admin`, `org_standard_admin`, `org_advanced_admin`, `student`, `employee`, `super_admin`, and unauthenticated/denied contexts where the selected unit anchors cover them. This task does not claim full manual browser runtime for every role.
- Acceptance Mapping Result: local unit validation and redacted evidence can close this validation packet; final standard/advanced MVP Pass, browser/e2e runtime, staging/prod, Provider, payment, schema/migration, and Cost Calibration remain out of scope.

## Requirement Mapping Result

- R1/R2/R8/R11/R12/R13/R14/R15: in scope for local validation evidence.
- Overall role-separated acceptance gate: remains blocked; this task is supporting evidence only.

## Role Mapping Result

- `ops_admin`: in scope for operations workspace, `redeem_code`, `org_auth`, employee import, contact config, and content-authoring denial anchors.
- `content_admin`: in scope for content workspace and operations-denial anchors.
- `org_standard_admin` and `org_advanced_admin`: in scope for organization workspace/AI-entry/static route anchors.
- `student` and `employee`: in scope where selected local role/authorization anchors cover student or employee flows.
- `super_admin`: in scope as a privileged operations role in selected unit anchors.
- Unauthenticated/denied contexts: in scope where guard tests cover them.

## Acceptance Mapping Result

- Local unit command evidence, lint/typecheck, diff, hardening, pre-push readiness, redacted evidence, and audit review: in scope.
- Source/test implementation, browser/e2e runtime, real account credentials, staging/prod, Provider, payment, schema/migration/database, dependencies, PR, force push, Cost Calibration, and final MVP Pass: out of scope.

## Evidence-Only Sources

- `docs/05-execution-logs/task-plans/2026-06-24-ops-redeem-code-generation-scope-entry.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-edition-selector-entry.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-manual-upgrade-planning.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-multi-scope-design.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-employee-import-template-boundary.md`.
- `tests/unit/admin-dashboard-layout-navigation.test.ts`.
- `tests/unit/student-login-ui.test.ts`.
- `tests/unit/auth/session-personal-auth-boundary.test.ts`.
- `tests/unit/admin-ai-generation-entry-surface.test.ts`.
- `tests/unit/organization-portal-admin-entry-surface.test.ts`.
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
- `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts`.
- `tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts`.
- `tests/unit/phase-20-ra-01-04-employee-import.test.ts`.
- `tests/unit/phase-20-ra-01-09-contact-config-runtime.test.ts`.
- `tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`.
- `tests/unit/phase-20-ra-06-04-org-auth-detail-route-alignment.test.ts`.
- `tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`.

## Conflict Check

- No requirement conflict was found.
- This task intentionally records redacted validation evidence and permits two fixture-only test updates after the initial validation exposed stale fixtures.
- Initial selected validation failed because two historical unit fixtures did not include newly required explicit authorization inputs. This is handled as test-only fixture repair inside this task before rerunning the same validation.
- If rerun validation fails due to source behavior, stop and create a separate repair task with its own allowed file range.
- Evidence must remain redacted and must not include raw request bodies, tokens, credentials, plaintext `redeem_code`, internal database rows, provider payloads, prompts, generated AI content, private answers, or full `paper` content.

## Validation Plan

- [x] Create task plan, evidence, audit review, queue entry, and current task state before running validation.
- [x] Run scoped Prettier check/write as needed for docs/state files.
- [x] Run selected local unit anchors and capture RED fixture failure.
- [x] Repair the two allowed historical unit fixtures without changing production source.
- [x] Rerun selected local unit anchors for role/workspace, operations authorization, `redeem_code`, `org_auth`, employee import, contact config, and redacted audit behavior.
- [x] Run `npm.cmd run lint`.
- [x] Run `npm.cmd run typecheck`.
- [x] Run `git diff --check`.
- [x] Run Module Run v2 pre-commit hardening.
- [x] Run Module Run v2 pre-push readiness.
- [x] Record redacted validation results in evidence and audit review.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-auth-runtime-validation-redacted.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-auth-runtime-validation-redacted.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-ops-auth-runtime-validation-redacted.md`.
- `tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts`.
- `tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`.

## Read-Only Allowed Files

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/**`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/01-requirements/**`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-redeem-code-generation-scope-entry.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-edition-selector-entry.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-manual-upgrade-planning.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-multi-scope-design.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-employee-import-template-boundary.md`.
- `src/**`.
- `tests/**`.
- `package.json`.

## Blocked Files And Work

- No production source, broad tests, e2e, schema, migration, dependency, package, lockfile, `.env*`, script, Provider, payment, external-service, staging/prod, PR, force push, browser/e2e runtime, or Cost Calibration work.
- No final standard/advanced MVP Pass claim.
- No sensitive data in evidence.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-ops-auth-runtime-validation-redacted.md docs/05-execution-logs/evidence/2026-06-24-ops-auth-runtime-validation-redacted.md docs/05-execution-logs/audits-reviews/2026-06-24-ops-auth-runtime-validation-redacted.md`
- `npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-11-redeem-code-batch-management-loop.test.ts tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts tests/unit/phase-20-ra-01-09-contact-config-runtime.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts tests/unit/phase-20-ra-06-04-org-auth-detail-route-alignment.test.ts tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-auth-runtime-validation-redacted-2026-06-24`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-auth-runtime-validation-redacted-2026-06-24 -SkipRemoteAheadCheck`

## Stop Conditions

- Stop if validation requires browser/e2e runtime, env/secret access, Provider, schema/migration/database, dependency, package/lockfile, staging/prod, payment, external service, PR, force push, Cost Calibration, or sensitive evidence.
- Stop and create a separate repair task if local unit validation fails due to source behavior.
