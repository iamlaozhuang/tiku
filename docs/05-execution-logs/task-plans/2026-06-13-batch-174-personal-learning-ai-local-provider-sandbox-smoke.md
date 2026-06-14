# Task Plan: batch-174-personal-learning-ai-local-provider-sandbox-smoke

## Scope

- Task: `batch-174-personal-learning-ai-local-provider-sandbox-smoke`
- Branch: `codex/batch-174-personal-learning-ai-local-provider-sandbox-smoke`
- Goal: execute exactly one approved local provider smoke through the batch-179 sandbox command and record only redacted summary evidence.
- Fresh approval: user prompt on 2026-06-13 approved one DeepSeek smoke with provider `openai_compatible`, providerName `deepseek`, baseUrl `https://api.deepseek.com`, model `deepseek-v4-flash`, max requests `1`, spend ceiling `$0.01`, timeout `30000ms`, and no retries.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Recent `docs/05-execution-logs/evidence/` and `docs/05-execution-logs/audits-reviews/`, especially batch-173, batch-176, and batch-179

## Exact Smoke Command

```powershell
$env:TIKU_PROVIDER_SMOKE_APPROVED='1'; node scripts/ai/run-personal-ai-provider-smoke.mjs --provider openai_compatible --provider-name deepseek --base-url https://api.deepseek.com --model deepseek-v4-flash --env-key DEEPSEEK_API_KEY --max-requests 1 --timeout-ms 30000 --execute
```

## Boundaries

Allowed:

- Check only whether `DEEPSEEK_API_KEY` exists in the current Codex/PowerShell process without printing the value.
- Let the exact smoke command read `DEEPSEEK_API_KEY` from the current process environment.
- Let the command read `TIKU_PROVIDER_SMOKE_APPROVED=1` as the execution gate.
- Modify only the batch-174 allowed files listed in `task-queue.yaml`.
- Record only the approved redacted evidence fields.

Blocked:

- Reading, creating, modifying, or printing `.env.local`, `.env.*`, real secret files, or provider configuration files.
- Printing or recording `DEEPSEEK_API_KEY`, Authorization headers, tokens, secrets, database URLs, row data, raw prompts, provider payloads, raw provider responses, raw generated output, or generated answer content.
- More than one smoke request, automatic retry, Cost Calibration, formal generated-content adoption, schema/migration, source/tests/e2e edits, package/lockfile edits, deploy, payment, external-service, PR creation, or force-push.
- `npm.cmd run build` if it would read `.env.local`.

## Execution Plan

1. Create the short branch and run pre-edit readiness.
2. Update state and queue for batch-174 with the fresh approval and closeout policy.
3. Check `DEEPSEEK_API_KEY` existence without printing the value.
4. If the key is missing, stop at blocked gate and write blocked evidence without calling the provider.
5. If the key is set, run the exact smoke command once.
6. Stop immediately on non-zero exit, timeout, missing env, provider error, rate limit, quota/billing error, redaction violation, requestCount greater than 1, or any raw prompt/payload/response/generated output exposure.
7. Write redacted evidence and audit review.
8. Run validation gates and close out through one commit, fast-forward merge to `master`, master closeout/pre-push verification, push `origin master`, and delete the merged short branch.
9. Re-read state and queue after cleanup and stop without claiming batch-175.

## Evidence Fields

Allowed fields:

- `provider`
- `providerName`
- `baseUrl`
- `model`
- `exactCommand`
- `requestCount`
- `timeoutMs`
- `resultStatus`
- `failureCategory`
- `durationMs`
- `usageSummary`
- `redactionStatus`
- `providerCallExecuted`

Forbidden fields:

- raw prompt
- provider payload
- raw provider response
- raw generated output
- API key
- Authorization header
- token
- secret
- database URL
- row data

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `if ($env:DEEPSEEK_API_KEY) { "DEEPSEEK_API_KEY is set" } else { "DEEPSEEK_API_KEY is missing" }`
- exact provider smoke command once, or blocked evidence if env is missing
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-13-batch-174-personal-learning-ai-local-provider-sandbox-smoke.md docs/05-execution-logs/evidence/2026-06-13-batch-174-personal-learning-ai-local-provider-sandbox-smoke.md docs/05-execution-logs/audits-reviews/2026-06-13-batch-174-personal-learning-ai-local-provider-sandbox-smoke.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-174-personal-learning-ai-local-provider-sandbox-smoke`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-174-personal-learning-ai-local-provider-sandbox-smoke`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-174-personal-learning-ai-local-provider-sandbox-smoke`

`npm.cmd run build` will not be run because local Next.js build has previously reported loading `.env.local`, outside this task's explicit secret boundary.

## Risks

- Real provider behavior may fail because this is the first approved live smoke; failure must be recorded only as a sanitized `failureCategory`.
- Local process env may not contain `DEEPSEEK_API_KEY`; if missing, the task must stop blocked without provider execution.
- Provider usage metadata may be partial depending on provider response shape; evidence must summarize usage without raw response content.
