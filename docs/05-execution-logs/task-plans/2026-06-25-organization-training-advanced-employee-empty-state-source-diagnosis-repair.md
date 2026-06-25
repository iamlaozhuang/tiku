# Organization Training Advanced Employee Empty State Source Diagnosis/Repair Plan

Task id: `organization-training-advanced-employee-empty-state-source-diagnosis-repair-2026-06-25`

Branch: `codex/org-training-advanced-empty-diagnosis-20260625`

## Goal

Determine why `org_advanced_employee` sees the `企业训练` home entry but `/organization-training` still renders an empty
state with no answer workflow after the effective authorization context source repair.

If the root cause is a code-owned route/repository/frontend mapping defect, apply the smallest TDD source repair. If the
root cause requires DB/seed/schema/migration/account mutation or private data changes, stop and request separate
approval.

No browser rerun and no Standard/Advanced MVP final Pass will be claimed in this task.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-25-organization-training-employee-effective-context-post-repair-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-employee-effective-context-post-repair-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-25-organization-training-employee-effective-authorization-context-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-employee-effective-authorization-context-repair.md`

## Debugging Method

- Reproduce from existing evidence: advanced employee home entry is visible, direct organization-training route is empty.
- Trace data flow from student route page to runtime API, route handler, effective authorization context selection, and
  repository visible-list filtering.
- Compare with working unit fixtures and historical organization-training local role-flow evidence.
- Form one root-cause hypothesis before any production code change.
- If implementing a fix, add a RED focused unit test first, verify it fails for the expected reason, then implement the
  smallest source change.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`
- `src/features/student/studentRuntimeApi.ts`
- `tests/unit/organization-training-employee-entry-surface.test.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/organization-training-repository.test.ts`
- `docs/05-execution-logs/task-plans/2026-06-25-organization-training-advanced-employee-empty-state-source-diagnosis-repair.md`
- `docs/05-execution-logs/evidence/2026-06-25-organization-training-advanced-employee-empty-state-source-diagnosis-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-advanced-employee-empty-state-source-diagnosis-repair.md`

Blocked:

- Browser/runtime rerun, credential read/input, DB/seed/schema/migration/account mutation, `.env*`, package/lockfile,
  Provider/Cost, staging/prod, payment, external service, PR/force push, final MVP Pass.

## Validation Commands

- Focused unit command selected from the repaired layer, if source repair is performed.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --check --ignore-unknown` for all changed allowed files.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-advanced-employee-empty-state-source-diagnosis-repair-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-advanced-employee-empty-state-source-diagnosis-repair-2026-06-25 -SkipRemoteAheadCheck`

## Risk Defenses

- No direct DB inspection or mutation in this task.
- No credential reuse; rely on prior redacted browser evidence.
- No browser rerun in this source diagnosis/repair task.
- If the root cause is missing assignment or seed data rather than code behavior, close with blocked evidence and request
  separate approval before any DB/seed/account work.
