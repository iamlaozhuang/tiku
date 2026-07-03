# Learner AI Context Source Landing Plan

## Task

- Task id: `learner-ai-context-source-landing-2026-07-03`
- Branch: `codex/learner-ai-context-source-landing-2026-07-03`
- Goal: land the learner AI context-selection source contract for explicit authorization context choice, quota owner confirmation, history/retry preservation, and standard-unavailable states.

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
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`

## Requirement Anchors

- `UX-REQ-12`
- `G13`
- `CT-REQ-033`
- `D13`
- ADR-007 quota ownership rule: the system must not automatically switch authorization contexts to obtain a higher `effectiveEdition` or more quota.

## Current Source Posture

- Learner AI page and tests already cover discoverable `AI训练`, standard-unavailable state, request/result history, retry affordance, redacted result detail, and task-type pagination.
- Current gap: request submission selects the first advanced context and request-body construction derives owner/quota context from session user type, not from the explicitly selected authorization context.

## Implementation Plan

1. Add failing unit coverage for personal and organization advanced contexts coexisting:
   - personal context is the default for learner AI;
   - organization quota is used only after the user explicitly selects the organization context;
   - request payload uses the selected context public metadata and does not expose session token or raw provider material.
2. Add a compact learner-facing authorization context selector and quota-owner confirmation panel using existing tokens and mobile-first layout.
3. Route submission through the selected `EffectiveAuthorizationContextDto`; do not add Provider calls, schema, dependency, Prompt, database, browser, or deployment work.
4. Preserve existing history/retry/standard-unavailable tests.
5. Record focused validation, two review passes, and closeout evidence.

## Boundaries

- Allowed source/test files:
  - `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
  - `tests/unit/student-personal-ai-generation-ui.test.ts`
- Allowed governance files:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`
  - `docs/05-execution-logs/task-plans/2026-07-03-learner-ai-context-source-landing.md`
  - `docs/05-execution-logs/evidence/2026-07-03-learner-ai-context-source-landing.md`
  - `docs/05-execution-logs/audits-reviews/2026-07-03-learner-ai-context-source-landing.md`
- Blocked: `.env*`, package and lockfiles, schema/migration/seed, direct DB connection or mutation, Provider calls/configuration, Prompt changes, browser/e2e/dev-server runtime, staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/server/services/personal-ai-generation-request-context-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-context-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId learner-ai-context-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-ai-context-source-landing-2026-07-03 -SkipRemoteAheadCheck`
