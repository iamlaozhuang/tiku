# Standard Advanced Backend UX Design First Contract Evidence

Task id: `standard-advanced-backend-ux-design-first-contract-2026-06-27`

Branch: `codex/standard-advanced-backend-ux-contract-20260627`

Task kind: `docs_state_planning`

result: pass

resultDetail: pass_docs_state_backend_ux_design_first_contract_no_runtime_no_final_pass

moduleRunVersion: 2

Batch range: docs/state design-first contract batch for standard and advanced backend workspace UX.

RED: Requirement review identified backend workspace separation, role/edition denial, organization admin first-class workspace, content AI entries, and operations authorization UX gaps that must be specified before source implementation.

GREEN: The contract artifact, index links, task plan, evidence, audit review, acceptance record, state/queue entries, scoped formatting, diff check, project status diagnostic, and Module Run v2 gates passed inside docs/state-only scope.

Commit: `e6835b904e618c8d82fe0c3b523a3f18d1208685` baseline before this local docs/state task.

localFullLoopGate: L0_docs_state_design_contract_only; blocked remainder remains blocked for source implementation, permission contract execution, browser/runtime, DB/schema execution, Provider/Cost, staging/prod/deploy, payment/OCR/export/external-service, release readiness, and final Pass.

threadRolloverGate: no new thread required; if context rolls over, resume from this evidence file, the task plan, `project-state.yaml`, and `task-queue.yaml`; do not infer runtime readiness.

automationHandoffPolicy: not seeded for automation; future source, permission, browser, DB, Provider, staging, or payment tasks require fresh approval by risk tier.

nextModuleRunCandidate: backend-workspace-shell-source-only-2026-06-27

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Summary

This docs/state-only task creates the design-first backend UX contract required before implementing standard and advanced backend workspace changes. The contract defines workspace information architecture, conceptual route map, role/edition matrix, navigation rules, state rules, component reuse boundaries, data/redaction boundaries, acceptance labels, follow-up task split, and copyable approval text.

It creates no source behavior change, no runtime validation, no browser run, no DB access, no Provider call, no Cost Calibration execution, no staging/prod work, no payment/external-service work, no PR, no force push, and no release-readiness or final-Pass claim.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/05-execution-logs/task-plans/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/05-execution-logs/evidence/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/05-execution-logs/acceptance/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`

## Approval Boundary

Current user approved docs/state-only task `standard-advanced-backend-ux-design-first-contract-2026-06-27`. Allowed changes are limited to `project-state.yaml`, `task-queue.yaml`, `docs/01-requirements/**`, and this task's plan/evidence/audit/acceptance files.

Closeout policy is materialized under the standing docs/state fast-lane approval for local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch cleanup after hard-block gates pass.

The approval excludes source, tests, e2e, schema, migration, seed, package/lockfiles, `.env*`, browser/dev-server/e2e runtime, DB, Provider, Cost Calibration, staging/prod/deploy, payment, OCR/export, external services, PR, force push, release readiness, and final Pass.

## Requirement Mapping Result

Mapped to:

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

Requirement outcome:

- `ops_admin`, `content_admin`, `org_standard_admin`, and `org_advanced_admin` need separated backend workspaces.
- Organization admin is a first-class `organization`-scoped workspace, not an operations workspace variant.
- `org_standard_admin` needs employee/auth status and advanced-unavailable states, not training or AI generation access.
- `org_advanced_admin` needs discoverable training, analytics, and organization AI generation entries.
- Content admin needs discoverable `AI出题` and `AI组卷` entries that remain separate from formal `question` and `paper`.
- Operations admin needs `redeem_code`, `org_auth`, upgrade, employee import, quota summary, `audit_log`, and `ai_call_log` UX boundaries without content authoring.
- UI visibility is not an authorization boundary; future implementation must preserve service-computed `effectiveEdition`.

## Design Contract Result

The new contract is:

- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`

It records:

- design principles;
- workspace information architecture;
- conceptual route map;
- role and edition matrix;
- navigation contract;
- required loading/empty/error/denial/unavailable/conflict/quota/destructive-confirmation states;
- component reuse contract;
- data and privacy contract;
- acceptance label model;
- follow-up task split;
- copyable approval text.

## Forbidden-Action Checklist

| Action                                                  | Result           |
| ------------------------------------------------------- | ---------------- |
| Source/test/e2e changed                                 | pass_not_touched |
| Schema/migration/seed touched                           | pass_not_touched |
| Package or lockfile changed                             | pass_not_touched |
| `.env*` read or changed                                 | pass_not_touched |
| Browser/dev-server/e2e run                              | pass_not_run     |
| DB connection or mutation                               | pass_not_run     |
| Provider call/configuration                             | pass_not_run     |
| Cost Calibration execution                              | pass_not_run     |
| Staging/prod/deploy/payment/OCR/export/external service | pass_not_run     |
| PR or force push                                        | pass_not_done    |
| Release readiness or final Pass claimed                 | pass_not_claimed |

## Validation

| Command                                                                                                                                                 | Result                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx.cmd prettier --write --ignore-unknown ...changed docs/state files...`                                                                              | pass; scoped prettier write completed and formatted `task-queue.yaml` plus the backend UX contract document.                                                                                                                      |
| `npx.cmd prettier --check --ignore-unknown ...changed docs/state files...`                                                                              | pass; all matched files use Prettier code style.                                                                                                                                                                                  |
| `git diff --check`                                                                                                                                      | pass; no whitespace errors.                                                                                                                                                                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                                              | pass diagnostic; `nextActionDecision: no_pending_task`, `activeQueueNonTerminalCount: 3`, `archiveCandidateCount: 3`, `highRiskRepairBlockedCount: 0`, `projectStatusRequiresHuman: true`; Cost Calibration Gate remains blocked. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ...`                     | pass; pre-commit hardening passed for this docs/state task and scanned 9 changed files within allowed scope.                                                                                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ...`                | pass after evidence and audit finalization; `module-closeout readiness passed`.                                                                                                                                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ... -SkipRemoteAheadCheck` | pass after final evidence and audit update; master, origin/master, state master, and state origin master were aligned at `e6835b904e618c8d82fe0c3b523a3f18d1208685`; `pre-push readiness passed`.                                 |
