# 2026-07-08 知识点 AI 链路验真与修复实施方案

## Scope

本方案覆盖知识点树、资源、题目、四类角色 AI 出题/AI 组卷知识点参数的当前源码验真与后续最小范围修复。执行边界仍遵守 `AGENTS.md`、AI 生成 SSOT、高级版授权需求和 2026-07-06 AI 组卷重订约。

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md` 至 `adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`

## Confirmed Current Gaps

| 编号 | 已验真问题                                                                                              | 证据入口                                                                                                                                                                | 影响                                                                                          | 修复结论                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| G1   | 资源上传服务会读取 `knowledgeNodePublicIds`，但资源 DTO 和内容后台资源页面没有展示/提交知识点绑定入口。 | `rag-resource-knowledge-runtime.ts` 已解析表单字段；`AdminResourceKnowledgeManagement.tsx` 上传表单未提交该字段。                                                       | 教材、知识点文档等资源与知识点树关系不可被内容人员显式建立，AI/RAG 知识点过滤缺少可治理输入。 | 修复资源 DTO、资源列表展示、上传表单提交和 targeted test。                  |
| G2   | 学员端 AI 出题/组卷知识点参数面板存在，但传入空选项。                                                   | `StudentPersonalAiGenerationPage.tsx` 使用空数组作为知识点选项。                                                                                                        | 个人高级版和企业高级版员工只能看到空态，不能选择知识点树节点。                                | 读取知识点树只读列表，按当前授权专业/等级过滤后供面板选择。                 |
| G3   | 后台 AI 出题/组卷只有覆盖模式、包含下级和补充说明，没有知识点树节点选择器。                             | `AdminAiGenerationEntryPage.tsx` 的知识点面板未加载/渲染节点选项。                                                                                                      | 内容后台、企业高级版后台无法提交结构化知识点 public id。                                      | 加载知识点树只读列表，按当前参数专业/等级过滤，渲染多选。                   |
| G4   | AI 组卷的 RAG grounding 和平台正式题库查询没有消费已选知识点范围。                                      | `owner-preview-qwen-visible-ai-runtime-control.ts` 只给 AI 出题传知识点范围；`ai-paper-route-source-resolution-service.ts` 查询条件固定 `knowledgeNodePublicId: null`。 | AI 组卷只在后段 section 匹配中体现知识点，源过滤和依据资料检索不闭环。                        | 给 AI 组卷 grounding 和正式题源查询传递知识点范围；多知识点查询需去重合并。 |

## Repair Branch Matrix

| 分支                                                    | 覆盖角色                                                                                    | 覆盖页面/链路                                           | 允许修改范围                                                                                                  | 禁止触碰范围                                                                                       | 必测权限边界                                                             | 必测 edition 边界                            | 必测状态                                                                 | 验证命令                                                                               | evidence / audit          |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------- |
| `codex/knowledge-resource-binding-ui-2026-07-08`        | `content_admin`、`super_admin` 内容后台入口                                                 | 内容后台资源管理上传与列表                              | `AdminResourceKnowledgeManagement.tsx`、资源 DTO/映射、相关 unit tests、计划/evidence/audit                   | DB、schema/migration/seed/fixture、Provider、env、package/lockfile、账号                           | `ops_admin` 不获得内容资源写入口；`super_admin` 仅内容后台上下文         | 不改变标准/高级判定；只做内容后台资源管理    | 未绑定空态、非法 public id 错误、资源停用/解析失败展示                   | targeted unit test、`npm.cmd run typecheck`、相关 lint/diff check                      | 本分支专属 evidence/audit |
| `codex/ai-knowledge-node-picker-2026-07-08`             | `personal_advanced_student`、`org_advanced_employee`、`org_advanced_admin`、`content_admin` | 四类角色 AI 出题/AI 组卷参数面板                        | 学员 AI 页面、后台 AI 页面、知识点只读列表适配、相关 unit tests                                               | 授权语义、Provider、DB 写入、package/lockfile、schema/migration/seed/fixture                       | 个人只用个人授权；员工和组织后台必须保留组织上下文；内容后台不进入组织域 | 标准版仍拒绝/升级提示；高级版显示可选知识点  | 空列表、加载失败、指定模式无选择禁用                                     | targeted UI tests、`npm.cmd run typecheck`、相关 lint/diff check                       | 本分支专属 evidence/audit |
| `codex/ai-paper-knowledge-scope-consumption-2026-07-08` | 四类高级 AI 角色                                                                            | AI 组卷 RAG grounding、平台正式题源选择、section 匹配   | `owner-preview-qwen-visible-ai-runtime-control.ts`、AI 组卷 source resolution/select service、相关 unit tests | Provider-enabled 执行、DB 写入、auth/edition 语义、package/lockfile、schema/migration/seed/fixture | 企业题源仍按同组织边界；平台正式题源不越权                               | 标准版不进入该服务成功链路；高级版按范围组卷 | 知识点为空不算 exact、题源不足、不合法 public id 已由前置 validator 拦截 | targeted service tests、必要全量 vitest、`npm.cmd run typecheck`、相关 lint/diff check | 本分支专属 evidence/audit |
| `codex/knowledge-ai-cross-role-regression-2026-07-08`   | 标准/高级学员、企业员工、企业管理员、内容后台、运营后台、`super_admin`                      | 资源、知识点树、题目筛选/绑定、AI 出题/组卷入口和拒绝态 | 只修跨分支不一致和遗漏；优先 tests/evidence/audit                                                             | 新功能扩围、Provider、DB、env、package/lockfile、schema/migration/seed/fixture                     | 入口、拒绝、组织上下文、后台工作区边界全复核                             | standard 拒绝清晰；advanced 入口和参数可用   | 空态、错误态、禁用态矩阵复核                                             | 全量/聚焦 vitest、`npm.cmd run lint`、`npm.cmd run typecheck`、diff check              | 收口 evidence/audit       |

## Fixed Flow

每个修复分支必须执行：

1. 从最新 `origin/master` 开 `codex/` 短分支。
2. 阅读本方案、相关 SSOT、矩阵行和当前代码。
3. 先写 targeted failing test，确认失败原因属于当前缺口。
4. 最小范围实现，不扩大页面或权限范围。
5. 运行 targeted tests、typecheck、相关 lint 或全量 vitest。
6. 写脱敏 evidence 与 adversarial audit。
7. 提交，合入 `master`，在 `master` 跑门禁，推送，删除短分支。
8. 确认 `master` clean 且与 `origin/master` 对齐，再进入下一分支。

## Three-Round Self Review

### Round 1 - Source Truth

- 已按要求读取 AGENTS、状态、任务队列、ADR、UI 规范、AI SSOT、高级版授权、RAG、题库/试卷、AI 重订约与已有知识点闭环计划。
- 本轮缺口来自当前源码和测试检索，不重开已被 SSOT 明确关闭的旧问题。

### Round 2 - Boundary

- 修复限定为表现层、DTO 映射、请求参数传递和本地服务选择逻辑。
- 不改登录、角色、授权、`effectiveEdition`、Provider、DB、schema/migration/seed/fixture、env、package/lockfile。
- evidence 仅记录路径、命令、结果和脱敏结论，不记录凭证、session、cookie、token、env、DB 原始行、Provider payload、raw prompt、raw AI output、完整题目/材料/资源内容。

### Round 3 - Completeness

- G1 覆盖资源到知识点树的人工建立入口。
- G2/G3 覆盖四类角色 AI 参数面板的结构化知识点 public id 选择。
- G4 覆盖 AI 组卷从 UI/API DTO 到服务源过滤和 RAG grounding 的消费链路。
- 最后用收口分支复核角色、edition、空态、错误态、禁用态和跨分支一致性。

## 品味合规自检 Checklist

- 未新增魔法色值或硬编码主题判断；后续 UI 改动继续使用现有 token 类名。
- 未新增依赖，未修改 `package.json` 或 lockfile。
- 未改数据库、schema、migration、seed 或 fixture。
- 未暴露内部数字 id、凭证、session、cookie、token、env、DB 原始行、Provider payload、raw prompt、raw AI output、完整题目/试卷/材料/资源内容。
- 方案保持 API JSON camelCase、路径和术语符合项目命名约定。
