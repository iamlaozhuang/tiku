# 0704 内容 AI 页面收敛执行计划

## 目标

统一内容管理员 AI出题与 AI组卷页面骨架，收敛生成条件、结果评审和任务记录的信息层级；保持 AI出题生成完整待审题目草稿、AI组卷仅生成方案并从平台正式题源本地选题的既定产品合同。

## 已读取基线

- `AGENTS.md`
- project-state、task-queue、代码品味十诫与全部 ADR
- requirements index、advanced-edition index、相关 AI/RAG requirement module/story
- `2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `2026-07-06-ai-generation-recontract-requirements-materialization.md`
- 2026-07-02 acceptance normalization / goal-completion audit
- 2026-07-06 final local goal rollup
- 2026-07-09 content AI question/paper formal publish loop evidence/audit
- 既有 AI出题、AI组卷私有截图，只读查看且不复制
- 当前页面、合同、路由、采纳闭环和 UI 测试

## 实施边界

1. 内容后台页面标题统一为“AI出题工作台”“AI组卷工作台”。
2. 首屏顺序统一为：角色/能力说明、视图导航、生成条件、唯一主操作、流程与边界。
3. 结果区明确区分“本次结果与评审”和“任务记录”；任务记录复用共享分页组件。
4. AI出题文案明确结果为待审题目草稿，不能直接发布。
5. AI组卷文案明确“生成组卷方案 → 本地正式题源选题 → 缺口说明 → 待审试卷草稿”，不得暗示 Provider 生成正式题目正文。
6. 保留当前请求、知识点范围、结构化预览、评审采纳、驳回、正式草稿创建和历史读取合同。

## TDD 与验证

1. 先补统一页面骨架、AI组卷语义、共享分页和敏感边界测试，记录预期红灯。
2. 最小 UI 实现，不改生成/采纳服务，不新增依赖。
3. 对抗式审查角色、effectiveEdition、正式内容、题源、敏感字段和 Provider 禁用边界。
4. 运行 targeted tests、lint、typecheck、format check、`git diff --check`、Module Run v2。
5. 写脱敏 evidence/audit，单提交合入、master 复跑、推送并清理。

## 风险防御

- Provider 保持关闭，不执行 Provider-enabled 行为或 prompt/provider payload 检查。
- 不访问 env/secret，不连接数据库，不执行 staging/prod/deploy/Cost Calibration。
- 不新增依赖，不修改 package/lockfile、schema、migration 或 seed。
- 不展示或记录 raw prompt、raw AI output、Provider payload、完整题目/试卷/材料/资源、内部 ID、凭证或会话。
- 不把 UI 文案重排解释为生成合同、权限或正式发布逻辑变更。

## 验收标准

- AI出题与 AI组卷页面结构、主操作位置、结果区和历史分页风格一致。
- AI出题只进入待审题目草稿；AI组卷只从允许的平台正式题源组装待审试卷草稿。
- 结果、评审、驳回和正式草稿详情入口保持可用。
- loading、empty、error、forbidden、standard-unavailable、disabled 状态不退化。
- Provider 默认关闭，页面不出现 raw Provider、prompt 或结果载荷。
