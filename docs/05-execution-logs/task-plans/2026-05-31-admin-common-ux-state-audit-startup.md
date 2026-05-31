# Admin Common UX State Audit Startup Task Plan

## Task

- Task id: `phase-21-admin-common-ux-state-audit-startup`
- Branch: `codex/phase-21-admin-common-ux-state-audit-startup`
- Scope: docs/state-only startup preparation for the next fresh Phase 21 admin common UX state audit task.

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

Do not claim historical `phase-21-tail-admin-common-ux-state-audit`, because it is `closed` with `closureDecision: deferred`. This startup registers a fresh task only.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-31-admin-common-ux-state-audit-startup.md`
- `docs/05-execution-logs/evidence/2026-05-31-admin-common-ux-state-audit-startup.md`

## Blocked Files And Actions

- `.env.local`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- staging/prod/cloud/deploy/real provider/external service work
- destructive data operation
- force push
- deletion of unknown worktrees or unmerged branches

## Startup Deliverables

- Register fresh implementation candidate for admin common UX state audit.
- Define allowed files, blocked files, risk types, and validation commands for the future implementation.
- Provide the prompt the next agent/user can use to approve and execute the implementation slice.
- Record evidence and pause after commit.

## Future Implementation Recommendation

Recommended next implementation slice: audit and harden admin common UX state handling across existing admin shells without schema, dependency, env, deployment, or provider changes.

Suggested risk types:

- `admin_ops`
- `browser_runtime`
- `local_human_verification`
- `evidence_integrity`

Suggested allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/app/(admin)/**`
- `src/app/api/v1/**`
- `src/components/admin/**`
- `src/features/admin/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/**`
- `e2e/**`

Suggested blocked files:

- `.env.local`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

Suggested validation commands:

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

## Prompt For Next Implementation

```text
继续 D:\tiku。请用中文沟通。不要凭对话记忆继续，必须从仓库状态恢复，并先读取 AGENTS.md、code-taste、local-ci、testing-tdd、ADR、Phase 21 contract、admin-ops contract、automation/security SOP、project-state、task-queue、blocked-gates。

我明确批准 fresh implementation task：Admin common UX state audit implementation。

本次批准风险类型：
- admin_ops
- browser_runtime
- local_human_verification
- evidence_integrity

允许修改：
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- docs/05-execution-logs/task-plans/**
- docs/05-execution-logs/evidence/**
- docs/05-execution-logs/audits-reviews/**
- src/app/(admin)/**
- src/app/api/v1/**
- src/components/admin/**
- src/features/admin/**
- src/server/contracts/**
- src/server/mappers/**
- src/server/services/**
- src/server/validators/**
- tests/**
- e2e/**

仍然禁止：
- .env.local 读取或修改
- .env.example 修改
- package.json / lockfile / 依赖变更
- src/db/schema/** 或 drizzle/**
- scripts/** 修改
- staging/prod/cloud/deploy/real provider/external service
- destructive data operation
- force push
- 删除未知 worktree 或未合入分支

实现要求：
- 注册 fresh queue task，不得从历史 closed/deferred 项直接领取。
- 先写 task plan 和 security/evidence。
- 聚焦 admin common UX state audit：loading/empty/error/success/conflict/permission-denied states、redaction-safe UI、API envelope/camelCase/no internal id exposure。
- 不改数据库 schema、不改依赖、不读 env、不做部署。
- 按 TDD 或先验失败用例推进，补最小实现和浏览器验证。
- 运行声明 validationCommands、local CI、git diff --check、readiness、naming、quality gate；触碰 admin/browser/runtime 时必须运行 build 和 test:e2e。
- 完成后 commit，不要 merge、push 或部署，暂停等待确认。
```

## Current Validation Plan

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-31-admin-common-ux-state-audit-startup.md docs\05-execution-logs\evidence\2026-05-31-admin-common-ux-state-audit-startup.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

`npm.cmd run build` and `npm.cmd run test:e2e` are skipped for this startup because it is docs/state-only and does not touch frontend, route, runtime, browser behavior, source, schema, migration, tests, or e2e files.
