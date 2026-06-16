# Task Plan: advanced-organization-training-publish-version-service-readonly-recheck

## Module Run V2 Anchors

- Task: `advanced-organization-training-publish-version-service-readonly-recheck`
- Branch: `codex/advanced-organization-training-publish-version-service-readonly-recheck`
- Baseline: `master == origin/master == b94c254efe40640825f015ed7bf2a37a8fee3248`
- Task kind: readonly audit
- Human approval: current 2026-06-15 Codex thread, user said `批准执行`.
- Closeout approval: task-scoped local commit, fast-forward merge to `master`, push `origin/master`, delete short branch, fetch prune.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-service.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-service.md`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`

## Scope

Readonly recheck only:

- Confirm the publish-version service remains a service-layer metadata/snapshot boundary.
- Confirm ADR-002 layering remains intact.
- Confirm formal content write, formal target write, provider, DB, schema, route, UI, dependency, dev-server, browser, and e2e gates remain blocked.
- Confirm redacted evidence posture and no public identifier value-list exposure in evidence.
- Record any downstream needs_recheck before repository/schema/route work.

## Implementation Plan

No product implementation.

Allowed edits are limited to:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- the matching evidence file
- the matching audit review file

## Validation Plan

- `npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-service-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-service-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-service-readonly-recheck`

## Risk Controls

- No `.env*` read/write/output.
- No DB access, direct row/private data access, provider/model call, provider configuration, quota/cost measurement, Cost Calibration Gate, dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service, schema/drizzle/scripts/package/lockfile/dependency change, formal content write, formal target write, PR, or force push.
- Evidence records field names, file paths, command names, and redacted conclusions only.
