# Task Plan: ops-redeem-code-generation-scope-entry-2026-06-24

## Task Metadata

- Task id: `ops-redeem-code-generation-scope-entry-2026-06-24`.
- Branch: `codex/ops-redeem-code-generation-scope-entry-20260624`.
- Task kind: `implementation`.
- Scope: operations `redeem_code` generation entry for single-code and specified-quantity generation with explicit `profession` and `level`.
- Approval source: current user instructed continuing the repair task from `ops-redeem-code-generation-scope-entry`; low-risk closeout is materialized from project-state standing Module Run v2 local closeout approval.
- Non-claim: this task does not declare standard/advanced MVP final Pass.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/03-standards/ui-code.md`.
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

- ADR-002 keeps route handlers thin and pushes business rules into services; the explicit `profession` and `level` generation rule belongs in the service normalization layer, with UI as guidance only.
- ADR-003 keeps admin/back-office flows desktop-first and compatible with shared contracts; the entry repair must be a bounded admin UI form change rather than a new application shell.
- ADR-004 and ADR-005 keep environment, staging, production, deployment, and external service surfaces out of scope.
- ADR-006 blocks dependency changes unless explicitly approved; this task uses existing React, Vitest, and service code only.
- ADR-007 makes authorization source and effective edition server-side concerns; this task must not invent a new authorization model or treat UI state as a boundary.
- `2026-06-24-role-separated-mvp-requirement-alignment.md` maps operations `redeem_code` repairs to R9 and R10.
- `edition-aware-authorization-acceptance-matrix.md` rows `EAA-OPS-REDEEM-SINGLE` and `EAA-OPS-REDEEM-SPECIFIED-QUANTITY` are the only acceptance rows targeted here.

## Requirement / Role / Acceptance Mapping Result

- Requirement R9 / `EAA-OPS-REDEEM-SINGLE`: provide a single `redeem_code` generation path that does not expose plaintext code values in ordinary UI feedback or evidence.
- Requirement R10 / `EAA-OPS-REDEEM-SPECIFIED-QUANTITY`: provide specified-quantity generation only when `profession` and `level` are explicit inputs.
- Role in scope: `ops_admin`; `super_admin` follows existing admin-equivalent API behavior where already supported by current code.
- Roles out of scope: `student`, `content_admin`, `org_admin`, `employee`, and `auditor` runtime walkthroughs.
- Acceptance target: local unit-level contract and UI behavior evidence for the two redeem-code rows only.

## Evidence-Only Source Context

- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx` currently posts a fixed generation input and renders the generated plaintext code in ordinary UI feedback.
- `src/server/services/admin-redeem-code-runtime.ts` currently defaults missing `profession` and `level`, which conflicts with R10.
- `src/server/repositories/admin-redeem-code-runtime-repository.ts` masks list/detail display but generation responses can contain plaintext; ordinary evidence and UI feedback must stay redacted.
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts` and `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts` are the focused RED/GREEN coverage surface.

## Planned TDD Steps

1. Add failing backend unit coverage proving missing generation `profession`/`level` returns a validation error before repository mutation.
2. Add failing UI unit coverage proving operators choose single/batch mode, `profession`, `level`, and count, and the generated plaintext is not rendered.
3. Implement server normalization so `profession` and `level` are required while preserving existing count, duration, and deadline validation.
4. Implement the operations UI form so generation uses explicit operator inputs and ordinary generated-code feedback is redacted.
5. Run focused GREEN tests and then the full task closeout command set.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-redeem-code-generation-scope-entry.md`.
- `docs/05-execution-logs/evidence/2026-06-24-ops-redeem-code-generation-scope-entry.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-ops-redeem-code-generation-scope-entry.md`.
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`.
- `src/server/services/admin-redeem-code-runtime.ts`.
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
- `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts`.

## Blocked Files And Work

- No `.env*`, package, lockfile, dependency, schema, migration, database write, e2e, browser runtime, dev server, Provider, Cost Calibration, staging/prod, deploy, payment, external service, PR, force push, or final acceptance Pass work.
- No plaintext `redeem_code`, token, password, Authorization header, database URL, raw DB row, provider payload, prompt, raw generated AI content, private answer text, or full `paper` content in evidence.
- No organization `org_auth` edition selector, manual upgrade, multi-scope bundle, employee import template, or runtime role walkthrough implementation in this task.

## Validation Commands

- RED: `npm.cmd run test:unit -- tests/unit/phase-11-redeem-code-batch-management-loop.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
- GREEN/closeout: `npm.cmd run test:unit -- tests/unit/phase-11-redeem-code-batch-management-loop.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx src/server/services/admin-redeem-code-runtime.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-11-redeem-code-batch-management-loop.test.ts docs/05-execution-logs/task-plans/2026-06-24-ops-redeem-code-generation-scope-entry.md docs/05-execution-logs/evidence/2026-06-24-ops-redeem-code-generation-scope-entry.md docs/05-execution-logs/audits-reviews/2026-06-24-ops-redeem-code-generation-scope-entry.md`.
- `git diff --check`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-redeem-code-generation-scope-entry-2026-06-24`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-redeem-code-generation-scope-entry-2026-06-24 -SkipRemoteAheadCheck`.

## Stop Conditions

- Stop if the repair requires schema/migration, database writes, dependencies, env/secret, Provider, Cost Calibration, browser/e2e, staging/prod, payment, external service, PR, or force push.
- Stop if a fix would require changing the generation API contract in a way that affects non-operations clients beyond the allowed scope.
- Stop if evidence would need plaintext `redeem_code` or other sensitive material.
