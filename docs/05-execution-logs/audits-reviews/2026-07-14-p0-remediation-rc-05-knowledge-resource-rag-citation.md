# P0 RC-05 Security And Adversarial Review

Date: 2026-07-15

Task: `p0-remediation-rc-05-knowledge-resource-rag-citation-2026-07-14`

Branch: `codex/p0-rc-05-knowledge-resource-rag-citation`

Base: `d8ea27882f98679db8f83992316cd9c6661bee3d`

Reviewer: current Agent self-adversarial review; no Subagent approved or used

Verdict: `APPROVE_BRANCH_CLOSEOUT / fresh_master_gate_required_after_merge`

## Finding Independence

- F-0068、F-0075、F-0076、F-0080、F-0081、F-0084 均保持 confirmed；同簇不等于 duplicate，不删除独立验收义务。
- RV-0013、RV-0014 及其余 runtime backlog 仍 pending；静态修复不表述为业务运行时验收通过。
- P1/P2 只更新影响映射，全部保留到 P0 后重基线。

## Round 1 — Root Cause / Diff / Transaction / Security

Conclusion: `pass`.

- `knowledge_base`、current/parent `knowledge_node` 和 resource relation 是权威事实；create/move/replace relation 在 transaction 中锁定 scope，复合 FK backstop same-base/same-profession 竞态。
- resource rebuild 只创建 immutable pending generation；complete 先锁 resource 后 generation，验证 source hash、状态、连续 chunks、keyword facts、1536 维有限 vector 与 enabled model，再原子 supersede old active/activate new generation。
- disabled、draft、indexing 等 current status 在 idempotency replay lookup 前 fail closed；旧 `markResourceIndexingStarted`/`saveResourceIndexingResult` 写入口删除，不能绕过 generation transaction。
- resource edit/disable supersede pending/indexing generation，保留旧 active generation；failed/stale complete 不会把 disabled 恢复成 `rag_ready`。
- recommendation create/update/copy enqueue 与 question mutation 同事务；disable supersede；complete/review 使用 question→task→candidate/node 稳定锁序，revision、question public ID、candidate set、node status/profession/level 复验。
- candidate citation 必须来自与该 exact knowledge node 关联、active generation、`rag_ready`、同 profession/level 的 chunk；不能用任意同专业资料伪造来源。
- 无真实 executor/model/prompt/RAG evidence 时不返回 recommendation success；没有 raw prompt/provider request/response、credential 或 numeric ID 进入 API。
- schema/migration 只编写、静态测试并独立提交；未连接数据库，历史缺 relation/generation 的数据不伪造 backfill。

复核期间发现并修正：disabled idempotency replay 越过状态门、legacy indexing write bypass、resource/question lock inversion、publish TOCTOU、pending generation 未 supersede、candidate citation scope 过宽、review URL/task confused deputy、confirm stale node、confirm 后 current question revision 丢失。

## Round 2 — Cross-role / State / API / Regression

Conclusion: `pass`.

- content admin resource UI 仅允许 published/index_failed/rag_ready 请求 rebuild，携带 idempotency key，并显示“请求已受理/pending generation”，不再把 chunking 当成重建完成。
- question recommendation UI 只消费服务端 task/candidate/review 状态；ignore 可逐项持久化，confirm 一项后原子替换正式绑定并结束其余 pending candidate；旧 revision 和并发 review 返回稳定冲突。
- student scoring、mistake explanation、owner preview 的默认路径使用持久 repository；local catalog 仅显式注入，production 不再默认消费本地 JSON 双事实源。
- keyword-only 明确返回 `semantic_unavailable_keyword_only`；fusion/hybrid 只消费独立 persisted semantic/rerank facts；citation 及 evidence summary 保留 resource/chunk/generation/hash provenance。
- API 保持 public ID、camelCase、标准 envelope、required nullable `generationPublicId`、空列表 `[]`；不暴露 numeric ID、storage path、raw prompt/provider payload 或 fabricated citation。
- full unit `387/387` files、`2289/2289` tests；focused RC-05/schema `2/2` files、`13/13` tests；lint/typecheck/format/diff/build 与 pre-commit hardening 全部通过。
- P1/P2 仅做影响映射；F-0069 path/depth descendant、F-0083 双 source 语义等仍保留到 P0 后重验，未为减少数量错误合并或降级。
- RV-0013/RV-0014 仍 pending；静态修复不表述为数据库迁移成功、Provider 可用或业务验收通过。

## Current Boundary Verdict

- 六个 P0 finding 均保留独立静态验收结论，并有 schema/source test、实现、两轮不同重点复核和全量回归证据；无剩余 blocking static defect，可按 standing authorization 提交治理证据、ff-only 合入 master、执行 fresh-master 门禁、普通 push 和清理。
- 任一 module closeout/pre-push/fresh-master/remote sync/cleanup 失败，不得领取 RC-06。
- database apply/read/write、runtime acceptance、browser/e2e、Provider、依赖、PR、force push 和 deployment 仍未授权。
