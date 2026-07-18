# P1 F-0117 spec approval transition hotfix evidence

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

Cost Calibration Gate remains blocked.

已读取任务要求中的规范、ADR、F-0117 需求/授权/规格/计划、F-0116 一次性治理通道及受影响守卫与 smoke。

## Root-Cause Reproduction

Result: pass

三套 smoke 在生产实现前均因缺少 F-0117 one-time marker 失败；现有通用守卫会拒绝同任务 state/queue 自修改和普通 `in_progress` SHA 漂移。

## TDD Evidence

Result: pass

F-0117 exact positive 与 standard、missing/altered authorization、extra/product file、wrong base/topology、wrong parent/gate projection、ordinary unrelated SHA drift 负例均通过。历史 F-0116 fixture 的失败根因是它从当前 F-0117 runtime 复制 state/queue 建模历史 transition，且负例恢复再次引入当前 queue；现仅将该 disposable fixture 的 state/queue 固定到真实历史 transition commit `992fc119a`，生产 guard/topology contract 未修改。

## Validation Results

Result: pass

- P1 full smoke: pass (`15 positive, 81 negative`).
- Module pre-commit full smoke: pass.
- Module pre-push full smoke: pass.
- PowerShell parser（6 个 guard/smoke）: pass.
- P1 manual guard: pass.
- P0 global guard: pass.
- `npm.cmd run format:check`: pass.
- `git diff --check`: pass.

## Reviewer Remediation RED/GREEN

Result: pass

Review RED（commit `a937b6307`）：P1 与 Module pre-commit smoke 仅扫描 F-0117 marker；三处 guard 对 `Human approval source` 只校验 `current user message` 前缀，Module pre-push 未校验 standing source、exact Branch 与 Exact Files。

GREEN commands/output：

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1
exit 0, 296.6s
F-0117 P1 and Module pre-commit behavior smoke passed
Module Run v2 pre-commit hardening smoke passed

powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1
exit 0, 148.9s
Module Run v2 pre-push readiness smoke passed

powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1
exit 0, 843.6s
P1 remediation serial program guard smoke passed: 15 positive, 81 negative
```

Disposable pre-commit behavior matrix executes both P1 and Module guards for exact positive plus wrong branch/base/task/gate, altered Human approval suffix/Branch/standing source/Exact Files, missing authorization, extra/product file, partial stage, and replay. Module pre-push additionally covers standard, wrong base, wrong runtime branch, wrong task/gate, altered authorization fields, extra/product file, and multi-commit/unrelated drift.

Six-script parser, `format:check`, `git diff --check`, P1 manual, and P0 all returned exit 0. Secret scan returned `SECRET_COUNT=0`; placeholder scan returned only the two task-plan phrases naming the required `secret/placeholder scan`, with no unresolved placeholder value. Scope scan found no product/source/schema/migration/database/dependency/runtime/P2 file.

## Final Review Authorization And Pre-Push Remediation

Result: pass

- P1、Module pre-commit、Module pre-push 对 12 个 authorization 键均执行“恰好一次且值精确匹配”；同值重复、冲突重复均 fail closed。
- Exact Files 按授权文档顺序直接比较 12 项；Module pre-push 不再通过 `Sort-Object -Unique` 掩盖重复项。
- committed-master disposable fixture 直接运行 P1 `pre_push`；exact positive 输出 `p1TransitionScopeMode: transition_only` 与 F-0117 one-time marker，并将该 mode 传给 Module pre-push。
- P1 `pre_push` 对 authorization append-conflict/duplicate-same、duplicate Exact Files、wrong task/projection/runtime branch/base、extra/product file、replay/multi-commit 均命中 F-0117 专属 finding。

Fresh full commands/output：

```text
Test-ModuleRunV2PreCommitHardening.Smoke.ps1
exit 0, 282.4s
F-0117 P1 and Module pre-commit behavior smoke passed

Test-ModuleRunV2PrePushReadiness.Smoke.ps1
exit 0, 217.3s
Module Run v2 pre-push readiness smoke passed

Test-P1RemediationSerialProgram.Smoke.ps1
exit 0, 779.5s
P1 remediation serial program guard smoke passed: 15 positive, 81 negative

Test-P1RemediationSerialProgram.ps1 -Phase manual -SkipExternalIntegrityChecks
exit 0, p1ProgramGuardResult: pass

Test-P0RemediationGlobalBaseline.ps1
exit 0, p0GlobalBaselineResult: pass

npm.cmd run format:check
exit 0, All matched files use Prettier code style!

git diff --check
exit 0

PowerShell parser (6 guard/smoke scripts)
exit 0
```

## F-0115 Authorization Loop Regression

Result: pass

最终对抗复核发现 Module pre-commit 的既有 F-0115 authorization loop 已将迭代变量改名为 `$fieldContract`，条件仍错误引用 `$pattern`，使历史 F-0115 patterns 未实际验证。唯一代码修复为改用当前迭代值 `$fieldContract`。

- PowerShell parser: pass。
- F-0115 authorization isolated positive: pass。
- F-0115 tampered `Status` negative: pass，篡改未被接受。
- Module pre-commit full smoke: pass（300.5s），包含既有 F-0115 positive / invalid-authorization matrix 与 F-0117 behavior smoke。
