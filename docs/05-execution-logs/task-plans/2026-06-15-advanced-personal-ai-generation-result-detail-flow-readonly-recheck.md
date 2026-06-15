# Task Plan: Advanced Personal AI Generation Result Detail Flow Readonly Recheck

## Task

- Task id: `advanced-personal-ai-generation-result-detail-flow-readonly-recheck`
- Branch: `codex/advanced-personal-ai-generation-result-detail-flow-readonly-recheck`
- Date: 2026-06-15
- Baseline: `3f4e2ba9f975b331c163f46e6d0880b0410f16a9`
- Scope: docs-only readonly regression audit after the `404045` student UI fix.

## Read Before Audit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- Recent evidence/audit for:
  - `advanced-personal-ai-generation-result-redacted-detail-read-model-service`
  - `advanced-personal-ai-generation-result-redacted-detail-readonly-route`
  - `advanced-student-ai-generation-result-detail-ui`
  - `advanced-personal-ai-generation-result-detail-flow-readonly-audit`
  - `fix-student-ai-generation-result-detail-not-found-state`

## Repository Gate

- `git switch master`: pass.
- `git fetch --prune origin`: pass.
- Worktree clean before branch creation: pass.
- `HEAD == master == origin/master`: pass at `3f4e2ba9f975b331c163f46e6d0880b0410f16a9`.
- No local or remote `codex/*` branch residue: pass.

## Audit Questions

1. Does the service still use `404045` for detail not-found and return standard `{ code, message, data }` envelopes?
2. Does the readonly route forward service detail responses through a thin ADR-002 adapter using session-owned
   `ownerPublicId` and route `{publicId}` as `resultPublicId`?
3. Does the student UI detail flow now map `404045` to the redacted empty state instead of the error state?
4. Do the focused component tests cover the `404045` empty-state path?
5. Are `local_contract_only`, `redacted_snapshot`, `redacted`, `metadata_only`, and
   `blocked_without_follow_up_task` declarations still accurate?
6. Are blocked gates still preserved without implementation, DB, provider, schema, dependency, browser/e2e, formal
   adoption, or external-service work?

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-personal-ai-generation-result-detail-flow-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-personal-ai-generation-result-detail-flow-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-personal-ai-generation-result-detail-flow-readonly-recheck.md`

## Readonly Source Inputs

- `src/server/services/personal-ai-generation-result-history-service.ts`
- `src/server/services/personal-ai-generation-result-route.ts`
- `src/app/api/v1/personal-ai-generation-results/[publicId]/route.ts`
- `src/server/contracts/personal-ai-generation-result-history-contract.ts`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`

## Blocked Gates

- No implementation or source mutation.
- No `.env*` read, output, summary, or modification.
- No DB access or direct row/private data access.
- No provider/model call or provider configuration.
- No quota/cost measurement or Cost Calibration Gate.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service work.
- No schema, migration, drizzle, script, package, lockfile, or dependency change.
- No route, service, repository, mapper, formal adoption write, authorization-model change, PR, or force-push.
- No raw prompt, raw answer, provider payload, secret, token, cookie, Authorization header, database URL, row data, or
  private data exposure.

## RED / GREEN Audit Method

- RED: record audit criteria before conclusions, including the prior `404045` mismatch finding.
- GREEN: complete readonly source/evidence review and focused local validation showing the mismatch is closed.

## Validation Plan

- `npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-personal-ai-generation-result-detail-flow-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-personal-ai-generation-result-detail-flow-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-personal-ai-generation-result-detail-flow-readonly-recheck`
