# Task Plan: batch-183-organization-training-paper-and-mock-exam-context-usage-without-ex

## Scope

- Task: `batch-183-organization-training-paper-and-mock-exam-context-usage-without-ex`
- Branch: `codex/organization-training-batch-183-paper-mock-context`
- Task kind: Module Run v2 local implementation
- Goal: add a local service boundary that lets organization training reference formal `paper` and `mock_exam` context only through redacted metadata, without exposing full paper content in runtime DTOs, writes, or evidence.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `src/server/models/organization-training.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/validators/organization-training.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`

## Implementation Plan

1. Follow TDD:
   - add RED tests in `src/server/services/organization-training-service.test.ts` for a redacted `paper` / `mock_exam` context boundary;
   - verify the tests fail because the service API does not yet exist;
   - add the minimal model, contract, and service changes to pass.
2. Introduce explicit local-only context types:
   - accepted source types: `paper`, `mock_exam`;
   - allowed metadata: public id, title, profession, level, subject, question count, total score, and source status;
   - redaction policy: no full question body, standard answer, `analysis`, prompt, provider payload, private row id, formal write target, or raw answer fields.
3. Add service method for attaching/normalizing context into organization training draft metadata:
   - requires advanced `org_auth`;
   - requires `canCreateOrganizationTraining`;
   - requires organization scope visibility and authorization owner match;
   - returns/writes only redacted context snapshots.
4. Keep implementation inside allowed files only:
   - `src/server/models/**`
   - `src/server/contracts/**`
   - `src/server/validators/**`
   - `src/server/services/**`
   - task state, plan, evidence, audit

## Verification Plan

- Pre-edit readiness:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-72-advanced-organization-training-implementation-planning -CandidateTaskId batch-183-organization-training-paper-and-mock-exam-context-usage-without-ex`
- RED:
  `npm.cmd run test:unit -- src/server/services/organization-training-service.test.ts src/server/validators/organization-training.test.ts`
- GREEN and closeout:
  `npm.cmd run test:unit -- src/server/services/organization-training-service.test.ts src/server/validators/organization-training.test.ts`
  `npm.cmd run lint`
  `npm.cmd run typecheck`
  `git diff --check`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-183-organization-training-paper-and-mock-exam-context-usage-without-ex`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-183-organization-training-paper-and-mock-exam-context-usage-without-ex`
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-183-organization-training-paper-and-mock-exam-context-usage-without-ex`

## Blocked Gates Preserved

- No `.env*` read/write/output.
- No real DB execution and no direct row/private data read.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema/drizzle/package/lockfile/dependency changes.
- No formal adoption target write.
- No full paper content, full question bodies, standard answers, `analysis`, employee answer bodies, private row data, public id lists, secret, token, cookie, Authorization header, DB URL, provider payload, raw prompt, or raw answer in evidence.
- No PR and no force push.

## Risks And Defenses

- Risk: accidentally implying organization training publishes formal `paper` or creates formal `mock_exam`.
  Defense: context snapshots are metadata-only and include no formal write policy or target ids beyond source public ids.
- Risk: evidence may leak full paper content.
  Defense: evidence records only command results and redacted behavior summaries, never fixture question bodies or answers.
- Risk: service API grows too broadly.
  Defense: add only a small local service method and DTO/model types needed by batch-183.
