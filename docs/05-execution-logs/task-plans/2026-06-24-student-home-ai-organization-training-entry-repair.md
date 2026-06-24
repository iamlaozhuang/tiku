# Task Plan: student-home-ai-organization-training-entry-repair-2026-06-24

## Required Reading

- AGENTS.md
- docs/03-standards/code-taste-ten-commandments.md
- docs/03-standards/ui-code.md
- docs/02-architecture/adr/
- docs/04-agent-system/operating-manual.md
- docs/04-agent-system/sop/requirement-ssot-reading-governance.md
- docs/04-agent-system/sop/task-lifecycle-governance.md
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml

## SSOT Read List

- docs/01-requirements/00-index.md
- docs/01-requirements/modules/03-student-experience.md
- docs/01-requirements/advanced-edition/00-index.md
- docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md
- docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md
- docs/01-requirements/advanced-edition/modules/04-organization-training.md
- docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md
- docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md
- docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md
- docs/01-requirements/traceability/role-experience-fulfillment-matrix.md

## Requirement Decision Map

- R5 requires personal advanced learners to see a discoverable `AI训练` entry for personal AI question/paper generation;
  personal standard learners must not receive enabled advanced AI actions.
- R6 requires standard organization employees to see neither `AI训练` nor `企业训练`, while advanced organization employees
  see both when valid advanced organization authorization permits them.
- Advanced AI entry contract requires learner-side `AI训练` to be visible without manual URL entry and to expose `AI出题`
  and `AI组卷` actions.
- Organization training requirements require `企业训练` to be discoverable for eligible advanced employees; URL-only
  access fails acceptance.

## Requirement Mapping Result

- `personal_standard_student`: no enabled `AI训练`; direct advanced route behavior may remain guarded by existing route
  logic or show unavailable/upgrade guidance without Provider execution.
- `personal_advanced_student`: learner home shows `AI训练`; `AI训练` links to the learner AI route and the AI page uses
  product-visible `AI出题` and `AI组卷` actions or blocked states.
- `org_standard_employee`: no enabled `AI训练`; no `企业训练` entry from organization context.
- `org_advanced_employee`: learner home shows `AI训练` and `企业训练` when existing authorization context capabilities
  indicate AI generation and organization training access.
- Backend roles remain out of scope for this package and are covered by later repair packages.

## Role Mapping Result

