# Layer 3 Provider Smoke Local Dev Redacted Execution Provider Error Follow-Up Approval Package Evidence

Task id: `layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package-2026-06-27`

result: pass

moduleRunVersion: 2

Cost Calibration Gate remains blocked.

Batch range: docs/state-only Provider error follow-up approval package after one-call `provider_error`, no Provider
execution in this task.

RED: Layer 3 Provider smoke remains blocked because the latest approved local dev `alibaba` / `qwen-plus` attempt
returned a sanitized `provider_error` after one Provider call and zero retries. The current evidence is too coarse to
distinguish account/key/model/region/quota/provider-SDK causes without a new approved boundary.

GREEN: this task prepares a follow-up approval matrix and copyable approval texts for the owner. It does not execute a
Provider call, does not read `.env*`, does not inspect raw Provider errors, does not change Provider configuration, and
does not enter Cost Calibration or pre-release work.

Commit: `81b3f64a0248ed164d6f1f79b63edf7269346c00` entry baseline before this approval package. Per the Post-Closeout
SHA Rule, the final task commit SHA belongs in handoff after commit and is not self-synchronized by a follow-up state-only
commit.

localFullLoopGate: Layer 2 local PostgreSQL `rejected` review-command evidence remains the local business loop baseline.
This task did not strengthen or regress Layer 2; it only prepares a Layer 3 Provider error follow-up boundary.

threadRolloverGate: continue_current_thread_for_docs_state_closeout_then_stop_for_owner_choice_of_provider_error_follow_up_path

automationHandoffPolicy: after this docs/state-only package closes, do not run Provider diagnostics, retry Provider, start
Provider rollup, or enter Cost Calibration until the owner selects and approves one follow-up path.

nextModuleRunCandidate: `layer-3-provider-smoke-redacted-error-code-diagnostic-execution-2026-06-27`

blocked remainder: Provider diagnostic execution, Provider retry, Provider configuration changes, `.env*` access, Cost
Calibration, staging/pre-release, payment/external-service, OCR/export, archive/index movement, release readiness, and
final Pass remain blocked.

## Summary

This docs/state-only task turns the `provider_error` blocker into a clear owner decision point. It provides three
available next paths:

1. run one redacted Provider error-code diagnostic using existing sanitized `providerErrorSummary.httpStatus` and
   `providerErrorSummary.providerErrorCode` fields;
2. have the owner manually verify Provider console/key/model/quota/region state and report only a category;
3. create a docs/state-only Provider configuration-boundary package if the path likely needs correction, such as an
   openai-compatible DashScope path or model/provider label adjustment.

No runtime action was taken in this task.

## Follow-Up Decision Matrix

| Path                                     | When to choose                                           | Codex runtime action now | Fresh approval needed before execution |
| ---------------------------------------- | -------------------------------------------------------- | ------------------------ | -------------------------------------- |
| Redacted error-code diagnostic execution | Owner wants the smallest Codex-run diagnostic            | none in this task        | yes                                    |
| Manual Provider console verification     | Owner wants to check key/model/quota/region outside Git  | none                     | no Codex runtime approval needed       |
| Provider configuration boundary package  | Owner suspects provider path/model/base URL mismatch     | none in this task        | yes, docs/state-only first             |
| Provider retry                           | Only after diagnostic/config/manual result justifies it  | blocked                  | yes                                    |
| Cost Calibration                         | Only after Provider smoke passes with acceptable summary | blocked                  | yes                                    |

## Recommended Next Approval Text

