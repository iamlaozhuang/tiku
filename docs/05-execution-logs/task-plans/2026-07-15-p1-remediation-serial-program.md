# P1 整改串行 Program（Draft，未授权）

## 状态

- 文档状态：`draft_not_authorized`
- 实现状态：未开始
- WIP：0
- 前置条件：P1/P2 启动包关闭、用户建立新的 P1 Goal 并明确业务源码/测试及 closeout 权限
- 排除：P2 实现、21 项 runtime validation、PR、force push、部署

本文件只让启动包具备可恢复的后续编排面，不构成 P1 任务领取、源码修改、schema/migration、数据库、Provider、浏览器或 runtime 授权。

## 第一性原理执行单位

Program 管理依赖顺序和 WIP=1，但不把 125 个 P1 或九个候选簇视为不可分割任务。真正执行单位必须同时满足：

- 约 5～12 个 finding；
- 一条或少数紧密相关的权威写路径；
- 一个可独立接受/拒绝的业务不变量；
- 精确文件 allowlist；
- 一个默认业务提交；
- 能独立完成二级复检、RED 证据、验证、两轮复核和 closeout。

若一个候选簇无法满足这些条件，必须在领取前拆分；若不同簇只因目录、角色或页面相邻，不得合并。

## 候选波次

1. P1-RC-01：identity/session/account boundary
2. P1-RC-02：organization/employee/quota lifecycle
3. P1-RC-03：authorization/edition/scope read model
4. P1-RC-04：shared API query/mutation contract
5. P1-RC-05：content editor/paper lifecycle
6. P1-RC-06：knowledge/resource/index lifecycle
7. P1-RC-07：AI task/generation provenance
8. P1-RC-08：learner answer/report/history
9. P1-RC-09：organization training handoff
10. P1 全局静态回归、P1/P2 影响重校准和 P1 新基线冻结

顺序由依赖决定而非编号。单个 finding 可在二级复检后有证据地移动到另一个簇；原 ID、风险和审计证据不得改写。

## 每个执行任务的标准管线

1. 恢复 `master/origin/live`、state/queue、上一任务 evidence 和 P0/P1 冻结基线。
2. 读取 `AGENTS.md`、品味十诫、全部 ADR、相关 requirement/story/traceability；advanced/authorization/AI 任务执行专项恢复规则。
3. 在领取当下完成二级对抗复检：权威调用链、数据模型、反证、失败路径、相邻 finding 共因和 P0 不变量。
4. 创建独立 task plan、短分支/worktree、精确 allowlist、风险和审批矩阵。
5. 先建立可复现 RED 测试，再做最小实现；遵循 `api → service → repository → model`。
6. 覆盖正常、越权、跨 organization、非法状态、并发、重复、失败回滚、重试幂等、null/空集合/边界和 API/枚举契约。
7. 运行 focused unit/integration/contract；按爆炸半径运行 full regression 和 P0 baseline guard。
8. Round 1 复核根因、权威写路径、安全、事务、并发和兼容性。
9. Round 2 复核九角色消费者、状态机、跨角色依赖、API/UI 字段枚举、P0 回归、P2 影响和敏感信息。
10. 写 evidence/audit，形成一个可审查提交；经授权 ff-only 合入 fresh master 后重跑门禁，再 push 和清理。
11. 当前任务完全关闭后才领取下一个；P2 只更新 impact，不关闭、不实现。

## 首任务选择规则

候选优先级为 P1-RC-01，但不能现在锁定 finding 或直接开始实现。新 P1 Goal 启动时：

1. 对 P1-RC-01 即时二级复检 F-0001、F-0003 等候选；
2. 若当前代码与反例测试证明 P0 已完整静态关闭，则记录独立 closure evidence，不重复修补；
3. 从仍 `confirmed` 的安全、越权或不可逆数据问题中选择唯一首任务；
4. 若需求 SSOT 冲突、需要新依赖/schema/migration/数据库/Provider/runtime 权限或无法形成独立提交，则停在真实审批边界。

## Program 完成条件

- 125 个 P1 均有独立、可追溯的当前处置结论；
- 所有执行任务具备计划、RED/验证证据、两轮复核、提交和 closeout 记录；
- P0 35 个不变量无回归；
- P1 全局静态回归通过并冻结新产品基线；
- 18 个 P2 影响映射按新基线重校准，但未越界提前整改；
- 未把静态整改表述为 21 项 runtime 业务验收通过；
- source/master/origin/live 一致，工作区和短分支清理完成。
