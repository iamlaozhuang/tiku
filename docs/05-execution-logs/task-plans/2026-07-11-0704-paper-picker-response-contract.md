# 0704 组卷选择器响应契约修复方案

## 任务信息

- taskId：`0704-paper-picker-response-contract-2026-07-11`
- 批次：B1A / A01
- 分支：`codex/0704-paper-picker-response-contract`
- 基线：`5798bb0a8d7234cdd9337ad6aa0487d4ba530b25`
- 目标：让题目与材料选择模式统一读取正式分页数组 envelope，恢复筛选、分页、预览和添加流程。

## 已读取约束

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/05-execution-logs/task-plans/2026-07-11-0704-paper-composer-workbench.md`
- `docs/05-execution-logs/evidence/2026-07-11-0704-paper-composer-workbench-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-11-0704-paper-composer-workbench-audit.md`
- `docs/05-execution-logs/task-plans/2026-07-11-0704-acceptance-remediation-ledger.md`

## 根因与边界

- 正式题目/材料列表契约均为 `data: T[]`，分页信息位于顶层 `pagination`。
- 组卷抽屉错误读取 `data.questions` / `data.materials`；原组件测试也使用了同样错误的 fixture，未能保护真实合同。
- 本批只修客户端消费与测试，不改 API、service、repository、validator、分页语义、权限、快照或发布规则。
- Provider、env/secret、直接数据库、schema/migration/seed、依赖、staging/production/deploy 和 Cost Calibration 均禁止。

## TDD 步骤

1. 将组件测试 fixture 改为正式数组 envelope，覆盖题目模式和材料优先模式，先得到运行时失败 RED。
2. 将两个列表请求泛型改为数组，并直接读取 `response.data`；错误 envelope 继续进入 error 状态。
3. 覆盖第 2 页请求和不同记录，验证分页来自服务端且返回材料列表后能继续筛选关联题目并添加。
4. 运行 focused test、累计 B0 全量 unit、lint、typecheck、format check、diff check 与 Module Run v2。
5. 写脱敏 evidence/audit，提交、`--ff-only` 合入本地 `master`，合入后复核并清理；禁止 push。

## 验收标准

- 题目模式使用真实数组 envelope 加载、分页、预览和添加，无运行时异常。
- 材料模式使用真实数组 envelope 加载材料；选择材料后按 `materialPublicId` 请求关联题目并可添加。
- 第 2 页请求返回服务端对应记录，上一页/下一页禁用逻辑与顶层 pagination 一致。
- loading、empty、error 状态不混淆；错误响应不保留陈旧数据。
- 无业务标识新增展示，无角色能力、正式内容写入、Provider 或敏感信息边界变化。

## 允许文件

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-11-0704-paper-picker-response-contract.md`
- `docs/05-execution-logs/evidence/2026-07-11-0704-paper-picker-response-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-07-11-0704-paper-picker-response-contract-audit.md`
- `src/features/admin/paper-composer/PaperComposerQuestionPickerDrawer.tsx`
- `src/features/admin/paper-composer/AdminPaperComposerPage.test.tsx`
