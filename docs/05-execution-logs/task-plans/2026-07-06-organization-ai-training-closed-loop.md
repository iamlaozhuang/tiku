# 2026-07-06 Organization AI Training Closed Loop

## 任务边界

- 目标：让组织后台 AI 出题/组卷结果复制到企业训练后，不再只是空元数据草稿，而是能保留 AI 来源血缘和题目快照，进入可审核、可发布、员工可练习、提交后可统计的正式企业训练链路。
- 当前任务只处理组织 AI 结果到企业训练闭环；个人学习会话闭环、内容后台正式采纳闭环已由前序任务覆盖。
- 不执行 Provider，不读取凭证，不连接运行时数据库，不做实际 DB mutation，不跑浏览器/dev server/e2e，不改依赖/lockfile/seed。
- 允许的 schema 变更限定为追加 SQL migration 与 Drizzle schema 元数据，用于保存训练版本题目快照、员工答案快照、员工结果快照；不执行 drizzle push。

## 已读取规范与基线

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- 前序 AI 训练闭环 evidence/audit。

## 第一性原理判断

- “闭环”不是页面上能点一个按钮，而是生成物必须拥有正式业务对象的可追踪状态、可审核内容、发布门禁、员工练习输入输出、统计聚合依据。
- 企业训练发布后的员工端不能依赖临时前端内存或测试 fixture；题目快照必须随训练版本持久化。
- 员工作答不能只保存汇总数字；最小闭环需要保存答案项和结果快照，否则无法稳定复盘和支撑统计追溯。
- AI 来源题目的证据状态是发布风险边界：`none` 阻断发布，`weak` 需要显式确认。

## 实施步骤

1. 写红灯测试，覆盖 validator/service/repository/route/UI 的组织 AI 训练闭环缺口：
   - 发布输入可携带题目快照和 `weakEvidenceConfirmed`。
   - `evidenceStatus=none` 阻断发布；`weak` 未确认阻断发布。
   - 发布版本持久化并返回题目快照。
   - 员工作答保存答案项和结果快照。
   - 组织 AI 结果复制训练草稿时记录 `organization_ai_result` 来源血缘。
2. 做最小源代码修复：
   - 增加组织训练 source context 类型 `organization_ai_result`。
   - 追加版本题目快照、答案项快照、结果快照字段的 schema/migration。
   - 扩展 validator/service/repository/mapper 的共用 DTO 与持久化路径。
   - 调整组织 AI 页面复制逻辑，复用现有企业训练 draft/source-context API，不重复写角色专用链路。
3. 验证组织统计不需要分叉逻辑：AI-sourced 训练提交后仍通过 `organization_training_answer` 聚合。
4. 执行格式化、typecheck、lint、focused tests、full unit、Module Run v2 门禁，写 evidence/audit。
5. 若门禁全通过，按任务 closeoutPolicy 提交、快进合并 master、推送、清理短分支。

## 风险防御

- 不把 AI 结果直接写入正式 question/paper 表；只进入组织训练草稿/版本快照，保留正式内容域隔离。
- 不在 evidence 中记录原题、材料、答案明文或 Provider payload。
- 不新增依赖，不扩展到浏览器/e2e/Provider/实际 DB 执行。
- 所有角色复用组织训练 domain service；避免前端角色分叉复制业务规则。
