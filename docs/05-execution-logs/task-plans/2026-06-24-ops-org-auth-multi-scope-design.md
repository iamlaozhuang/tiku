# Task Plan: ops-org-auth-multi-scope-design-2026-06-24

## Task Metadata

- Task id: `ops-org-auth-multi-scope-design-2026-06-24`.
- Branch: `codex/ops-org-auth-multi-scope-design-20260624`.
- Task kind: `docs_only`.
- Execution profile: `local_docs_only_org_auth_multi_scope_contract_security_design`.
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

- ADR-002 keeps runtime changes in the route handler / service / repository / model boundary; this docs-only task does not implement that runtime path.
- ADR-007 requires source `edition` to remain on authorization records and `effectiveEdition` to be computed by services, not UI state.
- `edition-aware-authorization-requirements.md` says `org_auth` remains the bundle or purchase record while future atomic scopes such as `org_auth_scope` represent one organization coverage plus one `profession`, one `level`, one `subject`, one `edition`, one time window, and one quota rule.
- `2026-06-21-org-auth-scope-product-decision.md` confirms that `auth_scope_type` describes organization coverage only and must not be overloaded for `profession`, `level`, `subject`, or `edition`.
- `2026-06-24-role-separated-mvp-requirement-alignment.md` routes R13 to this design packet and keeps runtime Pass blocked.

## Requirement Mapping

- R13: in scope for docs/contract/security design only. One commercial enterprise package may cover multiple `profession + level` combinations through atomic scopes.
- `EAA-ORG-MULTI-SCOPE-BUNDLE`: in scope for future acceptance design. The package remains one `org_auth` bundle with expanded atomic scopes for eligibility, quota, conflict, expiry, cancellation, and audit.
- US-06-04 AC-7: in scope for future operations UI planning. The UI must show selected bundle, expanded atomic rows, quota and expiry differences, cancellation differences, and conflict warnings before submit.
- Employee import R14/R15 is a dependent boundary, not implemented here; the design must not create employee template inputs for `profession`, `level`, `edition`, or `orgAuthScopePublicId`.

## Requirement/Role/Acceptance Mapping Result

- Requirement Mapping Result: mapped to R13, `EAA-ORG-MULTI-SCOPE-BUNDLE`, US-06-04 AC-7, and the `org_auth_scope` direction in the 2026-06-21 product decision.
- Role Mapping Result: `ops_admin` and `super_admin` are the future bundle creation actors; `org_standard_admin`, `org_advanced_admin`, employees, students, and `content_admin` are out of scope for global bundle creation.
- Acceptance Mapping Result: this task can close only the design/preflight layer; schema approval, migration, API, service, UI, audit, quota, security review, and runtime evidence remain required.

## Requirement Mapping Result

- R13: in scope for planning/preflight.
- `EAA-ORG-MULTI-SCOPE-BUNDLE`: in scope for future implementation acceptance design.
- US-06-04 AC-7: in scope for future operations UI flow.
- ADR-007 and the 2026-06-21 org auth scope decision: in scope for source-of-truth and atomic-scope boundaries.

## Role Mapping Result

- `ops_admin` and `super_admin`: future governed bundle creation actors.
- Organization admins, employees, students, and `content_admin`: out of scope for global bundle creation.

## Acceptance Mapping Result

- Planning/preflight layer for `EAA-ORG-MULTI-SCOPE-BUNDLE`: in scope.
- Runtime acceptance, browser/e2e validation, schema/migration execution, and final MVP Pass: out of scope.

## Evidence-Only Sources

