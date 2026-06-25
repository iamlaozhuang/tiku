# Learner AI And Enterprise Training Entry Runtime Repair Planning

## Status

- Date: 2026-06-24.
- Task id: `learner-ai-and-enterprise-training-entry-runtime-repair-planning-2026-06-24`.
- Scope: planning only for learner `AI训练` and `企业训练` entry repair.
- Source change by this task: none.
- Runtime executed by this task: none.
- Final Pass claim: none.

## SSOT Read List

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

## Requirement Mapping Result

- The implementation target is `GAP-LEARNER-01`.
- Learner `AI训练` must be discoverable for eligible advanced personal learners and advanced organization employees.
- `企业训练` must be discoverable for eligible advanced organization employees.
- Standard personal learners and standard organization employees must not receive advanced learner AI or enterprise
  training capability through menu visibility or direct URL access.
- Entry visibility must follow the authorization context list and `effectiveEdition`; frontend visibility remains UX, not
  the authorization boundary.
- Direct routes must distinguish true unauthenticated state from standard-unavailable or denied state for logged-in
  standard users.

## Role Mapping Result

| role                        | planned home entry                                  | planned direct-route behavior                                                                 |
| --------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `personal_standard_student` | no `AI训练`, no `企业训练`                          | `/ai-generation` shows upgrade/standard-unavailable or denied; no Provider execution.         |
| `personal_advanced_student` | visible `AI训练`, no `企业训练` by personal scope   | `/ai-generation` uses logged-in session and local contract boundary for `AI出题`/`AI组卷`.    |
| `org_standard_employee`     | no `AI训练`, no `企业训练`                          | `/ai-generation` and `/organization-training` show standard-unavailable or denied.            |
| `org_advanced_employee`     | visible `AI训练` and visible `企业训练` when scoped | `/ai-generation` and `/organization-training` use logged-in org context and scoped summaries. |

## Acceptance Mapping Result

- Planning acceptance: follow-up implementation task is queued with allowed files, validation commands, and blocked gates.
- Static implementation acceptance later: focused unit tests, lint, typecheck, diff check, and hardening.
- Runtime/browser acceptance later: not part of this planning task or the immediate static implementation closeout unless
  a fresh task approves it.
- Standard/advanced MVP final Pass remains blocked.

## Allowed Implementation Files

- `src/features/student/home/StudentHomePage.tsx`.
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`.
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`.
- `tests/unit/student-home-ui.test.ts`.
- `tests/unit/student-personal-ai-generation-ui.test.ts`.
- `tests/unit/organization-training-employee-entry-surface.test.ts`.
- Task-local plan/evidence/audit/state/queue files for
  `learner-ai-and-enterprise-training-entry-runtime-repair-2026-06-24`.

## Blocked Remainder

- Provider-backed generation, prompt/model payloads, real generated content, quota/cost calibration, schema/database
  changes, dependency changes, dev server, browser/runtime, credential/account actions, staging/prod/deploy,
  payment/external services, PR/force-push, and final Pass remain blocked.

## Recommended Next Task

- `learner-ai-and-enterprise-training-entry-runtime-repair-2026-06-24`.
