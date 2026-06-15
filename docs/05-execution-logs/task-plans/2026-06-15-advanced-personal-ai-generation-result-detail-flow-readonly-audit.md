# Task Plan: Advanced Personal AI Generation Result Detail Flow Readonly Audit

## Task

- Task id: `advanced-personal-ai-generation-result-detail-flow-readonly-audit`
- Branch: `codex/advanced-personal-ai-generation-result-detail-flow-readonly-audit`
- Date: 2026-06-15
- Baseline: `bce1e7bb4756c1078ee370571f212c0887054fd5`
- Task kind: readonly audit

## Readiness And References

- The preceding UI task was committed, fast-forward merged to `master`, pushed to `origin/master`, short-branch deleted,
  fetch-pruned, and verified clean/aligned with no `codex/*` refs before this branch was created.
- Reuse this session's fresh reads of `AGENTS.md`, code taste commandments, all ADRs, project state, task queue,
  capability catalog, advanced seeding plan, and related evidence/audit.
- Re-read current state/queue and relevant source/evidence before writing audit findings.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-personal-ai-generation-result-detail-flow-readonly-audit.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-personal-ai-generation-result-detail-flow-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-personal-ai-generation-result-detail-flow-readonly-audit.md`

Readonly inputs:

- `src/server/services/personal-ai-generation-result-history-service.ts`
- `src/server/services/personal-ai-generation-result-route.ts`
- `src/app/api/v1/personal-ai-generation-results/[publicId]/route.ts`
- `src/server/contracts/personal-ai-generation-result-history-contract.ts`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- recent related evidence/audit files

Blocked:

- Any implementation, source mutation, DB access, row/private data, provider/model calls, provider configuration, raw
  prompt/raw answer/provider payload exposure, schema/migration, dependency, package/lockfile, scripts, dev server,
  Browser, Playwright, e2e, quota/cost/Cost Calibration, staging/prod/cloud/deploy/payment/external-service, formal
  adoption write, PR, and force-push.

## Audit Criteria

1. ADR-002 layering remains intact: route handler is a thin adapter, business logic remains in service, no DB rows leak to
   UI.
2. Detail read-model service remains owner scoped and redacted.
3. Detail readonly route uses session-owned user context and ignores client-supplied owner identifiers.
4. Student UI consumes only the readonly detail route/local contract and does not introduce new runtime boundary.
5. Redacted/local contract semantics remain visible and accurate:
   `local_contract_only`, `redacted_snapshot`, `redacted`, `metadata_only`, and
   `blocked_without_follow_up_task`.
6. Blocked gates remain true: no provider, env/secret, DB direct access, schema/migration, dependency, e2e/browser,
   quota/cost, staging/prod/cloud/deploy/payment/external-service, formal adoption write, PR, or force-push.

## TDD / Verification Discipline

- This is a docs-only readonly audit with no implementation surface. The test-first analogue is to write audit criteria
  before writing conclusions, then validate them against source/evidence.
- No production code or test code will be changed.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-personal-ai-generation-result-detail-flow-readonly-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-personal-ai-generation-result-detail-flow-readonly-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-personal-ai-generation-result-detail-flow-readonly-audit`

## Risk Controls

- Evidence will contain no source excerpts with private data and no sensitive payloads.
- If any gate fails, stop and do not perform further tasks.
