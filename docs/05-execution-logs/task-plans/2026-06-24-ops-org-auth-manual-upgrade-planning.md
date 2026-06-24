# Task Plan: ops-org-auth-manual-upgrade-planning-2026-06-24

## Task Metadata

- Task id: `ops-org-auth-manual-upgrade-planning-2026-06-24`.
- Branch: `codex/ops-org-auth-manual-upgrade-planning-20260624`.
- Task kind: `docs_only`.
- Execution profile: `local_docs_only_org_auth_manual_upgrade_preflight`.
- Planning skill: `superpowers:writing-plans` used with project path override to `docs/05-execution-logs/task-plans/`.
- Approval source: current user approved serial advancement of the remaining operations authorization repair tasks on 2026-06-24.
- Closeout authorization: materialized to this task from current user serial approval plus standing docs/state closeout approval.
- Non-claim: this task does not change runtime behavior and must not declare standard/advanced MVP final Pass.

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

- ADR-002 keeps mutation work in route handler / service / repository / model order; future manual-upgrade implementation must not hide authorization checks in UI state.
- ADR-007 states that standard-to-advanced upgrade facts live in `auth_upgrade`; source `org_auth.edition` is not overwritten.
- `edition-aware-authorization-requirements.md` requires `auth_upgrade.source_type = ops_manual`, external reference, operations note, operator public id, and linked `audit_log`.
- `modules/06-admin-ops.md` and `stories/epic-06-admin-ops.md` add US-06-04 AC-6 for a governed operations upgrade entry.
- The 2026-06-24 role-separated alignment routes R12 to this planning packet and keeps runtime Pass blocked.

## Requirement Mapping

- R12 / `EAA-ORG-MANUAL-UPGRADE-ENTRY`: in scope for docs/contract/security preflight only.
- `EAA-ORG-MANUAL-UPGRADE`: in scope as the acceptance row that states active standard `org_auth` can be upgraded by platform operations with external reference and operations note.
- US-06-04 AC-6: in scope for future operations UI entry planning.
- ADR-007 source/effective edition boundary: in scope; original `org_auth` must remain unchanged.

## Requirement/Role/Acceptance Mapping Result

- Requirement Mapping Result: mapped to R12, `EAA-ORG-MANUAL-UPGRADE-ENTRY`, `EAA-ORG-MANUAL-UPGRADE`, US-06-04 AC-6, and ADR-007.
- Role Mapping Result: `ops_admin` / `super_admin` operations mutation path is in scope for future implementation; organization admins, employees, students, and content admins are out of scope for upgrade mutation.
- Acceptance Mapping Result: this task can close only the planning/preflight layer; schema/API/service/UI/audit/runtime evidence remains required before acceptance can pass.

## Requirement Mapping Result

- R12 / `EAA-ORG-MANUAL-UPGRADE-ENTRY`: in scope for planning/preflight.
- `EAA-ORG-MANUAL-UPGRADE`: in scope for future implementation acceptance design.
- US-06-04 AC-6: in scope for the operations controlled upgrade entry.
- ADR-007: in scope for preserving source `org_auth.edition` and computing `effectiveEdition` from `auth_upgrade`.

## Role Mapping Result

- `ops_admin` and `super_admin`: future governed mutation actors.
- `org_standard_admin`, `org_advanced_admin`, employees, students, and `content_admin`: out of scope for upgrade mutation.

## Acceptance Mapping Result

- Planning/preflight layer for `EAA-ORG-MANUAL-UPGRADE-ENTRY`: in scope.
- Runtime acceptance, browser/e2e validation, and final MVP Pass: out of scope.

## Evidence-Only Sources

- `docs/05-execution-logs/task-plans/2026-06-24-ops-authorization-entry-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-authorization-entry-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-ops-authorization-entry-repair-planning.md`.
- `src/db/schema/auth.ts`.
- `src/db/schema/auth.test.ts`.
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`.
- `src/server/contracts/organization-auth-contract.ts`.
- `src/server/models/auth.ts`.
- `src/server/services/admin-organization-org-auth-runtime.ts`.
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`.
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.

## Conflict Check

