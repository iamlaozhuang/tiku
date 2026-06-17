# 机制调优与状态瘦身实施方案执行计划

## Task

- id: `mechanism-tuning-authorization-slimming-implementation`
- date: `2026-06-17`
- branch: `codex/mechanism-tuning-authorization-slimming`
- scope: docs/state/script 机制维护；不恢复业务任务；不修改产品运行代码。

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`

## Hard Boundaries

- Do not read, output, summarize, or edit `.env*`.
- Do not expose secrets, tokens, cookies, Authorization headers, database URLs, provider payloads, raw prompts, raw answers, public identifier inventories, row data, or private data.
- Do not access staging, production, cloud, deploy, payment, or external services.
- Do not call providers or models, and do not perform quota, cost, or Cost Calibration work.
- Do not modify schema, drizzle, package, or lockfile files.
- Do not add, remove, or upgrade dependencies.
- Do not create PRs or force push.
- Do not start dev server, Browser, Playwright, or e2e.

## Allowed Files

- `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-mechanism-tuning-authorization-slimming-implementation.md`
- `docs/05-execution-logs/evidence/2026-06-17-mechanism-tuning-authorization-slimming-implementation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-mechanism-tuning-authorization-slimming-implementation.md`
- Focused `scripts/agent-system/*.ps1` and matching smoke scripts only when required for mechanism field compatibility.

## Implementation Order

1. Document the mechanism tuning consensus as planning-only SOP material and add it to the source-of-truth index.
2. Produce a read-only state and queue slimming audit with exact counts, archive eligibility rules, retention window, coverage checks, and dependency resolution checks.
3. Execute one conservative queue archival pass:
   - retain every non-terminal task;
   - retain the most recent 30 terminal tasks in active queue;
   - retain current recovery, handoff, and latest evidence chain tasks;
   - retain terminal tasks with missing evidence or unclear audit traceability;
   - retain dependencies of every retained task;
   - move only the remaining terminal task blocks to the June archive, preserving block text.
4. Update `task-history-index.yaml` for each archived task with archive path, evidence path, audit path, status, and task kind.
5. Conservatively sync `project-state.yaml`:
   - record this mechanism tuning run;
   - add a `mechanismTuning` status section;
   - do not delete standing approvals, automation semantics, or blocked gates.
6. Implement the first mechanism behavior compatibility layer:
   - recognize `executionProfile`, `evidenceMode`, `validationPolicy`, `queueSelectionMode`, `workPacket`, and `localFullFlowGate`;
   - keep legacy tasks compatible by defaulting to `legacy_explicit`;
   - support Evidence Lite without bypassing redaction or blocked remainder checks;
   - keep local full-flow strictly local-only.

## Validation Plan

- `git diff --check`
- `node_modules/.bin/prettier.cmd --check <changed docs/state/evidence/audit/task-plan files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- Queue archival checks:
  - archived ids absent from active queue;
  - archived ids present in June archive;
  - archived ids present in task history index;
  - retained ids present in active queue;
  - active task dependencies resolve through active queue or index;
  - pending task count remains `0`.
- Module Run v2 readiness:
  - `Test-ModuleRunV2PreCommitHardening.ps1`
  - `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
  - `Test-ModuleRunV2PrePushReadiness.ps1`
- Script smoke checks for every modified script when a matching `.Smoke.ps1` exists.

## Risk Controls

- Keep archival and mechanism behavior edits reviewable in one local mechanism-maintenance branch, but separate evidence sections by task package.
- Preserve archived task blocks verbatim and never delete evidence or audit files.
- Prefer additive script compatibility over behavior changes unless a validation command proves legacy behavior remains stable.
- Stop before remote actions unless a valid task-level closeout policy and current repository gates explicitly authorize them.
