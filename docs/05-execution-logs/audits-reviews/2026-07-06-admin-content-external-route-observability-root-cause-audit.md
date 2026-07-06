# 2026-07-06 Admin Content External Route Observability Root-Cause Audit

## Result

Status: pass for root-cause identification, partial for acceptance observability.

The admin/content and organization/admin external routes are wired to the runtimeBridge. The loss of observable failure category happens after bridge resolution, when the route enforces the draft acceptability gate and returns the static `409015` response.

## Findings

1. The external route does not fail before runtimeBridge.
   Both content and organization routes instantiate shared handlers with owner-preview admin runtime bridge control, and the POST flow resolves runtimeBridge before deciding whether the output is acceptable for a draft.

2. `missing_provider_credential` is intentionally not an acceptable draft.
   In the missing-credential path, the bridge has `providerCallExecuted=false` and `visibleGeneratedContent=null`. The draft acceptability gate requires sufficient grounding plus parsed structured preview, so it rejects this as `409015`.

3. The route folds distinct causes into one response.
   `missing_provider_credential`, insufficient grounding, Provider failure without content, and structured-preview parse mismatch all become the same external `409015` response with `data: null`.

4. Existing tests protect non-persistence, not external diagnostic specificity.
   Tests assert `409015` and no task/result persistence for provider-disabled, insufficient grounding, and bad structured-preview paths. They do not require a redacted failure category in the external error body.

5. This is not evidence of a broken bridge or missing route wiring.
   The prior bridge replay remains valid: bridge internals can reach `missing_provider_credential`. The route-level limitation is observability after rejection.

## Fix Decision Boundary

Create a separate fix branch only if the acceptance requirement is:

- admin/content external route or frontend must distinguish no-Provider credential blocks from insufficient grounding/parse failures; or
- browser acceptance must show a clearer Provider-disabled message for content/admin and organization/admin routes.

Likely safe fix shape:

- keep `409015` and `data: null` to preserve no-persistence behavior;
- add a redacted top-level diagnostic field or mapped message category for the rejected runtimeBridge failure;
- do not expose Provider payload, prompt, raw output, grounding text, internal ids, or credential/env values;
- add unit tests for missing credential, insufficient grounding, and structured-preview mismatch remaining distinguishable enough for UI messaging.

## Unsupported Claims

- No source fix was made.
- No DB-backed runtime pass is claimed.
- No browser pass is claimed.
- No Provider-enabled pass is claimed.
- No release readiness, production usability, staging/prod, deploy, or Cost Calibration is claimed.
