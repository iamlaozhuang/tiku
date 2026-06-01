# Phase 29 Real Provider Redaction Approval Decision Evidence

## Summary

- Result: pass.
- Scope: blocked_gate/docs_only.
- Changed surfaces: evidence only.
- Gates: `real-provider-staging-redaction` remains blocked; approval inputs listed; no provider call, secret config, quota enablement, or staging/prod access.
- Forbidden scope (`forbiddenScope`): no real provider, no provider secret, no staging/prod/cloud/deploy, no raw prompt, no raw student answer, no raw model response, no provider payload, no external service call.
- Residual gaps (`residualGaps`): real-provider staging validation cannot proceed until explicit approval unlocks the gate.

## Decision

`real-provider-staging-redaction` remains blocked by default.

Phase 30 may proceed with mock-only AI/RAG staging dry-run preparation if all other staging approvals exist. Real-provider calls, provider quota, provider secret configuration, and provider payload evidence require a separate explicit human approval.

## Approval Inputs Required To Unlock Later

| Input                                | Required content                                                                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Target environment                   | Must name `staging`; `prod` is separate and remains blocked.                                                                                                             |
| Provider/model scope                 | Provider name, allowed model(s), allowed endpoints/use cases, and fallback behavior.                                                                                     |
| Secret owner/storage                 | Owner, secret manager/runtime storage class, access boundary, and rotation trigger.                                                                                      |
| Quota/cost limit                     | Daily/monthly cap, alert threshold, and kill-switch owner.                                                                                                               |
| Synthetic-only acceptance input plan | Confirmation that no production, customer/customer-like, private, raw paper, raw student answer, or private content is sent.                                             |
| Redaction verification commands      | Future approved commands that prove prompt, answer, model response, provider error payload, token, key, and headers are redacted from `ai_call_log`, logs, and evidence. |
| Logging retention policy             | Retention duration, allowed metadata, deletion owner, and incident handling.                                                                                             |
| Rollback/disable plan                | Feature flag disable path, secret revoke/rotate path, quota disable path, and owner.                                                                                     |
| Human approval                       | Explicit approval evidence before any real provider execution.                                                                                                           |

## Redaction Rules

Evidence must not include:

- raw prompts;
- raw student answers;
- raw model responses;
- provider request/response payloads;
- provider error payloads if they include sensitive request context;
- Authorization headers, API keys, tokens, cookies, or signed URLs;
- DB URLs or credentials;
- plaintext `redeem_code`;
- customer/customer-like private data.

Allowed evidence after future approval is limited to metadata such as provider class, model label, status, redaction check result, token/count class, and pass/fail outcome.

## Gate Status For Phase 30

- If no real-provider approval exists: proceed only with mock/local AI surfaces and record `real-provider-blocked`.
- If real-provider approval exists: Phase 30 must still run redaction verification before owner acceptance uses provider-backed outputs.
