# P0 RC-06 AI 配置、任务执行与结果真实性证据

status: ready_for_branch_closeout

result: pass

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

## Requirement Mapping Result

- stable SSOT、最新 traceability、AI baseline recovery、九角色 catalog、原始 finding 与当前代码已按来源层级和时间序核对。
- 未发现无法消解的需求冲突；Provider/secret/database/runtime 权限边界保持阻断。
- implementation target：governed config/secret adapter、durable scoring task/provenance、honest unavailable、super/ops 治理入口。

## Baseline Recovery

- source branch/HEAD：`master` / `f3af180ee9be32ec8d74ef3a297ed4bf2072dc0e`
- RC-06 branch/worktree：`codex/p0-rc-06-ai-config-execution-provenance` / `D:\tiku\.worktrees\p0-rc-06`
- `master...origin/master`：`0 0`
- live remote `refs/heads/master`：`f3af180ee9be32ec8d74ef3a297ed4bf2072dc0e`
- RC-05 worktree/short branch：absent / absent
- audit：`feat/calibration` / `a84224fa12ec85b28e6acd945deba2afa28c6c02` / clean / `git fsck --no-dangling` pass
- RC-06 baseline full unit：`387/387` files、`2289/2289` tests passed，`388.36s`

## Revalidation

| finding | status           | evidence summary                                                                                                                                                     |
| ------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-0062  | baseline_changed | RC-04/05 changed mock/student services, but default answer-length scoring, missing persistent queue/timeout and split retry remain                                   |
| F-0101  | confirmed        | governance component still has no production route/menu                                                                                                              |
| F-0102  | confirmed        | secret input is discarded to last4/configured; no secret writer/resolver; runtime remains local_mock/env split; connection test is synthetic success without adapter |
| F-0134  | root_cause_alias | retrieval baseline changed, but practice/mistake fixed prose, length score and fake provenance remain; alias F-0062 is not duplicate/resolved                        |

## Approval Boundary

- schema/migration source authoring、static test、commit：approved by current user。
- local commit、ff-only master merge、origin/master push、post-sync cleanup：standing task authorization。
- database apply/read/write、secret/env、Provider/model request、worker activation、runtime/browser/e2e：blocked。
- dependencies、PR、force push、deployment、Cost Calibration：blocked。

## Validation Log

- schema/migration/chain focused：`41/41` passed；包含 RC-01 至 RC-06 Drizzle chain、首个 task migration 与 single-owner correction migration。
- final RC-06 focused：`24/24` files、`215/215` tests passed。
- final full unit：`393/393` files、`2322/2322` tests passed，`274.70s`。
- `corepack pnpm@10.15.1 run lint`：passed。
- `corepack pnpm@10.15.1 run typecheck`：passed。
- `corepack pnpm@10.15.1 run format:check`：passed。
- `corepack pnpm@10.15.1 run build`：passed；93 个静态页面生成，`/ops/ai-governance` 与 mock/practice/model routes 存在。
- `git diff --check`：passed。
- P0 serial manual guard：passed；current RC-06、next RC-07。
- migration source：`drizzle/20260715200303_p0_rc_06_ai_scoring_task.sql` 与 `drizzle/20260715205720_p0_rc_06_ai_scoring_task_single_owner.sql`；snapshot chain 为 `20260715200303_snapshot.json` → `20260715205720_snapshot.json`，journal idx 27/28。
- migration source 仅经 schema/static test 验证；使用无效 dummy URL 只进行 source generation，未连接或读取数据库、未执行 migrate/apply/push/backfill/seed。
- 一次并行 lint/typecheck/format/build 因 Windows `node_modules` 文件锁返回 EPERM；该结果作废。等待残留只读进程结束后四项均串行重跑并通过。
- branch Module Run v2 pre-commit hardening 与 pre-push readiness：pass；closeout readiness 首次按预期识别 evidence/audit 机器可读锚点缺失，补齐后重跑。fresh master 门禁仍在合入之后。

