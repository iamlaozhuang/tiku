# P0 RC-04 Security And Adversarial Review

Date: 2026-07-15

Task: `p0-remediation-rc-04-content-paper-aggregate-snapshot-2026-07-14`

Branch: `codex/p0-rc-04-content-paper-aggregate-snapshot`

Base: `4d1d011d4a6c1fa63d2f2e547b0e4f9cda42af65`

Reviewer: current Agent self-adversarial review; no Subagent approved or used

Verdict: `APPROVE_BRANCH_CLOSEOUT / fresh_master_gate_required_after_merge`

## Finding Independence

- F-0050、F-0051、F-0092、F-0093、F-0171 均保持 confirmed；同一根因簇不等于 duplicate，不删除独立验收义务。
- RV-0011、RV-0012、RV-0015、RV-0021 和其余 runtime backlog 仍 pending；静态修复不表述为业务运行时验收通过。
- P1/P2 仅更新影响映射；未因局部覆盖而提前关闭、降级或顺手整改。

## Risks Reviewed

- rich text 无损与 XSS render boundary、stale overwrite、locked source race、API timestamp precision。
- scoring union 漂移、unknown enum、objective/subjective 错路由、非法 half-point、missing/duplicate scoring identity。
- aggregate revision/status/count/subtotal、partial failure、response-loss replay、same key/different payload、actor collision。
- question/group/material snapshot lineage、copy source drift、deadlock lock order、published immutability、start/archive race。
- public/internal identity leakage、answer leakage、command hash、credential、prompt/provider payload、P1/P2 越界。

## Round 1 — Root Cause / Diff / Transaction / Security

Conclusion: `pass`.

- question/material CAS 同时要求 public id、未锁定、expected timestamp；毫秒精度比较与至少 1ms 单调推进避免 PostgreSQL 微秒和同毫秒双成功。
- paper 是唯一 aggregate root；所有 draft child mutation 和 lifecycle transition 由 revision/status CAS 串行化，transaction failure 回滚 revision、child、score subtotal 和 command claim。
- `paper_command` 以 public command id 唯一；actor、kind、canonical request hash 全等才 replay；result 在同一 transaction 完成，冲突与未完成 claim fail closed。
- add/publish/copy 的 replay 均先于 mutable status/source validation；UI 对同一失败 payload 复用 command id，避免 response loss 后重复 paper/question/publish side effect。
- copy 锁定精确 source paper revision/status，先按 public id 稳定顺序锁全部 source question，再锁 material；与 add/publish 的 question→material 顺序一致，无已识别环路。
- group material 使用当前母题 material snapshot；group public id、paper、section、sort/title/material 精确 join；copy/publish 对 legacy 矛盾 fail closed。
- rich text edit load 不再 strip；student renderer/sanitizer 未放宽，未把无损编辑误解成信任原始 HTML。
- schema source 的 child public id 使用随机 UUID；未从 numeric id 推导，未执行数据库 apply/read/write。

复核期间发现并修正：timestamp 精度条件永不命中、同毫秒双成功、publish 接受 objective points/unknown enum、add/publish lock-order、copy revision TOCTOU、copy group stale material、service 状态预检阻塞 replay、copy source 预检阻塞 replay、copy material→question 死锁风险。

## Round 2 — Cross-role / State / API / Regression

Conclusion: `pass`.

- content_admin 的 list/direct editor 都携带 expected timestamp；旧非法 scoring combination 在可编辑表单恢复为 canonical default，API 和 publish 仍独立 fail closed。
- personal standard/advanced 与 org standard/advanced learner snapshot 共享 stable paper question/group/scoring point identities；practice/mock start 对 archived transition 原子拒绝。
- mock start/submit/retry 不再过滤 malformed points 或伪造 overall；缺失、重复、unknown、non-half、sum mismatch 和 question identity mismatch 返回稳定业务错误。
- stale invalid active learner snapshot 先终止/过期再建立当前有效 snapshot；新建前再次锁 paper published 状态，archive 交错不会留下新 in-progress。
- API 仍为 public id、camelCase、标准 envelope、`null`/`[]`；numeric id、command hash、credential、raw prompt/provider payload 不进入 DTO。
- full unit `385/385` files、`2274/2274` tests；focused `24/24` files、`283/283` tests；lint/typecheck/format/diff/build 全部通过。
- P1 F-0052 rich text sanitizer、F-0074 ungrouped material reference、F-0094 empty group/section independent management 等仅保留影响映射，不在本 RC 扩张修复。

复核期间发现并修正：独立 editor 漏传 expected timestamp、malformed scoring point 被静默过滤、missing identity 被丢弃、stale invalid active snapshot 被继续使用、composer failed retry 生成新 command id、copy child/group current material 未二次对账。

## Current Boundary Verdict

- 五个 P0 的静态修复边界均有失败测试、实现证据、两轮不同重点复核和全量门禁；无剩余 blocking static finding，可按 standing authorization 执行当前任务可审查提交、ff-only 合入 master、fresh-master 门禁、普通 push 和隔离资源清理。
- 任一 pre-commit/module closeout/pre-push、fresh-master test/build、remote sync 或 cleanup 失败，均不得领取 RC-05。
- database apply/read/write、runtime acceptance、browser/e2e、Provider、依赖、PR、force push 和 deployment 仍未授权。
