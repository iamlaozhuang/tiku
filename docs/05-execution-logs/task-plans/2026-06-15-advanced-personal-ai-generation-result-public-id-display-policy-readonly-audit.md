# advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit

## Task

只读审计 personal AI generation result 的 public identifier 展示策略，确认当前 service/route/contract/student UI detail flow 在 `publicId` 使用上仍保持：

- route boundary 只通过 `/api/v1/personal-ai-generation-results/{publicId}` 读取单条 redacted detail；
- UI 不展示 publicId 列表，不新增 publicId 枚举或复制 affordance；
- metadata-only/redacted/local_contract_only/formal adoption blocked 语义不被削弱；
- 不暴露 raw prompt、raw answer、provider payload、row/private data。

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`

## Recent Evidence To Recheck

- `docs/05-execution-logs/evidence/2026-06-15-advanced-personal-ai-generation-result-detail-flow-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-personal-ai-generation-result-detail-flow-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-15-fix-student-ai-generation-result-detail-not-found-state.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-fix-student-ai-generation-result-detail-not-found-state.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-student-ai-generation-result-detail-ui.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-student-ai-generation-result-detail-ui.md`

## Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- `docs/05-execution-logs/evidence/2026-06-15-advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit.md`

Readonly inspection:

- `src/server/contracts/personal-ai-generation-result-history-contract.ts`
- `src/server/services/personal-ai-generation-result-history-service.ts`
- `src/server/services/personal-ai-generation-result-route.ts`
- `src/app/api/v1/personal-ai-generation-results/[publicId]/route.ts`
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
- no PR or force push
- no implementation or publicId policy changes

## Plan

1. Inspect current source text for `publicId` use, detail entry flow, response contract, and redacted display labels.
2. Compare findings with recent detail recheck evidence.
3. Record audit conclusion, findings, needs_recheck, and blocked gate preservation.
4. Run local validation commands and record redacted evidence.
5. Close the task with a single docs-only commit, fast-forward merge to `master`, push `origin/master`, delete short branch, fetch prune, and confirm clean state before starting the next task.

## Validation

- `npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit`
