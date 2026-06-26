# AI generation Provider route-integrated smoke execution evidence

Task id: `ai-generation-provider-route-integrated-smoke-execution-2026-06-26`

## Scope

- Status: closed
- Branch: `codex/admin-ai-real-provider-route-smoke-20260626`
- Approval consumed: `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-provider-route-integrated-smoke-approval-package.md`
- Fake Provider precondition: passed by `admin-ai-generation-provider-enabled-route-runtime-bridge-fake-provider-tdd-2026-06-26`
- Maximum real Provider calls allowed: 4
- DB/schema/migration/seed: not executed
- Formal question/paper write: not executed
- Staging/prod/payment/external service/release readiness: not executed

## Commands

### Smoke preflight

- `tsx --eval` command-line mode exceeded Windows command-line length before execution; no Provider call executed.
- `tsx` stdin route module import check passed.
- Two stdin runner shape checks failed before Provider execution due local env loader/named export wiring; no Provider call executed.

### Real Provider route smoke

Command:

```powershell
@'<redacted inline local route smoke runner>'@ | npx.cmd tsx -
```

Result: pass.

| Workflow                              | Route                                         | Status | Latency  | Token summary                   | Cost summary                              | Error |
| ------------------------------------- | --------------------------------------------- | ------ | -------- | ------------------------------- | ----------------------------------------- | ----- |
| `content_ai_question_generation`      | `/api/v1/content-ai-generation-requests`      | pass   | 11125 ms | input 27, output 539, total 566 | not estimated, pricing table not in scope | null  |
| `content_ai_paper_generation`         | `/api/v1/content-ai-generation-requests`      | pass   | 11232 ms | input 27, output 592, total 619 | not estimated, pricing table not in scope | null  |
| `organization_ai_question_generation` | `/api/v1/organization-ai-generation-requests` | pass   | 13477 ms | input 27, output 699, total 726 | not estimated, pricing table not in scope | null  |
| `organization_ai_paper_generation`    | `/api/v1/organization-ai-generation-requests` | pass   | 13602 ms | input 27, output 722, total 749 | not estimated, pricing table not in scope | null  |

## Redacted smoke summary

- Provider/model: `alibaba-qwen` / `qwen3.7-max` via `openai_compatible`.
- Credential source: local private env file presence for `ALIBABA_API_KEY`; credential value not printed or persisted.
- Total real Provider calls: 4.
- Retries: 0.
- All four workflows returned `responseCode: 0`, `runtimeStatus: local_contract_only`, `runtimeBridgeStatus: provider_call_succeeded`, and `localContractSummaryHit: true`.
- `providerCallExecuted: true`, `envSecretAccessed: true`, and `providerConfigurationRead: true` were observed per workflow.
- `costCalibrationExecuted: false`; only token usage and pricing-table-not-in-scope cost boundary were recorded.
- Formal question/paper writes remained `blocked_without_follow_up_task`.
- Database connection/write/schema/migration/seed: not executed.
- Source/test/package/lockfile/env file modifications: not executed.
- Staging/prod/payment/external service/deployment/release readiness/final Pass: not executed.
- Raw prompt, raw output, raw Provider payload, API key, token, cookie, Authorization header: not recorded.
