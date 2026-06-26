# ai-generation-provider-cost-final-pass-smoke-or-calibration-2026-06-26

## Scope

Local dev Provider/Cost smoke or calibration under the refreshed task 1 gate package.

This task read the approved local Provider credential source and executed four real Provider calls. Evidence remains
redacted.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-provider-cost-final-pass-smoke-or-calibration.md`

## Approval Boundary

Approved by:

- refreshed task 1 gate package:
  `docs/05-execution-logs/acceptance/2026-06-26-provider-cost-final-pass-boundary-and-cost-calibration-decision-package.md`
- current owner instruction to execute real Provider smoke only after the gate package explicitly allows it;
- prior owner instruction approving task 2 Provider credential read and real model calls under the task 1 cap.

Blocked:

- more than four Provider calls;
- retry;
- raw prompt, raw output, provider payload, API key, token, cookie, Authorization header, raw provider payload, raw DOM,
  screenshot, trace, DB rows, full `question`/`paper`, or generated content evidence;
- source/test/package/lockfile/script/env/schema/migration/DB/account changes;
- staging/prod, payment, external services, deployment, release readiness, or final Pass claim.

## Requirement Mapping Result

Mapped to:

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- ADR-006 runtime dependency alignment.

Mapping conclusion:

- The Provider smoke/calibration labels cover content admin and organization advanced admin AI `question`/AI `paper`
  workflows.
- Formal `question` and `paper` writes remain blocked.
- Provider/Cost evidence remains local only and does not approve staging/prod/release readiness.
- Admin route-integrated Provider Pass remains blocked because the current admin route status is
  `provider_call_blocked`.

## Provider Profile

- `modelProvider`: `openai_compatible`
- `providerName`: `alibaba-qwen`
- `modelName`: `qwen3.7-max`
- `baseUrlHost`: `dashscope.aliyuncs.com`
- `secretAlias`: `ALIBABA_API_KEY`
- `maxRequestsPerWorkflow`: `1`
- `maxTotalProviderCalls`: `4`
- `maxRetries`: `0`
- `maxOutputTokens`: `8`
- `timeoutMs`: `30000`
- `streaming`: blocked
- `fallbackProvider`: blocked

## Credential Metadata

- `secretAlias`: `ALIBABA_API_KEY`
- `secretSourceKind`: `local_dotenv`
- `secretPresence`: `present`
- `credentialValueRecorded`: false

## Provider Smoke Result

Execution result: `pass_local_real_model_smoke_4_calls`.

| Workflow                   | Status | Calls | Retry | Duration ms | Input tokens | Output tokens | Total tokens | Reasoning tokens | Cached input tokens | Error category |
| -------------------------- | ------ | ----- | ----- | ----------- | ------------ | ------------- | ------------ | ---------------- | ------------------- | -------------- |
| `content_ai_question`      | pass   | 1     | 0     | 11848       | 24           | 588           | 612          | 582              | 0                   | null           |
| `content_ai_paper`         | pass   | 1     | 0     | 11410       | 24           | 573           | 597          | 567              | 0                   | null           |
| `organization_ai_question` | pass   | 1     | 0     | 10977       | 24           | 559           | 583          | 554              | 0                   | null           |
| `organization_ai_paper`    | pass   | 1     | 0     | 12420       | 24           | 640           | 664          | 634              | 0                   | null           |

Execution controls:

- real Provider calls executed: `4`
- max allowed Provider calls: `4`
- retries executed: `0`
- provider/model: `openai_compatible` / `alibaba-qwen` / `qwen3.7-max`
- base URL host: `dashscope.aliyuncs.com`
- redaction status: `passed`
- raw prompt recorded: false
- raw output recorded: false
- raw provider payload recorded: false
- credential value recorded: false

## Local Contract Summary Status

Result: `provider_bridge_blocked_product_chain`.

The four workflow labels map to content and organization admin local contract loops, but the committed product route
evidence and current route source still show local contract behavior:

- `runtimeStatus`: `local_contract_only`
- `productChainStatus`: `provider_call_blocked`
- `providerCallExecuted`: `false`
- `adminRouteIntegratedProviderPass`: false
- `envSecretAccessedByAdminRoute`: `false`
- `costCalibrationExecutedByAdminRoute`: `false`
- `contentVisibility`: `summary_only`
- formal `question`/`paper` write: blocked

No browser or role-account credential runtime was executed in this task. Product-chain Provider integration remains a
follow-up implementation or diagnostic item.

## Token/Cost Summary

- provider calls: `4`
- total input tokens: `96`
- total output tokens: `2360`
- total tokens: `2456`
- total reasoning tokens: `2337`
- cached input tokens: `0`
- total recorded duration: `46655 ms`
- monetary cost estimated: false
- pricing lookup executed: false
- Cost Calibration Gate Pass: false

The SDK returned reasoning/output token counters larger than `maxOutputTokens: 8`, consistent with prior smoke evidence.
This is recorded as usage-counter evidence only, not as quota/pricing calibration.

## Validation Results

1. Local Provider/Cost smoke loop under the refreshed task 1 gate package:
   - Result: pass for local Provider reachability and usage counters; `4` calls, `0` retries.
   - Product-chain result: blocked because admin local contract routes remain provider-disabled.
2. `npx.cmd prettier --write --ignore-unknown ...`
   - Result: pass; scoped files unchanged after formatting.
3. `npx.cmd prettier --check --ignore-unknown ...`
   - Result: pass; all matched files use Prettier code style.
4. `git diff --check`
   - Result: pass; no whitespace errors.
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-provider-cost-final-pass-smoke-or-calibration-2026-06-26`
   - Result: pass; five files matched declared scope; Cost Calibration Gate remains blocked.
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-provider-cost-final-pass-smoke-or-calibration-2026-06-26 -SkipRemoteAheadCheck`
   - Result: pass; branch, `master`, `origin/master`, and state checkpoint all matched
     `d9f69bba162c75cd3fd5f5027f4f91891b7d1697`.

## Blocked Work Statement

Staging/prod, release readiness, payment, external services, DB/schema/migration/account mutation,
source/test/package/env changes, browser/role credentials, raw prompt/output/payload evidence, and final Pass claim remain
blocked.

## Next Step

Recommended next step: create a focused admin runtime bridge diagnostic or provider-disabled product loop implementation
plan for the content/organization admin AI local contract routes before including Provider/Cost in a final Pass boundary.
