# advanced-student-ai-generation-result-public-id-display-ux-redaction

## Task

Implement the policy decision that student-facing advanced personal AI generation result history/detail UI should hide
or collapse public identifier text lists by default.

The task must preserve:

- internal selected `resultPublicId` use for opening the readonly detail route;
- redacted/local contract metadata;
- loading/empty/error/unauthorized/detail ready states;
- formal adoption blocked semantics;
- existing service/route/API contracts.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-personal-ai-generation-result-public-id-display-policy-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-personal-ai-generation-result-public-id-display-policy-decision.md`

## Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- `docs/05-execution-logs/evidence/2026-06-15-advanced-student-ai-generation-result-public-id-display-ux-redaction.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-student-ai-generation-result-public-id-display-ux-redaction.md`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`

## Blocked Gates

- no `.env*` read/write/output
- no DB access or row/private data inspection
- no provider/model call or provider payload/raw prompt/raw answer inspection
- no quota/cost/Cost Calibration
- no dev server
- no Browser/Playwright/e2e
- no staging/prod/cloud/deploy/payment/external-service
- no schema/drizzle/scripts/package/lockfile/dependency changes
- no formal adoption write
- no service/route/API contract changes
- no PR or force push

## TDD Plan

1. RED: Add focused component expectations that public identifier values are not rendered in student-facing request
   history, result history, or result detail while the detail route is still called with the selected result public id.
2. GREEN: Hide/collapse only visible public identifier fields in the student UI; keep internal selected id flow intact.
3. VERIFY: Run the focused unit test, then full task validation commands.

## Validation

- `npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-student-ai-generation-result-public-id-display-ux-redaction`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-student-ai-generation-result-public-id-display-ux-redaction`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-student-ai-generation-result-public-id-display-ux-redaction`
