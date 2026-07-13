# AI 训练生成设置顺序修复方案

- taskId: `user-led-ai-training-settings-order-repair-2026-07-12`
- branch: `codex/ai-training-settings-order`
- baseline: `499a90e8744040af1af03d70651b65e80e110a54`
- approval: `current_user_fresh_approved_branch_commit_merge_push_cleanup_2026_07_12`

## 已读取

- `AGENTS.md`、project-state、task-queue、代码品味十诫、UI code、ADR-001 至 ADR-007。
- 标准版/高级版需求索引、edition-aware authorization、个人/组织 AI 模块、AI requirements SSOT、phase4 baseline、最新 AI baseline evidence 与 goal-completion audit。
- 2026-07-07 全角色 UI/UX 实施入口、全局基线、企业员工/个人学员批次、设计审查及 AI recontract。
- B4 方案、证据、审计，当前 `StudentPersonalAiGenerationPage`、对应测试和仓库外修复前截图。

## 新鲜失败证据

| roleLabel      | route label | 状态类别        | 问题类别 | 严重程度 | 实际表现                                                                                        | 期望表现                                                                   | 复现步骤                                  | 建议方案                                                                   | 疑似同根因                                        |
| -------------- | ----------- | --------------- | -------- | -------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------- |
| 企业高级版员工 | AI训练      | Provider-closed | 信息架构 | P1       | 模式标签后先展示约 2460px 历史区，折叠的生成设置位于页面约 3455px，用户认为参数和生成按钮已消失 | 模式标签后立即出现生成设置入口；关闭状态可查看参数但不可提交；历史随后展示 | 登录企业高级版员工并进入 `/ai-generation` | 固定顺序为模式标签、生成设置、历史；关闭状态保持设置折叠并补充不可生成原因 | B4 移动端历史前置策略无差别应用到桌面和长历史状态 |

## TDD 与实现

1. RED：把 Provider-closed 测试改为断言生成设置位于历史区之前，并断言展开后显示关闭原因且提交按钮禁用。
2. GREEN：移除 closed/error 下的历史前置分支，固定生成设置紧随模式标签；available 状态继续默认展开，closed/error 继续默认收起。
3. GREEN：在禁用生成按钮附近显示面向用户的状态原因，不改变 availability API、Provider 开关或请求合同。
4. HARDEN：断言授权和 AI出题/AI组卷切换仍可用，关闭状态零生成 POST，标准版继续 fail-closed。

## 范围

- allowedFiles：学员 AI 训练页面、对应页面测试、本任务 plan/evidence/audit、project-state、task-queue。
- blockedFiles：API、repository、schema、migration、fixture、seed、依赖/lockfile、`.env*`、Provider 配置、staging/prod/deploy。
- 不处理生产 Provider 接入或 release readiness；本任务只修复 localhost Provider-closed 信息架构。

## 验证

- focused Vitest：`StudentPersonalAiGenerationPage.test.tsx` 及综合 AI 页面测试。
- 全量 unit、lint、typecheck、format:check、webpack build、`git diff --check`。
- 浏览器桌面与 390px：设置入口顺序、折叠/展开、disabled、零错误、containment。
- 对抗式审查：Provider 零 POST、标准版直接 URL、企业/个人授权切换、历史交互、敏感信息、焦点和旧状态回归。
- Module Run v2 pre-commit、module closeout、pre-push；ff-only 合入 `master` 后复验并普通 push `origin/master`。
