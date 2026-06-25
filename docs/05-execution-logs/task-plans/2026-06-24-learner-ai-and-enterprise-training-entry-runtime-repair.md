# Task Plan: learner-ai-and-enterprise-training-entry-runtime-repair-2026-06-24

## Metadata

- Task id: `learner-ai-and-enterprise-training-entry-runtime-repair-2026-06-24`.
- Branch: `codex/learner-entry-runtime-repair-20260624`.
- Task kind: `implementation`.
- Execution profile: `low_risk_learner_entry_runtime_boundary_repair_no_provider`.
- Approval consumed: current user approved serial execution and closeout on 2026-06-24.
- Browser plugin status: available in session, but browser/runtime observation is blocked by this task.
- Final Pass claim: none.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`.

## Requirement Mapping Result

- Target gap: `GAP-LEARNER-01`.
- Learner `AI训练` and `企业训练` entries must remain capability-driven through authorization contexts and
  `effectiveEdition`.
- Direct learner AI route must not treat a cookie-backed logged-in learner as logged out because localStorage has no bearer
  token or stores the cookie-backed marker.
- Direct organization training route must not treat a cookie-backed logged-in employee as logged out for the same reason.
- Standard/unavailable direct-route responses must be shown as authorization-unavailable or denied states, not as generic
  login or generic load failures.

## Role Mapping Result

- `personal_standard_student`: home advanced entries hidden; direct AI route displays authorization-unavailable/blocked
  state when the backend reports the standard or unavailable boundary.
- `personal_advanced_student`: home AI entry visible; direct AI route can load history and submit the local contract using
  either bearer token or cookie-backed session.
- `org_standard_employee`: home AI and enterprise entries hidden; direct organization training route maps employee-context
  unavailable responses to authorization-unavailable state.
- `org_advanced_employee`: home AI and enterprise entries visible; direct organization training route loads visible
  training rows through bearer token or cookie-backed session.

## Acceptance Mapping Result

- Focused static acceptance: update allowed learner pages and focused unit tests.
- Required commands: focused unit tests, lint, typecheck, diff check, Module Run v2 hardening.
- Browser/runtime acceptance is not executed in this task.
- Standard/advanced MVP final Pass remains blocked.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair.md`.
- `src/features/student/home/StudentHomePage.tsx`.
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`.
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`.
- `tests/unit/student-home-ui.test.ts`.
- `tests/unit/student-personal-ai-generation-ui.test.ts`.
- `tests/unit/organization-training-employee-entry-surface.test.ts`.

## Blocked Files And Actions

- Blocked files: `.env*`, package and lock files, `src/db/schema/**`, `drizzle/**`, `scripts/**`, `e2e/**`, browser
  artifacts, build artifacts, and local private credential paths.
- Blocked actions: Provider/model execution or configuration, Provider cost/quota measurement, Cost Calibration Gate,
  schema/migration/database write, dependency change, dev server start, browser/runtime observation, credential/account
  action, staging/prod/cloud/deploy, payment/external service, PR/force-push, and final Pass claim.

## Implementation Approach

1. Keep `StudentHomePage` capability-driven entry visibility intact and add any missing focused assertions only if needed.
2. In the learner AI page, map real stored tokens to Bearer requests, while `COOKIE_BACKED_SESSION_MARKER` or missing local
   token uses same-origin cookie requests.
3. In the learner AI page, keep 401 as true unauthenticated and map standard/unavailable or blocked API responses to a
   visible authorization-unavailable/blocked state without rendering provider, prompt, raw content, or token values.
4. In the organization training page, use the same bearer-or-cookie session mapping for visible-list and employee answer
   actions.
5. In the organization training page, keep 401 as true unauthenticated and map employee-context unavailable or blocked
   responses to a visible authorization-unavailable/denied state.
6. Update focused unit tests for bearer-token compatibility, cookie-backed marker/no-header requests, missing-session
   401, and permission/unavailable direct-route behavior.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/organization-training-employee-entry-surface.test.ts`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `git diff --check`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-and-enterprise-training-entry-runtime-repair-2026-06-24`.
