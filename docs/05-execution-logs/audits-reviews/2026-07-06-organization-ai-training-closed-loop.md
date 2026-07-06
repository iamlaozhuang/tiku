# 2026-07-06 Organization AI Training Closed Loop Audit

## 对抗式审查

- 空草稿风险：原链路只创建训练草稿元数据，本任务增加 AI result source-context 和版本题目快照，避免员工端无题目。
- 发布风险：`none` 证据直接阻断，`weak` 需要显式确认；避免资料不足题目被发布为企业训练。
- 泄露风险：员工可见 `questions` 不包含标准答案和解析；标准答案/解析只进入提交后的 result snapshot。
- 正式内容域风险：未写正式题库/试卷/练习/考试报告/错题本，保持组织训练私有域闭环。
- 统计风险：未新增统计分叉；AI-sourced 训练提交仍是正常 `organization_training_answer` submitted 行，沿用组织统计聚合。
- 兼容风险：保留 paper source 快照 fallback；已有 paper-source 训练仍可通过 source-context 回填题目快照。
- 迁移风险：仅 additive enum/jsonb/default 字段；未执行 runtime DB mutation 或 drizzle push。

## 剩余风险

- 真实数据库需在部署/本地目标库执行 migration 后才能拥有新增列；本任务按机制只提交 SQL/schema，不直接变更运行时数据库。
- 企业训练的可视化编辑器仍是后续产品面增强点；当前闭环保证后端和现有入口可持久化、发布、练习、统计，不声称完成发布编辑器的最终交互体验。

## 结论

- 当前任务范围内通过 focused tests、typecheck、lint、full unit。
- 未发现越界修改、依赖变更、Provider 调用、凭证读取、运行时 DB mutation、浏览器/e2e/staging/prod 执行。
