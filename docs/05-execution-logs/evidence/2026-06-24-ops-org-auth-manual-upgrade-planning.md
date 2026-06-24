# Evidence: ops-org-auth-manual-upgrade-planning-2026-06-24

## Summary

- Task id: `ops-org-auth-manual-upgrade-planning-2026-06-24`.
- Branch: `codex/ops-org-auth-manual-upgrade-planning-20260624`.
- Task kind: `docs_only`.
- Status: ready_for_closeout; docs/state validation passed.
- Scope: docs/contract/security preflight for governed organization standard-to-advanced manual upgrade.
- Non-claim: this evidence does not declare runtime behavior changed and does not declare standard/advanced MVP final Pass.

## Approval Boundary

- Approval source: current user approved serial advancement of operations authorization repair tasks on 2026-06-24.
- Approved local actions: task registration, task plan/evidence/audit creation, local docs/state validation, local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch cleanup if all task gates pass.
- Still blocked: source/test implementation, schema/migration/database writes, dependency or lockfile changes, `.env*`, Provider, Cost Calibration, browser/e2e runtime, staging/prod/deploy, payment/external services, PR, force push, and final acceptance Pass.

## SSOT Read List

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

## Requirement/Role/Acceptance Mapping Result

- Requirement Mapping Result: R12 / `EAA-ORG-MANUAL-UPGRADE-ENTRY`, `EAA-ORG-MANUAL-UPGRADE`, US-06-04 AC-6, and ADR-007 are in scope for planning only.
- Role Mapping Result: `ops_admin` / `super_admin` future mutation path is in scope; organization admins, employees, students, and content admins are out of scope for upgrade mutation.
- Acceptance Mapping Result: this task records planning/preflight only; schema/API/service/UI/audit/runtime evidence remains required before acceptance can pass.

## Requirement Mapping Result

- R12 / `EAA-ORG-MANUAL-UPGRADE-ENTRY`: in scope for planning/preflight.
- `EAA-ORG-MANUAL-UPGRADE`: in scope for future implementation acceptance design.
- US-06-04 AC-6 and ADR-007: in scope.

## Role Mapping Result

- `ops_admin` and `super_admin`: future governed mutation actors.
- Organization admins, employees, students, and `content_admin`: out of scope for upgrade mutation.

## Acceptance Mapping Result

- Planning/preflight evidence: in scope.
- Runtime acceptance and final MVP Pass: out of scope.

## Current Code Evidence Summary

- `auth_upgrade` already has source type values `redeem_code | ops_manual`, status values `active | expired | revoked`, and fields for `ops_reference`, `ops_note`, `operator_admin_id`, source authorization, and revocation.
- Operations org authorization list/detail surfaces already expose source `edition`, computed `effectiveEdition`, and `upgradeStatus` summaries.
- No governed manual upgrade mutation entry is implemented by this task.

## Validation Results

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-manual-upgrade-planning.md docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-manual-upgrade-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-ops-org-auth-manual-upgrade-planning.md`: passed. Output: `All matched files use Prettier code style!`.
- `git diff --check`: passed with no whitespace errors.
- First `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-org-auth-manual-upgrade-planning-2026-06-24`: failed as expected for missing exact `## Requirement Mapping Result` heading even though the combined mapping paragraph existed.
- After adding exact `Requirement Mapping Result`, `Role Mapping Result`, and `Acceptance Mapping Result` headings, `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-org-auth-manual-upgrade-planning-2026-06-24`: passed. Output included `OK_SSOT_READ_LIST`, `OK_REQUIREMENT_MAPPING_RESULT`, all five changed files in scope, `Cost Calibration Gate remains blocked`, and `pre-commit hardening passed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-org-auth-manual-upgrade-planning-2026-06-24 -SkipRemoteAheadCheck`: passed. Output included clean git readiness for branch `codex/ops-org-auth-manual-upgrade-planning-20260624`, `master` and `origin/master` at `f03174f7b8fe8c8441c189bffcba581b564cfdcd`, evidence/audit paths found, and `pre-push readiness passed`.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`: current task pointer moved to this planning packet.
- `docs/04-agent-system/state/task-queue.yaml`: task entry seeded with allowed files, blocked files, validation commands, and closeout policy.
- `docs/05-execution-logs/task-plans/2026-06-24-ops-org-auth-manual-upgrade-planning.md`: SSOT-backed manual upgrade preflight plan.
- `docs/05-execution-logs/evidence/2026-06-24-ops-org-auth-manual-upgrade-planning.md`: redacted validation evidence.
- `docs/05-execution-logs/audits-reviews/2026-06-24-ops-org-auth-manual-upgrade-planning.md`: authorization boundary audit review.

## Blocked Remainder

- Manual upgrade runtime implementation must be a later implementation task with its own allowed files, tests, evidence, audit review, and closeout.
- Multi-scope authorization, employee import template boundary, and redacted runtime validation remain separate tasks.
- Schema/migration/database work, dependency changes, env/secret, Provider, browser/e2e, staging/prod, payment, external service, PR, force push, Cost Calibration, and final MVP Pass remain blocked.

## Redaction Notes

- Evidence records command status and summaries only.
- Evidence must not contain plaintext `redeem_code`, database rows, credentials, tokens, Authorization headers, provider payloads, prompts, raw generated AI content, private answer text, or full `paper` content.
