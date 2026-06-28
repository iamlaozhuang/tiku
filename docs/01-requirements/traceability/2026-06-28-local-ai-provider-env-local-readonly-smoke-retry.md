# Local AI Provider Env Local Readonly Smoke Retry Traceability

## Task

- Task id: `local-ai-provider-env-local-readonly-smoke-retry-2026-06-28`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Branch: `codex/local-provider-env-smoke-20260628`
- Scope: retry the local Provider smoke with owner-approved readonly `ALIBABA_API_KEY` lookup from `.env.local`.

## Requirement Mapping

| Requirement area                       | Mapping                                                                                                | Boundary                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Provider-backed AI smoke               | Reuses the existing one-request Provider smoke runner.                                                 | At most one real Provider request; no prompt/payload/raw output evidence.            |
| Environment isolation                  | Reads local `dev` `.env.local` only under fresh owner approval.                                        | No `.env*` modification and no staging/prod/cloud connection.                        |
| Content and organization AI generation | Existing localhost e2e validates content/admin organization routes and denial boundary.                | Local-contract route output remains redacted and formal content writes stay blocked. |
| Student AI explanation                 | Existing localhost e2e validates answer, mistake_book AI explanation, report, and learning suggestion. | No raw answer, full question content, prompt, or AI output in evidence.              |
| Authorization                          | Standard organization admin denial remains part of e2e coverage.                                       | UI visibility is not treated as authorization.                                       |
| Cost Calibration                       | Explicitly not executed.                                                                               | No cost measurement, pricing, quota defaults, release readiness, or final Pass.      |

## Evidence Boundary

Evidence may record only:

- whether the key was found as a boolean;
- Provider request count class;
- `providerCallExecuted`;
- result status;
- failure category;
- redaction status;
- focused e2e pass/fail counts;
- blocked-gate summary.

Evidence must not record credentials, secret values, connection strings, tokens, cookies, localStorage, Authorization headers, raw DB rows, internal ids, user emails/phones, raw DOM, screenshots, traces, prompts, Provider payloads, raw AI output, raw answers, or full question/paper/resource/chunk content.

## Expected Closure

If the Provider smoke succeeds, successful redacted Provider evidence exists for the local full-loop sprint and the next recommended work becomes a post-provider rollup task. That follow-up still requires a separate execution decision and must not claim release readiness or final Pass.
