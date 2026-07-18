# P1 F-0116 Scope-Correction Guard Hotfix Plan

**Goal:** 以一次精确治理提交物化已批准的两个 F-0116 smoke allowlist correction，并让 P1/Module/pre-push 只对该单父、transition-only 提交接受 ancestor checkpoint；其他 `in_progress` SHA 漂移继续 hard-block。

**Architecture:** 热修固定 base、branch、parent task 与 12 文件集合。state 只同步已通过 transition-only 的 F-0116 design checkpoint 和已批准规格 gate；queue 只增加两个 smoke 路径并同步已批准 gate。P1/Module pre-commit 只识别这组精确 staged 内容；P1 pre-push 仅对该 exact commit 输出 `transition_only`；Module pre-push 另行验证 exact-one-parent、parent/base、文件集和授权 materialization。

## Allowed Files

1. `docs/04-agent-system/state/project-state.yaml`
2. `docs/04-agent-system/state/task-queue.yaml`
3. `docs/05-execution-logs/acceptance/2026-07-18-p1-f0116-scope-correction-guard-hotfix-authorization.md`
4. `docs/05-execution-logs/task-plans/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md`
5. `docs/05-execution-logs/evidence/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md`
6. `docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md`
7. `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
8. `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
9. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
10. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
11. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`

## Blocked Files

- 产品源码与产品测试内容、依赖/lockfile、schema/migration、数据库、Provider、runtime/browser、P2、PR、force push、deploy。
- wildcard allowlist、普通 `in_progress` ancestor fallback、hook bypass、质量门禁降级。

## TDD Steps

1. RED：在三套 smoke 中声明新的 exact-scope marker/topology，确认生产守卫缺失时失败。
2. GREEN：复用 F-0116 designPath hotfix 的一次性 file-set/review/topology 模式，增加 state/queue exact projection 校验。
3. 对抗矩阵：wrong base/branch/task/status、partial stage、extra/missing file、queue/state 多改、invalid approval、standard mode、replay、多 parent、普通 SHA drift 均失败。
4. 运行 PowerShell parser、三套完整 smoke、P1/P0/Module gates、`git diff --check`；两轮审查后才提交。

## Stop Conditions

- 无法把热修限定为 12 个精确文件；
- 需要允许产品文件或 wildcard state/queue 漂移；
- 无法证明 `transition_only` + exact-one-parent 才能使用 ancestor checkpoint；
- 任何普通 `in_progress` SHA drift 变为可通过。
