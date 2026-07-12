# B4 AI 训练信息架构与 Provider-closed 体验修复方案

- taskId: `user-led-b4-ai-training-information-architecture-2026-07-12`
- branch: `codex/user-led-b4-ai-training-ux`
- baseline: `86610c400f6db101ffefc08d179c0ad1de5ce641`
- approval: `current_user_approved_execute_full_remediation_plan_2026_07_12`

## 已读取

- `AGENTS.md`、project-state、task-queue、代码品味十诫、ADR-001 至 ADR-007。
- 标准版/高级版需求索引、edition-aware authorization、AI requirements SSOT、phase4 baseline、acceptance normalization、goal-completion audit、最新 AI/B3 evidence 与 audit。
- `StudentPersonalAiGenerationPage`、页面级/综合单测、现有个人高级版和企业高级版员工 AI 训练截图。

## 问题登记

| roleLabel       | route label | 状态类别               | 问题类别   | 严重程度 | 实际表现                                   | 期望表现                                 | 复现步骤                  | 建议方案                                          | 疑似同根因                 |
| --------------- | ----------- | ---------------------- | ---------- | -------- | ------------------------------------------ | ---------------------------------------- | ------------------------- | ------------------------------------------------- | -------------------------- |
| 企业高级版员工  | AI训练      | Provider-closed        | 上下文文案 | P2       | 企业员工仍显示“个人 AI 训练”               | 按账号能力显示“企业员工 AI 训练”         | 员工进入 `/ai-generation` | 根据有效企业授权上下文使用稳定 eyebrow            | 页面标题硬编码             |
| 个人/企业高级版 | AI训练      | ready/closed           | 信息可读性 | P2       | 展示 `monopoly` 和完整 ISO 时间            | 专业中文化、日期使用本地可读格式         | 查看授权与历史            | 复用本页纯函数做枚举和日期格式化                  | DTO 值直接透传 UI          |
| 个人/企业高级版 | AI训练      | Provider-closed        | 交互阻断   | P2       | 授权和 AI出题/AI组卷切换随生成入口一起禁用 | 只禁用新建生成；历史浏览和上下文切换可用 | Provider 关闭后进入页面   | 拆分浏览交互与生成提交禁用条件                    | 单一 disabled 状态复用过度 |
| 企业高级版员工  | AI训练      | Provider-closed/mobile | 信息架构   | P2       | 多张授权卡与完整生成设置占据首屏，历史过深 | 历史前置，生成设置默认收起               | 390px 或多授权上下文进入  | 使用原生 details 收起生成设置，关闭时历史置于其前 | 页面按实现顺序堆叠         |

## TDD 与实现

1. RED：增加企业员工 eyebrow、中文专业、可读日期、关闭状态仍可切换上下文/模式、历史先于生成设置的断言。
2. GREEN：根据有效授权上下文区分个人/企业员工标题，增加 profession 和 date formatter，不改变 DTO/API。
3. GREEN：拆分 navigationDisabled 与 generationDisabled；关闭或状态异常时仅禁止新建生成。
4. GREEN：在 Provider-closed 下先渲染历史，再以原生 `details` 默认收起生成设置；Provider available 保持现有默认展开工作流。
5. 回归直接 URL、标准版不可用、Provider 零 POST、owner/actor、移动端 containment 和敏感信息边界。

## 边界

- 允许：AI 训练学员页面、对应页面/综合单测和本任务治理文档。
- 禁止：API、repository、schema、migration、fixture、seed、依赖/lockfile、`.env*`、Provider、staging/prod/deploy、PR、force push。
- Provider-closed 提示保留并改为面向用户的稳定状态，不删除必要状态反馈。

## 验证

- focused Vitest：页面组件与综合 UI。
- 全量 unit、lint、typecheck、format:check、webpack build、`git diff --check`。
- Module Run v2 pre-commit/module-closeout/pre-push。
- 对抗式检查：Provider POST 为零、关闭状态可浏览不可生成、标准版 fail-closed、直接 URL、企业/个人额度选择、敏感信息不展示。
