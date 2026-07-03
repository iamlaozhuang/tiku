# 2026-07-03 Operations Authorization Source Landing Plan

## Task

Implement the confirmed operations authorization, `redeem_code`, and employee import source landing package after the
accepted UI/UX contract.

Task id: `ops-authorization-source-landing-2026-07-03`

Branch: `codex/ops-authorization-source-landing-2026-07-03`

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-07-02-ops-authorization-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- Relevant source and tests under the allowed file list below.

## Decision Anchors

- `CT-REQ-004`: overlapping active authorization in the same atomic scope is blocked by default; explicit closure actions
  must let operations continue after renewal, manual upgrade, replacement, or increase-only handling.
- `CT-REQ-005`: personal `redeem_code` must distinguish standard activation, advanced activation, and edition upgrade;
  type, profession, and level must be explicit.
- `CT-REQ-006`: eligible `ops_admin` and `super_admin` can view plaintext `redeem_code` in generation distribution,
  list, and detail, while evidence/log/export/screenshot records stay redacted.
- `CT-REQ-007`: edition upgrade ambiguity must require explicit target authorization selection.
- `CT-REQ-008`: multi-scope org_auth creation can be a UI package, but the service must keep atomic scope semantics and
  must not fake multi-scope data with comma strings or unreviewed arrays.
- `CT-REQ-010` / `CT-REQ-011`: employee mutation is platform-owned; import targets an organization node and must not carry
  profession, level, edition, or per-employee authorization columns.
- `CT-REQ-012`: first release uses organization-tree segmentation, not employee-level authorization allowlists.
- `CT-REQ-022` / `CT-REQ-052`: operations pages need guided flows, pagination discipline, explicit card semantics, and
  redaction-safe plaintext handling.

## Allowed Writes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-03-ops-authorization-source-landing.md`
- `docs/05-execution-logs/evidence/2026-07-03-ops-authorization-source-landing.md`
- `docs/05-execution-logs/audits-reviews/2026-07-03-ops-authorization-source-landing.md`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/repositories/admin-redeem-code-runtime-repository.ts`
- `src/server/services/admin-redeem-code-runtime.ts`
- `src/server/services/admin-user-org-auth-ops-service.ts`
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts`
- `tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
- `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`
- `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts`
- `tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`

## Blocked Scope

- Database schema, migration, seed, direct database connection, or database mutation.
- Adding a new plaintext `redeem_code` storage field or changing schema/security storage semantics. This package reuses
  the existing protected `code_display` value for eligible operations list/detail display and keeps hash/internal fields
  hidden.
- Provider/model calls, Provider configuration reads, Prompt registry edits, env/secret access.
- Dependency or lockfile changes.
- Organization analytics, organization training, AI post-actions, content resource management, learner flows, browser/e2e
  runtime, staging/prod deploy, PR, force-push, Cost Calibration, release readiness, final Pass, production-usability claims.

## Implementation Approach

1. Carry `redeemCodeType` through the management API contract, normalization, repository insert, generated response, list,
   detail, and tests using the existing schema enum.
2. Require operations users to explicitly select the `redeem_code` type in the generation form and confirmation dialog.
3. Add a current-batch distribution window that displays and copies the generated plaintext values returned by the create
   response; evidence must not include those values.
4. Let ordinary list/detail render plaintext only when the API explicitly supplies `canViewPlainText` and `codePlainText`
   from the protected operations runtime; otherwise retain masked display and clear unavailable state.
5. Improve employee import to choose the target organization before account CSV/TSV upload; the UI injects the selected
   organization for account rows while blocking profession, level, edition, and org_auth-scope columns.
6. Add non-technical guidance to org_auth creation about explicit edition/profession/level/quota/date/scope choices and
   overlap closure, without changing org_auth storage semantics.

## Validation

- `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/phase-8-admin-redeem-code-runtime.test.ts tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts tests/unit/phase-11-redeem-code-batch-management-loop.test.ts tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-authorization-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ops-authorization-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-authorization-source-landing-2026-07-03 -SkipRemoteAheadCheck`

## Evidence Rules

Evidence may record task ids, file paths, changed source categories, route names, role names, validation commands, and
redacted expected/observed summaries.

Evidence must not record credentials, tokens, sessions, cookies, Authorization headers, env values, raw DB rows, internal
numeric ids, PII, plaintext `redeem_code`, Provider payloads, prompts, raw AI IO, raw employee answers, full
question/paper/material/resource/chunk content, screenshots, traces, or raw DOM dumps.

## Self-Review

- Pass 1: Check `redeem_code` type, distribution, plaintext redaction, and employee import behavior against the decision
  anchors.
- Pass 2: Check blocked-scope drift, test coverage, evidence redaction, and regression risk before commit/merge/push.
