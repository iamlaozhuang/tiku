# P0 RC-08 企业训练完整性整改证据

status: in_progress

result: pending

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
- Business GREEN：pending。

## Validation Log

- 领取时 P0 serial guard 首次正确阻断缺少 evidence/audit 和 queue canonical order 漂移；补齐后 manual/pre-commit guard 与 Module Run v2 hardening passed，claim commit `5f519f8a0`。
- source generation：为 Drizzle Kit 注入不可达的合成占位连接串后执行 `drizzle-kit generate --name p0_rc_08_organization_training_integrity`；该命令只比较 schema snapshot 并生成 source，未连接数据库、未 apply/migrate/backfill/seed，证据不记录连接串内容。
- schema focused：`vitest run tests/unit/p0-rc-08-schema-migration-source.test.ts src/db/schema/organization-training.test.ts` passed，`19/19`。
- migration chain + typecheck：passed，`40/40` tests；`tsc --noEmit` passed。

## Finding Remediation Conclusions

| finding | task-entry status                              | branch static conclusion | runtime boundary |
| ------- | ---------------------------------------------- | ------------------------ | ---------------- |
| F-0121  | baseline_changed                               | pending                  | RV-0020 pending  |
| F-0123  | baseline_changed（保留 root cause alias 关系） | pending                  | RV-0020 pending  |
| F-0145  | baseline_changed                               | pending                  | RV-0020 pending  |

## Review Log

- Round 1：in_progress。
- Round 2：pending。

## P1/P2 Impact Mapping Only

- potentially covered：F-0122、F-0028、F-0099、F-0124、F-0125、F-0144、F-0147、F-0166、F-0167。
- semantic change：F-0022、F-0033、F-0042、F-0126、F-0127。
- P0 后重新复验；本任务不关闭、降级或实现上述 P1/P2。

## Non-Actions

- 未执行 database apply/read/write/backfill/seed、Provider、secret/env、worker activation、runtime/browser/e2e。
- 未修改依赖、lockfile、`D:\tiku-readonly-audit`；未创建 PR、force push 或部署。
