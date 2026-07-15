# P0 Remediation RC-01 To RC-08 Serial Program

Date: 2026-07-14

Program: `p0-remediation-rc-01-to-rc-08-2026-07-14`

Status: `in_progress`

Baseline source SHA: `7aac83765ca4b650b73b1612013e26a0111775ae`

Audit baseline SHA: `a84224fa12ec85b28e6acd945deba2afa28c6c02`

## Purpose

按根因而不是 finding 编号机械打补丁，WIP=1 串行关闭 8 个 P0 根因簇；每簇保持 finding 独立结论、
独立 task plan、隔离分支/worktree、TDD、验证、两轮对抗式复核、evidence 和提交。RC-08 后执行 P0
全局静态回归、重校准 P1/P2 影响映射并冻结新静态基线。

本 Program 不执行 P1/P2 整改和 21 项 runtime validation，不修改只读审计仓库。

## Authorization

`docs/05-execution-logs/acceptance/2026-07-14-p0-remediation-serial-standing-authorization.md`

- 每个 task 在全部门禁通过后允许 local commit、ff-only merge `master`、普通 push `origin/master` 和清理。
- 依赖、schema/migration、数据库、runtime/browser/e2e、Provider、secret/env、PR、force push、部署仍按任务
  单独申请 fresh approval。
- 未取得批准的高风险边界是正常暂停条件，不得通过缩小测试或临时实现绕过。

## State Machine And WIP

合法主状态：`pending -> in_progress -> ready_for_closeout -> closed`。

- 同时只能有一个 task 处于 `in_progress` 或 `ready_for_closeout`。
- 前一 task 的 commit、ff-only merge、`origin/master` 同步、fresh checkout gate、worktree/短分支清理未实际
  完成，后继 task 不得开始产品编辑。
- 前一 task 的 closeout 事实随下一 task 的状态投影提交，避免为记录自身 commit SHA 形成无限状态提交链。
- `orderedTaskIds` 必须与下表一致；修改顺序必须有用户决策和 amendment，不能同步篡改 state/queue 静默重排。
- 一个 RC 的共享根因不能自动把其 finding 标记为 duplicate/resolved；每个 finding 仍需独立证据结论。

## Canonical Task Order

| Order | Task ID                                                              | Content                                                                                              |
| ----- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 00    | `p0-remediation-serial-program-bootstrap-2026-07-14`                 | 关闭启动包，物化授权、Program、Guard、state/queue、hooks 和恢复门禁；不改产品代码                    |
| 01    | `p0-remediation-rc-01-identity-session-admin-account-2026-07-14`     | F-0002/F-0045/F-0130；身份、持久原子锁定、后台账号多角色/停用/重置、session 撤销                     |
| 02    | `p0-remediation-rc-02-organization-scope-quota-employee-2026-07-14`  | F-0005/F-0006/F-0109/F-0111/F-0113；organization 拓扑、范围、额度与 employee 生命周期事务闭环        |
| 03    | `p0-remediation-rc-03-authorization-object-scope-2026-07-14`         | F-0011/F-0014/F-0016；显式 authorization 上下文与 profession/level/organization 对象级校验           |
| 04    | `p0-remediation-rc-04-content-paper-aggregate-snapshot-2026-07-14`   | F-0050/F-0051/F-0092/F-0093/F-0171；内容/paper aggregate、事务、group identity、发布 snapshot 完整性 |
| 05    | `p0-remediation-rc-05-knowledge-resource-rag-citation-2026-07-14`    | F-0068/F-0075/F-0076/F-0080/F-0081/F-0084；knowledge/resource/index generation/RAG/citation 事实链   |
| 06    | `p0-remediation-rc-06-ai-config-execution-provenance-2026-07-14`     | F-0062/F-0101/F-0102/F-0134；model_config/prompt_template、AI executor、secret 引用和结果 provenance |
| 07    | `p0-remediation-rc-07-answer-mock-scoring-report-2026-07-14`         | F-0059/F-0060/F-0061/F-0064/F-0066/F-0136；answer_record/mock_exam/ai_scoring/exam_report 状态闭环   |
| 08    | `p0-remediation-rc-08-organization-training-integrity-2026-07-14`    | F-0121/F-0123/F-0145；organization training draft/version/publish/submit/score/analytics 完整性      |
| 09    | `p0-remediation-global-static-regression-baseline-freeze-2026-07-14` | 35 个 P0 全局静态回归、P1/P2 影响映射重校准、新静态基线冻结和最终恢复审计                            |

## Per-Task Contract

每个 RC 都必须覆盖：

