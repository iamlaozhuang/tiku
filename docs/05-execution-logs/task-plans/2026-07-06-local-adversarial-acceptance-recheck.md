# 2026-07-06 Local Adversarial Acceptance Recheck Plan

## Goal

对当前 `master` 的本地证据做反证优先复核，明确源码/机制健康、证据链一致性、0704 DB-backed runtime、浏览器角色矩阵、Provider disabled/enabled 小样本的可信边界。

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- 最新 2026-07-06 AI 生成 learner / organization / content admin / runtime acceptance / personal standard fixture evidence。
- 最新 active queue slimming 与 AI runtime residual decision package evidence。

## Scope And Boundaries

- 只使用本地仓库、localhost、0704 本地 DB 目标。
- 不新增依赖，不修改 `package.json` 或 lockfile。
- 不执行 destructive DB 操作。
- 不执行 staging/prod/deploy/env/secret/Cost Calibration。
- Provider-enabled 仅允许本地小样本，不做成本测量。
- 证据只记录聚合状态、命令状态、业务错误码、角色标签和链路阶段。
- 禁止记录凭证、session、cookie、token、env 值、DB 原始行、内部 id、Provider payload、raw prompt、raw AI output、完整题目/试卷/材料。
- 如果发现当前代码问题，先定位根因；确认是代码问题后另建独立 fix 分支。

## Execution Steps

1. 确认 git 工作区 clean，`master` 与 `origin/master` 对齐。
2. 运行源码与机制门禁：
   - `npm.cmd run lint`
   - `npm.cmd run typecheck`
   - `npm.cmd run test:unit`
   - `Get-TikuNextAction.ps1`
   - `Get-TikuProjectStatus.ps1`
   - `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`
3. 审查 `project-state.yaml`、`task-queue.yaml`、最新 evidence、commit 的一致性，核对关键闭环任务是否有 plan/evidence/audit。
4. 复核最新 runtime acceptance 证据的外推边界，并用本轮新鲜命令与 localhost 抽检替代旧结论。
5. 用本地 0704 DB 与 localhost 走最小闭环抽检：
   - 学员 AI训练闭环。
   - 企业 AI出题/AI组卷到企业训练、发布、员工作答、组织统计闭环。
   - 内容后台采纳/驳回与不直接发布边界。
6. 用 localhost 走角色矩阵抽检：
   - `personal_advanced_student`
   - `org_advanced_employee`
   - `org_advanced_admin`
   - `content_admin`
   - `personal_standard_student`
   - `org_standard_employee`
   - `org_standard_admin`
7. Provider disabled 与 enabled 小样本复核；enabled 只验证 grounding、structured preview、题量可识别，不记录原始输出。
8. 写入本轮脱敏 evidence 与 adversarial audit review。
9. 运行文档格式、diff 与 Module Run v2 本地门禁，确认没有源码/依赖/敏感文件变更。

## Risk Defense

- 旧 evidence 只作为 baseline，不作为本轮结论。
- 当前复核若因服务、私有 fixture、Provider、网络或本地 DB 状态受阻，记录为 blocked 或 partial，不绕过边界。
- 标准版角色必须以后端拒绝和前端明确提示共同验证；前端隐藏不算授权边界。
- 高级版入口可见不等于闭环通过，必须有后端链路阶段证据。
- 本轮不声明 release readiness、production usability、staging readiness 或 Cost Calibration。
