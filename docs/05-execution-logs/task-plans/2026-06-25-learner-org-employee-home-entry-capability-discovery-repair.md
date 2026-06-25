# Learner Org Employee Home Entry Capability Discovery Repair Plan

Task id: learner-org-employee-home-entry-capability-discovery-repair-2026-06-25

Branch: codex/home-entry-visibility-repair-20260625

Task kind: implementation_tdd

Status: planned

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- R5 requires `personal_advanced_student` to see `AI训练`; `personal_standard_student` must not receive advanced AI.
- R6 requires `org_advanced_employee` to see `AI训练` and `企业训练`; `org_standard_employee` must see neither entry.
- Advanced edition modules state that URL-only access fails acceptance for eligible advanced learner and organization training entries.
- `effectiveEdition` is service-computed; UI visibility is not the authorization boundary. Provider, Cost Calibration, staging/prod, payment, and external-service work remain blocked.

## Requirement Mapping

This task maps only to the entry-discovery portion of R5/R6. It will repair the effective authorization capability DTO used by learner home entry visibility so advanced personal and organization authorization contexts expose discoverable AI or training capability while still carrying a blocked reason when production Provider enablement is not configured. It does not repair direct-route denial for standard organization employees, run browser acceptance, change Provider behavior, or claim final MVP Pass.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-ai-entry-repair-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-post-ai-entry-repair-gap-refresh-no-final-pass.md`

These files are historical runtime evidence only, not requirement SSOT.

## Conflict Check

No SSOT conflict found for this narrow repair. The latest runtime evidence shows direct `/ai-generation` is authenticated for sampled learner/employee rows, but eligible advanced rows still lack learner-home entries. The service currently treats production enablement as disabling all advanced display capabilities, while requirements separate entry discoverability from Provider/Cost approval.

## Allowed Scope

- `src/server/services/effective-authorization-service.ts`
- `src/server/services/effective-authorization-service.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md`
- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md`

## Blocked Scope

- Browser, Playwright, dev server, and real runtime rerun.
- Credential, token, cookie, localStorage, `.env*`, secret, or private account file reads.
- DB, seed, schema, migration, destructive database operation, and account mutation.
- Provider/model calls, Provider configuration, Cost Calibration, staging/prod/cloud/deploy, payment, external services, package or lockfile changes.
- PR, force push, and final Standard/Advanced MVP Pass claims.

## TDD Plan

1. Add failing focused tests in `effective-authorization-service.test.ts` proving:
   - personal advanced contexts expose AI capability even when Provider production enablement is blocked;
   - organization advanced employee contexts expose AI and organization training capability even when Provider production enablement is blocked.
2. Run the focused unit test and record RED failure.
3. Implement the smallest service change so capabilities represent entitlement/discoverability and `blockedReason` continues to represent Provider production enablement.
4. Run focused unit tests and existing learner home UI unit test.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/effective-authorization-service.test.ts`
- `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown src/server/services/effective-authorization-service.ts src/server/services/effective-authorization-service.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md`
- `npx.cmd prettier --check --ignore-unknown src/server/services/effective-authorization-service.ts src/server/services/effective-authorization-service.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-org-employee-home-entry-capability-discovery-repair-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-org-employee-home-entry-capability-discovery-repair-2026-06-25 -SkipRemoteAheadCheck`

## Risk Defenses

- Keep the change in service capability mapping only; no UI refactor and no authorization repository query changes.
- Preserve standard edition disabled capabilities.
- Preserve `production_enablement_blocked` for advanced contexts when Provider production enablement is not configured.
- Do not run browser or read credentials; post-repair browser proof remains a separate approval task.