1. 正常路径与权威写路径可重载。
2. 越权、错误 owner、跨 organization/profession/level 访问 fail-closed。
3. 非法状态转换、终态回退和取消/过期/停用竞态。
4. 重复请求、并发请求、乱序响应和多实例竞争。
5. 事务中途失败、回滚、重试和幂等。
6. `null`、`[]`、零/上限/越界、未知枚举和异常输入。
7. DB snake_case、API camelCase、前后端字段/枚举和 `{ code, message, data, pagination? }` 契约。
8. 相关九角色回归范围与 unit/integration/contract 测试；runtime 只在 fresh approval 后执行。

## Task Reading Profiles

### Always

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- 上一 task 最新 evidence/audit 与实际 Git/远端/worktree
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/` 全部 ADR
- `docs/01-requirements/00-index.md`
- 当前 RC 对应 module、story、use-case、最新 traceability
- 启动包、finding ledger、原 finding、状态机、跨角色依赖、runtime backlog
- 目标实现、目标测试、schema/调用链和至少一个类似实现

### RC-01 And RC-02

- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- role-separated 与 role-experience 最新 traceability
- 涉及 organization/authorization 时追加 advanced index、edition-aware requirements 和 ADR-007

### RC-03 And RC-08

- 强制执行高级版需求读取规则：standard index、advanced index、相关 module/story/traceability、
  `edition-aware-authorization-requirements.md`、ADR-007。

### RC-04

- `modules/02-question-paper.md`、相关 content stories/use-cases、
  `2026-07-13-content-admin-p0-platform-interaction-contract.md`。

### RC-05 And RC-06

- `modules/04-ai-scoring.md`、`modules/05-rag-knowledge.md` 与相关 story/use-case。
- 强制执行 AI current-baseline 恢复规则，先读 2026-07-02 AI SSOT alignment、Phase4 alignment、最新 AI
  baseline evidence 和 goal-completion audit，再读取旧 evidence。

### RC-07

- `modules/03-student-experience.md`、`modules/04-ai-scoring.md` 和 practice/mock/report 相关 stories/use-cases。

## Task Boundaries And Expected Source Areas

- RC-01：auth/session/admin account service/repository/validator/API/UI 及对应测试；schema/migration 未获批前不得改。
- RC-02：organization tree、org_auth、quota、employee command/repository/API 及测试；数据迁移未获批前不得改。
- RC-03：effective authorization selector、scope validator、AI/training 消费适配器及测试。
- RC-04：question/material/paper aggregate、validator、repository、published snapshot 及测试。
- RC-05：knowledge_node/resource/relation/chunk/index/RAG/citation 及测试；外部向量/Provider/依赖均另批。
- RC-06：model_config/prompt_template/AI task/executor/provenance 及测试；Provider/secret/env 另批。
- RC-07：answer_record/mock_exam/ai_scoring/exam_report 状态机、事务、contract 及测试。
- RC-08：organization training draft/version/answer/publish/submit/analytics 及测试。
- 09：静态对账、回归、影响映射和基线文档；不执行 runtime acceptance。

每个 task 必须在读取源码后把该候选范围收缩为精确 `allowedFiles`；本表不是通配授权。

## Validation And Two-Round Review

- RED：先证明原失败路径；GREEN：最小修复和合法控制路径。
- focused unit/integration/contract；lint、typecheck、format、build、`git diff --check`；共享 runtime、核心 contract、
  authorization、AI、测试基础设施或跨域失败触发 full regression。
- Round 1：根因与 diff，攻击权威写路径、越权、并发、事务、兼容性和表面修补。
- Round 2：跨角色/上下游回归，攻击状态机、P1/P2 语义影响、API/枚举、敏感信息、过度设计和反向破坏。
- 未批准 Subagent 时，两轮由当前 Agent 自对抗执行，不能表述为独立审查者复核。

## Normal Stops

- requirement SSOT 无法消解冲突。
- 需要尚未批准的依赖、schema/migration、数据库、Provider、secret/env、runtime/browser/e2e 或外部服务能力。
- 两轮复核仍有 P0/P1 回归，full regression/fresh checkout 门禁失败，或基线/远端/审计仓库出现未解释漂移。
- 当前 RC 无法形成独立可审查提交。

Program 保持 active；停止当前 RC 并申请精确批准，不跳到后继 RC。

## Completion Contract

- 00、RC-01 至 RC-08、09 全部独立关闭，计划、RED/GREEN、验证、两轮复核、evidence、提交和清理齐全。
- 35 个 P0 全部有明确整改结论，没有无依据降级、错误合并或以静态证据不足推导问题不存在。
- P0 全局静态回归完成，P1/P2 只重校准影响映射，新静态基线冻结。
- `master`、本地 `origin/master`、实时远端 `master` 一致，根工作区 clean，无 Program 短分支/worktree 残留。
- `D:/tiku-readonly-audit` 未改动。
- 21 项 runtime validation 仍按其真实状态记录，不把静态整改表述为业务验收通过。
