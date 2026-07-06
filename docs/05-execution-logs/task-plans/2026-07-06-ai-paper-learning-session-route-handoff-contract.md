# 2026-07-06 AI Paper Learning Session Route Handoff Contract

## 任务边界

- 任务 id：`ai-paper-learning-session-route-handoff-contract-2026-07-06`
- 短分支：`codex/ai-paper-learning-session-route-handoff-contract-2026-07-06`
- 父 Goal：`ai-generation-recontract-local-repair-goal-2026-07-06`
- 范围：让 personal/employee learning-session route 能接收 AI组卷 `paperAssemblyContainer`，并通过服务端题源解析器补齐正式题源内容后调用 learning-session handoff 服务。
- 不做：前端 UI 改造、浏览器验证、DB runtime、Provider call、schema/migration/seed、依赖变更、staging/prod/deploy、Cost Calibration。

## 已读取规范与恢复入口

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-paper-learning-session-handoff-contract.md`
- TDD skill and frontend testing/debugging skill.

## 合同目标

1. Route 保留现有 AI出题 `visibleGeneratedContent` 创建学习会话路径。
2. Route 新增 AI组卷路径：
   - body 包含 `paperAssemblyContainer`；
   - grounding 只来自 `visibleGeneratedContent.groundingSummary`；
   - 题目内容只来自服务端 `paperSourceQuestionResolver`；
   - 不接受客户端提交的正式题源内容作为作答题。
3. Resolver 返回平台正式题库和企业训练快照内容后，route 调用 `createLearningSessionFromPaperAssembly`。
4. Resolver 缺失或题源不足时，route 返回安全 blocked 结果，不保存半成品 session。
5. Employee owner scope 继续保持 organization owner + actor isolation。

## TDD 计划

1. 先在 `personal-ai-generation-learning-session-route.test.ts` 添加失败测试：
   - AI组卷 route 通过服务端 resolver 创建可作答 session；
   - 客户端 source question 字段被忽略；
   - resolver 缺题时 blocked 且不保存 session；
   - AI出题 route 不调用 paper source resolver。
2. 实现最小 route 合同：
   - 增加 resolver dependency 类型；
   - 增加 `paperAssemblyContainer` body 读取；
   - 创建 discriminated route creation input；
   - AI组卷调用 learning-session handoff 服务。
3. 跑 focused unit、相关 AI paper regression、`git diff --check`、`typecheck`、`lint`、scoped prettier、Module Run v2 precommit hardening。

## 风险防御

- 对抗点：不能让客户端把完整题目/答案作为 AI组卷最终作答题源。
- 对抗点：不能把 Provider plan 或 raw output 作为正式题目内容。
- 对抗点：不能破坏已有 AI出题学习会话 route。
- 对抗点：本包只做 route 合同，DB 仓储默认 wiring 后续单独包处理。

## 预期交付

- source/test/doc/state/evidence/audit 本地提交。
- 不合入、不推送、不清理分支，除非另有 fresh approval。
