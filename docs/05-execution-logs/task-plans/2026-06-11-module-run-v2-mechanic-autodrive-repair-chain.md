# 2026-06-11 Module Run V2 自动驾驶机制串行修复总计划

## 目标

按审计报告 backlog 串行完成 Module Run V2 自动驾驶机制修复：stop envelope、standing auto-seed、terminal finalizer、MECE self-review、diagnostic noise、state source ownership、stop economics metrics。

## 执行边界

- 当前分支：`codex/mechanism-autodrive-repair-chain`。
- 每个任务独立 task plan / evidence / audit review / commit。
- 不执行 provider、env/secret、schema migration、deploy、PR、force push 或 Cost Calibration Gate。
- 不创建产品实现 seed transaction，不领取业务实现任务。
- 最终不自动 push；除非获得新的明确 push 批准。

## 串行任务

1. `mechanism-stop-envelope-normalization`
2. `mechanism-standing-auto-seed-consumption`
3. `mechanism-terminal-finalizer-contract`
4. `mechanism-seed-mece-self-review`
5. `mechanism-diagnostic-noise-budget`
6. `mechanism-state-source-ownership-map`
7. `mechanism-stop-economics-metrics`

## 全链验证

- `git diff --check`
- targeted Prettier check
- `npm run lint`
- `npm run typecheck`
- runner / seed / finalizer / next-action / metrics smoke scripts
- targeted anchor check: `seed_proposal_available`, `approval_required`, `auto_recoverable`, `standingUnattendedLocalCloseoutApproval`, `MECE`, `finalizer`, `nextCommand`, `Cost Calibration Gate remains blocked`

Cost Calibration Gate remains blocked.

Mechanism anchors: `tiku-module-run-v2-autopilot`, `tiku-module-run-v2-mechanic-2`.
