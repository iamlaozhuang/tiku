# 2026-07-06 AI Paper Learning Session Handoff Contract

## 任务边界

- 任务 id：`ai-paper-learning-session-handoff-contract-2026-07-06`
- 短分支：`codex/ai-paper-learning-session-handoff-contract-2026-07-06`
- 父 Goal：`ai-generation-recontract-local-repair-goal-2026-07-06`
- 范围：让 personal/employee AI组卷生成的本地 `paperAssembly` 可以交接到个人 AI 学习会话服务，形成“试卷容器预览后可开始作答”的后端合同基础。
- 不做：前端 UI 改造、浏览器验证、DB runtime、Provider call、schema/migration/seed、依赖变更、staging/prod/deploy、Cost Calibration。

## 已读取规范与恢复入口

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-paper-personal-route-container-contract.md`
- TDD skill and testing anti-patterns reference.

## 合同目标

1. 学习会话服务必须能从 AI组卷 `paperAssembly` 选择结果创建 answerable learning session。
2. 题目内容必须来自服务端解析的正式题源内容：
   - 平台正式题库题目；
   - 企业训练版本题目快照。
3. 不允许把 Provider 的 paper plan、raw output 或 nested generated question draft 当作 AI组卷最终作答题目。
4. 个人/员工会话仍保持 formal write boundary blocked：
   - 不写正式 `question`；
   - 不写正式 `paper`；
   - 不写正式 `practice`；
   - 不写正式 `answer_record`；
   - 不写正式 `exam_report`；
   - 不写正式 `mistake_book`。
5. 企业员工会话保留 organization owner scope 与 actor isolation。
6. 证据只记录聚合状态、计数、角色、题源类别和错误类别。

## TDD 计划

1. 先在 `personal-ai-generation-learning-session-service.test.ts` 写失败测试：
   - `paperAssembly` 选择平台 + 企业题源后创建可作答学习会话；
   - 会话问题来自正式题源内容，而不是 Provider paper plan；
   - 缺少选中题源内容时 blocked；
   - employee owner scope 和 actor isolation 保留。
2. 实现最小服务合同：
   - 增加 paper assembly learning session 输入 DTO；
   - 增加 source question DTO；
   - 在 learning session service 中把 selected questions 映射为 session questions；
   - 保持已有 AI出题 visibleGeneratedContent 创建路径不变。
3. 运行 focused unit、相关 AI paper unit、`git diff --check`、`typecheck`、`lint`、scoped prettier、Module Run v2 precommit hardening。

## 风险防御

- 对抗点：AI组卷不能退回 Provider 直接生成题目内容。
- 对抗点：不能把只有 public id 的 container 当作可作答题目；必须有服务端题源内容。
- 对抗点：不能泄漏完整题目到 evidence；测试可使用 synthetic fixture，evidence 只记录计数和类别。
- 对抗点：不触碰 DB/schema；生产 repository hydration 另包或后续 route wiring 完成。

## 预期交付

- source/test/doc/state/evidence/audit 本地提交。
- 不合入、不推送、不清理分支，除非另有 fresh approval。
