# Task Plan: advanced-personal-ai-generation-formal-adoption-review-flow-readonly-recheck

## Scope

- Task type: readonly recheck.
- Goal: recheck service, route, admin UI, and student readonly display consistency after the admin formal adoption review affordance implementation.
- Branch: `codex/advanced-personal-ai-generation-formal-adoption-review-flow-readonly-recheck`.
- Baseline: `master == origin/master == 81e608a2b2fd40be6101f4dad906b89d4d5dff03` before task branch creation.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- Task 1 and task 2 evidence/audit records from the current batch.
- Queued readonly product files for route, contract, service, runtime, admin UI, admin UI test, and student readonly display.

## Recheck Plan

1. Re-read current source files from the task's `readonlyFiles`.
2. Confirm ADR-002 layering: route/runtime adapter -> service -> repository/model/contract, with UI consuming route/contract only.
3. Confirm admin UI affordance is UI-only and does not expand formal adoption write behavior.
4. Confirm student readonly display remains metadata-only and has no formal adoption review/write submission affordance.
5. Confirm redacted/metadata-only/publicId display policy/formal target write blocked statements are accurate.
6. Run scoped unit tests and local governance gates.

## Risk Controls

- No `.env*` read/write/output.
- No DB access or direct row/private data inspection.
- No provider/model call, provider configuration, provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement or Cost Calibration Gate execution.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, route, service, UI, test, API contract, or formal adoption write changes.
- Evidence must stay metadata-only and redacted.

## Validation

- `npm.cmd run test:unit -- src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.test.tsx src/server/services/personal-ai-generation-formal-adoption-service.test.ts src/server/services/personal-ai-generation-formal-adoption-runtime.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-personal-ai-generation-formal-adoption-review-flow-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-personal-ai-generation-formal-adoption-review-flow-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-personal-ai-generation-formal-adoption-review-flow-readonly-recheck`
