# P0 RC-08 企业训练完整性整改证据

status: ready_for_branch_closeout

result: pass

staticResult: static_remediation_pass_runtime_pending

Business closeout commit: `e136ca28acde82282a17c65ccfb828a01e872c0b`（schema commit `897a1b4e0` 保持独立）。

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

## Requirement Mapping Result

- F-0121、F-0123、F-0145 与当前 `78da56891d82883de2384438b03c6ab4d4444cfd` 已完成重基线；三项均保持 P0，当前状态为 `baseline_changed`。
- SSOT 要求 canonical editable draft、immutable published version、single submit、`short_answer` default AI scoring 和 analytics official-submission-only；未发现冲突。
- schema/migration 仅允许 source authoring/static test/commit；database、Provider、worker activation 和 RV-0020 仍未批准。
- schema/migration source approval：`docs/05-execution-logs/acceptance/2026-07-15-p0-remediation-schema-migration-source-approval.md`；本任务沿用该已物化批准与用户本次再次确认。

## Baseline Recovery

- master/origin/live remote：`78da56891d82883de2384438b03c6ab4d4444cfd`，clean。
- RC-08 branch/worktree：`codex/p0-rc-08-organization-training-integrity` / `D:\tiku\.worktrees\p0-rc-08`。
- baseline full unit：`397/397` files、`2370/2370` tests passed，`--maxWorkers=4`。
- audit：`a84224fa12ec85b28e6acd945deba2afa28c6c02`，clean，只读。

## RED / GREEN

- RED：`p0-rc-08-schema-migration-source.test.ts` 初跑 `5/5` 失败，稳定证明 canonical draft status/revision/snapshot、单 draft 单 version、answer operation/revision、non-terminal scoring 状态、durable scoring task 与 migration chain 均不存在。
- Schema GREEN：新增 additive schema 与 `20260715231500_p0_rc_08_organization_training_integrity.sql`、snapshot、journal；RC-01/02/04/05/06/07/08 migration chain 加 organization training schema 测试 `8/8` files、`40/40` tests passed，typecheck passed。
- Business GREEN：canonical draft/save/publish/answer/scoring/analytics 边界完成；最终 focused `11/11` files、`198/198` tests passed。

## Validation Log

- 领取时 P0 serial guard 首次正确阻断缺少 evidence/audit 和 queue canonical order 漂移；补齐后 manual/pre-commit guard 与 Module Run v2 hardening passed，claim commit `5f519f8a0`。
- source generation：为 Drizzle Kit 注入不可达的合成占位连接串后执行 `drizzle-kit generate --name p0_rc_08_organization_training_integrity`；该命令只比较 schema snapshot 并生成 source，未连接数据库、未 apply/migrate/backfill/seed，证据不记录连接串内容。
- schema focused：`vitest run tests/unit/p0-rc-08-schema-migration-source.test.ts src/db/schema/organization-training.test.ts` passed，`19/19`。
- migration chain + typecheck：passed，`40/40` tests；`tsc --noEmit` passed。
- 首轮全量分片暴露 5 个旧契约断言（draft mapper 新字段、员工请求旧 count/score、管理端 evidence 可编辑及 publish 旧大载荷），均只按新的服务端权威契约修正；对应定向测试分别通过。
- Round 1 对抗复核发现并修复：客户端编辑后 evidence 未同步降级；scoring completion 未绑定 canonical 逐题基线；过期 lease worker 仍可能回写。新增 RED 后，canonical question result input、租约时限、objective fact 防篡改和 terminal answer 条件更新均通过。
- Round 2 对抗复核发现并修复：draft save、consumed publish、terminal submit 的 service 预检查会阻断同 operation 响应丢失重放。修复后 stale-looking retry 进入事务幂等权威，同 operation 返回原结果、异 operation 仍冲突。
- 最终 focused：`11/11` files、`198/198` tests passed。
- 最终 full unit 使用四个互斥 shard、相同测试集合、`--maxWorkers=4`：`100/535`、`100/513`、`100/672`、`100/666`，合计 `400/400` files、`2386/2386` tests passed。
- `lint`：passed，0 warnings；`typecheck`：passed；`format:check`：passed；`next build`：passed，93/93 static pages generated。
- `git diff --check`：passed；依赖与 lockfile 未变化；business commit 尚待 pre-commit gate。
- P0 serial manual guard：passed，current RC-08、next global static regression/freeze。
- Module Run v2 pre-commit 首次正确阻断 3 个未登记的新文件；确认均为本 RC 的 operation-id、persistence-conflict 与测试后补入精确 allowlist，重跑 passed；未扩大依赖、数据库或 runtime 权限。

### Branch closeout command record

