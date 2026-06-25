# Evidence: learner-ai-and-enterprise-training-entry-runtime-repair-2026-06-24

## Summary

- Task id: `learner-ai-and-enterprise-training-entry-runtime-repair-2026-06-24`.
- Branch: `codex/learner-entry-runtime-repair-20260624`.
- Task kind: `implementation`.
- Scope: learner AI and enterprise training direct-route session/runtime boundary repair.
- Browser/runtime executed by this task: none.
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

- Result: pass_learner_entry_runtime_boundary_repaired_static_validated.
- Learner AI direct route now treats `COOKIE_BACKED_SESSION_MARKER` as a cookie-backed same-origin request instead of a
  bearer token.
- Learner AI direct route now probes cookie-backed session when no local token exists, preserving true 401
  unauthenticated behavior.
- Organization training employee direct route now uses the same bearer-or-cookie request token mapping for visible-list,
  draft-save, submit, and readonly-summary.
- Organization training direct route maps employee authorization/context unavailable responses to an explicit
  authorization-unavailable state rather than a generic loading failure.
- Provider-backed generation, raw prompt/content, schema, env, dependency, browser/runtime, and final Pass remain blocked.

## Role Mapping Result

- `personal_standard_student`: advanced home entry remains hidden by existing authorization-context logic; direct AI route
  can display authorization-unavailable/blocked state when the backend reports an unavailable or denied boundary.
- `personal_advanced_student`: direct AI route preserves bearer-token support and adds cookie-backed session support for
  history and local contract submit flow.
- `org_standard_employee`: advanced home entries remain hidden by existing authorization-context logic; direct enterprise
  training route maps employee-context unavailable responses to authorization-unavailable state.
- `org_advanced_employee`: direct enterprise training route preserves bearer-token support and adds cookie-backed session
  support for visible training and employee answer actions.

## Acceptance Mapping Result

- Focused unit/static acceptance: pass.
- Runtime/browser acceptance: not executed by this task.
- Standard/advanced MVP final Pass: not claimed.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair.md`.
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`.
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`.
- `tests/unit/student-personal-ai-generation-ui.test.ts`.
- `tests/unit/organization-training-employee-entry-surface.test.ts`.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/organization-training-employee-entry-surface.test.ts`
  - Result: pass; 3 files passed, 29 tests passed.
- `npm.cmd run lint`
  - Result: pass.
- `npm.cmd run typecheck`
  - Result: pass.
- `git diff --check`
  - Result: pass; no whitespace errors.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-and-enterprise-training-entry-runtime-repair-2026-06-24`
  - Result: pass; `pre-commit hardening passed`.

## Blocked / Not Executed

- Browser/runtime, dev server, credential/account actions, database read/write/migration, dependency changes, `.env*`,
  Provider/model/cost calibration, staging/prod/deploy, payment/external service, PR/force-push, Cost Calibration Gate,
  and final acceptance Pass were not executed.
