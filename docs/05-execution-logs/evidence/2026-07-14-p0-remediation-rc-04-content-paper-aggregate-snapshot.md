# P0 RC-04 Evidence

Date: 2026-07-15

Task: `p0-remediation-rc-04-content-paper-aggregate-snapshot-2026-07-14`

Status: `ready_for_closeout`

result: pass

## Baseline And Recovery

- claim base/master/origin/live remote: `4d1d011d4a6c1fa63d2f2e547b0e4f9cda42af65`
- branch: `codex/p0-rc-04-content-paper-aggregate-snapshot`
- worktree: `D:/tiku/.worktrees/p0-rc-04`
- governance checkpoint: `5aeb7331b`
- approved schema/migration source checkpoint: `813d7641a`
- implementation checkpoint: `14f8e4c5029118fafe0cb29c83f973676a13b0f9`
- RC-03 origin sync、worktree cleanup、short branch cleanup：pass。
- `D:/tiku-readonly-audit`：`a84224fa12ec85b28e6acd945deba2afa28c6c02`，clean/read-only。
- 审计 baseline 到当前源 baseline 的 RC-04 目标差异已映射；五个 finding 均保持 confirmed，未无依据推翻全审计。

## Reading Evidence

status: complete

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

conflictsFound: false

已按 task plan 完整读取 AGENTS、品味十诫、ADR-001～ADR-007、题库/试卷与 AI 评分 SSOT、traceability、五个原始 finding、runtime backlog、RC-03 evidence、standing authorization 与 schema/migration source approval。未使用 Subagent。

## Requirement Mapping Result

| finding | status    | static remediation conclusion                                                                                                                                                         |
| ------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-0050  | confirmed | 题目/材料编辑保留受支持 rich text、表格和受管图片标记；列表与独立编辑页均携带 `expectedUpdatedAt`；repository 以毫秒 API 精度 CAS 且单调推进 `updated_at`，陈旧或锁定写不覆盖新内容。 |
| F-0051  | confirmed | 共享题型评分联合合同覆盖 UI、content integrity、API validator、发布与 learner consumer；客观题只 auto、三类主观题只 AI、填空题二选一、partial rule 仅多选题。                         |
| F-0092  | confirmed | paper revision/status CAS、事务内子写与小计、持久 `paper_command`、response-loss replay、copy/add/publish 原子边界、start/archive 行锁和失败回滚已建立。                              |
| F-0093  | confirmed | `question_group.public_id` 成为一等身份；显式 create/join；母题实际 material 与 group material、paper、paper_section 对账；copy 对当前母题/material 再取快照并 fail closed。          |
| F-0171  | confirmed | 学员 snapshot 一等复制 `paper_scoring_point` public id、描述、分值和顺序；mock 对缺失、重复、非法顺序/分值/合计 fail closed，删除 overall fallback。                                  |

以上均为静态整改结论，不代表 RV-0011、RV-0012、RV-0015、RV-0021 或任何业务运行时验收通过；原始 finding、风险级别和只读审计状态未改写。

## Implementation Proof

- rich text 编辑不再在加载阶段用纯文本剥离函数破坏 HTML；question option、stem、analysis、standard answer 与 material content 原样 round-trip。
- question/material PATCH 的版本条件同时包含 public id、`is_locked=false` 和 API 毫秒精度 `expectedUpdatedAt`；成功时间至少推进 1ms，同毫秒重复写也只能一个成功。
- `question-scoring-contract` 统一七题型的 scoring method 与 multi-choice rule；编辑旧非法组合时恢复可修复默认值，发布和 learner snapshot 对未知枚举 fail closed。
- paper 聚合根新增单调 revision；metadata、add/update/remove、publish、archive、delete 均以 expected revision/status 条件写；子写、评分点和小计处于同一 transaction。
- create/copy/add/publish 持久化 canonical SHA-256 request hash；actor/kind/hash 不一致返回稳定冲突；replay 在可变状态与 source 复验前返回原结果，UI 对相同失败 payload 复用 command public id。
- copy 先锁定 source paper revision/status，再按稳定顺序锁全部 source question，后锁 material，避免与 add/publish 的 question→material 顺序形成死锁；任一 section/group/question/material 缺失均回滚整个副本。
- group create/join 使用稳定 public id；加入时 group material 必须等于当前母题 material；发布再次对账 group id、section 和 material；同材料不同组仍由显式新 group 表示。
- schema/migration source 新增 `paper.revision`、`question_group.public_id`、`paper_scoring_point.public_id`、`paper_command`；历史 child public id 使用随机 UUID，不从自增 id 推导；未连接或修改数据库。
- practice/mock create transaction 对 published paper 行持 share lock；archive 的状态更新先取得同一行排他锁并在同一事务终止未完成 session。
- learner snapshot 缺 question identity、正分值或 group public id 时抛出 integrity error；mock start/submit/retry 对完整且唯一的 question/scoring identity 集合复验。

## RED / GREEN

- rich text/CAS：独立编辑入口最初未携带 expected timestamp，陈旧写可覆盖；补齐 list/direct editor 契约和 repository CAS 后 GREEN。
- scoring union：非法 objective+AI、subjective+auto、非多选 partial、unknown enum 与非法 scoring point 先 RED；共享合同和 publish/consumer fail-closed 后 GREEN。
- aggregate：相同 revision 并发写、101st question、publish/add、delete/subtotal partial failure、response-loss replay 先 RED；revision CAS、transaction 和 command ledger 后 GREEN。
- copy/replay 复核发现 service 的状态预检挡住已提交命令 replay、copy 在 replay 前重验 source、composer 失败后生成新 command；修正后相同 payload/status 漂移仍返回单一结果。
- snapshot：生产 snapshot 未读取 paper scoring points、malformed entry 被过滤、missing identity 被丢弃、overall fallback 被伪造；一等复制和完整集合校验后 GREEN。
- material/group 复核发现 copy group 使用旧 group material snapshot，且 material→question 锁顺序可与 publish 成环；改为全部 question 先锁、current material 后锁并复验 group lineage 后 GREEN。