### Branch closeout command record

- `git diff --check`：pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationSerialProgram.ps1 -Phase manual`：pass。
- `corepack pnpm@10.15.1 exec vitest run tests/unit/p0-rc-06-ai-config-execution-provenance.test.ts tests/unit/p0-rc-06-schema-migration-source.test.ts --reporter=dot`：已由更大的 final focused 集覆盖并通过。
- `corepack pnpm@10.15.1 run test:unit`：pass，`393/393` files、`2322/2322` tests。
- `corepack pnpm@10.15.1 run lint`：pass。
- `corepack pnpm@10.15.1 run typecheck`：pass。
- `corepack pnpm@10.15.1 run format:check`：pass。
- `corepack pnpm@10.15.1 run build`：pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p0-remediation-rc-06-ai-config-execution-provenance-2026-07-14`：pass；补齐 `ai-mock-provider-runtime.ts` allowlist，并缩短无敏感语义的测试 fixture 后通过。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p0-remediation-rc-06-ai-config-execution-provenance-2026-07-14`：pass；首次机器可读锚点缺失已补齐并重跑通过。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p0-remediation-rc-06-ai-config-execution-provenance-2026-07-14 -SkipRemoteAheadCheck`：pass。

## RED / GREEN

- RED：schema export `aiScoringTask` / `aiScoringTaskStatusValues` 不存在；RC-06 migration source 数量为 `0`，`6` 个预期测试失败。
- GREEN：新增 durable FIFO `ai_scoring_task`、固定 `max_attempt_count=3`、`timeout_second=60`、answer FK、idempotency/FIFO/lease indexes 以及 model/prompt/input/authorization snapshots；后续 single-owner correction 确保一个 answer 只有一个 task lifecycle。
- RED/GREEN：secret input 原先在 validator 被销毁；改为只传 injected writer，invalid/missing writer 返回 `503641`，repository 仅存 opaque ref/last4/status。
- RED/GREEN：connection test 原先由 metadata 伪造 12ms 成功；改为 injected synthetic executor，missing secret/adapter/disabled config 均失败且不自动停用。
- RED/GREEN：治理组件无路由、默认 capability 为 true、无 callback 本地伪成功；新增受保护入口并把 capability 缺省改为 false，移除本地 fake save/test。
- RED/GREEN：default mock/practice/mistake/owner/learning paths 产生长度分、固定文案或 fake provenance；全部改为 governed-only 或 explicit unavailable。
- RED/GREEN：durable task 补 FIFO claim、lease recovery、manual retry、max-three attempts、timeout、success fixation、call provenance 与 invalid score rejection。
- 第一轮复核共修正 9 项：missing call provenance、lease recovery、provider mode、authorization snapshot、standalone scope、invalid result/unrelated log、single-owner、recovery bypass、attempt original time。
- 第二轮复核共修正 4 项：UI capability fail-open、practice indefinite pending、retry route 固定 blocked、finding ledger 错位 rationale。

## Migration Source Isolation

- approval：`docs/05-execution-logs/acceptance/2026-07-15-p0-remediation-schema-migration-source-approval.md`，用户再次确认“批准审批请求”。
- schema checkpoint：`78054149b feat(ai-scoring): add durable task migration source`。
- correction 独立 commit：`f42ba551a fix(ai-scoring): enforce single task lifecycle`；scope 为 schema unique index、single-owner SQL、snapshot/journal chain 与 schema/static tests，不夹带业务实现。
- compatibility：首个 migration 只新增 enum/table/index/FK/check，第二 migration 只新增 single-answer unique index；不改写或删除现有列与数据。历史重复数据诊断/清理及 database apply 仍需 fresh approval。

## Static Remediation Proof

