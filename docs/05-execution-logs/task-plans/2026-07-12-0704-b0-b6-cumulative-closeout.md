# 0704 B0-B6 累计收口方案

**日期：** 2026-07-12

**任务：** `0704-b0-b6-cumulative-closeout-2026-07-12`

**分支：** `codex/0704-b0-b6-cumulative-closeout`

**基线：** `10f60614773325d337f66ade65ea128c912418a2`

## 目标

- 逐项复核冻结台账 A01-A30，确认 B0-B6 每个修复、保护决策或验收缺口均有对应提交、evidence 和 audit。
- 在包含全部 16 个本地提交的最新 `master` 基线上执行累计回归，防止后批文案、布局、角色或验收变更破坏前批合同。
- 仅形成最终脱敏 closeout 证据；本任务不改产品源码、测试、依赖、数据库、fixture、schema 或环境。

## 已读取基线

- `AGENTS.md`、project state、task queue、十诫、ADR 与基础/高级版需求入口。
- 2026-07-07 全角色 UI/UX source implementation entry。
- B0 A01-A30 冻结台账、evidence 和 audit。
- B1A、B1B、B1C、B1D、B2、B3、B4、B5A/B/C、B6 A21/A22/A23 及登录目标诊断的 task plan、evidence 和 audit。
- AI requirements SSOT、phase4 baseline、最新 AI baseline evidence 与 goal-completion audit 已由 B2 读取并在本轮累计审计中保持 supersession 结论。

## 台账收口规则

- A01-A13、A16-A20、A24-A30：必须有实现或数据/视觉修复证据，并由累计测试覆盖。
- A14：保持产品决策前不改手机号展示，记为 `protected_deferred_decision`，不得伪报为代码修复。
- A15：保留合资格运营角色卡密明文能力及审计，记为 `protected_requirement`，不得视为缺陷删除。
- A21-A23：必须分别有真实键盘/分页和产品 API 业务闭环证据。
- 任何仍为 `blocked`、`pending` 或只有旧 superseded 证据的实现项均阻止 closeout。

## 累计验证

1. Git：确认本地 `master` 与本分支基线一致、工作区 clean、`origin/master` 仍为 `fa65cbd9b`，不执行 push。
2. 单测：`npm.cmd run test:unit -- --maxWorkers=1`，不通过重试掩盖失败。
3. 静态与构建：lint、typecheck、全仓 format check、webpack production build、`git diff --check`。
4. localhost：显式进程级 0704DB 服务健康，9 个核心角色脱敏登录矩阵通过，Provider availability 保持 closed。
5. 真实浏览器补证：content_admin 在 390px 视口无页面级横向溢出；后台宽表只在 `AdminTableFrame` 内滚动；详情抽屉覆盖 Tab、Shift+Tab、Escape 和焦点恢复。
6. 安全扫描：无内部 ID、凭证、会话、连接信息、raw Prompt、raw AI output 或 Provider payload 进入最终 evidence。
7. Module Run v2：pre-commit hardening 与 closeout readiness 通过后，按批准策略本地提交、快进合入并清理；不 push。

## 停止条件

- 任一 A01-A30 条目缺少可追溯闭环，或 A14/A15 保护被误改。
- 任何累计测试、构建、真实角色、键盘、窄屏或角色隔离回归失败。
- 出现 Provider 请求、正式内容直写、权限扩大、组织范围推断、敏感输出或直接 DB 行为。
- 需要源码、测试、依赖、fixture、schema、migration、seed、env、staging/prod/deploy 或远端变更。
