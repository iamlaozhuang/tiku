# 2026-07-02 Redeem Code Edition Plaintext Decision Doc Update

## Task

Record the confirmed `redeem_code` product decisions from the current requirement discussion:

1. Personal `redeem_code` must distinguish standard activation, advanced activation, and standard-to-advanced upgrade.
2. After generation, operations gets a distribution window, and `ops_admin` / `super_admin` may still view and copy plaintext `redeem_code` values from normal list and detail pages for distribution.

This is a docs-only requirement update. It does not approve product source changes, tests, schema, migration, database access, Provider execution, env/secret access, browser/runtime validation, staging/prod deployment, payment, release readiness, final Pass, or production usability claims.

## Current Discussion Package Addendum

The task scope was expanded in the same branch after the owner requested that all decisions already discussed in the
current round be processed without omissions. The expanded package remains docs-only and records:

- personal `redeem_code` types, upgrade target selection, and plaintext operations visibility;
- organization authorization overlap default block plus explicit closure actions;
- multi-profession/multi-level enterprise package atomic-scope direction;
- administrator/employee account separation and phone non-reuse;
- employee import fields, generated password distribution, reset-password handling, inherited authorization, and transfer
  quota/session behavior;
- organization tree ownership and node move restriction;
- organization training wizard, sources, snapshot/edit rules, evidence gating, draft/publish/takedown/deadline rules, and
  non-formal boundaries;
- organization analytics levels, date filters, small-sample warning, weak-point summaries, no export, and no enterprise
  AI quota consumption summary;
- organization workspace menus and operations workspace guided flows;
- content AI, organization AI, model connection test, read-only Prompt registry, log redaction, and contact configuration
  boundaries.

Supplemental UI/UX contract decisions were added after the owner approved the faster duplicate-check process:

- content-owned resource management and non-technical resource workflow;
- system-admin user/account management for backend admins, learners, employees, no-auth users, and standard/advanced
  authorization status;
- learner login/register/redeem/profile, learner authorization context, and AI quota-owner selection;
- learner practice, `mock_exam`, reports, and objective-only `mistake_book` interaction boundaries;
- employee `企业训练` answer/result experience;
- organization-admin training list/wizard/source/detail/takedown lifecycle;
- organization analytics separation between enterprise training and formal `practice` / `mock_exam` aggregate signals;
- super-admin read-only full-text Prompt registry with ops metadata-only view;
- organization tree UX and operations pending-work routing;
- no-repeat discussion process for locked decisions.

## Reconciliation Ledger Addendum

After the owner raised the risk that some current-thread discussions duplicated existing requirements while others
supplemented, changed, or exposed implementation gaps, this task adds a durable reconciliation ledger:

- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`

The ledger records `CT-REQ-*` rows for every current-thread topic, separates existing source posture from current-thread
deltas, marks implementation status without claiming runtime acceptance, and identifies UI/UX contract work that should
precede product source changes.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- ADR-007 for edition-aware authorization source-of-truth boundaries.

Read-only implementation inspection already identified current code behavior for gap recording:

- `src/db/schema/auth.ts`
- `drizzle/20260621024911_add_edition_aware_authorization.sql`
- `src/server/services/admin-redeem-code-runtime.ts`
- `src/server/repositories/admin-redeem-code-runtime-repository.ts`
- `src/server/services/redeem-code-authorization-service.ts`
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/server/validators/employee-account.ts`
- `src/server/services/employee-account-service.ts`
- `src/server/services/organization-training-service.ts`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `src/db/schema/organization-training.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- `src/features/admin/model-config-management/AdminModelConfigManagement.tsx`
- `src/server/services/admin-ai-audit-log-runtime.ts`

## Implementation Plan

1. Add a traceability decision record for the confirmed `redeem_code` edition and plaintext operations policy.
2. Backfill standard user-auth requirements so personal card kinds are explicit in the standard requirements tree.
3. Update advanced edition authorization and operations requirements to reflect the approved plaintext exception for eligible operations roles while keeping logs, evidence, audit metadata, screenshots, and committed docs redacted.
4. Update UI/UX gap baseline so `UX-REQ-03` is no longer an undecided reveal policy, while implementation remains a future gap.
5. Update requirement indexes and governance state/queue metadata for the docs-only decision packet.
6. Add a comprehensive decision package that classifies existing requirements, newly confirmed decisions, and source
   implementation gaps.
7. Add the current-thread reconciliation ledger and link it from decision package, requirement indexes, source index,
   state, queue, evidence, and audit.
8. Append supplemental `CT-REQ-031` through `CT-REQ-043` rows for the UI/UX contract discussion and update the decision
   package/baseline gap analysis.
9. Run formatting, diff check, and Module Run v2 pre-commit hardening.

## Risk Controls

- Do not include real or example plaintext `redeem_code` values.
- Do not modify product source, tests, schema, migration, package files, or runtime scripts.
- Do not interpret the approved operations UI plaintext visibility as permission to expose plaintext in evidence, logs, audit metadata, or committed artifacts.
- Record implementation gaps without starting implementation.
- Future work must cite relevant `CT-REQ-*` rows instead of relying on chat memory after context compaction.

## Validation

- `npm.cmd exec -- prettier --write --ignore-unknown ...`
- `npm.cmd exec -- prettier --check --ignore-unknown ...`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId redeem-code-edition-plaintext-decision-doc-update-2026-07-02`
