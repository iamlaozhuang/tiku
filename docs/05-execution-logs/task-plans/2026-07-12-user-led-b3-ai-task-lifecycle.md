# B3 AI 任务生命周期一致性修复方案

- taskId: `user-led-b3-ai-task-lifecycle-2026-07-12`
- branch: `codex/user-led-b3-ai-training`
- baseline: `f1148823d6f2d59ea3cb40d430ef7cb552c969cb`
- approval: `current_user_approved_execute_full_remediation_plan_2026_07_12`

## 已读取

- `AGENTS.md`、project-state、task-queue、代码品味十诫、ADR-001 至 ADR-007。
- 标准版/高级版需求索引、edition-aware authorization、个人与组织 AI module/story。
- AI requirements SSOT、phase4 baseline、acceptance normalization、goal-completion audit、最新累计 closeout。
- 个人/企业 AI 训练截图及 request/result repository、mapper、service、UI 与测试。

## 新鲜失败证据

- 企业高级版员工历史任务已有 `resultPublicId` 和结果卡片，但请求状态仍显示“处理中”。
- `attachResultToTask` 只写结果引用、依据与调用日志，没有把 `task_status` 更新为 `succeeded`。
- 结果插入与任务更新当前是两个独立数据库操作，不满足原子性。

## TDD 与实现

1. RED：增加 mapper 历史兼容测试，证明 `pending + resultPublicId` 必须对外显示为 `succeeded`。
2. RED：增加 repository 测试，证明新结果持久化必须通过一个原子 gateway 操作，并携带 `taskStatus: succeeded`。
3. GREEN：生产 PostgreSQL gateway 在一个 Drizzle transaction 内插入结果并更新任务状态、结果引用和依据元数据。
4. GREEN：mapper 对历史残留执行读时兼容，不批量回填数据库。
5. 回归幂等、个人/组织 owner+actor 隔离、Provider-closed 和敏感信息边界。

## 边界

- 允许：个人 AI request/result repository、mapper、对应测试和本任务治理文档。
- 禁止：`.env*`、依赖/lockfile、schema、migration、seed/fixture、Provider、staging/prod/deploy、PR、force push。
- 不输出账号、凭证、session、cookie、token、DB URL、原始生成内容或完整题目。

## 验证

- focused Vitest：request mapper、result repository/service/route、学员 AI UI。
- 全量 unit、lint、typecheck、format:check、webpack build。
- `git diff --check`、Module Run v2 pre-commit/module-closeout/pre-push。
- 对抗式检查：跨 owner/actor、重复写入、事务失败、旧数据兼容、Provider 零调用、正式域零写入。
