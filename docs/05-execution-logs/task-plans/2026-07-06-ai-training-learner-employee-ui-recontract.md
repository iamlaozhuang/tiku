# 2026-07-06 AI训练学员与员工 UI 重定合同执行方案

## 任务边界

- Task id: `ai-training-learner-employee-ui-recontract-2026-07-06`
- Branch: `codex/ai-training-learner-employee-ui-recontract-2026-07-06`
- Parent goal: `ai-generation-recontract-local-repair-goal-2026-07-06`
- Depends on: `ai-paper-learning-session-source-resolver-wiring-contract-2026-07-06`
- Scope: learner and employee `AI训练` UI source and unit tests only.

本任务只处理个人高级版学员与企业高级版员工的 `AI训练` 页面合同：

1. `AI出题` / `AI组卷` 使用页内标签切换，不再把两个入口按钮伪装成提交动作。
2. 当前激活表单底部只保留一个提交按钮：
   - AI出题：`生成练习题草稿`
   - 个人 AI组卷：`生成自测试卷`
   - 企业员工 AI组卷：`生成企业自测试卷`
3. UI 必须显示与后端请求一致的题量：
   - AI出题默认 3，最大 10
   - AI组卷默认 30，最大 80
4. AI组卷题源说明：
   - 个人高级版学员：`平台正式题库`
   - 企业高级版员工：`平台正式题库 + 本企业可用题库`
5. 企业员工 AI组卷显示题源偏好：
   - `均衡使用`
   - `优先使用企业题`
   - `优先使用平台题`
6. 学员/员工 AI组卷预览不得在作答前展示答案、解析或把 Provider 生成题体当作最终试卷内容。

## 明确非目标

- 不修改 `package.json`、lockfile 或新增依赖。
- 不修改 DB schema、migration、seed。
- 不连接 DB，不执行 destructive DB 操作。
- 不执行 Provider 调用，不读取 env/secret。
- 不启动浏览器 runtime、dev server 或 e2e。
- 不执行 staging/prod/deploy/Cost Calibration。
- 不声明 release readiness、production usability 或最终验收通过。
- 不记录凭证、session、cookie、token、env 值、DB 原始行、内部 id、Provider payload、raw prompt、raw AI output、完整题目/试卷/材料、DOM 或截图。

## 已读取规范

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- TDD skill: `test-driven-development`
- Verification skill: `verification-before-completion`

## 实现策略

1. 先在 `tests/unit/student-personal-ai-generation-ui.test.ts` 增加失败用例，覆盖：
   - 切换 `AI组卷` 标签不发起 POST；
   - AI出题可见默认题量为 3，提交体为 3；
   - AI组卷可见默认题量为 30，提交体为 30；
   - 个人与企业员工 AI组卷题源文案正确；
   - 企业员工显示题源偏好；
   - AI组卷预览在作答前不展示答案/解析。
2. 观察 RED，确认失败原因来自现有 UI 合同不满足。
3. 最小修改 `StudentPersonalAiGenerationPage.tsx`：
   - 增加 active tab 状态；
   - 用当前 tab 决定表单、提交按钮、历史筛选与重试；
   - 将默认题量常量化并写入可见 input；
   - 使用当前授权上下文决定个人/企业员工文案；
   - 对 AI组卷预览只展示试卷容器摘要、题量、题源、匹配说明，不展示答案/解析。
4. GREEN 后运行聚焦测试与源码门禁。

## 风险防御

- 个人 AI出题闭环不能被破坏：保留现有生成后练习、答题、反馈路径。
- 企业员工组织上下文不能退化：继续使用已有 authorization context 选择逻辑。
- UI 文案必须全中文，避免 `Provider`、`structuredPreview`、`payload`、`grounding`、`fallback`、`ownerType`、`paper draft` 等技术词。
- Evidence 只记录文件、测试名、命令状态、聚合结果和非敏感角色/题源标签。

## 计划验证

- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts`
- `git diff --check`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-training-learner-employee-ui-recontract.md docs/05-execution-logs/evidence/2026-07-06-ai-training-learner-employee-ui-recontract.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-training-learner-employee-ui-recontract.md src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx tests/unit/student-personal-ai-generation-ui.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-training-learner-employee-ui-recontract-2026-07-06`
