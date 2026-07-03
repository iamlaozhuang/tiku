# Employee Training Answer Result Source Landing Plan

## Task

- Task id: `employee-training-answer-result-source-landing-2026-07-03`
- Branch: `codex/employee-training-answer-result-source-landing-2026-07-03`
- Goal: land the learner-grade employee `企业训练` answer/result source contract for real question rendering, draft save, submit confirmation, and own-result review.

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`

## Requirement Anchors

- `UX-REQ-17`
- `G14`
- `CT-REQ-036`
- `D15`

## Current Source Posture

- Student home already exposes `企业训练` only for advanced organization employee capability.
- Student organization training page has loading/empty/error/unavailable states and session-backed route calls.
- Current employee answer UI still uses numeric `answeredQuestionCount`, `score`, and `totalScore` fields; this conflicts with `CT-REQ-036`, which requires actual questions/materials/options/text inputs and own-result review.
- Current database schema and repository do not store organization training question snapshots or per-question employee answers. This package therefore lands the UI/DTO/request source contract without schema or database migration.

## Implementation Plan

1. Add failing unit coverage requiring:
   - employee-facing `企业训练` list metadata includes organization node, profession, level, subject, version, question count, deadline, status, and submitted score;
   - answer UI renders question stems, materials, options, and text inputs instead of numeric score-entry fields;
   - draft-save and submit request bodies carry question-level answer items and no user-entered score fields;
   - submit still requires confirmation;
   - own result review renders submitted answer, score summary, standard answer, analysis, and subjective scoring-point reasons when returned by the employee summary API;
   - raw employee answer/result detail is not exposed to organization admin summaries by this package.
2. Extend organization training DTOs with optional learner-facing question snapshots and own-answer/result details.
3. Refactor `StudentOrganizationTrainingPage` to render a learner-grade question answer surface, preserving existing loading, empty, error, unavailable, session, and redaction behavior.
4. Keep backend route compatibility by preserving `answeredQuestionCount` and a transport score summary where the current API still requires it, while hiding score entry from users.
5. Record validation, two self-review passes, and closeout evidence.

## Boundaries

- Allowed source/test files:
  - `src/server/contracts/organization-training-contract.ts`
  - `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`
  - `tests/unit/organization-training-employee-entry-surface.test.ts`
- Allowed governance files:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`
  - `docs/05-execution-logs/task-plans/2026-07-03-employee-training-answer-result-source-landing.md`
  - `docs/05-execution-logs/evidence/2026-07-03-employee-training-answer-result-source-landing.md`
  - `docs/05-execution-logs/audits-reviews/2026-07-03-employee-training-answer-result-source-landing.md`
- Blocked: `.env*`, package and lockfiles, schema/migration/seed, direct DB connection or mutation, Provider calls/configuration, Prompt changes, browser/e2e/dev-server runtime, staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration.

## Follow-Up Gap

- Full persistence of question snapshots and per-question employee answers requires a later schema/API/service/repository packet. This package must not hide that gap or claim complete production behavior.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/organization-training-employee-entry-surface.test.ts src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts src/server/validators/organization-training.test.ts src/server/mappers/organization-training-mapper.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId employee-training-answer-result-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId employee-training-answer-result-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId employee-training-answer-result-source-landing-2026-07-03 -SkipRemoteAheadCheck`
