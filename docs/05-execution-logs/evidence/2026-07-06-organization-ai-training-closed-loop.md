# 2026-07-06 Organization AI Training Closed Loop Evidence

## 范围

- 任务：`organization-ai-training-closed-loop-2026-07-06`
- 分支：`codex/organization-ai-training-closed-loop-2026-07-06`
- Provider：未执行
- 运行时 DB 连接/DB mutation/drizzle push：未执行
- 浏览器/dev server/e2e/staging/prod：未执行
- 依赖/lockfile/seed：未变更

## 红灯

- `npm.cmd exec -- vitest run src/server/validators/organization-training.test.ts`
- 结果：失败，3 个断言失败。
- 失败点：发布输入未保留题目快照字段；`organization_ai_result` source-context 被拒绝；员工 answerItems 被丢弃。

## 实现证据

- 追加 migration：`drizzle/20260706052000_add_organization_ai_training_closed_loop.sql`
  - 新增 `organization_ai_result` source type。
  - 新增 `organization_training_version.question_snapshot`。
  - 新增 `organization_training_answer.answer_item_snapshot`、`question_result_snapshot`。
- 组织 AI 复制训练草稿后追加 source-context 关联，返回血缘不匹配时不标记成功。
- 发布版本保存题目快照；员工可见版本返回题目快照。
- 发布门禁：`evidenceStatus=none` 阻断；`weak` 未确认阻断。
- 员工保存/提交保存 answerItems；提交时从版本题目快照生成结果快照。
- 组织统计继续走既有 `organization_training_answer` submitted 聚合路径。

## 验证

- `npm.cmd exec -- vitest run src/server/validators/organization-training.test.ts src/server/services/organization-training-service.test.ts src/server/repositories/organization-training-repository.test.ts src/server/mappers/organization-training-mapper.test.ts src/server/services/organization-training-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts src/server/services/organization-analytics-service.test.ts`
  - 通过：8 个文件，157 个测试。
- `npm.cmd run typecheck`
  - 通过。
- `npm.cmd run lint`
  - 通过。
- `npm.cmd exec -- prettier --write --ignore-unknown ...`
  - 通过。
- `npm.cmd run test:unit`
  - 通过：333 个文件，1657 个测试。
- `npm.cmd exec -- prettier --check --ignore-unknown ...`
  - 通过。
- `git diff --check`
  - 通过。
- blocked file diff guard
  - 通过：`.env`、依赖/lockfile、`migrations`、`seed`、`e2e`、报告/构建产物无差异。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-ai-training-closed-loop-2026-07-06`
  - 通过。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-ai-training-closed-loop-2026-07-06 -SkipRemoteAheadCheck`
  - 首次因机制状态 SHA 基线滞后阻断；更新 `lastKnownMasterSha` / `lastKnownOriginMasterSha` 为当前 master/origin master 后重跑通过。

## 边界确认

- 未将 AI 结果写入正式 `question` / `paper` / `practice` / `mock_exam` / `answer_record` / `exam_report` / `mistake_book`。
- Evidence 未记录原题、材料、标准答案、解析、Provider payload、凭证、环境变量、会话/token、PII 或原始 DB 行。
