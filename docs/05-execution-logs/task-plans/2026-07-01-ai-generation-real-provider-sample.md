# 2026-07-01 AI 出题 / AI 组卷真实 Provider 小样本执行方案

## 任务边界

- 任务 id：`ai-generation-real-provider-sample-2026-07-01`
- 分支：`codex/ai-generation-real-provider-sample`
- 目标：在八角色 no-Provider 矩阵复跑通过后，对已打通的高级/内容角色执行本地 owner preview Qwen 小样本，验证生成后数量/结构、反馈位置和可见状态。
- 本任务只做 localhost 浏览器小样本与脱敏 evidence；不修业务源码、不执行 e2e、不改 DB/schema/migration/seed/依赖、不部署、不做 Cost Calibration、不声明 release readiness 或 final Pass。

## 已读取规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-07-01-ai-generation-eight-role-matrix-rerun.md`

## 执行范围

- Eligible roles:
  - `personal_advanced_student`
  - `org_advanced_employee`
  - `org_advanced_admin`
  - `content_admin`
- Functions:
  - `ai_question_generation`
  - `ai_paper_generation`
- Maximum Provider calls: `8` total.
- Retry policy: no retry loop. A failed call is recorded once with a failure category.

## 证据边界

- 允许记录：角色标签、页面/流程标签、Provider executed/not executed、状态、耗时桶、token 计数、失败类别、可见草稿数量桶、结构化解析成功/失败、反馈位置摘要。
- 禁止记录：账号密码、cookie、token、session、localStorage、Authorization header、`.env*` 值、DB 连接串、raw DB 行、内部自增 id、PII、Provider payload、prompt、raw AI 输入输出、完整题文/试卷/材料/resource/chunk 内容、截图、trace、raw DOM、HTML dump。
- 凭证处理：agent 可读取本地私有角色凭证并输入到 `localhost` 登录页；不复述、不输出、不保存、不写入 evidence，不读取或记录会话材料。
- Env 处理：不读取或修改 `.env*`；要求运行中的本地应用已自行加载 `ALIBABA_API_KEY`。

## 验证点

- AI 出题：生成完成后页面应给出明显反馈；结构化草稿应能按数量展示，或明确显示结构化解析失败。
- AI 组卷：生成完成后页面应给出明显反馈；应展示 paper_section/题型分布/题量/知识点覆盖/草稿评审状态中的结构摘要。
- 结果可见性：操作后反馈不能只隐藏在页面末尾且无可感知状态。
- 持久化边界：evidence 不记录 raw prompt、Provider payload、raw AI output 或完整题文/试卷内容。

## 验证命令

```powershell
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-real-provider-sample.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-real-provider-sample.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-real-provider-sample.md
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-real-provider-sample-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-real-provider-sample-2026-07-01 -SkipRemoteAheadCheck
```

## 退出标准

- 每个 executed sample 都有脱敏状态、耗时桶、失败类别或结构摘要。
- Provider 调用总数不超过 `8`。
- OP-06 与 OP-07 得到真实 Provider 小样本证据，或记录明确失败类别。
- evidence 不含敏感值、raw Provider/AI 内容或完整业务内容。
