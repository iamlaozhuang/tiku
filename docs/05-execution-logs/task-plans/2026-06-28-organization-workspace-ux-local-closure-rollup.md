# Organization Workspace UX Local Closure Rollup

## Task

- Task id: `organization-workspace-ux-local-closure-rollup-2026-06-28`
- Branch: `codex/org-workspace-ux-local-closure-rollup-20260628`
- Task kind: `docs_state_rollup`
- Execution profile: `docs_state_local_closure_rollup`
- Approval source: current user approval on 2026-06-28 for serial batch item 2 with commit, merge, push, and cleanup after each task.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-ux-polish-queue-planning.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Requirement Decision Map

- Organization backend/workspace UX local closure follows the refreshed standard/advanced UX polish queue planning decision.
- ADR-007 remains controlling for `authorization`, `org_auth`, `effectiveEdition`, and UI-as-consumer boundaries.
- ADR-004 and ADR-005 keep dev/local evidence separate from staging/prod and release decisions.
- ADR-006 keeps installed Provider packages as dependency facts only, not Provider execution approval.

## Requirement Mapping

- Mapping result: `local_closure_rollup_only`.
- The rollup may summarize already committed source-only UI, unit contract, and local browser evidence.
- The rollup must not create new product requirements or claim runtime behavior beyond recorded evidence.
- The rollup must clearly separate local proof from DB-backed authorization, Provider, Cost Calibration, staging/prod, payment/OCR/export, release readiness, and final Pass.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-standard-advanced-ux-polish-queue-planning.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-page-states-polish-source-only.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-ux-polish-local-browser-validation.md`
- Matching audit review files for those tasks.

These are evidence and history. Requirement authority remains in `docs/01-requirements/**` and ADR/SOP files.

## Conflict Check

- No conflict found between requirement SSOT and recorded local evidence.
- Local browser evidence confirms role/route/state/count outcomes only. It does not prove DB row correctness, Provider behavior, staging/prod readiness, or final acceptance.
- Permission contract TDD improves service-summary consumption, but it does not replace future DB-backed authorization proof.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-organization-workspace-ux-local-closure-rollup.md`
- `docs/05-execution-logs/task-plans/2026-06-28-organization-workspace-ux-local-closure-rollup.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-ux-local-closure-rollup.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-organization-workspace-ux-local-closure-rollup.md`
- `docs/05-execution-logs/acceptance/2026-06-28-organization-workspace-ux-local-closure-rollup.md`

Blocked files and actions:

- `src/**`, `tests/**`, `e2e/**`
- schema, drizzle, migration, seed
- `package.json`, lockfiles, `.env*`
- browser, dev server, e2e
- DB connection/read/write
- Provider call or configuration
- Cost Calibration
- staging, prod, deploy, payment, OCR, export, external service
- PR, force push, release readiness, final Pass

## Implementation Approach

1. Create a traceability rollup that lists local evidence, proof level, residual risk, and next gate options.
2. Add this task to `task-queue.yaml` with docs/state-only allowed files and closeout policy from the current serial approval.
3. Update `project-state.yaml` current task pointer and local closure summary.
4. Write evidence, audit review, and acceptance record.
5. Run scoped Prettier, `git diff --check`, `Get-TikuProjectStatus.ps1`, and Module Run v2 pre-commit hardening.
6. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch under current approval.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-ux-local-closure-rollup-2026-06-28`
- Closeout on `master`: `git diff --check`, `Test-GitCompletionReadiness.ps1 -BaseBranch master`, `Test-AgentSystemReadiness.ps1`, `Get-TikuProjectStatus.ps1`

## Risk Defenses

- Use only redacted evidence summaries and task ids.
- Do not copy credentials, raw DOM, screenshots, traces, DB rows, Provider payloads, prompts, raw AI output, plaintext `redeem_code`, employee answer text, or full `question`/`paper` content.
- Keep release readiness and final Pass explicitly blocked.
- Keep Cost Calibration Gate blocked.

## Stop Conditions

Stop before commit if:

- a source/test/runtime edit becomes necessary;
- a high-risk gate action becomes necessary;
- validation fails without a docs-only fix;
- evidence would need to record sensitive data;
- the rollup cannot distinguish local evidence from blocked environment/provider gates.
