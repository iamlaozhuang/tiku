# Knowledge Node AI Closure Plan Adversarial Audit

## Scope

本审计只复核第一阶段方案、矩阵和任务边界，不执行浏览器、不连 DB、不跑 Provider、不改产品源码。

## Round 1: Relationship Correctness

检查问题：

- 是否把知识点文档、教材章节或资源误当作知识点树。
- 是否说明 `knowledge_node_resource` 和 `question_knowledge_node` 的职责差异。
- 是否说明关系建立时机和现有脱节点。
- 是否避免新增 schema 或 migration。

结论：

- 已明确 `knowledge_node` 是树，`resource` 是资源，教材、鉴定点、知识点文档均先作为资源。
- 已明确 `knowledge_node_resource` 表达资源支持知识点，`question_knowledge_node` 表达正式题考查知识点。
- 已指出当前导入按专业粗关联资源的风险，并把修复放入 `knowledge-node-resource-link-resolver-2026-07-08`。
- 已保持“不新增 schema/migration/seed/fixture”的边界。

修正：

- 在关系方案中补充 AI 出题采纳时才写正式题知识点绑定，避免把草稿误认为正式题。
- 在 AI 组卷 flow 中补充“知识点为空不能算 exact 命中”。

## Round 2: Role, Permission, and Edition Boundary

检查问题：

- 是否覆盖个人高级版、企业高级版员工、企业高级版管理员、内容后台四类 AI 角色。
- 是否防止 standard 用户误用高级版能力。
- 是否保持 super_admin 组织上下文和 ops_admin 入口边界。
- 是否不改变登录、角色、授权、edition 判定语义。

结论：

- 四类 AI 角色已分别登记 UI、服务和采纳边界。
- standard 拒绝或升级提示已列为每个相关分支必测项。
- super_admin 缺组织上下文不得误入组织业务页、ops_admin 与 super_admin 入口不混淆已列入强制边界。
- 所有实现分支均禁止修改授权语义，只允许消费既有判定结果。

修正：

- 在矩阵第三阶段增加全入口回归行，避免只测四类高级版角色而漏掉 standard、ops_admin、super_admin。

## Round 3: AI Chain, Source Safety, and Evidence Redaction

检查问题：

- 是否避免 Provider-enabled 执行。
- 是否保持 AI 组卷只由 Provider 输出方案、本地服务选择正式题。
- 是否避免记录敏感材料、完整题目、完整资源内容或浏览器状态。
- 是否定义不足题源和弱证据状态。

结论：

- 矩阵所有分支禁止 Provider-enabled 执行。
- AI 组卷分支只允许修 source resolution、assembly、plan/select 和 tests，不允许模型生成最终题目内容。
- evidence 模式只允许路径、计数、状态和代码符号结论。
- 空态、错误态、禁用态、weak/none evidence、题源不足均列为必测。

修正：

- 在 `ai-question-grounded-resource-filter-2026-07-08` 增加 weak evidence 提示和 no evidence 禁用/错误检查。
- 在 `ai-paper-knowledge-source-selection-2026-07-08` 增加来源禁用态和题源不足错误态检查。

## Final Audit Result

第一阶段方案可以作为后续短分支执行依据。后续任何实现分支若发现跨分支问题，必须写入矩阵对应行并在第三阶段全角色收口前核销。

## 品味合规自检 Checklist

- [x] 没有用文档登记替代权限、授权或 edition 的代码语义变更。
- [x] 没有新增依赖、schema、migration、seed、fixture。
- [x] 没有记录敏感材料、完整题目、完整试卷、完整资源内容、Provider payload 或浏览器状态。
- [x] 使用项目既有术语：`knowledge_node`、`resource`、`question`、`paper`、`authorization`、`edition`。
- [x] 后续任务按可测试、可提交、可回滚的短分支拆分。