- In scope: `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, `org_advanced_employee`.
- Explicitly out of scope: `org_standard_admin`, `org_advanced_admin`, `content_admin`, `ops_admin`.
- Current implementation source for in-scope role visibility is existing authorization context capabilities from
  `/api/v1/authorizations`; if those capabilities are unavailable, the UI must not infer advanced access.

## Evidence-Only Sources

- docs/05-execution-logs/acceptance/2026-06-23-role-separated-mvp-repair-issue-list-and-requirement-decisions.md
- docs/05-execution-logs/acceptance/2026-06-23-advanced-ai-entry-ui-ux-contract.md
- docs/05-execution-logs/evidence/2026-06-24-backend-workspace-landing-logout-separation-repair.md
- docs/05-execution-logs/audits-reviews/2026-06-24-backend-workspace-landing-logout-separation-repair.md

These files provide decision provenance and baseline findings. The requirement SSOT files above control the mapping.

## Conflict Check

- Existing `StudentHomePage` only fetches paper scopes and paper lists; that data does not include `effectiveEdition` or
  capability booleans.
- Existing `/api/v1/authorizations` already returns `authorizationContexts` with capability flags. This task should
  reuse that route instead of adding schema, API fields, migrations, or dependencies.
- Existing `/ai-generation` and `/organization-training` routes exist. This task is primarily discoverability and
  product-copy repair, not Provider execution or organization training data mutation.
- The current personal AI page wording is still local-contract oriented; this task may adjust visible copy and actions
  without implying Provider readiness.

## Scope

- Task id: student-home-ai-organization-training-entry-repair-2026-06-24
- Branch: codex/student-home-ai-org-training-entries-20260624
- Task kind: implementation
- Product closure contribution: learner home AI and organization training discoverability for currently modeled learner
  and employee roles.

Allowed files:

- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- src/features/student/home/StudentHomePage.tsx
- src/features/student/studentRuntimeApi.ts
- src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx
- tests/unit/student-home-ui.test.ts
- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx
- tests/unit/organization-training-employee-entry-surface.test.ts
- docs/05-execution-logs/task-plans/2026-06-24-student-home-ai-organization-training-entry-repair.md
- docs/05-execution-logs/evidence/2026-06-24-student-home-ai-organization-training-entry-repair.md
- docs/05-execution-logs/audits-reviews/2026-06-24-student-home-ai-organization-training-entry-repair.md

Blocked files and actions:

- `.env*`
- package files and lockfiles
- `src/db/schema/**`
- `drizzle/**`
- `e2e/**`
- `scripts/**`
- database reads/writes, seed, schema migration, Provider call/configuration, Cost Calibration Gate, browser/e2e runtime,
  staging/prod/cloud/deploy, payment, external services, PR, force push, final acceptance Pass.

## Implementation Plan

1. Write RED unit tests in `student-home-ui.test.ts`:
   - advanced personal context shows `AI训练` linking to `/ai-generation`.
   - advanced organization employee context shows both `AI训练` and `企业训练` linking to `/organization-training`.
   - standard personal or standard organization contexts do not show enabled advanced entries.
   - runtime mode fetches `/api/v1/authorizations` with `credentials: "same-origin"` and no bearer header.
2. If needed, write RED unit assertions in `StudentPersonalAiGenerationPage.test.tsx` for visible `AI训练`, `AI出题`, and
   `AI组卷` product labels while preserving local/mock/gated wording.
3. Implement the smallest authorization-context reader:
   - reuse existing `/api/v1/authorizations`;
   - derive `canShowAiTraining` from `canGenerateAiQuestion` or `canGenerateAiPaper`;
   - derive `canShowOrganizationTraining` from `canAnswerOrganizationTraining`;
   - keep failure behavior conservative and avoid showing advanced entries when capability evidence is absent.
4. Add learner home entry cards/links using existing design tokens and mobile-first layout.
5. Re-run focused unit tests, lint, typecheck, Prettier check, `git diff --check`, and Module Run v2 pre-commit
   hardening.
6. Write evidence and audit review with SSOT Read List, Requirement Mapping Result, Role Mapping Result, RED/GREEN
   evidence, and residual gaps.

## Risk Defense

- Do not treat frontend visibility as the only authorization boundary; only add discoverability using existing capability
  data.
- Do not call Provider or imply real model execution.
- Do not expose prompts, generated content, tokens, cookies, localStorage values, database rows, or plaintext
  `redeem_code` in evidence.
- Do not add `effectiveEdition` to `StudentPaperScopeDto` or change API contracts unless a later task approves that
  scope.
- Do not claim standard/advanced MVP final Pass after local unit validation.

## Validation Commands

```powershell
npm.cmd run test:unit -- tests/unit/student-home-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/organization-training-employee-entry-surface.test.ts
npm.cmd run lint
npm.cmd run typecheck
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/features/student/home/StudentHomePage.tsx src/features/student/studentRuntimeApi.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx tests/unit/student-home-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/organization-training-employee-entry-surface.test.ts docs/05-execution-logs/task-plans/2026-06-24-student-home-ai-organization-training-entry-repair.md docs/05-execution-logs/evidence/2026-06-24-student-home-ai-organization-training-entry-repair.md docs/05-execution-logs/audits-reviews/2026-06-24-student-home-ai-organization-training-entry-repair.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId student-home-ai-organization-training-entry-repair-2026-06-24
```

## Stop Conditions

- The repair requires schema/migration, database seed/write, new API contract fields, dependency changes, env/secret,
  Provider execution, browser/e2e runtime, staging/prod, payment, external services, PR, force push, or final acceptance
  Pass claims.
- Capability data is insufficient to distinguish standard versus advanced entries without changing backend contracts.
- Evidence would need to record tokens, cookies, localStorage values, passwords, prompt text, Provider payloads, raw AI
  outputs, database rows, private employee answers, or plaintext `redeem_code`.
