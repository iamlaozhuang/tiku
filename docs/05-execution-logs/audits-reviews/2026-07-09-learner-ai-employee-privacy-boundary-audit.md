# 2026-07-09 Learner AI Employee Privacy Boundary Audit

## Adversarial Review

- Same-organization employee result leakage: mitigated by requiring the current actor on request history, result history/detail, task lookup, result attachment, and learning-session source result lookup.
- Cross-employee idempotent reuse: mitigated by actor-scoped request and result reuse lookups. If an existing owner-level uniqueness conflict belongs to a different actor, the path fails closed instead of reusing another employee record.
- Personal user regression: personal flows pass the current user as both owner actor context and actor filter; tests preserve personal route calls.
- Organization admin regression: this branch does not add any organization admin route or enterprise training visibility over employee learner AI raw results.
- Formal content boundary: this branch does not promote learner AI output into formal `question` or `paper`, and does not write practice or answer-record tables.
- Sensitive evidence: evidence and tests use synthetic public labels and do not record credentials, raw DB rows, internal ids, Provider payloads, prompts, raw AI output, or full question/paper/material content.

## Residual Risk

- The existing owner-level request idempotency uniqueness can still produce a fail-closed conflict for two same-organization employees with identical idempotency hash. That avoids privacy leakage in this branch; changing uniqueness semantics would require a separate schema/migration task and approval.
- This branch validates repository and route contracts with focused tests. Full localhost role walkthrough remains part of the final regression phase after subsequent learner AI组卷 fixes.

## 品味合规自检 Checklist

- 已按 `api -> service -> repository -> model` 的既有分层补边界，没有绕开层级。
- API 可见字段继续使用 `camelCase`，数据库字段引用继续使用既有 `snake_case`。
- 未新增依赖，未修改 package 或 lockfile。
- 未引入 schema、migration、seed 或 destructive DB 操作。
- 未把内部自增主键、凭证、session、cookie、token、env、Provider payload、raw prompt、raw AI output 或完整题目/试卷/材料写入 evidence。
- 修改范围只覆盖本分支隐私边界和对应测试，未扩大到企业训练、内容后台发布或正式练习记录。