## Round 1 — Root Cause / Diff / Transaction / Security

status: pass

- 逐条追踪 content write、paper aggregate authority、command ledger、copy lineage、published snapshot 和 learner start 的权威路径；没有以 UI 可见性或内存状态代替数据库条件。
- revision/status/count/subtotal/publish/archive/delete/start 的原子边界和失败回滚成立；command replay 先于 mutable source/state 检查，same key/different payload 或 actor fail closed。
- question→material 锁顺序在 add、copy、publish 中一致；source question/options/scoring points 和 current material snapshot 在 share lock 下取得。
- 复核期间发现并修正：timestamp 微秒/毫秒永不相等与同毫秒双成功、copy source revision TOCTOU、add/publish lock-order、copy material snapshot漂移、service replay 被前置状态挡住、copy replay 被 source 预检挡住。
- rich text 接受面未扩展 student renderer；既有 sanitizer/StudentRichText 边界保持，未顺手整改 P1 F-0052。
- schema/migration source 仅静态编写与测试；未 apply、read、write、backfill 或 seed。

## Round 2 — Cross-role / State / API / Regression

status: pass

- content_admin 的 list/direct question/material editor、paper management/composer、publish/copy/archive 与 personal/org learner practice/mock 消费同一 public identity 和 scoring contract。
- 复核期间发现并修正：独立 question/material editor 漏传 expected timestamp；malformed scoring point 被静默过滤；missing/duplicate question identity 被丢弃；stale invalid active snapshot 被恢复；composer retry command id 未复用。
- API 保持 public id、camelCase、标准 envelope、`null`/`[]`；不暴露 numeric id、command hash、标准答案的额外边界、credential、raw prompt/provider payload。
- F-0024/F-0052/F-0053/F-0055/F-0056/F-0058/F-0074/F-0094/F-0095/F-0096/F-0098/F-0100/F-0155 仅记 potentially covered，F-0057/F-0073 仅记 semantic change；全部保留到 P0 后重基线，未提前关闭或降级。
- 未改 RC-05+、依赖、lockfile、env、外部配置、Provider、runtime acceptance、PR、force push 或 deployment。

## Validation Log

- focused affected regression：`24/24` files、`283/283` tests passed。
- final monolithic full unit：`385/385` files、`2274/2274` tests passed，`283.58s`，`--maxWorkers=4`。
- 两次早期默认并发 full run 分别暴露 phase-8/phase-20 UI 异步加载 flake；两个文件随后单 worker `2/2` files、`15/15` tests passed，最终 monolithic full run 全绿，未为无关 flake 修改产品语义。
- `corepack pnpm@10.15.1 run lint`：pass，zero warnings。
- `corepack pnpm@10.15.1 run typecheck`：pass。
- `corepack pnpm@10.15.1 run format:check`：pass。
- `corepack pnpm@10.15.1 run build`：pass；92 个静态页面生成，相关 content/paper/practice/mock routes 存在。
- `git diff --check`：pass。
- P0 serial manual guard：pass；current task RC-04，next task RC-05。
- branch pre-commit、module closeout、pre-push 与 fresh-master 门禁属于下述 closeout 动作；任一失败即阻止 RC-05 claim。

## Command Accounting

```text
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationSerialProgram.ps1 -Phase manual
corepack pnpm@10.15.1 exec vitest run tests/unit/p0-rc-04-content-paper-aggregate-snapshot.test.ts tests/unit/p0-rc-04-schema-migration-source.test.ts --reporter=dot
corepack pnpm@10.15.1 run test:unit
corepack pnpm@10.15.1 run test:unit -- --maxWorkers=4 --reporter=json
corepack pnpm@10.15.1 run lint
corepack pnpm@10.15.1 run typecheck
corepack pnpm@10.15.1 run format:check
corepack pnpm@10.15.1 run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p0-remediation-rc-04-content-paper-aggregate-snapshot-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p0-remediation-rc-04-content-paper-aggregate-snapshot-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p0-remediation-rc-04-content-paper-aggregate-snapshot-2026-07-14 -SkipRemoteAheadCheck
```

localFullLoopGate: pass_branch_gates_fresh_master_required_after_merge

## Approval Boundary

- schema/migration source authoring、generation、static test、isolated commit：approved and complete。
- database apply/read/write、fixture/seed、runtime/browser/e2e/Provider：blocked。
- dependencies、PR、force push、deployment：blocked。
- 普通 ff-only merge、origin/master push 与合入后 cleanup：task-level standing authorization 已物化；仍须先通过 branch/fresh-master gates。

## Non-Actions

- 未执行 database apply/read/write、fixture、seed、backfill 或历史数据诊断。
- 未执行 runtime/browser/e2e/Provider/Cost Calibration。
- 未修改依赖、package/lockfile、env/secret 或外部配置；未创建 PR、未 force push、未部署。
- 未修改 `D:/tiku-readonly-audit` 或原始 finding 状态。

Cost Calibration Gate remains blocked.

threadRolloverGate: continue_same_goal_after_rc_04_closeout

nextModuleRunCandidate: `p0-remediation-rc-05-knowledge-resource-rag-citation-2026-07-14`
