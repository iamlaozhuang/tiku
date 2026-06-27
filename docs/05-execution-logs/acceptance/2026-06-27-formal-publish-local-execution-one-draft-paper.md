# formal publish local execution for one draft paper acceptance

## Acceptance criteria

- A named draft paper is selected or created from a named local source paper.
- Exactly one formal publish call is executed on the selected draft.
- A rollback/cleanup action archives the copied published paper after the publish evidence is captured.
- Evidence records redacted identifiers, statuses, counts, and final archive state.
- The task does not execute Provider calls, env/credential reads, staging/prod/deploy, payment, external service, browser/e2e/dev server, or release/final Pass decisions.

## Result

- Accepted for local formal publish execution scope after closeout validation.
- Copied target draft: `paper-989beac0-471f-493e-ad83-26cef5461a92`.
- Publish call count: 1.
- Rollback/cleanup result: copied target paper archived.
- No Provider call/credential read, env file read/edit, browser/e2e/dev server, staging/prod/deploy, payment, external service, source/test/schema/package/lockfile edit, release readiness, or final Pass action was executed.
