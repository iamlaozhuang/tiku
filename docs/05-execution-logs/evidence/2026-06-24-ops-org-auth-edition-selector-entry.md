# Evidence: ops-org-auth-edition-selector-entry-2026-06-24

## Summary

- Task id: `ops-org-auth-edition-selector-entry-2026-06-24`.
- Branch: `codex/ops-org-auth-edition-selector-entry-20260624`.
- Task kind: `implementation`.
- Status: closed after fast-forward merge to `master` and post-merge validation.
- Approval boundary: current user approved serial operations authorization repair tasks on 2026-06-24; this task materializes only low-risk local implementation, validation, local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup after gates pass.

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

## Requirement/Role/Acceptance Mapping Result

- Requirement Mapping Result: R11 / `EAA-ORG-CREATE-STANDARD-ADVANCED-SELECTOR`, US-06-04 AC-1 and AC-5, advanced ops auth quota acceptance, and ADR-007 source/effective edition boundary are in scope.
- Role Mapping Result: `ops_admin` create `org_auth` entry is in scope; other roles are out of scope.
- Acceptance Mapping Result: local UI and validator behavior for visible `standard | advanced` create selection is in scope; strict runtime role acceptance remains blocked for the later redacted runtime task.

## Requirement Mapping Result

- R11 / `EAA-ORG-CREATE-STANDARD-ADVANCED-SELECTOR`: in scope.
- US-06-04 AC-1 and AC-5: in scope.
- Advanced operations authorization quota acceptance: in scope for safe source/effective edition summary only.
- ADR-007 source `edition` and computed `effectiveEdition` boundary: in scope.

## Role Mapping Result

- `ops_admin`: in scope for system operations `org_auth` creation.
- Other roles: out of scope for this task.

## Acceptance Mapping Result

- Local UI and validator behavior for visible `standard | advanced` create selection: in scope.
- Runtime browser/e2e role acceptance and final MVP Pass: out of scope.

## Planned Validation

- RED and GREEN targeted unit tests:
  - `npm.cmd run test:unit -- src/server/validators/org-auth.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`
- Closeout gates:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx src/server/validators/org-auth.ts src/server/validators/org-auth.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-edition-selector-entry.md docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-edition-selector-entry.md docs/05-execution-logs/audits-reviews/2026-06-24-ops-org-auth-edition-selector-entry.md`
  - `git diff --check`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-org-auth-edition-selector-entry-2026-06-24`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-org-auth-edition-selector-entry-2026-06-24 -SkipRemoteAheadCheck`

## Validation Results

- RED `npm.cmd run test:unit -- src/server/validators/org-auth.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`: failed as expected before implementation. Summary: validator still accepted missing create-side `edition`, and the operations UI did not yet expose `org-auth-edition-select` / `org-auth-create-button`.
- GREEN `npm.cmd run test:unit -- src/server/validators/org-auth.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`: passed. Output: 3 files passed, 25 tests passed.
- Post-format GREEN rerun of the same focused unit command: passed. Output: 3 files passed, 25 tests passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx src/server/validators/org-auth.ts src/server/validators/org-auth.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-edition-selector-entry.md docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-edition-selector-entry.md docs/05-execution-logs/audits-reviews/2026-06-24-ops-org-auth-edition-selector-entry.md`: passed. Output: `All matched files use Prettier code style!`.
- `git diff --check`: passed with no whitespace errors.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-org-auth-edition-selector-entry-2026-06-24`: passed. Output included `OK_SSOT_READ_LIST`, `OK_REQUIREMENT_MAPPING_RESULT`, all 9 changed files in scope, `Cost Calibration Gate remains blocked`, and `pre-commit hardening passed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-org-auth-edition-selector-entry-2026-06-24 -SkipRemoteAheadCheck`: passed. Output included clean git readiness for branch `codex/ops-org-auth-edition-selector-entry-20260624`, `master` and `origin/master` at `3a6691ffe4c03fec04114af157e81e9bda9d6bd8`, evidence/audit paths found, and `pre-push readiness passed`.

## Post-Merge Master Validation Results

- Fast-forward merge target: `master`.
- Implementation commit: `4aecf645cd8a4cf747fba2b1adfe9f657f256805`.
- Timestamp: `2026-06-24T08:53:06-07:00`.
- `npm.cmd run test:unit -- src/server/validators/org-auth.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`: passed on `master`. Output: 3 files passed, 25 tests passed.
- `npm.cmd run lint`: passed on `master`.
- `npm.cmd run typecheck`: passed on `master`.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx src/server/validators/org-auth.ts src/server/validators/org-auth.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-edition-selector-entry.md docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-edition-selector-entry.md docs/05-execution-logs/audits-reviews/2026-06-24-ops-org-auth-edition-selector-entry.md`: passed on `master`.
- `git diff --check`: passed on `master`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-org-auth-edition-selector-entry-2026-06-24`: passed on `master` with `filesToScan: 0`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-org-auth-edition-selector-entry-2026-06-24 -SkipRemoteAheadCheck`: passed on `master`; output showed `master` at `4aecf645cd8a4cf747fba2b1adfe9f657f256805` and `origin/master` at `3a6691ffe4c03fec04114af157e81e9bda9d6bd8`.

## Changed Files

- `src/server/validators/org-auth.ts`: create-side `org_auth` normalization no longer silently defaults missing `edition` to `standard`.
- `src/server/validators/org-auth.test.ts`: added explicit-edition requirement coverage while preserving valid standard/advanced cases.
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`: added visible operations `org_auth` edition selector, disabled create until edition is selected, included selected source `edition` in create payload, and surfaced selected edition in the confirmation dialog.
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`: added UI coverage for required edition selection and create payload edition propagation.
- Agent-system state, queue, plan, evidence, and audit files updated within the task allowlist.

## Implementation Summary

- Operations `org_auth` create now requires an explicit `standard | advanced` selector before submit.
- Create payloads include source `edition`; read-side compatibility and computed `effectiveEdition` display behavior remain unchanged.
- The validator rejects omitted create-side `edition` instead of applying a hidden default.

## Blocked Work

- Manual upgrade, multi-scope authorization, employee import template, and runtime redacted validation remain separate tasks.
- Schema, migration, database writes, dependency, env/secret, Provider, browser/e2e runtime, dev server, staging/prod, payment, external service, PR, force push, Cost Calibration, and final acceptance Pass remain blocked.

## Redaction

- Evidence will record command names, pass/fail status, and summarized failures only.
- No tokens, passwords, Authorization headers, database URLs, raw DB rows, plaintext `redeem_code`, provider payloads, prompts, raw generated AI outputs, private answer text, or full `paper` content may be recorded.
