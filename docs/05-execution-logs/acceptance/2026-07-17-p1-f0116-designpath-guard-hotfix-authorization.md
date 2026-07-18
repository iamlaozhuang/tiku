# P1 F-0116 Design Path Guard Hotfix Authorization

Status: approved

Task ID: `p1-f0116-designpath-guard-hotfix-2026-07-17`

Parent task: `p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`

Base: `ce6aef7b30c82f459ccfdc06782eda9bc720c15d`

Branch: `codex/p1-f0116-designpath-guard-hotfix`

Human approval source: current user message。用户已明确允许创建独立治理热修任务，严格限定为修复 pre-push 编排、P1/Module 守卫及对应 smoke tests；并再次批准 F-0116 方案 A 继续推进。

授权仅允许：

- 让普通 P1 任务转换把当前 task 明确声明的 `designPath` 视为治理 artifact；
- 为本热修建立固定 base、branch、单 parent、精确十文件的一次性 P1/Module transition-only 路径；
- 增加 P1、Module pre-commit、Module pre-push 对应 smoke。

`ancestorCheckpoint: only_after_transition_only_guard_pass`

`otherInProgressShaDrift: hard_block`

`hookBypass: prohibited`

`qualityGateReduction: prohibited`

不授权产品源码、依赖、schema/migration、数据库、Provider、runtime/browser、P2、PR、force push 或部署。

## Exact Files

1. `docs/05-execution-logs/acceptance/2026-07-17-p1-f0116-designpath-guard-hotfix-authorization.md`
2. `docs/05-execution-logs/task-plans/2026-07-17-p1-f0116-designpath-guard-hotfix.md`
3. `docs/05-execution-logs/evidence/2026-07-17-p1-f0116-designpath-guard-hotfix.md`
4. `docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0116-designpath-guard-hotfix.md`
5. `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
6. `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
7. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
8. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
9. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
10. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
