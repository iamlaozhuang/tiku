# learner-employee-ai-visible-result-closure-repair-2026-07-02

## 任务边界

- 任务：修复个人高级与企业高级员工 AI 出题 / AI 组卷提交后看不到本次生成结果的闭环问题。
- 后续但不在本提交内：专卖 AI 组卷资料覆盖不足、物流无资料时隐藏 / 禁用。
- 分支：`codex/learner-employee-ai-visible-result-closure-repair`。
- 禁止：读取或写入 `.env*`、执行真实 Provider 调用、连接或修改数据库、导入资源、改 schema / migration / seed、改依赖或 lockfile、执行 e2e、部署、声明 release readiness / final Pass / Cost Calibration。

## 已读取规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-02-marketing-monopoly-provider-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-02-learner-employee-ai-history-closure.md`

## 根因审查方向

1. 复查学员端与企业员工端提交链路，确认 POST 后响应中 `runtimeBridge.visibleGeneratedContent`、`resultState`、历史查询是否一致。
2. 复查个人 / 员工共用 route、runtime bridge、local browser experience 服务，优先复用共享链路，不增加角色特化分叉。
3. 写失败单测覆盖：Provider 成功时，本次响应必须直接带可见结构化结果；企业员工组织 owner scope 不能丢失；历史失败状态不能覆盖当前成功可见结果。
4. 最小修复后运行 focused unit、lint、typecheck、diff 与 Module Run v2 门禁。

## 实现决策

- 复用既有 `personal-ai-generation-request-route`、`personal-ai-generation-runtime-bridge-service` 与 redacted materialization 服务，不新建角色专用链路。
- actual localhost route 为个人 / 员工 AI 请求接入已有 `personal_ai_generation_result` 草稿结果仓储；仅在 Provider 成功、资料依据充足、结构化预览可解析时物化脱敏草稿。
- 当前响应的 `resultState` 从 materialization summary 回填为 `succeeded`，使普通页面能直接显示本次生成并给出结果已生成状态。
- 持久化只保存 digest、脱敏摘要、依据状态和引用数量；不保存 raw prompt、Provider payload 或 raw AI output。

## 预期验收

- 个人高级与企业高级员工的 AI 出题 / AI 组卷 POST 返回本次可见生成结果摘要。
- 若证据不足或 Provider 未执行，返回明确业务状态，不把旧历史失败伪装成当前结果。
- 不记录 Provider payload、prompt、raw AI 输出、完整题文 / 试卷 / 材料 / chunk。
- 本任务不做真实浏览器 Provider 验收；真实 Provider 复验留给后续有资料后的专项。

## 验证命令

- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-local-browser-experience-service.test.ts src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-learner-employee-ai-visible-result-closure-repair.md docs/05-execution-logs/evidence/2026-07-02-learner-employee-ai-visible-result-closure-repair.md docs/05-execution-logs/audits-reviews/2026-07-02-learner-employee-ai-visible-result-closure-repair.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-employee-ai-visible-result-closure-repair-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-employee-ai-visible-result-closure-repair-2026-07-02 -SkipRemoteAheadCheck`
