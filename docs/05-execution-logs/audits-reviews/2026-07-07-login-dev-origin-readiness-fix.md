# 2026-07-07 Login Dev Origin Readiness Fix Audit Review

## Verdict

`pass` for the local loopback login-button blocker.

The root cause was not the shared `Input` component. The failure reproduced only when the dev page was opened through the loopback host while the Next.js dev server treated the canonical local host separately. Adding the loopback host to `allowedDevOrigins` restored client-side interactivity at the user's current URL.

## Adversarial Review

| Question                                                     | Result | Evidence                                                                    |
| ------------------------------------------------------------ | ------ | --------------------------------------------------------------------------- |
| Could this be the 0704 DB or account document?               | no     | Submit never reached the backend before the fix.                            |
| Could this be an invalid password-length rule?               | no     | Valid-shaped placeholder inputs still failed before the fix.                |
| Could this be shared `Input` source regression?              | no     | Shared input and login UI unit tests passed; localhost browser path worked. |
| Could this be early hydration timing only?                   | no     | Waiting for page load and delay still failed at loopback before the fix.    |
| Could this be host-origin mismatch?                          | yes    | Dev log showed loopback dev-resource block; localhost browser path passed.  |
| Did the fix broaden auth, DB, Provider, staging, or release? | no     | Only dev config, focused config test, and task evidence/state were changed. |
| Did evidence include sensitive values?                       | no     | Evidence records only aggregate statuses, host labels, and command results. |

## Regression Timing

- The shared `Input` component has used Base UI since the early foundation baseline.
- The login page has used controlled `Input value + onChange` since the local login UI runtime baseline.
- A 2026-07-04 repair added a shared input contract test and classified one browser failure as hydration readiness, but it did not add a dev-origin allowlist or a regression test for `127.0.0.1`.
- The current visible failure appeared when local browser validation used `http://127.0.0.1:3000/login` against a dev server whose canonical local origin was `localhost:3000`.

## Residual Risk

- This fix is a local development readiness repair. It does not prove staging, production, release readiness, or Cost Calibration.
- It does not claim all login account fixtures are valid against the selected DB. It only restores the ability to click submit after valid-shaped inputs on the loopback host.
- If future local validation uses additional hostnames, they need explicit origin review instead of assuming this fix covers them.

## Non-Claims

- Release readiness: `not claimed`
- Production usability: `not claimed`
- Staging: `not executed / requires fresh approval`
- Cost Calibration: `not executed / requires fresh approval`
