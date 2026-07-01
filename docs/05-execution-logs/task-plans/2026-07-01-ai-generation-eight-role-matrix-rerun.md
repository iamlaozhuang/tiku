# 2026-07-01 AI 出题 / AI 组卷八角色矩阵复跑执行方案

## 任务边界

- 任务 id：`ai-generation-eight-role-matrix-rerun-2026-07-01`
- 分支：`codex/ai-generation-eight-role-matrix-rerun`
- 目标：在 P0/P1/P2 修复和本地资料导入后，使用 localhost owner preview 对 AI 出题 / AI 组卷八角色矩阵做人工走查，记录 `pass` / `fail` / `blocked` / `not_applicable` 结论。
- 本任务只做本地浏览器走查与脱敏问题归档；不修业务源码、不执行 e2e、不触发真实 Provider、不改 DB/schema/migration/seed/依赖、不部署。
- 2026-07-01T11:04:40-07:00 用户授权 agent 读取本地私有 8 角色凭证并输入到内置浏览器；该授权仅限 `localhost` owner preview 登录，不允许输出、保存或写入任何凭证值。

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
- `docs/01-requirements/traceability/2026-07-01-ai-generation-core-walkthrough-contract.md`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-root-cause-and-reuse-protocol.md`

## 数据前提

- `ai-generation-resource-import-contract-2026-07-01` 已导入本地资料支撑：
  - question: 3
  - resource: 62
  - knowledge_node: 3
  - material: 3
  - paper: 3
  - paper_question: 3
- 本轮只复跑本地 owner preview，不声明生产、发布、release readiness 或 final Pass。

## 走查矩阵

| Role                        | AI 出题 | AI 组卷 | 预期                             |
| --------------------------- | ------- | ------- | -------------------------------- |
| `personal_standard_student` | pending | pending | 不可用或升级/拒绝状态            |
| `personal_advanced_student` | pending | pending | 高级个人授权下可用               |
| `org_standard_employee`     | pending | pending | 不可用或升级/拒绝状态            |
| `org_advanced_employee`     | pending | pending | 高级企业授权下可用               |
| `org_standard_admin`        | pending | pending | 标准后台不可用或升级提示         |
| `org_advanced_admin`        | pending | pending | 组织拥有的 AI 出题 / AI 组卷可用 |
| `content_admin`             | pending | pending | 内容 AI 草稿/评审面可用          |
| `ops_admin`                 | pending | pending | 无内容生产入口或被拒绝           |

## 检查点

- 入口与权限：角色能否进入对应页面，标准版是否正确拒绝，高级版是否正确放行。
- 参数合同：`profession`、`level`、`subject`、`knowledge_node`、题型、数量、难度、目标等是否符合合同；`level` 必须为 1-5。
- 资料状态：导入数据后是否仍出现无专业、无等级、无知识点、无题库的误导状态。
- 结果与反馈：不触发真实 Provider 的前提下检查提交前后状态；若页面会触发 Provider，则停止并记录为需 Provider 样本任务。
- 历史列表：AI 出题 / AI 组卷是否分离，默认倒序，分页/筛选入口是否存在。

## 证据边界

- 允许记录：角色标签、页面/流程标签、状态、计数、按钮/字段是否存在、脱敏现象摘要、疑似根因边界。
- 禁止记录：账号密码、完整卡密、cookie、token、session、localStorage、Authorization header、`.env*` 值、DB 连接串、raw DB 行、内部自增 id、PII、手机号/邮箱原文、Provider payload、prompt、raw AI 输入输出、完整题文/试卷/材料/resource/chunk 内容、截图、trace、raw DOM、HTML dump。
- 凭证处理：agent 可读取本地私有角色凭证并输入到 `localhost` 登录页；不复述、不输出、不保存、不写入 evidence，不读取或记录 cookie、token、session、localStorage、Authorization header。

## 允许文件

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-01-ai-generation-eight-role-matrix-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-01-ai-generation-eight-role-matrix-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-eight-role-matrix-rerun.md`

## 验证命令

```powershell
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-eight-role-matrix-rerun.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-eight-role-matrix-rerun.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-eight-role-matrix-rerun.md
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-eight-role-matrix-rerun-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-eight-role-matrix-rerun-2026-07-01 -SkipRemoteAheadCheck
```

## 退出标准

- 16 个角色/功能单元都有明确结论。
- OP-01 到 OP-09 在新走查结果中都有对应状态：已修复通过、仍失败、blocked 或 not_applicable。
- 每个 blocker 都有阻塞角色、流程和后续修复依赖。
- evidence 只含脱敏状态/计数/摘要。
- 不声明 release readiness、final Pass、生产可用或 Cost Calibration。
