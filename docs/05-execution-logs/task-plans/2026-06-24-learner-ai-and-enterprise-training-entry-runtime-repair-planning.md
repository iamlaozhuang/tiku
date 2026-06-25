# Task Plan: learner-ai-and-enterprise-training-entry-runtime-repair-planning-2026-06-24

## Metadata

- Task id: `learner-ai-and-enterprise-training-entry-runtime-repair-planning-2026-06-24`.
- Branch: `codex/learner-entry-repair-planning-20260624`.
- Task kind: `docs_requirement_alignment`.
- Execution profile: `learner_entry_repair_scope_planning_no_source_no_runtime`.
- Approval consumed: current user approved serial execution and closeout on 2026-06-24.
- Product source change: not approved for this planning task.
- Browser/runtime validation: not approved for this planning task.
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

## Requirement Decision Map

- `GAP-LEARNER-01` is the direct planning target.
- R5 requires `personal_advanced_student` to see discoverable `AI训练`, while `personal_standard_student` must not receive
  advanced AI capability and needs hidden, upgrade, or denied state for direct access.
- R6 requires `org_advanced_employee` to see discoverable `AI训练` and `企业训练`, while `org_standard_employee` sees neither
  and receives denied or unavailable direct-route states.
- Advanced AI scope clarification confirms learner AI output stays in the learner AI learning content domain and does not
  auto-write formal `question` or `paper`.
- Organization training requirements confirm employee training is separate from formal `paper`, `practice`, and
  `mock_exam`.
- Edition-aware authorization requirements confirm UI visibility is not an authorization boundary; the follow-up
  implementation must respect service-computed `effectiveEdition` and selected authorization context semantics.

## Requirement Mapping

- This planning task maps requirements to a follow-up implementation package for learner entry visibility and direct-route
  boundaries only.
- It does not approve Provider execution, AI prompt/model payload handling, schema/database changes, dependency changes,
  account changes, runtime browser validation, or final acceptance.

## Role Mapping Result

- `personal_standard_student`: home must hide advanced `AI训练`; direct `/ai-generation` must show standard-unavailable or
  upgrade guidance rather than a generic login state for an already logged-in standard learner.
- `personal_advanced_student`: home must show `AI训练`; direct `/ai-generation` must use the logged-in session and expose
  `AI出题` and `AI组卷` actions within the existing local contract boundary.
- `org_standard_employee`: home must hide `AI训练` and `企业训练`; direct `/ai-generation` and `/organization-training` must
  show standard-unavailable or denied state.
- `org_advanced_employee`: home must show both `AI训练` and `企业训练`; direct `/organization-training` must use the logged-in
  session and show assigned/empty training without requiring localStorage-only token state.

## Acceptance Mapping Result

- Planning acceptance: scoped allowed files and validation commands are recorded for the follow-up implementation task.
- The follow-up implementation may prove local static/unit behavior only.
- Fresh browser/runtime role-row acceptance remains a separate later task.
- Standard/advanced MVP final Pass remains blocked.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-visible-chinese-ui-technical-label-cleanup.md`.
- Read-only source scan of student home, learner AI generation, organization training, and focused tests.

## Conflict Check

- No SSOT conflict found.
- Existing source already contains a home-level authorization-context mechanism, but runtime evidence showed direct routes
  can still behave as unauthenticated or standard-ambiguous because direct pages depend on localStorage token behavior.
- Implementation must preserve service-side authorization as the boundary; frontend visibility remains only entry UX.

## Allowed Files

This planning task may edit only:

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`.

The follow-up implementation task may edit only:

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

## Follow-Up Implementation Approach

1. Keep `StudentHomePage` capability-driven entry visibility, but add or adjust focused tests for personal/organization
   standard and advanced rows.
2. Replace direct-route localStorage-only session gating in the AI training page with the existing cookie-backed student
   runtime where possible, while preserving bearer-token support for older local tests if needed.
3. Make direct AI training route distinguish logged-in standard-unavailable or denied states from true unauthenticated
   state.
4. Replace organization training page localStorage-only session gating with cookie-backed student runtime where possible.
5. Make direct organization training route distinguish standard employee unavailable/denied from valid advanced employee
   empty/assigned training states.
6. Keep real Provider execution blocked; `AI出题` and `AI组卷` stay within existing local contract/draft boundary.
7. Update focused unit tests only for the changed learner entry and direct-route state behavior.

## Validation Commands

Planning task:

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md docs/05-execution-logs/acceptance/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md docs/05-execution-logs/acceptance/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-learner-ai-and-enterprise-training-entry-runtime-repair-planning.md`.
- `git diff --check`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-and-enterprise-training-entry-runtime-repair-planning-2026-06-24`.

Follow-up implementation task:

- `npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/organization-training-employee-entry-surface.test.ts`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `git diff --check`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-and-enterprise-training-entry-runtime-repair-2026-06-24`.
