# 2026-07-06 AI Paper Learning Session Source Resolver Wiring Contract

## 任务边界

- 任务 id：`ai-paper-learning-session-source-resolver-wiring-contract-2026-07-06`
- 短分支：`codex/ai-paper-learning-session-source-resolver-wiring-contract-2026-07-06`
- 父 Goal：`ai-generation-recontract-local-repair-goal-2026-07-06`
- 范围：为 personal/employee AI组卷 learning-session route 提供默认服务端正式题源解析器，并在 app route 注入。
- 不做：前端 UI 改造、浏览器验证、DB runtime、Provider call、schema/migration/seed、依赖变更、staging/prod/deploy、Cost Calibration。

## 已读取规范与恢复入口

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-paper-learning-session-route-handoff-contract.md`

## 合同目标

1. Result user context 必须保留 employee public id，供员工企业题源解析使用。
2. Source resolver 必须从服务端仓储解析：
   - 平台正式题库：`question.status = available`；
   - 企业题库 v1：同组织员工可见的已发布训练版本内部题目快照。
3. Resolver 只返回被 `paperAssemblyContainer` 选中的题源内容。
4. App route 默认注入 lazy Postgres 仓储与 resolver；本任务不打开 DB 连接。
5. AI出题路径不受影响。

## TDD 计划

1. 先写失败测试：
   - employee result user resolver 保留 `employeePublicId`；
   - source resolver 从平台题库与企业训练快照解析正式题源内容；
   - personal resolver 不调用企业训练仓储；
   - app route wiring 类型可加载。
2. 实现最小代码：
   - 扩展 `PersonalAiGenerationResultUserContext`；
   - 新增 source resolver service；
   - 在 organization training repository 暴露 server-only snapshot source lookup；
   - app route 注入默认 resolver。
3. 运行 focused unit、相关回归、`git diff --check`、`typecheck`、`lint`、scoped prettier、Module Run v2 precommit hardening。

## 风险防御

- 不把企业训练答案/解析暴露到 API 结果或 evidence。
- 不执行数据库 runtime；只验证 lazy wiring 和 service mapping。
- 不在循环中执行 DB 查询；平台题源使用一次 broad query，企业题源使用一次员工可见版本查询。
- 不把客户端 source content 作为正式题源。

## 预期交付

- source/test/doc/state/evidence/audit 本地提交。
- 不合入、不推送、不清理分支，除非另有 fresh approval。