- F-0101：正式 `/ops/ai-governance` 路由、OPS menu 与 role overview 可发现；super 写/测/Prompt 全文、ops 脱敏只读由 UI capability 与服务端 role guard 双层约束。
- F-0102：raw secret 只在 injected writer 调用期间存在；普通持久层只写 opaque ref/last4/status。owner preview 不读 `process.env`/`ALIBABA_API_KEY`；无 adapter/secret 不再返回成功。
- F-0062：mock submit 先锁定 governed model/prompt/RAG/authorization facts，再与 answer/mock/task 原子写入；HTTP 不执行 Provider。worker contract 执行 60 秒 timeout、persistent attempt、call-log provenance 和 score validation；failed task 由 actor/mock scope 下 DB-only retry 重置，第三次后不可再认领。
- F-0134：practice 不再按答案长度给分或返回固定讲解/提示；mistake-book default 不再构造 fake request/output；UI 明确 unavailable，不把 placeholder 当 AI success。
- result success 必须匹配 task、attempt、model config、Prompt key/version、actor、mock、answer 与 success scoring call log；API/日志不暴露 internal id、secret ref、raw Prompt/Provider payload。
- RC-07 下游保留：mock/answer/report 最终聚合、评分结果证据快照和报告 UI；不因本 RC task source 存在就提前关闭 RC-07 findings。

## Review Log

- Round 1：pass — root cause/diff、secret boundary、task transaction/lease/retry/idempotency、provenance、schema/data compatibility。
- Round 2：pass — super/ops/student/org handoff、UI/API fail-closed、mock/practice/mistake/owner honesty、P1/P2 boundary 与 full regression。
- 详细记录：`docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-rc-06-ai-config-execution-provenance.md`。

## P1/P2 Impact Mapping Only

- potentially covered：F-0021、F-0038、F-0039、F-0063、F-0091、F-0105、F-0150、F-0156、F-0160、F-0174、F-0177、F-0178。
- semantic change：F-0103、F-0104。
- all deferred to post-P0 revalidation; no finding closed or downgraded here.

## Non-Actions

- 未修改或执行数据库；未读取真实 secret/env；未调用 Provider；未激活 worker。
- 未执行 runtime/browser/e2e；未修改依赖/package/lockfile；未创建 PR、force push 或部署。
- 未修改 `D:\tiku-readonly-audit` 或原始 finding 状态；未进入 RC-07/P1/P2。

Cost Calibration Gate remains blocked.

threadRolloverGate: continue_same_goal_after_rc_06_closeout

nextModuleRunCandidate: `p0-remediation-rc-07-answer-mock-scoring-report-2026-07-14`

## Finding Remediation Conclusions

| finding | task-entry status | branch static conclusion                        | runtime boundary                       |
| ------- | ----------------- | ----------------------------------------------- | -------------------------------------- |
| F-0062  | baseline_changed  | static_fixed；RC-07 继续最终状态/报告聚合       | RV-0012/RV-0021 pending；worker 未激活 |
| F-0101  | confirmed         | static_fixed                                    | RV-0017 pending                        |
| F-0102  | confirmed         | static_fixed                                    | RV-0017、真实 secret/Provider pending  |
| F-0134  | root_cause_alias  | static_fixed；仍保持 alias F-0062、非 duplicate | RV-0021 pending                        |

## 品味合规自检 Checklist

- [x] 命名遵循 glossary；数据库 snake_case、API camelCase、publicId 外部标识。
- [x] API 使用标准 envelope、null/[]，未暴露 numeric id、secret ref、raw Prompt/Provider IO。
- [x] 分层保持 api → service → repository → model；fixture 与 production execution 明确隔离。
- [x] UI 仅使用既有 design tokens，无纯黑/魔法颜色或 JS 主题判断。
- [x] 并发、事务、权限、失败、重试、边界输入与两轮对抗复核已覆盖。
- [x] migration 仅源码/静态测试，未越过 database/runtime approval boundary。

localFullLoopGate: pass_branch_gates_fresh_master_pending
