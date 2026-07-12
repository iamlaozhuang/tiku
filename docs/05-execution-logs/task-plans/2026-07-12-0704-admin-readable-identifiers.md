# 0704 后台可读业务语义与辅助名称修复方案

**日期：** 2026-07-12

**任务：** `0704-admin-readable-identifiers-2026-07-12`

**分支：** `codex/0704-admin-readable-identifiers`

**基线：** `6479cf45ef01b16b020c1e5eed856458daa8c3b4`

## 目标与问题映射

- A08-A10、A26、A30：试卷、题目、材料和运营对象的可见文案、反馈、确认框与辅助名称使用名称、题干摘要、题型、状态或序号，不向普通流程回显内部业务标识。
- A11：知识点推荐使用名称和完整路径；名称或路径缺失时显示不可用，不回退到标识。
- A12：题目关联材料、知识点、标签和资源关联知识点改为名称选择器；内部提交继续使用 `publicId`，不改变写接口语义。
- A13：组织首页只显示组织名称、层级路径、范围摘要和计数，不显示组织、授权或范围标识。
- A16：审计动作与目标类型使用完整中文映射；未知值安全回退为“其他操作”或“其他对象”。
- A17：运营日志将 Token 改为“用量”、Prompt 摘要改为“输入摘要”，移除 `redacted`、`summary_only` 和 Cost Calibration 等内部措辞；保留模型、用量和成本摘要。
- A14：手机号展示决策未确认，本任务不得修改手机号可见性或脱敏策略。
- A15：保留合资格 `ops_admin` / `super_admin` 的卡密明文查看与复制能力、角色限制和审计；只改善可读操作名称并验证边界。

## 已读取基线

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- 2026-07-02 AI requirements SSOT、phase4 baseline、最新 AI baseline evidence 与 goal-completion audit。
- 2026-07-11 内容后台五项任务的 task plan、evidence 与 audit。
- B0 完整问题台账、修复批次、evidence 与 audit。
- 卡密明文运营决策、角色/授权/组织后台需求包。

## 第一性原理与实现边界

1. `publicId` 是系统关联合同，不是用户完成日常运营所需的产品语言；UI 应通过业务名称选择，边界层再提交不透明标识。
2. 可访问名称必须让同页重复操作可唯一识别，同时不得用内部标识制造唯一性。
3. 推荐结果缺少可读名称或路径意味着数据不可评审，必须 fail closed，不能以标识代替业务语义。
4. 审计日志仍须保留运营所需事实，但原始枚举、Prompt、Provider payload、原始输出和内部治理措辞不得进入产品表面。
5. 选择器所需标签列表只新增鉴权只读查询，不新增依赖、schema、migration、seed，不扩大内容写权限。
6. 不改手机号策略、卡密角色能力、授权服务端边界、Provider、正式内容、数据库结构、env/secret、staging/prod/deploy 或 Cost Calibration。

## RED 计划

1. 内容对象：为试卷、题目、材料写失败测试，断言搜索、反馈、确认框、推荐评审和可访问名称不包含合成标识，并以名称、题干摘要、题型、状态或序号表达上下文。
2. 绑定选择器：写标签只读 route/repository 合同 RED；写题目和资源表单 RED，按业务名称选择后断言请求仍提交对应 `publicId`；缺失选项显示不可用。
3. 审计与 AI 日志：写动作/目标完整映射、未知安全回退、用量/输入摘要文案和内部徽标缺失 RED；详情操作名称必须唯一。
4. 运营与组织页面：写组织首页不泄漏标识回归；写用户、授权、组织树、卡密、模型配置与知识点页面的业务语义和辅助名称 RED，A15 明文角色合同继续通过。

## 最小 GREEN

- 为业务对象构造稳定的可读上下文函数，移除面向用户的标识拼接；URL 仍使用编码后的不透明标识。
- 在题目材料工作区加载材料、知识点和标签名称选项，使用选择控件维护内部 `publicId` 数组；标签新增鉴权只读列表 route。
- 资源上传复用知识点名称选项，不要求人工输入标识。
- 为审计动作、目标和治理状态建立显式中文 formatter，未知值不原样透传。
- 只在既有页面边界做最小文案和辅助名称修复，不重构权限、数据模型或大型布局。

## 对抗式验收矩阵

| 边界              | 必须通过                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| 内容对象          | 搜索、toast、确认框、表格、抽屉和操作辅助名称均无内部标识；同页重复操作唯一。                          |
| 绑定选择          | 材料、知识点、标签均可按名称完成绑定；请求合同继续发送 `publicId`；缺失名称不回退标识。                |
| 推荐评审          | 显示知识点名称和完整路径；无名称/路径项不可勾选，不显示目标题目或知识点标识。                          |
| 组织首页          | 只显示组织名称、路径、范围摘要和数量；合成组织、授权、范围标识不可见。                                 |
| 审计日志          | 已知动作/目标中文可读；未知值显示安全回退；无原始枚举、Token、Prompt、raw/provider/internal wording。  |
| 卡密 A15          | 合资格角色仍可查看/复制明文且产生既有审计；其他角色不可见；测试输出、截图、证据不含明文。              |
| 手机 A14          | 页面手机号行为与基线完全一致。                                                                         |
| 角色/版本         | 内容、运营、组织角色不扩权；标准/高级版和组织上下文边界不变。                                          |
| Provider/敏感信息 | 零 Provider 请求；无 env、secret、session、token、完整内容、raw Prompt/output/payload 或内部 ID 证据。 |

## 验证门禁

1. 四组 RED 逐组记录预期失败，再做最小 GREEN。
2. focused unit/route/component tests，随后运行受影响模块累计回归与 B1-B3 回归。
3. 全量 `npm.cmd run test:unit`。
4. `npm.cmd run lint`、`npm.cmd run typecheck`、`npm.cmd run format:check`、`git diff --check`。
5. API/route 合同新增后执行 webpack production build。
6. Module Run v2 pre-commit hardening。
7. localhost 仅做脱敏健康和可用角色验收；原 0704DB 未挂载时明确延期，不猜测 env 或凭证。

## 停止条件

- UI 通过默认值伪造业务名称、组织范围或授权上下文。
- 卡密明文能力、手机号策略、角色/版本/组织权限发生变化。
- Provider 请求、正式内容直写、敏感字段进入 UI/日志/证据。
- 依赖、lockfile、schema、migration、seed、env 或部署文件变化。
- 无法解释的既有测试失败。
