# 活动状态瘦身执行方案

日期：2026-07-13

任务：`content-admin-platform-m2-active-state-slimming-2026-07-13`

分支：`codex/active-state-slimming`

基线：`master == origin/master == 15e2b5fbdb11ac37bfa58d13bfc8adfa2e7980d5`

执行方式：当前线程串行执行；用户明确禁止 Subagent。产品部署不在本任务范围内。

## 目标

把默认恢复面从 3.72 MB 的 `project-state.yaml` 和 1.78 MB 的 `task-queue.yaml` 收敛为当前 B–F
Program、M2 当前任务、B0 唯一下一任务、最近 closeout、standing authorization 与历史索引指针。历史只做
精确归档和索引，不删除证据、不改写语义、不一次性迁移 execution logs。

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/lean-module-run-v3-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/execution-log-archival-and-index-governance.md`
- `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-b-to-f-serial-program.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-b-to-f-standing-authorization.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`
- `docs/05-execution-logs/task-plans/2026-07-13-lean-module-run-v3.md`
- `docs/05-execution-logs/evidence/2026-07-13-lean-module-run-v3.md`
- `docs/05-execution-logs/audits-reviews/2026-07-13-lean-module-run-v3-audit.md`

## 精确归档清单

| Source active file                              | Immutable archive target                                                                  | Baseline inventory                  |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------- |
| `docs/04-agent-system/state/project-state.yaml` | `docs/04-agent-system/state/archive/project-state-snapshot-2026-07-13-before-m2.yaml`     | 3,722,463 bytes; 894 top-level keys |
| `docs/04-agent-system/state/task-queue.yaml`    | `docs/04-agent-system/state/archive/task-queue-active-snapshot-2026-07-13-before-m2.yaml` | 1,781,709 bytes; 241 active records |

任务队列快照的状态分布为：closed 165、ready_for_closeout 69、closed_local_merged 4、pending 1、
local_closeout_complete_push_blocked 1、supplemented 1。快照保留原始 YAML 字节和全部链接；新
`active-state-history-index.yaml` 记录 SHA-256、长度、语义、前后继与既有 archive/index 指针。

## 文件边界

允许修改：

- `.husky/pre-commit`
- `.husky/pre-push`
- `scripts/agent-system/Test-ContentAdminPlatformRecoverySurface.ps1`
- `scripts/agent-system/Test-ContentAdminPlatformRecoverySurface.Smoke.ps1`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/active-state-history-index.yaml`
- `docs/04-agent-system/state/archive/project-state-snapshot-2026-07-13-before-m2.yaml`
- `docs/04-agent-system/state/archive/task-queue-active-snapshot-2026-07-13-before-m2.yaml`
- `docs/05-execution-logs/task-plans/2026-07-13-active-state-slimming.md`
- `docs/05-execution-logs/evidence/2026-07-13-active-state-slimming.md`
- `docs/05-execution-logs/audits-reviews/2026-07-13-active-state-slimming-audit.md`

禁止修改或执行：

- 产品源码、产品测试、`package.json`、lockfile、依赖、测试基础设施；
- requirements、ADR、PIC 结论、历史 evidence/audit 内容；
- 数据库、schema、migration、fixture、Provider、凭证、浏览器、部署、PR、force push、Cost Calibration Gate；
- 一次性迁移全部 execution logs，或删除任何历史记录。

## 实施与 TDD

1. 先写 recovery-surface smoke：正例必须只靠精简 state/queue/index 恢复 Program、M2、B0、授权、门禁、顺序
   来源和历史快照；负例阻断多余活动记录、断链、快照哈希漂移、部署授权和 current/next 不一致。
2. 把两份原活动文件原字节移动到精确快照路径，计算 SHA-256 与长度，再创建精简 active state/queue/index。
3. 精简 state 只保留当前 Program、当前任务、唯一下一任务、M1/M2 最近 checkpoint、standing
   authorization、repository checkpoint 和历史指针；queue 只保留 M2 与 B0 两条活动记录。
4. Hook 挂载 recovery-surface Guard；更新 operating manual 与 mechanism index 的默认恢复顺序。
5. 运行 smoke、真实 recovery Guard、Program Guard、YAML 解析、链接、快照哈希、scoped format、diff、Module
   Run pre-commit/closeout/pre-push。没有产品测试基础设施变化，不运行 2036 个产品用例或构建。
6. 完成两轮对抗式审查；同范围问题自动修复并重新验证。

## 验收与停止条件

- 新线程无需读取归档快照即可准确输出 Program、M2、B0、canonical plan、standing authorization、门禁与下一动作。
- 两份快照与索引的 SHA-256/长度一致，原始 key/active record 数可复核，旧链接仍可解析。
- active state 不保留历史任务正文；M1 closeout 为 pass，M2 为唯一 active，B0 为唯一 next。
- recovery Guard 与 Program Guard 均通过，且多活动记录、断链、哈希漂移和部署越权负例失败。
- M2 evidence/audit 完整后，只做一个 principal commit、ff-only merge、普通 push 与清理，然后立即开始 B0。
