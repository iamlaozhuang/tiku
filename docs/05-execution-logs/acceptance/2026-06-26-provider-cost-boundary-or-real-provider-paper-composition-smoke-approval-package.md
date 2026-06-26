# Provider Cost boundary or real Provider paper composition smoke approval package

Task id: `provider-cost-boundary-or-real-provider-paper-composition-smoke-approval-package-2026-06-26`

## Decision

Decision: `FRESH_PROVIDER_EXECUTION_APPROVAL_REQUIRED`.

This package does not approve real Provider execution in the current task. It defines the minimum safe boundary for a
future execution task if the owner explicitly approves it.

## Current Basis

- Local content admin generated paper result formal adoption has now been proven as a composed formal draft with:
  - 1 `paper_section`;
  - 1 `paper_question`;
  - 1 companion formal `question` draft;
  - no Provider call and no publish.
- Prior admin route-integrated Provider smoke proved `alibaba-qwen` / `qwen3.7-max` can return Provider-success for
  content and organization AI generation routes, but it did not execute formal paper draft composition.
- Provider/Cost, formal publish, staging/prod, payment, external service, deployment, release readiness, and final Pass
  remain separate approval gates.

## Future Execution Boundary If Approved

The smallest future real Provider paper composition smoke should use:

- Environment: local only.
- Provider: `alibaba-qwen`.
- Model: `qwen3.7-max`.
- Compatibility mode: `openai_compatible`.
- Credential alias: `ALIBABA_API_KEY`.
- Provider call cap: 1 total.
- Workflow: content admin `content_ai_paper_generation` followed by formal draft composition adoption.
- Formal adoption POST cap: 1.
- Companion question draft cap: 1.
- `paper_section` cap: 1.
- `paper_question` cap: 1.
- Retry cap: 0 automatic retries.
- Token cap: 2000 total tokens.
- Budget cap: USD 1.00 maximum; if pricing cannot be estimated safely, evidence must record token usage only and mark
  Cost Calibration as not executed.
- DB scope: local draft-only route/service path only if explicitly approved in the execution task.
- Formal publish: 0.
- Student-visible content: 0.

## Credential Boundary

Future execution may only read the named local credential through the existing approved runtime/private-env path if the
owner gives fresh approval for that task. The credential value must never be printed, persisted, committed, or described
in evidence.

## Allowed Evidence Fields

- Provider/model identifier.
- Route/workflow name.
- Provider call count.
- Response status and error category.
- Latency/duration.
- Token usage summary.
- Cost estimate status, not raw pricing payload.
- Formal adoption response code.
- Public-id presence states only.
- Composition counts only.
- Redaction status.

## Forbidden Evidence Fields

- Raw prompt.
- Raw model output.
- Raw Provider request or response payload.
- API key, token, cookie, Authorization header, DB URL, `.env*` values, or credentials.
- Raw generated result content.
- Raw reviewed draft body.
- Full formal `paper`, `paper_section`, `paper_question`, `question`, option, standard answer, or analysis content.
- Raw DB rows or internal numeric ids.

## Failure Branches

- Missing credential: stop as `credential_missing`; do not retry or inspect secrets.
- Provider failure: stop as `provider_call_failed`; record redacted category only.
- Token or budget cap exceeded: stop as `provider_cost_boundary_exceeded`.
- Local DB or route composition failure after Provider success: stop as `composition_route_failed`; do not broaden into
  schema/migration/data repair.
- Any publish requirement: stop and open the formal publish approval package.
- Any staging/prod/payment/external-service/deploy need: stop and open a separate approval package.

## Explicitly Not Approved In This Task

- Real Provider call.
- Provider credential read.
- Cost Calibration execution.
- Local DB mutation, schema migration, seed, cleanup delete, or data repair.
- Source/test/package/lockfile/env/script changes.
- Formal publish or student-visible content.
- Staging/prod/payment/external-service/deployment/release readiness.
- Final Pass.

## Next Step

Stop here until the owner gives fresh explicit execution approval for the future real Provider paper composition smoke.
Only after such execution passes may the flow continue to
`formal-publish-student-visible-content-approval-package-2026-06-26`.
