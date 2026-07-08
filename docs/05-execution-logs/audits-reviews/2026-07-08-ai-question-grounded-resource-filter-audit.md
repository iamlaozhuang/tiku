# AI Question Grounded Resource Filter Adversarial Audit

## Requirement Mapping Result

- 核对矩阵行：`ai-question-grounded-resource-filter-2026-07-08`。
- 允许范围：owner-preview AI 出题 grounding、本地 RAG scope 调用、服务测试、任务计划/evidence/audit/状态矩阵。
- 禁止范围：Provider 执行、DB mutation、auth/edition 语义、package/lockfile、schema/migration/seed/fixture/rawfiles。

## Adversarial Checks

- 权限边界：本分支没有修改登录、角色、授权或 edition 判定；标准版拒绝仍由上游路由/UI 边界处理。
- 知识点范围：AI 出题会把已归一化 `knowledgeNodePublicIds` 传入本地 RAG；资源层已有 missing scope 返回 `none` 的覆盖测试。
- 组卷边界：没有在本分支改 AI 组卷题源选择；避免混入后续矩阵行的 source selection 规则。
- 空态/错误态：没有制造伪 citation；未命中资源仍保持 evidence status 的 existing `none` 表达。
- 证据红线：evidence 只记录命令、路径和脱敏结论；不含凭证、session、cookie、token、env、DB row、Provider payload、raw prompt、raw AI output 或完整内容材料。

## Result

- Targeted tests、lint、typecheck、diff check、Module Run v2 precommit、Module Run v2 prepush readiness 均已通过。
