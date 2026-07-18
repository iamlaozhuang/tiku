# P1 F-0116 Design Path Guard Hotfix Plan

**Goal:** 让 P1 governance-only task transition 接受当前任务显式声明的 `designPath`，同时保持所有其他实现文件、重放、多提交和普通 `in_progress` SHA 漂移 hard-block。

**Architecture:** P1 transition allowlist 从固定的 scope control、plan/evidence/audit/fresh approval 扩展为再读取当前 task 的一个 `designPath` scalar；空值仍忽略，路径仍经过 canonical repository path 校验。热修自身使用固定 base、branch、parent task、精确十文件、一次性授权和完整 review contract。P1 pre-push 只有在该精确提交通过后输出 `transition_only`；Module pre-push 只有收到该信号并独立验证 exact-one-parent topology 后才接受 ancestor checkpoint。

**Tech Stack:** PowerShell、disposable Git fixtures、现有 P1/Module Run v2 guards。

---

## Allowed Files

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

## Blocked Files

- state/queue、产品源码与测试、依赖与 lockfile、schema/migration、数据库、Provider、runtime/browser、P2、PR、force push、deploy。

## TDD Steps

1. RED：在 P1 smoke 的 disposable transition fixture 中增加 task `designPath` 和第六个 design artifact，确认当前守卫报 `P1_PROGRAM_TRANSITION_FILE_SCOPE_INVALID`。
2. GREEN：只把当前 task 的 `designPath` 加入 transition allowlist；增加缺失声明、额外未声明 spec、产品文件负例。
3. 为本热修增加 P1/Module exact-scope 识别与 pre-push exact-one-parent smoke，证明 replay、wrong parent、extra commit、extra file 和 ordinary drift 均失败。
4. 运行 6 parser、三套完整 smoke、P1/P0/Module 门禁与 `git diff --check`。

## Stop Conditions

- 需要 wildcard 接受 `docs/superpowers/**`、允许多个 design artifact、接受未声明路径或修改普通 SHA 规则；
- 无法证明本热修 exact one-parent 或无法保持 ordinary `in_progress` drift hard-block；
- 需要任何 blocked file 或 hook bypass。
