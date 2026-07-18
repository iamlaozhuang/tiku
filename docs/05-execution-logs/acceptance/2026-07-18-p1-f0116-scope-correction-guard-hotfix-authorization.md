# P1 F-0116 Scope-Correction Guard Hotfix Authorization

Status: approved

Task ID: `p1-f0116-scope-correction-guard-hotfix-2026-07-18`

Parent task: `p1-remediation-rc-02-employee-import-preflight-2026-07-17`

Base: `f6b14825f41a83b3f9dd3994ec9c1936876b12ff`

Branch: `codex/p1-f0116-scope-correction-hotfix`

Human approval source: current user message。用户已批准执行独立治理热修，精确限定为 F-0116 两个既有 smoke tests 的 allowlist correction、P1/Module/pre-push 守卫及对应 smoke；不授权产品能力扩张。

Approved allowlist corrections:

- `tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts`
- `tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`

`ancestorCheckpoint: only_after_transition_only_guard_pass`

`otherInProgressShaDrift: hard_block`

`hookBypass: prohibited`

`qualityGateReduction: prohibited`

不授权产品源码/测试内容、依赖、schema/migration、数据库、Provider、runtime/browser、P2、PR、force push 或部署。

## Exact Files

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