```text
我 fresh approve 一个 Layer 3 Provider smoke redacted error-code diagnostic execution 任务：
layer-3-provider-smoke-redacted-error-code-diagnostic-execution-2026-06-27。

允许 Codex 在本地 dev 仅为本次命令打开 `.env.local`，只提取 `ALIBABA_API_KEY` 到当前命令进程环境；禁止输出、复制、记录或提交任何 `.env*` 内容、secret、token、Provider credential、DB URL 或任何 credential 值。

允许对 `alibaba` / `qwen-plus` 执行最多 1 次 Provider diagnostic call，0 retry，timeout 30000ms，max output tokens 8，spend stop limit USD 0.05。证据只能记录 provider label、model label、result status、failure category、request count、Provider call executed boolean、retry count、redaction status、cap status、stop condition、以及脱敏 `providerErrorSummary.httpStatus` / `providerErrorSummary.providerErrorCode`；禁止记录 raw prompt、raw response、Provider payload、raw Provider error body/message、raw generated content、secret、token、Authorization header、DB URL、DB row、SQL output、截图、trace、cookie/localStorage。

不批准第二次调用、retry loop、Provider configuration 变更、Cost Calibration、DB、浏览器/dev-server/e2e、staging/prod/deploy/payment external service、OCR/export、PR、force push、release readiness 或 final Pass。若缺少 alias、命令 fail/blocked 后需要第二次调用或 raw 细节、或机制门禁失败，必须停止并写脱敏 blocked evidence。
```

## Alternate No-Call Owner Verification Text

```text
我选择人工在 Provider 控制台核验 `ALIBABA_API_KEY` 对 `alibaba` / `qwen-plus` 的权限、额度、区域和服务开通状态。Codex 不读取 `.env*`，不调用 Provider，不接收 secret/raw response；我会只回传脱敏结论分类，例如 `key_valid_model_denied`、`quota_or_billing_blocked`、`model_name_or_region_mismatch`、`provider_console_ok`。
```

## Alternate Configuration Boundary Text

```text
我 fresh approve 一个 docs/state-only Provider configuration boundary approval package：
layer-3-provider-smoke-provider-configuration-boundary-approval-package-2026-06-27。范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档；允许定义是否改用 openai-compatible DashScope path、base URL、provider name、model label 或 SDK provider path 的后续执行边界和审批文本。不批准 Provider call、读取 `.env*`、Provider configuration 变更执行、Cost Calibration、DB、浏览器/e2e、staging/prod/deploy/payment external service、PR、force push、release readiness 或 final Pass。
```

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md`

## Requirement Mapping Result

This task maps only to the Layer 3 Provider smoke recovery path. It does not change Layer 1 role/entry/permission status
or Layer 2 local PostgreSQL business-loop evidence. ADR-004 keeps `.env.local` local-only and never committed; ADR-006
treats installed AI SDK packages as available but still gated. Therefore this package does not authorize Provider
execution by itself.

## Validation Transcript

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md`
  - passed; all six scoped docs/state files unchanged after formatting.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package.md`
  - passed; all matched files use Prettier code style.
- `git diff --check`
  - passed; no whitespace errors.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
  - passed; projectStatusDecision `idle_no_pending_task`, activeQueueNonTerminalCount `28`,
    archiveCandidateCount `37`, highRiskRepairBlockedCount `0`, Cost Calibration Gate remains blocked.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package-2026-06-27`
  - passed after adding the required authorization SSOT read-list entry for
    `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package-2026-06-27`
  - passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-provider-error-follow-up-approval-package-2026-06-27 -SkipRemoteAheadCheck`
  - passed.

## Forbidden-Action Checklist

- Provider call/retry executed: no.
- `.env*` read/output/copied/recorded/committed: no.
- Secret/token/DB URL/credential value output: no.
- Raw prompt/response/payload/Provider error/generated content recorded: no.
- Provider configuration changed: no.
- DB/browser/e2e/schema/migration/seed/source/test/package/lockfile touched: no.
- Cost Calibration/staging/prod/deploy/payment/OCR/export executed: no.
- Archive/index movement executed: no.
- PR/force push executed: no.
- Release readiness/final Pass claimed: no.

## Residual Gap

Layer 3 Provider smoke remains blocked until the owner approves and completes one follow-up path. Cost Calibration and
pre-release gates remain blocked.
