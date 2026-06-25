# Evidence: learner-org-employee-ai-entry-session-repair-2026-06-25

## Summary

- Task id: `learner-org-employee-ai-entry-session-repair-2026-06-25`.
- Branch: `codex/learner-org-ai-entry-session-repair-20260625`.
- Status: closed with focused source/unit validation passing.
- Scope: focused local source/test repair for learner/org employee AI entry and login-state classification.
- Non-claim: no Standard MVP or Advanced MVP final Pass is declared.

## Scope Boundary

Approved by the current user instruction for task 3 as low-risk source plus focused unit tests only. Browser rerun, DB/seed/schema/migration, `.env*`, credentials, Provider, Cost Calibration, staging/prod, payment, external services, PR, force push, and final MVP Pass remain blocked.

## Selected Repair

Task 1 and task 2 outputs selected the first minimal repair candidate: `learner/org employee AI entry and login-state misclassification repair`.

## TDD Evidence

- RED command: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts tests/unit/student-personal-ai-generation-ui.test.ts`.
- RED result: expected failure; 3 tests failed.
- RED failure points:
  - employee AI request route returned `401001` instead of a logged-in organization-context local contract response;
  - employee AI result resolver returned `null`;
  - learner AI page POST body still used `personal_auth`, `personal` owner, and `organizationPublicId: null` for an employee session.
- GREEN command: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-request-context-service.test.ts src/server/services/personal-ai-generation-request-flow-service.test.ts src/server/services/ai-generation-task-request-service.test.ts src/server/validators/personal-ai-generation-request.test.ts tests/unit/student-personal-ai-generation-ui.test.ts`.
- GREEN result: pass; 7 test files and 61 tests passed.

## Implementation Result

- `personal` learner AI local contract behavior remains session-owned and defaults to `personal_auth`.
- `employee` sessions with `organizationPublicId` now resolve as logged-in AI request/result sessions instead of `401001`.
- Employee learner AI POST bodies now carry `org_auth`, `organization` owner/quota context, and the session organization public id.
- AI request context/read-model output now includes explicit authorization boundary fields for source, owner, organization, and quota owner.
- Learner AI task policy accepts `org_auth` plus organization owner/quota boundary for learner AI question/paper local contracts.
- Organization employee local contract requests do not extend the personal-only persistence repository in this task.

## Validation Results

- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-request-context-service.test.ts src/server/services/personal-ai-generation-request-flow-service.test.ts src/server/services/ai-generation-task-request-service.test.ts src/server/validators/personal-ai-generation-request.test.ts tests/unit/student-personal-ai-generation-ui.test.ts`: pass; 7 test files and 61 tests passed.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npx.cmd prettier --write --ignore-unknown ...`: pass; scoped allowed files formatted.
- `npx.cmd prettier --check --ignore-unknown ...`: pass; output included `All matched files use Prettier code style!`.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-org-employee-ai-entry-session-repair-2026-06-25`: pass; output included 20 `OK_SCOPE` entries and `pre-commit hardening passed`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-org-employee-ai-entry-session-repair-2026-06-25 -SkipRemoteAheadCheck`: pass; output included `OK_GIT_COMPLETION_READINESS`, `OK_EVIDENCE_PATH`, `OK_AUDIT_PATH`, and `pre-push readiness passed`.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-25-learner-org-employee-ai-entry-session-repair.md`
- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-entry-session-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-entry-session-repair.md`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `src/server/contracts/personal-ai-generation-request-contract.ts`
- `src/server/models/ai-generation-task-request.ts`
- `src/server/models/personal-ai-generation-request.ts`
- `src/server/models/personal-ai-generation-request-flow.ts`
- `src/server/services/personal-ai-generation-request-context-service.ts`
- `src/server/services/personal-ai-generation-request-context-service.test.ts`
- `src/server/services/personal-ai-generation-request-flow-service.test.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`
- `src/server/services/personal-ai-generation-result-route.ts`
- `src/server/services/personal-ai-generation-result-route.test.ts`
- `src/server/services/ai-generation-task-request-service.test.ts`
- `src/server/validators/personal-ai-generation-request.ts`
- `src/server/validators/personal-ai-generation-request.test.ts`

## Residual Blockers

- Full eight-row real browser rerun was not executed and remains blocked without fresh approval.
- DB/schema/seed-backed organization AI persistence was not changed.
- Standard-vs-advanced runtime authorization behavior still requires later full role evidence.
- No Standard MVP or Advanced MVP final Pass is claimed.

## Taste Compliance Checklist

- [x] Naming follows the project glossary and existing `personal_ai_generation` contract boundaries.
- [x] API JSON remains `camelCase`; DB/schema naming is untouched.
- [x] No hard-coded secrets, tokens, Provider payloads, raw generated content, or `.env*` reads are introduced.
- [x] UI copy uses Chinese labels for user-facing context and avoids raw technical identifiers where surfaced.
- [x] No DB/schema/migration/dependency/browser/e2e/Provider/staging/prod/payment/external-service work is performed.
- [x] No final Standard/Advanced MVP Pass is claimed.