- `git diff --check`：pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationSerialProgram.ps1 -Phase manual`：pass。
- `corepack pnpm@10.15.1 exec vitest run tests/unit/p0-rc-08-organization-training-integrity.test.ts tests/unit/p0-rc-08-schema-migration-source.test.ts --reporter=dot`：pass。
- `corepack pnpm@10.15.1 exec vitest run src/db/schema/organization-training.test.ts src/server/validators/organization-training.test.ts src/server/mappers/organization-training-mapper.test.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts src/server/repositories/organization-analytics-repository.test.ts --reporter=dot`：pass。
- `corepack pnpm@10.15.1 exec vitest run --maxWorkers=4 --reporter=dot`：pass，`400/400` files、`2386/2386` tests。
- `corepack pnpm@10.15.1 run lint`：pass。
- `corepack pnpm@10.15.1 run typecheck`：pass。
- `corepack pnpm@10.15.1 run format:check`：pass。
- `corepack pnpm@10.15.1 run build`：pass，93 pages。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p0-remediation-rc-08-organization-training-integrity-2026-07-14`：pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p0-remediation-rc-08-organization-training-integrity-2026-07-14`：本记录提交后重跑。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p0-remediation-rc-08-organization-training-integrity-2026-07-14 -SkipRemoteAheadCheck`：module closeout 通过后重跑。

## Fresh Master Closeout

- `master` 已以 `--ff-only` 合入 RC-08 claim、schema 与 business commits；验证基线：`e136ca28acde82282a17c65ccfb828a01e872c0b`。
- master 本地依赖首次 focused gate 因旧 `node_modules` 缺少 Vitest 未执行；随后 `CI=true corepack pnpm@10.15.1 install --offline --frozen-lockfile` 完整复用 741 个 locked packages，未修改 package/lockfile。
- fresh focused：`9/9` files、`178/178` tests passed。
- fresh full unit：`400/400` files、`2386/2386` tests passed，`484.73s`，`--maxWorkers=4`。
- fresh serial quality gates：lint zero warnings、typecheck、format check、build passed；build 生成 `93/93` 个静态页面。
- `git diff --check` 与 P0 serial manual guard：passed；依赖、lockfile 与 tracked worktree 均无变化。
- RC-08 branch/worktree 与 audit repository 在 closeout state commit 前保持 clean；audit HEAD 保持 `a84224fa12ec85b28e6acd945deba2afa28c6c02`。
- `origin/master` 与实时远端仍为 `78da56891d82883de2384438b03c6ab4d4444cfd`；尚未 push，隔离资源尚未清理。
- fresh/full/quality/两轮复核均通过后，RC-08 已显式转为 `ready_for_closeout`；未在 origin sync 与隔离资源清理前提前标记 closed。

## Finding Remediation Conclusions

| finding | task-entry status                              | branch static conclusion                                                                                                                | runtime boundary |
| ------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| F-0121  | baseline_changed                               | static_remediated：publish 仅消费 server canonical draft；客户端不能声明 evidence/count/score/authorization truth                       | RV-0020 pending  |
| F-0123  | baseline_changed（保留 root cause alias 关系） | static_remediated：单 draft 单 version、事务 consume、同 operation replay、异 operation/revision/concurrency conflict                   | RV-0020 pending  |
| F-0145  | baseline_changed                               | static_remediated：answerItems 为唯一输入；服务端计数/客观评分，short_answer durable scoring，analytics 仅消费 submitted terminal score | RV-0020 pending  |

## Review Log

- Round 1：passed；根因、权威写路径、事务、revision、evidence、scoring lease 与数据兼容已复核，三个复核发现均已修复并回归。
- Round 2：passed；跨角色状态、API/枚举、响应丢失重放、analytics、隐私、P1/P2 影响与反向破坏已复核，无未解决 P0 静态回归。

## P1/P2 Impact Mapping Only

- potentially covered：F-0122、F-0028、F-0099、F-0124、F-0125、F-0144、F-0147、F-0166、F-0167。
- semantic change：F-0022、F-0033、F-0042、F-0126、F-0127。
- P0 后重新复验；本任务不关闭、降级或实现上述 P1/P2。

## Non-Actions

- 未执行 database apply/read/write/backfill/seed、Provider、secret/env、worker activation、runtime/browser/e2e。
- 未修改依赖、lockfile、`D:\tiku-readonly-audit`；未创建 PR、force push 或部署。

## 品味合规自检 Checklist

- [x] glossary、snake_case、camelCase、publicId 与 API envelope 保持一致。
- [x] api → service → repository → model 分层保持；事务权威位于 repository。
- [x] UI 使用既有 design tokens，未新增硬编码颜色、inline style 或主题判断。
- [x] 未暴露 numeric id、standard_answer 提前事实、secret、raw Prompt 或 Provider payload。
- [x] 越权、跨 organization、非法状态、并发、失败、重试、回滚、幂等、null/空集合与异常输入均有对抗覆盖。
- [x] migration 仅源码与静态测试，未越过 database/runtime approval boundary。

localFullLoopGate: pass_fresh_master_attached_prepush_origin_sync_and_cleanup_pending

Cost Calibration Gate remains blocked.

threadRolloverGate: continue_same_goal

nextModuleRunCandidate: `p0-remediation-global-static-regression-baseline-freeze-2026-07-14`
