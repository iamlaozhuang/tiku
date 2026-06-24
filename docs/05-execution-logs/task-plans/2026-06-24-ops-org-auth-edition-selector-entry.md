# Task Plan: ops-org-auth-edition-selector-entry-2026-06-24

## Task Metadata

- Task id: `ops-org-auth-edition-selector-entry-2026-06-24`.
- Branch: `codex/ops-org-auth-edition-selector-entry-20260624`.
- Task kind: `implementation`.
- Execution profile: `local_low_risk_org_auth_edition_selector_entry`.
- Approval source: current user approved serial advancement of the remaining operations authorization repair tasks on 2026-06-24.
- Closeout authorization: materialized to this task from the current user serial approval plus standing low-risk Module Run v2 local closeout approval.
- Non-claim: this task must not declare standard edition MVP, advanced edition MVP, staging, production, Provider, payment, Cost Calibration, or final acceptance Pass.

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

- ADR-002 keeps runtime layering at route handler / service / repository / model; this task only changes the route-facing validator and existing UI entry.
- ADR-007 defines source `edition`, computed `effectiveEdition`, and upgrade status. The original source `edition` must not be overwritten by computed state.
- `edition-aware-authorization-requirements.md` states that `org_auth` creation must expose an explicit `edition = standard | advanced` selector.
- `modules/06-admin-ops.md` and `stories/epic-06-admin-ops.md` add US-06-04 AC-5: creating `org_auth` requires explicit standard or advanced edition selection.
- The 2026-06-24 role-separated alignment routes R11 to operations authorization repair and states that hidden defaults are insufficient.

## Requirement Mapping

- R11 / `EAA-ORG-CREATE-STANDARD-ADVANCED-SELECTOR`: the operations `org_auth` create entry must visibly choose `standard | advanced` before submit.
- US-06-04 AC-1: lists continue to show `edition`, effective edition, quota usage, validity, and status with public identifiers only.
- US-06-04 AC-5: create submit must carry explicit source `edition`.
- Advanced ops auth quota acceptance: operations summaries show source `edition`, computed `effectiveEdition`, upgrade state, and quota owner safely.
- ADR-007 compatibility rule: existing read-side rows that lack explicit `edition` may still render as `standard`; create-side input must not rely on this fallback.

## Requirement/Role/Acceptance Mapping Result

- Requirement Mapping Result: mapped to R11, US-06-04 AC-1 and AC-5, advanced ops auth quota acceptance, and ADR-007 source/effective edition boundary.
- Role Mapping Result: `ops_admin` can create organization authorization through the system operations workspace; `content_admin`, organization admins, employees, and students are out of scope for this task.
- Acceptance Mapping Result: covers the local UI and validator layer of `EAA-ORG-CREATE-STANDARD-ADVANCED-SELECTOR`; runtime browser/e2e acceptance remains blocked for the later `ops-auth-runtime-validation-redacted` task.

## Requirement Mapping Result

- R11 / `EAA-ORG-CREATE-STANDARD-ADVANCED-SELECTOR`: in scope.
- US-06-04 AC-1 and AC-5: in scope.
- Advanced operations authorization quota acceptance: in scope for safe source/effective edition summary only.
- ADR-007 source `edition` and computed `effectiveEdition` boundary: in scope.

## Role Mapping Result

- `ops_admin`: in scope for system operations `org_auth` creation.
- `content_admin`, `org_standard_admin`, `org_advanced_admin`, employees, and students: out of scope.

## Acceptance Mapping Result

- Local UI and validator behavior for visible `standard | advanced` create selection: in scope.
- Runtime browser/e2e role acceptance and final MVP Pass: out of scope.

## Evidence-Only Sources

- `docs/05-execution-logs/task-plans/2026-06-24-ops-authorization-entry-repair-planning.md`.
- Existing source and tests inspected as implementation evidence only:
  - `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`.
  - `src/server/validators/org-auth.ts`.
  - `src/server/validators/org-auth.test.ts`.
  - `src/server/services/admin-organization-org-auth-runtime.ts`.
  - `src/server/contracts/organization-auth-contract.ts`.
  - `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
  - `tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`.

## Conflict Check

- No requirement conflict was found.
- Create-side behavior must be stricter than read-side compatibility: missing source `edition` in existing data may be interpreted as `standard`, but new create requests must provide an explicit valid `edition`.
- Manual upgrade, multi-scope bundle, employee import template, browser/e2e runtime validation, schema, migration, Provider, payment, staging/prod, external service, and final acceptance Pass are separate later tasks or blocked gates.

## Planned TDD Steps

1. RED: update focused unit tests to prove missing `edition` is rejected by the validator and that the operations UI cannot submit `org_auth` until an edition is explicitly selected.
2. GREEN: add the smallest UI and validator changes so the form has a visible selector, submit body includes `edition`, and the validator rejects omitted or invalid create-side edition.
3. REFACTOR: keep naming, public-id boundaries, and safe summaries intact without broad UI redesign.
4. Closeout validation: run targeted unit tests, lint, typecheck, scoped Prettier check, `git diff --check`, pre-commit hardening, and pre-push readiness.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-edition-selector-entry.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-edition-selector-entry.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-ops-org-auth-edition-selector-entry.md`.
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`.
- `src/server/validators/org-auth.ts`.
- `src/server/validators/org-auth.test.ts`.
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
- `tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`.

## Blocked Files And Work

- No `.env*`, package or lockfile, schema, migration, drizzle, script, e2e, browser runtime, dev server, Provider, payment, external-service, staging/prod, PR, force push, Cost Calibration, or final acceptance Pass work.
- No account fixture, database seed/write, plaintext `redeem_code`, token, password, Authorization header, database URL, raw DB row, prompt, provider payload, raw generated AI output, private answer text, or full `paper` content in evidence.

## Validation Commands

- `npm.cmd run test:unit -- src/server/validators/org-auth.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx src/server/validators/org-auth.ts src/server/validators/org-auth.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-edition-selector-entry.md docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-edition-selector-entry.md docs/05-execution-logs/audits-reviews/2026-06-24-ops-org-auth-edition-selector-entry.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-org-auth-edition-selector-entry-2026-06-24`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-org-auth-edition-selector-entry-2026-06-24 -SkipRemoteAheadCheck`

## Stop Conditions

- Stop if the fix requires schema, migration, database writes, dependency changes, env/secret access, Provider work, browser/e2e runtime, staging/prod, payment, external service, PR, force push, or Cost Calibration Gate.
- Stop if the change would need to resolve manual upgrade, multi-scope bundle, or employee import semantics in this task.
- Stop if validation failure points outside the allowed file set.
