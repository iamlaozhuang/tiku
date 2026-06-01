# Admin Write Concurrency Proof Startup Task Plan

## Task

- Task id: `phase-21-admin-write-concurrency-proof-startup`
- Branch: `codex/phase-21-admin-write-concurrency-proof-startup`
- Scope: docs/state-only startup preparation for the next fresh Phase 21 admin write concurrency proof implementation.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-21-high-risk-tail-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Fresh Task Rule

Do not claim historical `phase-21-tail-admin-write-concurrency-proof`, because it is `closed` with `closureDecision: deferred`. This startup registers a fresh implementation candidate only.

## Startup Boundary

This startup is planning-only. It must not change:

- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- `.env.local`
- `.env.example`
- package or lock files

No transaction behavior, permission behavior, route contract, schema, migration, deployment, real provider, or destructive data operation is approved in this startup.

## Future Implementation Recommendation

Recommended next implementation slice: prove deterministic concurrency behavior for one narrow existing admin write path before expanding to more surfaces.

Preferred first slice:

- `redeem_code` batch/generation duplicate-submit proof, if existing runtime already exposes deterministic uniqueness or idempotence that can be tested without schema changes.

Fallback slice:

- `authorization` overlap conflict proof, only if existing service/repository already has an atomic conflict boundary and no schema change is required.

Avoid combining redeem code, authorization overlap, employee import, and model config fallback ordering in one implementation task.

## Approval Checklist For Implementation

Before implementation, evidence must record:

- exact write surface in scope;
- whether behavior is proof-only over existing semantics or changes runtime behavior;
- transaction strategy or existing atomic boundary;
- conflict response contract, including `{ code, message, data, pagination? }` and `4096xx` where applicable;
- whether `auth_permission_model` is touched;
- whether `database_migration` is touched;
- whether `transaction_concurrency` is required;
- tests to add before implementation;
- e2e/browser route to verify;
- rollback plan;
- explicit human approval.

## Suggested Implementation Risk Types

- `admin_ops`
- `transaction_concurrency`
- `data_contract`
- `authorization`
- `local_human_verification`
- `evidence_integrity`

Add `auth_permission_model` only if role, permission, denial, organization scope, or service authorization behavior changes.

Add `database_migration` only if schema, migration, index, constraint, lock/version column, or Drizzle output changes.

## Suggested Allowed Files For Implementation

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- `src/app/api/v1/**`
- `tests/**`
- `e2e/**`

## Suggested Blocked Files For Implementation

- `.env.local`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `scripts/**`
- `src/db/schema/**` and `drizzle/**` unless the future task explicitly approves `database_migration`

## Suggested Validation Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

Run `npm.cmd run build` if route/runtime/browser behavior or build-relevant source changes are included.

## Prompt For Next Implementation

```text
继续 D:\tiku。请用中文沟通。不要凭对话记忆继续，必须从仓库状态恢复，并先读取 AGENTS.md、code-taste、local-ci、testing-tdd、ADR、Phase 21 contract、admin-ops contract、automation/security SOP、project-state、task-queue、blocked-gates。

我明确批准 fresh implementation task：Admin write concurrency proof implementation。

本次批准风险类型：
- admin_ops
- transaction_concurrency
- data_contract
- authorization
- local_human_verification
- evidence_integrity

允许修改：
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- docs/05-execution-logs/task-plans/**
- docs/05-execution-logs/evidence/**
- docs/05-execution-logs/audits-reviews/**
- src/server/services/**
- src/server/repositories/**
- src/server/contracts/**
- src/server/mappers/**
- src/server/validators/**
- src/app/api/v1/**
- tests/**
- e2e/**

仍然禁止：
- .env.local 读取或修改
- .env.example 修改
- package.json / lockfile / 依赖变更
- src/db/schema/** 或 drizzle/**，除非我另行批准 database_migration
- scripts/** 修改
- staging/prod/cloud/deploy/real provider/external service
- destructive data operation
- force push
- 删除未知 worktree 或未合入分支

实现要求：
- 注册 fresh queue task，不得从历史 closed/deferred 项直接领取。
- 先写 task plan 和 security/evidence。
- 选择一个最小写路径做并发证明，优先 redeem_code 生成/重复提交或已有 authorization overlap conflict，不要一次覆盖多个高风险面。
- 按 TDD 先写失败测试，再最小实现。
- 保持 API response envelope `{ code, message, data, pagination? }`，JSON 字段 camelCase，外部只用 publicId。
- 不改数据库 schema、不改依赖、不读 env、不做部署。
- 运行声明 validationCommands、local CI、git diff --check、readiness、naming、quality gate；触碰 route/runtime/e2e 时运行 test:e2e，触碰 build/runtime 时运行 build。
- 完成后 commit，不要 merge、push 或部署，暂停等待确认。
```

## Current Validation Plan

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-31-admin-write-concurrency-proof-startup.md docs\05-execution-logs\evidence\2026-05-31-admin-write-concurrency-proof-startup.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

`npm.cmd run build` and `npm.cmd run test:e2e` are skipped for this startup because it is docs/state-only and does not touch frontend, route, runtime, browser behavior, source, schema, migration, tests, or e2e files.
