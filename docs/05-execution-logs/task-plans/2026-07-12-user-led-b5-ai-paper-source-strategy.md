# B5 AI 组卷题源策略修复方案

- taskId: `user-led-b5-ai-paper-source-strategy-2026-07-12`
- branch: `codex/user-led-b5-ai-paper-source`
- baseline: `295a1a7c4afcf3e91730ea6ec3612b0fc4ad53b7`
- approval: `current_user_approved_execute_full_remediation_plan_2026_07_12`

## 已读取

- `AGENTS.md`、project-state、task-queue、代码品味十诫、ADR-001 至 ADR-007。
- 标准版/高级版索引、edition-aware authorization、AI requirements SSOT、phase4、2026-07-05 closed-loop、2026-07-06 recontract、最新 AI baseline evidence/audit 与 B4 closeout。
- 个人/组织 AI generation modules、plan-and-select contract/service/tests、route wiring，以及企业高级版员工 AI训练既有截图。

## 问题登记

| roleLabel             | route label | 状态类别                           | 问题类别 | 严重程度 | 实际表现                                                         | 期望表现                                                         | 复现步骤                                        | 建议方案                                 | 疑似同根因                               |
| --------------------- | ----------- | ---------------------------------- | -------- | -------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| 企业高级版员工/管理员 | AI组卷      | Provider-available/closed 后端合同 | 题源策略 | P2       | `balanced` 与 `prefer_platform` 都把全部平台候选排在企业候选之前 | 同匹配层级内全卷来源数量近 1:1，奇数确定性分配，单侧不足自动补足 | 传入充足的同质量平台题与企业题并选择 `balanced` | 让选择器按偏好和全卷累计来源计数逐题选择 | source preference 仅实现为一次性数组排序 |

## TDD 与实现

1. RED: 增加多 section 的 `balanced` 失败用例，证明当前实现会全部选择平台题。
2. GREEN: 匹配质量仍严格遵循 exact -> nearby knowledge -> same scope；只在同一匹配层级内应用来源偏好。
3. GREEN: `balanced` 根据全卷累计来源数量选择当前较少的一侧；相等时平台题先取，下一题由企业题追平。
4. GREEN: `prefer_platform`、`prefer_enterprise` 保持明确优先；优先侧不足时另一侧补足。
5. 回归个人/内容角色平台题限定、同企业 published/not-taken-down 边界、去重、跨企业拒绝和不足状态。

## 边界

- 允许：plan-and-select 选择器、对应单测和本批治理文档。
- 禁止：UI、route、repository、schema、migration、fixture、seed、依赖/lockfile、`.env*`、Provider、staging/prod/deploy、PR、force push。
- 不改变 API/DTO，不生成题目正文，不放宽角色、组织或正式题源边界。

## 验证

- focused Vitest：plan-and-select service 与 route wiring。
- 全量 unit、lint、typecheck、format:check、webpack build、`git diff --check`。
- Module Run v2 pre-commit/module-closeout/pre-push。
- 对抗式检查：质量层级优先、奇数确定性、单侧不足、重复 publicId、跨企业、taken-down、AI 草稿、敏感内容与 Provider 零调用。
