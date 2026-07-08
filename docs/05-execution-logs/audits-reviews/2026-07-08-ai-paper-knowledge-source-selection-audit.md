# AI Paper Knowledge Source Selection Adversarial Audit

## Requirement Mapping Result

- 核对矩阵行：`ai-paper-knowledge-source-selection-2026-07-08`。
- 允许范围：AI 组卷 route assembly、plan-and-select、本地 source adapter/resolution 测试、任务计划/evidence/audit/状态矩阵。
- 禁止范围：Provider 最终题生成、DB mutation、auth/edition 语义、package/lockfile、schema/migration/seed/fixture/rawfiles。

## Adversarial Checks

- 权限边界：本分支没有修改登录、角色、授权或 edition 判定；标准版拒绝仍由上游边界处理。
- 题源边界：个人和内容后台仍排除企业快照；组织角色仍只能使用同组织已发布训练快照；其他组织快照和下架/禁用状态不进入结果。
- 知识点范围：Provider 方案缺 section public id 时，使用提交参数中的结构化知识点范围；空范围不再记为 exact。
- 不足态：题源不足仍返回 `insufficient_formal_question_source`，不让 AI 补造题目。
- 证据红线：evidence 只记录命令、路径和脱敏结论；不含凭证、session、cookie、token、env、DB row、Provider payload、raw prompt、raw AI output 或完整内容材料。

## Result

- Targeted tests、lint、typecheck、diff check、Module Run v2 precommit、Module Run v2 prepush readiness 均已通过。
