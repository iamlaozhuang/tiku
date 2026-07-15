# P0 RC-06 两轮对抗式复核

status: pass_branch_closeout_ready

reviewer: 当前 Agent 自对抗复核；未批准、未使用 Subagent，不能表述为独立审查者复核。

Verdict: `APPROVE_BRANCH_CLOSEOUT / fresh_master_gate_required_after_merge`

## Round 1 — 根因、Diff、安全与事务

结论：`pass`。

- model provider secret 仅短暂传入 injected protected writer；writer 必须返回不含原 secret 的 opaque ref，普通数据库仅存 ref、last4、status、rotation time。无 writer 或非法 ref 返回 `503641`，不再伪称 configured。
- connection test 只向 injected executor 传 synthetic、无用户数据、无 raw Prompt 的 health check；无 secret/executor、disabled config 均诚实失败，失败不自动停用模型。
- persisted model config 默认标记 `governed_provider`；local fixture 只有显式 `allowFixture` 才可选择，生产默认不会把 local_mock/local_fixture 作为 AI 成功。
- `ai_scoring_task` 固化 model/prompt/input/authorization/RAG snapshot；单 answer 只有一个任务生命周期，claim 只认 pending，FIFO + `skip locked` 防并发多 owner。
- lease recovery 先锁过期 task，记 timeout attempt 并把 answer 标为 scoring_failed；claim 不再越过 recovery 直接重认领，避免漏记崩溃 attempt。
- 普通执行失败保留原 scheduled/started 时间，写 failed attempt；是否可重试只保留为 retry metadata，HTTP 请求只重置持久 failed task，不在请求内调用 Provider。
- 成功 completion 必须关联 success/scoring `ai_call_log`，并匹配 actor/mock/answer/model config/prompt key+version；缺 provenance、越界/NaN score 或非 scored result 均 fail closed。
- standalone enqueue 与 submit transaction 均绑定 answer/mock/actor scope；duplicate submit、不同 idempotency、late completion、lost lease 不产生第二成功结果。
- migration 只新增 task enum/table/constraints/index，并以第二 source migration 收紧每 answer 单 task；snapshot chain 已恢复为时间戳顺序。未 apply、read、write、backfill 或 seed 数据库。

本轮发现并修正：

1. success 可缺 `ai_call_log` provenance；补 runtime 与 completion 双层拒绝。
2. lease expiry 会漏记 attempt，第三次 expiry 可永远卡 running；补 recovery 事务。
3. 默认 redacted snapshot 错标 local_mock；改为 governed provider，fixture 显式标注。
4. task authorization snapshot 缺 actor/mock/scope；补 profession/level/subject 与 guard time/boundary。
5. standalone enqueue 可关联跨 scope answer；补 answer→mock→user scope join。
6. invalid score 和无关 call log 可完成；补有限值/范围/status 与 provenance matching。
7. 同一 answer 可产生多个 task lifecycle；补单 owner unique constraint。
8. claim 仍可绕过有限批次 recovery 直接认领第 101 个 expired task；claim 改为只认 pending。
9. retry failure attempt 误把下次 retry time 记成当前 attempt scheduled time；先锁并保留原时间。

## Round 2 — 跨角色、状态机、API 与回归

结论：`pass`。

- `/ops/ai-governance` 已纳入运营菜单和角色总览；super 可写 provider/config、测连接、看 Prompt 全文，ops 只见脱敏只读摘要；服务端 API 仍是最终授权边界。
- `AdminModelConfigManagement` capability 默认由 true 改为 false；调用者遗漏 role capability 时 fail closed，无 callback 不再本地伪保存/伪测试。
- Prompt Registry 保持首期只读；未扩张为编辑/启停能力。API 保持标准 envelope、camelCase、publicId、null/[]，不暴露 numeric id、secret ref、raw Prompt/Provider IO。
- mock submit 在配置不可用时明确 `503318`，有配置时只事务写 task/answer/mock 状态，不等待 Provider；retry endpoint 只对当前 actor/mock 下 failed task 加锁重置，最多三次事实来自 attempt count。
- practice、mistake-book、owner preview、learning suggestion 默认 fake 被移除；缺 governed executor 时不产生分数、固定 AI 文案、fake request ID/citation。练习 UI 显式显示“暂不可用”，不再永远显示伪“生成中”。
- RC-07 仍负责 answer/mock/report 聚合、评分结果快照和报告 UI；本 RC 不把该下游工作或 RV-0012/RV-0017/RV-0021 表述为已验收。
- P1/P2 仅保留影响映射：F-0063 等可能被 durable attempt/task 语义覆盖，但全部等 P0 后重基线，不在本 RC 关闭或降级。
- focused `24/24` files、`215/215` tests；最终 full unit `393/393` files、`2322/2322` tests；lint、typecheck、format、build、diff 与 serial manual guard 通过。

第二轮发现并修正：

1. model governance UI capability 缺省为可写/可看全文；改为 fail-closed。
2. 删除 fake hint 后，subjective practice UI 会永久显示“AI 提示生成中”；新增明确 unavailable 状态并禁用伪操作。
3. retry endpoint 仍固定 Provider blocked，无法消费持久 failed task；改为 DB-only durable reschedule，Provider 仍只由未激活 worker 执行。
4. RC-06 领取时 finding ledger 的三条 revalidation rationale 错写到 F-0002/F-0005/F-0006；恢复三项原记录并把定向重基线写回 F-0062/F-0101/F-0102。

## Current Boundary Verdict

- F-0062、F-0101、F-0102、F-0134 的静态根因均有源码、测试和两轮复核证据；F-0134 保持 root-cause alias 关系，不改成 duplicate。
- branch 可进入 Module Run v2 pre-commit/closeout；合入后仍必须在 fresh master 重跑门禁，随后方可 push/cleanup/领取 RC-07。
- database apply/read/write、真实 secret/env、Provider、worker activation、runtime/browser/e2e、PR、force push、deployment 仍未授权。

reviewResult: pass_branch_closeout_ready_fresh_master_required