- `docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-manual-upgrade-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-manual-upgrade-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-ops-org-auth-manual-upgrade-planning.md`.
- `src/db/schema/auth.ts`.
- `src/server/contracts/organization-auth-contract.ts`.
- `src/server/models/auth.ts`.
- `src/server/services/admin-organization-org-auth-runtime.ts`.
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`.
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.

## Conflict Check

- No requirement conflict was found.
- Current code remains a single-scope baseline: `org_auth` stores one `profession`, one `level`, one `edition`, one quota, and organization coverage through `org_auth_organization`; no `org_auth_scope` child structure exists.
- That current baseline is compatible only as legacy/current behavior. Future multi-scope implementation must not store arrays or comma-joined values in `org_auth.profession` or `org_auth.level`.
- This task records the future target design only and does not approve schema, migration, API, service, UI, or runtime work.

## Multi-Scope Design

Future design direction:

- `org_auth` remains the commercial authorization bundle or purchase record.
- A later schema-approved child table, currently referred to as `org_auth_scope`, represents atomic authorization rows.
- One atomic row represents one organization coverage set, one `profession`, one `level`, one registered `subject`, one source `edition`, one effective time window, and one quota rule.
- Existing single-scope `org_auth` records are interpreted as compatible bundle records with implicit atomic scopes for both registered `subject` values, `theory` and `skill`, until a later approved migration records explicit child rows.
- `auth_scope_type` continues to represent organization coverage only: `current_and_descendants` or `specified_nodes`.
- UI may present a multi-`profession` and multi-`level` package, but submit/preview must show expanded atomic scopes before final confirmation.
- Active overlap is denied for the same effective `organization`, `profession`, `level`, `subject`, `edition`, and time window unless a later approved renewal, extension, upgrade, or precedence rule exists.
- Quota summaries may aggregate for display, but consumption and audit must retain the atomic scope that grants access.
- URLs, DTOs, logs, and evidence must use public identifiers and redacted summaries, not internal database ids or raw rows.

Future contract sketch, subject to a separate implementation task:

```ts
type OrgAuthBundleScopeInput = {
  profession: "monopoly" | "marketing" | "logistics";
  level: number;
  subjects: Array<"theory" | "skill">;
  accountQuota: number;
};
```

The future implementation must normalize every `subjects` entry into one atomic scope row. If a future UI offers an
"all subjects" convenience, it must expand to `theory` and `skill`; no new enum value is introduced by this task.

## Future Implementation Packets

### Task 1: Schema Approval Package

**Files:**

- Create or modify a future schema approval document under `docs/02-architecture/interfaces/`.
- No schema or migration execution in this task.

- [ ] Define `org_auth_scope` columns, indexes, public ids, uniqueness and overlap rules.
- [ ] Define backward compatibility for current `org_auth.profession` and `org_auth.level`.
- [ ] Request fresh schema/migration approval before touching `src/db/schema/**` or `drizzle/**`.

### Task 2: Contract And Validator

**Files:**

- Modify: `src/server/contracts/organization-auth-contract.ts`.
- Modify: `src/server/validators/org-auth.ts`.
- Test: `src/server/validators/org-auth.test.ts`.

- [ ] Add bundle input fields for repeated `profession + level + subject` scopes.
- [ ] Reject empty scope lists, invalid duplicate scope rows, and unregistered subject values.
- [ ] Preserve current single-scope input compatibility only when the task explicitly chooses that path.

### Task 3: Service And Repository

**Files:**

- Modify: `src/server/services/admin-organization-org-auth-runtime.ts`.
- Modify: `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`.
- Test: `tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`.

- [ ] Create a bundle and its atomic child scopes in one governed transaction.
- [ ] Run overlap and quota checks on expanded atomic scopes.
- [ ] Attribute audit and quota consumption to the exact atomic scope.

### Task 4: Operations UI

**Files:**

- Modify: `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`.
- Test: `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.

- [ ] Add a scoped bundle editor that supports multiple `profession + level` rows.
- [ ] Show expanded atomic scopes, quota/expiry/cancellation differences, and conflict warnings before submit.
- [ ] Keep employee import fields separate from bundle scope fields.

### Task 5: Redacted Runtime Validation

**Files:**

- Create future evidence and audit files only after a separate runtime validation task is approved.

- [ ] Validate `ops_admin` can create/view safe multi-scope summaries.
- [ ] Validate direct role and organization access denial boundaries.
- [ ] Keep evidence free of secrets, cleartext `redeem_code`, raw DB rows, raw prompts, provider payloads, private answers, or full `paper` content.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-multi-scope-design.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-multi-scope-design.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-ops-org-auth-multi-scope-design.md`.

## Blocked Files And Work

- No source, tests, e2e, schema, migration, dependency, package, lockfile, `.env*`, script, Provider, payment, external-service, staging/prod, PR, force push, or Cost Calibration work.
- No browser/e2e/dev-server runtime validation in this planning task.
- No plaintext `redeem_code`, token, password, Authorization header, database URL, raw DB row, provider payload, prompt, raw generated AI content, private answer text, or full `paper` content in evidence.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-multi-scope-design.md docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-multi-scope-design.md docs/05-execution-logs/audits-reviews/2026-06-24-ops-org-auth-multi-scope-design.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-org-auth-multi-scope-design-2026-06-24`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-org-auth-multi-scope-design-2026-06-24 -SkipRemoteAheadCheck`

## Stop Conditions

- Stop if implementation becomes necessary before a follow-up implementation task is created.
- Stop if schema/migration, database write, dependency, env/secret, Provider, payment, staging/prod, external-service, browser/e2e, PR, force push, or Cost Calibration work becomes necessary.
- Stop if evidence would need sensitive values or runtime data.
