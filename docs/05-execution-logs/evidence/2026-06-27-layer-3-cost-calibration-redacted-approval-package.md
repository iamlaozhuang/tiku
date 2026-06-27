# Layer 3 Cost Calibration Redacted Approval Package Evidence

Task id: `layer-3-cost-calibration-redacted-approval-package-2026-06-27`

result: pass

businessResult: pass_cost_calibration_approval_package_ready_execution_seeded

moduleRunVersion: 2

Cost Calibration execution was not performed by this task.

Cost Calibration Gate remains blocked for this approval package; the separately queued successor execution task carries
its own one-call approval boundary.

Batch range: single docs/state-only Layer 3 Cost Calibration approval package after Provider smoke passed.

RED: Layer 3 Cost Calibration had no approved execution package after the OpenAI-compatible DashScope Provider smoke
passed.

GREEN: This task defines the pricing source, sample workflow, caps, redaction rules, stop conditions, quota ledger
policy, and a queued successor execution task.

Commit: `398e24d49` pre-closeout base; final task commit is created after this readiness gate.

localFullLoopGate: Layer 2 local PostgreSQL `rejected` review-command evidence remains the minimum local business loop
baseline. This task does not execute runtime behavior.

threadRolloverGate: continue_current_thread_to_cost_calibration_execution_if_successor_task_readiness_passes

automationHandoffPolicy: the successor execution task may proceed only through its materialized task queue caps; any
cap expansion, second call, retry, credential output, raw payload, or mechanism failure must stop and write blocked
evidence.

nextModuleRunCandidate: `layer-3-cost-calibration-redacted-execution-2026-06-27`

blocked remainder: staging/pre-release, prod, deploy, payment/external-service, OCR/export, archive/index movement,
release readiness, and final Pass remain blocked.

## Approval Boundary

This docs/state-only task consumes:

- the current Goal serial high-risk package approval for `layer-3-cost-calibration-redacted-approval-package-2026-06-27`;
- the 2026-06-27 unattended supplemental approval for readonly public official pricing lookup and future single-call
  Cost Calibration execution caps.

This task did not read `.env*`, read credentials, call Providers, execute Cost Calibration, connect to DB, start
browser/dev-server/e2e, modify source/tests/scripts/package/lockfiles/schema/migration/seed, deploy, touch payment or
external-service, execute OCR/export, move archive/index entries, create PRs, force push, or claim release readiness/final
Pass.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md`

## Official Public Pricing Source

Readonly lookup source:

- Alibaba Cloud Model Studio model pricing:
  `https://www.alibabacloud.com/help/en/model-studio/model-pricing`
- Retrieved: 2026-06-27
- Relevant public row: Qwen-Max, `qwen3.7-max`, China (Beijing) / Chinese mainland, `0<Token<=1M`.
- Local estimate rates for the successor task: input `$1.65` per 1 million tokens, output `$4.951` per 1 million tokens.

This lookup used only public official documentation. No login, account billing page, console, API key, Provider call, or
private data was accessed.

## Cost Calibration Package

```yaml
costCalibrationPackage:
  providerLabel: openai_compatible
  providerName: alibaba-qwen
  modelLabel: qwen3.7-max
  baseUrlHost: dashscope.aliyuncs.com
  credentialAlias: ALIBABA_API_KEY
  pricingSource:
    sourceType: official_public_model_pricing_doc
    sourceUrl: https://www.alibabacloud.com/help/en/model-studio/model-pricing
    retrievedDate: 2026-06-27
    deploymentScope: china_beijing_chinese_mainland
    inputPriceUsdPerMillionTokens: 1.65
    outputPriceUsdPerMillionTokens: 4.951
    estimateLabelRequired: local_minimum_estimate_usd
  sampleWorkflows:
    count: 1
    workflowLabel: minimal_text_generation_cost_probe
    rawPromptRecording: forbidden
    rawResponseRecording: forbidden
    rawGeneratedAiContentRecording: forbidden
  caps:
    maxProviderCalls: 1
    maxRetries: 0
    maxTargets: 1
    timeoutMs: 30000
    maxOutputTokens: existing_script_cap_only_do_not_increase
    spendStopLimitUsd: 0.05
  redaction:
    envFileContent: forbidden
    credentialValue: forbidden
    authorizationHeader: forbidden
    rawPrompt: forbidden
    rawResponse: forbidden
    providerPayload: forbidden
    rawGeneratedAiContent: forbidden
    fullPaperMaterialContent: forbidden
    evidenceAllowedFields:
      - providerLabel
      - providerName
      - modelLabel
      - baseUrlHost
      - passFailBlocked
      - requestCount
      - providerCallExecuted
      - retryCount
      - tokenCountSummary
      - localMinimumEstimateUsd
      - capStatus
      - redactionStatus
      - stopCondition
      - forbiddenActionChecklist
  quotaLedgerPolicy:
    writeRuntimeAiCallLog: false
    dbReadWrite: false
    evidenceOnlySummary: true
  stopConditions:
    - missing_ALIBABA_API_KEY_alias
    - second_provider_call_needed
    - retry_needed
    - cap_exceeded
    - raw_payload_or_secret_needed
    - pricing_source_conflict_or_unavailable
    - mechanism_gate_failure
```

## Successor Execution Task

`layer-3-cost-calibration-redacted-execution-2026-06-27` is seeded as the next serial task. It may consume the existing
fresh approvals only if its own task queue entry remains unchanged, caps are respected, and its task plan/evidence/audit
are created before execution.

## Validation Transcript

- `npx.cmd prettier --write --ignore-unknown ...`
  - passed; scoped docs/state files formatted.
- `npx.cmd prettier --check --ignore-unknown ...`
  - passed; all matched files use Prettier code style.
- `git diff --check`
  - passed; no whitespace errors.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
  - passed; next executable task `layer-3-cost-calibration-redacted-execution-2026-06-27`, activeQueueNonTerminalCount
    `29`, archiveCandidateCount `41`, highRiskRepairBlockedCount `0`; current changes must close before next task.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-cost-calibration-redacted-approval-package-2026-06-27`
  - passed; scope scan limited to the 6 allowed docs/state files.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-cost-calibration-redacted-approval-package-2026-06-27`
  - passed; evidence/audit accepted, Cost Calibration Gate recorded as blocked for this package.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-cost-calibration-redacted-approval-package-2026-06-27 -SkipRemoteAheadCheck`
  - passed; branch/master/origin/master/state checkpoint aligned at `398e24d496f6cadedf6c165d94d884b0a6755b09`.

## Forbidden-Action Checklist

- Cost Calibration executed by this task: no.
- Provider call executed by this task: no.
- `.env*` read/write/output/copy: no.
- Secret/token/DB URL/credential value output: no.
- Raw prompt/response/payload/Provider error/generated content recorded: no.
- Provider configuration changed: no.
- DB/browser/e2e/schema/migration/seed/source/test/script/package/lockfile touched: no.
- Staging/prod/deploy/payment/OCR/export executed: no.
- Archive/index movement executed: no.
- PR/force push executed: no.
- Release readiness/final Pass claimed: no.

## Residual Gap

The Goal is not complete. Layer 3 Provider smoke has passed and this Cost Calibration approval package is now defined,
but Cost Calibration execution, staging/pre-release, high-risk package cleanup/archive movement, and final evidence review
remain incomplete until their task-scoped evidence exists.
