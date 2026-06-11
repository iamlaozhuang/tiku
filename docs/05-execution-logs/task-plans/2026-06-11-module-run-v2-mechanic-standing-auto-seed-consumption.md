# 2026-06-11 Module Run V2 Standing Auto-Seed Consumption Plan

## 目标

让 runner 在无 pending 且 seed proposal available 时，能够消费 `project-state.yaml` 中已批准的 `standingUnattendedLocalCloseoutApproval`，自动 apply 低风险本地 implementation seed transaction。

## 修改范围

- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- 本任务 evidence / audit review

## 实现要点

- 增加 state-driven approval statement resolver。
- `-PlanOnly` 永不写队列，只输出 `runnerSeverity: auto_recoverable` 和 `nextCommand`。
- 非 PlanOnly 且 standing approval 满足时，自动使用 state approval statement 执行 seed transaction。
- auto-seed 后仍停在 `seed_transaction_applied -> closeout_auto_seed_transaction`，不直接领取 seeded task。

## 验证

- runner smoke fixture 覆盖 standing approval 自动 seed。
- `git diff --check`
- targeted Prettier check
- `npm run lint`
- `npm run typecheck`

Cost Calibration Gate remains blocked.

Mechanism anchors: `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-mechanic-2`.
