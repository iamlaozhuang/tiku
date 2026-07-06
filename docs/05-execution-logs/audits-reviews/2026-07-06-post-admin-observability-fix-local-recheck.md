# 2026-07-06 Post Admin Observability Fix Local Recheck Audit

## Verdict

Partial pass for the post-fix observability target. The fix-specific source/unit gates passed, localhost content admin API now returns a redacted 409015 safe rejection reason instead of `data=null`, no-persistence remained observable by aggregate history count, and the current browser surface maps the safe reason to a specific no-draft message.

## Evidence-Supported Claims

- Admin AI generation 409015 can now carry a redacted safe rejection category.
- Frontend copy is no longer limited to a generic admin route message when the safe rejection DTO is present.
- Content admin rejected request did not increase aggregate history count in the local probe.
- Standard organization admin remains blocked from organization AI generation by business code 403011.
- The 8 primary role credentials can still establish local sessions without exposing a client-visible token in the response body.
- Source/unit gates for the admin observability surface remain green after the fix.

## Adversarial Findings

1. Provider-enabled success is not proven.
   - The only Provider-enabled small sample returned `provider_execution_failed`.
   - This supports safe failure observability, not generation success, structured preview success, requested question count compliance, or AI paper count recognition.

2. Provider-disabled localhost runtime is not freshly proven in this branch.
   - The active local environment attempted Provider execution.
   - Existing controlled tests and browser-shape checks support the DTO/mapping contract, but not a fresh disabled-runtime end-to-end pass.

3. Browser coverage is partial.
   - The real page, session, load, and alert rendering were exercised.
   - The POST response was intercepted to avoid a repeated Provider call, so this is frontend mapping evidence, not full browser/backend/Provider evidence.

4. DB-backed runtime coverage is partial.
   - Aggregate history before/after was stable for the content admin rejected request.
   - Learner closed loop, organization draft/publish/work-answer/statistics loop, and content formal adoption/rejection loop were not rerun after the fix.

5. One API probe has a process-exit caveat.
   - The command printed the full redacted aggregate result before the shell wrapper timeout.
   - Treat it as evidence for the printed aggregate behavior, not as a clean command pass.

## Unsupported Externalizations

- Do not claim local adversarial acceptance overall pass.
- Do not claim release readiness or production usability.
- Do not claim staging/prod readiness.
- Do not claim Cost Calibration.
- Do not claim Provider-enabled generation success.
- Do not claim the full 0704 local acceptance matrix was freshly rerun after this fix.

## Recommendation

Next task should be a separate, bounded Provider-disabled localhost replay if a clean disabled-runtime claim is required. Provider-enabled success should remain blocked until credentials/network/provider health are explicitly approved and available for a fresh small-sample run; Cost Calibration remains a separate fresh-approval gate.
