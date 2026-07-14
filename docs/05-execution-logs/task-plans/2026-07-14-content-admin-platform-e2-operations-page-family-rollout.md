# Content Admin Platform E2 Operations Page-Family Rollout Plan

Date: 2026-07-14

Task: `content-admin-platform-e2-operations-page-family-rollout-2026-07-13`

Branch: `codex/content-admin-platform-e2-operations-page-family-rollout`

Profile: R3 / `independent_audit`

Baseline: `master == origin/master == d29f36401202296b541a7ed24f4300b5d879d9f6`

## Goal

Roll the established B1-B4 interaction contracts into the operations page family without changing authorization,
edition, phone-disclosure, card-plaintext or log-redaction semantics. Replace duplicated mutation feedback in user,
organization/authorization/card and purchase-contact consumers with `AdminToast`; move read-only user, enterprise
authorization, card and audit-log details onto `AdminDetailDrawer`. Task/form drawers and confirmation dialogs keep their
current semantics. Operations overview, AI-call logs and model management remain focused regression consumers.

## SSOT Read List

- `AGENTS.md`, `docs/04-agent-system/state/project-state.yaml`,
  `docs/04-agent-system/state/task-queue.yaml`, the active history index, canonical B-F plan, standing authorization,
  E0 inventory, PIC ledger, Lean Module Run v3 and closeout/archival SOPs.
- `docs/03-standards/code-taste-ten-commandments.md` and every ADR under `docs/02-architecture/adr/`, especially
  `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`.
- `docs/01-requirements/00-index.md`, `docs/01-requirements/modules/01-user-auth.md`,
  `docs/01-requirements/modules/06-admin-ops.md`, `docs/01-requirements/stories/epic-06-admin-ops.md`,
  `docs/01-requirements/advanced-edition/00-index.md`, the relevant advanced authorization/operations/log-retention
  modules and stories, and `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- Latest traceability and decision chain:
  `docs/01-requirements/traceability/2026-07-02-ops-authorization-ui-ux-contract.md`,
  `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`,
  `docs/01-requirements/traceability/2026-07-02-admin-model-prompt-log-governance-ui-ux-contract.md`,
  `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-operations-and-super-admin.md` and
  `docs/01-requirements/traceability/2026-07-02-requirements-code-implementation-alignment-audit.md`.
- All `OPS-E2` source/test roots named by E0, plus operations mode of `AdminRoleOverviewPage` and its focused test.
- Analogous shared implementations and tests: `AdminToast`, `AdminDetailDrawer`, `AdminStateTemplate`, `AdminList` and
  `useAdminListInteraction`.

The complete reading found no unresolved requirement/ADR/traceability conflict and no fresh baseline failure that
permits reopening A01-A30 or closed AI findings.

## Exact Scope

- `/ops/users`: keep account-domain separation, role-scoped actions and audited phone reveal/copy endpoints unchanged;
  use shared feedback and a focus-managed read-only user detail Drawer.
- `/ops/organizations`: keep organization task drawers, atomic authorization scope, edition selection, quota checks and
  employee transaction semantics unchanged; use shared feedback and a read-only authorization detail Drawer.
- `/ops/redeem-codes`: keep the approved product plaintext exception, one-time distribution window and redacted evidence
  boundary unchanged; use shared feedback and a focus-managed card detail Drawer.
- `/ops/contact-config`: preserve channel/upload/save contracts; use shared typed feedback only.
- `/ops/audit-logs`: preserve split read-only log ownership and redacted allowlist; replace the local detail Drawer
  implementation with the shared focus-managed Drawer. `/ops/ai-call-logs` and model management are regression-only.
- `/ops/overview`: regression-only. E5 still owns legacy redirects and cross-workspace aliases.

## TDD Design

1. RED-first require user, enterprise-authorization, card and audit detail interactions to focus the shared close action,
   close on Escape and restore the initiating control.
2. RED-first require user, organization/card and purchase-contact mutation feedback to expose shared typed Toast titles,
   live-region priority and explicit dismissal.
3. Replace only duplicated consumer presentation. If the user-detail rollout exposes a shared Drawer modal-coordination
   defect, fix that primitive narrowly with a RED regression; do not change request paths, payloads, response mapping,
   roles, authorization calculations, plaintext eligibility, audit data or model/Provider behavior.
4. Run focused security regressions for phone, edition, authorization, one-time secrets/card plaintext and log redaction.

## Risk Defenses

- Phone reveal/copy still requires its current server action; the Drawer never grants disclosure and closing it clears no
  server policy.
- Card plaintext remains visible only when the DTO explicitly permits it or in the one-time generation window. Plan,
  evidence, audit, logs and feedback never store a card plaintext value.
- Log details remain allowlisted, read-only and redacted; raw Prompt, Provider payload, raw AI input/output, employee
  answers, credentials, sessions and internal identifiers are excluded.
- Shared primitive behavior remains unchanged except for a narrowly proven nested `alertdialog` coordination fix needed
  by the user-detail action path. Task drawers and confirmation dialogs are not forced into a detail abstraction.
- No API/service/schema/database/dependency/environment/Provider/browser/PR/force-push/deployment action. No global PIC
  promotion and no E5 alias closure claim.

## Allowed Changes

- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`.
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`.
- `src/features/admin/contact-config/AdminContactConfigPage.tsx`.
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`.
- `src/components/admin/AdminDetailDrawer/index.tsx` and its focused test, only for the nested modal regression found by
  adversarial review.
- The focused `OPS-E2` tests and operations-overview regression test required for RED/GREEN proof.
- Active state/history, this plan, E2 evidence/audit and the PIC coverage/exception ledger declared by the queue.

## Validation

- Focused RED/GREEN: the five E0 `OPS-E2` suites, shared Drawer/Toast suites and operations overview.
- Security boundary: phone reveal/copy, backend-account role scope, edition/atomic authorization, employee quota/session,
  card plaintext eligibility/distribution, audit/AI-log redaction and model-management role separation.
- Serial full unit regression is impact-triggered because E2 enters authorization, edition, phone, card plaintext and
  log/AI protected domains; then lint, typecheck, changed-file Prettier, `git diff --check` and production build.
- Recovery/serial Program Guards and Module Run pre-commit, closeout and pre-push gates.

## Adversarial Review

- Round 1: correctness, returned-data integrity, request/payload invariants, phone/card/log redaction, authorization and
  edition contracts, focus lifecycle and requirements coverage.
- Round 2: regression, privilege escalation, direct exceptional paths, stale/duplicate operations, diagnostic or secret
  leakage, cross-page inconsistency, closed-task reopening, false PIC promotion and over-design.

Closeout is one principal commit, ff-only merge to `master`, ordinary push to `origin/master`, remote equality check and
short branch/worktree cleanup; E3 starts automatically. Deployment remains blocked.