- No requirement conflict was found.
- Current schema already contains `auth_upgrade` fields for `ops_reference`, `ops_note`, `operator_admin_id`, status, revocation, and source relation; this planning task does not approve schema or migration changes.
- Current operations runtime lists `effectiveEdition` and `upgradeStatus`, but has no governed manual-upgrade mutation entry; this task documents the future packet and does not change code.

## Manual Upgrade Preflight Design

- Future route shape: `POST /api/v1/org-auths/{publicId}/manual-upgrade`.
- Future request JSON fields:
  - `externalReference: string` required, trimmed, 1-120 characters.
  - `operationsNote: string` required, trimmed, 10-500 characters.
- Future server-derived fields:
  - `sourceType = "ops_manual"`.
  - `targetEdition = "advanced"`.
  - `operatorAdminPublicId` from the authenticated admin session; no client-supplied operator id.
  - `startsAt` from server time.
  - `expiresAt` inherited from target `org_auth.expiresAt`.
  - linked `audit_log` record with redacted metadata.
- Future eligibility checks:
  - actor is `super_admin` or `ops_admin`.
  - target `org_auth` exists by public id and is active.
  - source `org_auth.edition` is `standard` or legacy-missing interpreted as standard.
  - target has no active unrevoked advanced `auth_upgrade`.
  - expired, cancelled, advanced-source, or already-upgraded records return safe validation errors without creating a new upgrade.
- Future response summary:
  - standard API envelope.
  - `orgAuth.publicId`, source `edition`, computed `effectiveEdition`, `upgradeStatus`, expiry, and redacted audit reference.
  - no internal id, raw database row, token, secret, plaintext `redeem_code`, provider payload, prompt, or private content.

## Future Implementation Packet

### Task 1: Contract And Validator

**Files:**

- Modify: `src/server/contracts/organization-auth-contract.ts`.
- Modify: `src/server/validators/org-auth.ts`.
- Test: `src/server/validators/org-auth.test.ts`.

- [ ] Add `OrgAuthManualUpgradeInput` and `OrgAuthManualUpgradeResultDto`.
- [ ] Add a validator that rejects missing or short `externalReference` and `operationsNote`.
- [ ] Run `npm.cmd run test:unit -- src/server/validators/org-auth.test.ts`.

### Task 2: Runtime Service And Repository

**Files:**

- Modify: `src/server/services/admin-organization-org-auth-runtime.ts`.
- Modify: `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`.
- Test: `tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`.

- [ ] Add repository capability to create one `auth_upgrade` row with `source_type = "ops_manual"`.
- [ ] Use server-derived operator admin and source `org_auth.expires_at`.
- [ ] Add audit logging for success and safe failures.
- [ ] Run `npm.cmd run test:unit -- tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`.

### Task 3: Operations UI Entry

**Files:**

- Modify: `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`.
- Test: `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.

- [ ] Show an upgrade action only for source standard org authorization summaries.
- [ ] Require external reference and operations note before confirmation.
- [ ] Display redacted upgrade result and refresh safe list/detail summaries.
- [ ] Run `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts`.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-manual-upgrade-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-manual-upgrade-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-ops-org-auth-manual-upgrade-planning.md`.

## Blocked Files And Work

- No source, tests, e2e, schema, migration, dependency, package, lockfile, `.env*`, script, Provider, payment, external-service, staging/prod, PR, force push, or Cost Calibration work.
- No browser/e2e/dev-server runtime validation in this planning task.
- No plaintext `redeem_code`, token, password, Authorization header, database URL, raw DB row, provider payload, prompt, raw generated AI content, private answer text, or full `paper` content in evidence.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-manual-upgrade-planning.md docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-manual-upgrade-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-ops-org-auth-manual-upgrade-planning.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-org-auth-manual-upgrade-planning-2026-06-24`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-org-auth-manual-upgrade-planning-2026-06-24 -SkipRemoteAheadCheck`

## Stop Conditions

- Stop if implementation becomes necessary before a follow-up implementation task is created.
- Stop if schema/migration, database write, dependency, env/secret, Provider, payment, staging/prod, external-service, browser/e2e, PR, force push, or Cost Calibration work becomes necessary.
- Stop if evidence would need sensitive values or runtime data.
