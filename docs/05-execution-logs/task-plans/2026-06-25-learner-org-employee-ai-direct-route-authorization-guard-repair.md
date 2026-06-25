# Learner/Org Employee AI Direct Route Authorization Guard Repair

Task id: `learner-org-employee-ai-direct-route-authorization-guard-repair-2026-06-25`

Branch: `codex/ai-direct-route-guard-20260625`

## Goal

Repair the learner AI direct route so standard personal learners and standard organization employees receive an
unavailable or denied state instead of the `AI训练` workflow when manually opening `/ai-generation`.

No Standard/Advanced MVP final Pass will be claimed.

## SSOT Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-home-entry-capability-post-repair-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-home-entry-capability-post-repair-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-home-entry-capability-discovery-repair.md`
- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-runtime-cookie-session-post-repair-browser-rerun.md`

## Requirement Mapping Result

- Edition-aware authorization SSOT says UI visibility is not an authorization boundary; runtime services must enforce
  `effectiveEdition` and capability checks.
- Personal AI generation SSOT says standard learners and standard organization employees must receive clear unavailable
  or denied states for direct advanced AI route access.
- R5/R6 role-separated traceability requires `personal_standard_student` and `org_standard_employee` to be denied or
  standard-unavailable on direct learner AI routes, while advanced rows retain discoverable AI workflow.

## Conflict Check

Requirements, traceability, and latest browser evidence agree. The latest browser rerun showed `/home` entry visibility is
repaired, but direct `/ai-generation` still exposes workflow for standard rows. The next minimal repair is therefore a
direct-route authorization guard, not another home-entry repair.

## Scope

Allowed files:

- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-25-learner-org-employee-ai-direct-route-authorization-guard-repair.md`
- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-direct-route-authorization-guard-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-direct-route-authorization-guard-repair.md`

Blocked scope:

- Browser rerun, credential read/input, DB, seed, schema, migration, env files, Provider/model calls, Cost Calibration,
  staging/prod, payment, external services, package/lockfile changes, PR, force push, and final MVP Pass claim.

## TDD Plan

1. RED: add focused UI tests showing standard personal and standard organization employee authorization contexts render
   unavailable state and do not expose `AI出题`.
2. GREEN: make `StudentPersonalAiGenerationPage` fetch `/api/v1/authorizations` fail-closed and require an advanced
   context with AI generation capability before initial histories or submit workflow remain available.
3. Preserve advanced personal and advanced organization employee behavior.
4. Run focused tests, lint, typecheck, formatting, diff, pre-commit hardening, and pre-push readiness.

## Validation Plan

- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --check --ignore-unknown src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx tests/unit/student-personal-ai-generation-ui.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-learner-org-employee-ai-direct-route-authorization-guard-repair.md docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-direct-route-authorization-guard-repair.md docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-direct-route-authorization-guard-repair.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-org-employee-ai-direct-route-authorization-guard-repair-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-org-employee-ai-direct-route-authorization-guard-repair-2026-06-25 -SkipRemoteAheadCheck`
