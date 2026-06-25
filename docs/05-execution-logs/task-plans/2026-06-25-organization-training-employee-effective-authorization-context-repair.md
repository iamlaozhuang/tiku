# Organization Training Employee Effective Authorization Context Repair Plan

Task id: `organization-training-employee-effective-authorization-context-repair-2026-06-25`

Branch: `codex/org-training-employee-workflow-20260625`

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

## Requirement Decision Map

- ADR-007: UI visibility is not an authorization boundary; services compute `effectiveEdition` from source
  `authorization` state.
- Organization training requirements: `org_standard_employee` cannot discover or answer `企业训练`;
  `org_advanced_employee` can discover assigned `企业训练` under valid advanced `org_auth`.
- Role-separated R6: employee navigation and direct route behavior must reflect `effectiveEdition` and organization
  context.

## Requirement Mapping

The previous real-browser rerun showed `org_advanced_employee` reached empty `/organization-training` state. Static code
inspection found the organization-training runtime employee context is synthesized as fixed `logistics` level `4`
advanced `org_auth`; this can filter out real assigned training when the employee's actual `org_auth` has a different
`profession` or `level`, and it fails to deny standard employees through the effective authorization source.

This task repairs the runtime context source so organization-training employee list/detail/write routes use the
service-computed effective `org_auth` context for the logged-in employee organization.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-direct-route-guard-post-repair-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-direct-route-guard-post-repair-browser-rerun.md`

## Conflict Check

No requirement conflict found. Runtime evidence explains the observed gap; requirement SSOT already requires effective
authorization enforcement and advanced employee assigned training visibility.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `docs/05-execution-logs/task-plans/2026-06-25-organization-training-employee-effective-authorization-context-repair.md`
- `docs/05-execution-logs/evidence/2026-06-25-organization-training-employee-effective-authorization-context-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-employee-effective-authorization-context-repair.md`

Blocked:

- Browser/runtime rerun, credential read/input, DB/seed/schema/migration/account mutation, `.env*`, package/lockfile,
  Provider/Cost, staging/prod, payment, external service, PR/force push, final MVP Pass.

## Implementation Approach

1. Add RED route tests proving a standard organization employee effective context blocks employee visible-list before
   repository list access.
2. Add RED route test proving an advanced employee visible-list uses the real effective `org_auth` profession/level
   context and therefore returns assigned training matching that context instead of the synthetic `logistics/4`
   fallback.
3. Update `organization-training-route.ts` to resolve employee authorization context from the effective authorization
   service for the logged-in user and current organization.
4. Keep the route handler thin; do not alter DB schema, repository SQL shape, or seed data.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --check --ignore-unknown src/server/services/organization-training-route.ts src/server/services/organization-training-route.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-organization-training-employee-effective-authorization-context-repair.md docs/05-execution-logs/evidence/2026-06-25-organization-training-employee-effective-authorization-context-repair.md docs/05-execution-logs/audits-reviews/2026-06-25-organization-training-employee-effective-authorization-context-repair.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-employee-effective-authorization-context-repair-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-employee-effective-authorization-context-repair-2026-06-25 -SkipRemoteAheadCheck`

## Risk Defenses

- TDD: production route code changes only after RED focused tests fail for the expected reason.
- Evidence remains redacted and command-summary only.
- Browser rerun is a later task after source closeout.
- If repair requires DB/seed/schema/migration or credentialed runtime changes, stop and request separate approval.
