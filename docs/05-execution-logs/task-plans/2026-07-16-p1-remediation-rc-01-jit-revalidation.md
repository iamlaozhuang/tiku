# P1 RC-01 即时二级复检与范围冻结方案

日期：2026-07-16

任务：`p1-remediation-rc-01-jit-revalidation-2026-07-16`

分支：`codex/p1-rc01-jit-revalidation`

工作树：`D:/tiku/.worktrees/p1-rc01-jit-revalidation`

## 目标

在当前 `origin/master` 基线逐项复检 F-0001、F-0003、F-0129、F-0131，分别给出 `confirmed`、`not_reproduced`、`false_positive` 或 `needs_review` 结论；只有证据充分且根因、权威写路径、测试边界相同的 finding 才允许进入同一窄任务。本过渡步骤不修改产品代码，不声称关闭任何 finding。

## 已读取规范与当前权威来源

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/` 全部 ADR；涉及身份、授权时以 ADR-007 及其后续 traceability 为准
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-12-phone-visibility-and-prelaunch-ai-paper-history-decision.md`
- `docs/01-requirements/traceability/2026-06-29-security-unit-b-auth-role-boundary-static-review.md`
- `docs/01-requirements/traceability/2026-06-29-repair-session-login-response-credential-boundary.md`
- `docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-serial-program.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-rc-01-identity-session-admin-account.md`
- `docs/05-execution-logs/evidence/2026-07-14-p0-remediation-rc-01-identity-session-admin-account.md`
- `D:/tiku-readonly-audit/findings/finding-register.yaml` 中 F-0001、F-0003、F-0129、F-0131 原始记录

## 复检方法

1. 对每个 finding 单独建立“需求不变量 → 当前权威路径 → 反证测试 → verdict”链条，不以旧行号或旧结论代替当前代码证据。
2. 比较原审计基线、P0 影响映射和当前 `master`，识别已修复、部分修复、迁移后换路径或仍可复现的行为。
3. 对身份唯一性、注册事务、注销完成、并发 session 签发分别构造失败时序；禁止因共享 `auth/session` 名词而合并。
4. 仅在静态证据充分后冻结一个 WIP=1 successor 范围；其 `allowedFiles`、`blockedFiles`、验证命令、风险与 finding 映射必须精确物化。
5. 过渡提交只允许更新本方案、复检 evidence、复检 audit、`project-state.yaml` 和 `task-queue.yaml`，不得夹带产品、schema、migration、依赖或格式化噪声。

## 当前允许文件

- `docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-rc-01-jit-revalidation.md`
- `docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-01-jit-revalidation.md`
- `docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-rc-01-jit-revalidation.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## 禁止范围

- 产品源码、测试、schema、migration、seed、`package.json`、lockfile
- 数据库连接、迁移 apply、真实用户/session 数据读取、Provider、浏览器/E2E、环境变量值、部署、PR、force push
- P2 实现、21 项 runtime validation、F-0013 runtime hold
- 在 successor 范围冻结前使用 Subagent 参与安全复检

## 风险防御

- 身份域混淆：分别检查 learner/employee `user` 域与 `admin` 域，保留 learner 绑定 employee 的统一账号模型。
- 非原子注册：检查 credential、user、session 的事务边界和失败回滚，不把 precheck 当作并发保证。
- 注销假成功：检查客户端可见结果、服务端 session 撤销和失败语义，local marker 不构成服务端注销。
- 并发多 session：检查数据库约束、事务顺序和后写失效语义，不以单线程测试证明单活。
- 证据泄漏：evidence 只记录路径、计数、匿名化时序和结论，不记录 credential、cookie、session 值、手机号、环境变量、数据库行或原始内容。

## 交付物

- `docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-01-jit-revalidation.md`
- `docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-rc-01-jit-revalidation.md`
- 一个经门禁物化的 WIP=1 successor task，或在证据不足时明确停止为 `needs_review`

## 验证门禁

- `git diff --check`
- 当前目标源码与测试定向静态检索
- 与原审计基线、P0 变更和当前 `master` 的差异核对
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P1RemediationSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId <materialized-task-id>`

## 完成定义

- 四个 finding 均有独立、可追溯的当前代码 verdict。
- 聚类或拆分决定由权威路径和可测试根因支持。
- bootstrap 的 merge/push/cleanup 五项 checkpoint 在 state 中关闭。
- 恰好一个 successor scope 进入 `scope_frozen`，且 WIP 保持 1；若不能安全冻结，则不物化产品任务。
- transition diff 不含产品、依赖、schema、migration 或敏感信息。
