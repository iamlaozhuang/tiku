# 2026-06-11 Module Run V2 Stop Envelope Normalization Plan

## 目标

修复 runner 把 `seed_proposal_available` 误归类为 `hard_block` 的问题，并在 runner terminal output 中增加标准 stop envelope。

## 修改范围

- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- 本任务 evidence / audit review

## 实现要点

- 保留 `stopTaxonomy` 兼容字段。
- 新增输出字段：`runnerSeverity`、`requiresHuman`、`safeToProceed`、`nextCommand`、`stateWritten`、`noWriteReason`、`resumePointer`。
- `seed_proposal_available` 不再落到 `hard_block`：
  - 未检测到 standing approval：`runnerSeverity: approval_required`，`stopTaxonomy: approval_missing`。
  - standing approval 可用但 PlanOnly：`runnerSeverity: auto_recoverable`，`stopTaxonomy: approval_missing`。
- 输出三行人类结论：`Why stopped`、`Risk if auto-continued`、`Next action`。

## 验证

- `.\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- 当前仓库 PlanOnly runner，确认 `seed_proposal_available` 不再显示 `stopTaxonomy: hard_block`。
- `git diff --check`
- targeted Prettier check
- `npm run lint`
- `npm run typecheck`

Cost Calibration Gate remains blocked.

Mechanism anchors: `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-mechanic-2`.
