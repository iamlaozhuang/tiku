# Role Workflow Experience Walkthrough From Code Baseline Review

Task id: `role-workflow-experience-walkthrough-from-code-baseline-2026-07-02`

Review result: `APPROVE_BLOCKED_EVIDENCE_CLOSEOUT`

## Review Scope

This is an adversarial review of the bounded local role/workflow walkthrough attempt. It checks whether the evidence
overclaims, records sensitive data, or misclassifies the failure layer.

## Findings

| Finding                                                                                                           | Severity | Review status |
| ----------------------------------------------------------------------------------------------------------------- | -------- | ------------- |
| The walkthrough failed before a trustworthy role/AI workflow verdict because login/session setup is broken.       | P1       | accepted      |
| Existing e2e specs still expect `data.token`, while the current session route strips it and uses HttpOnly cookie. | P1       | accepted      |
| Login UI still assumes a stripped token field exists for personal users.                                          | P1       | accepted      |
| Admin browser denial fixture needs to be realigned with cookie/current-session behavior.                          | P1       | accepted      |

## Boundary Checks

| Check                                                                                                           | Result |
| --------------------------------------------------------------------------------------------------------------- | ------ |
| Source/test/package/schema changes avoided                                                                      | pass   |
| Provider call and Provider configuration avoided                                                                | pass   |
| Direct DB access by Agent avoided                                                                               | pass   |
| Credentials, cookies, tokens, sessions, localStorage values, and headers omitted                                | pass   |
| Raw DOM, screenshots, traces, Provider payloads, prompts, AI output, raw DB rows, PII, and full content omitted | pass   |
| Release readiness, final Pass, production usability, and Cost Calibration claims avoided                        | pass   |

## Decision

The blocked evidence is valid for diagnosis, but this review does not approve source/test repair, merge, push, release
readiness, final Pass, production usability, Cost Calibration, Provider execution, DB action, dependency change, schema
change, staging/prod deploy, PR, or force push.

The next task should be a narrow source/test repair for cookie-backed login and acceptance fixture alignment, followed by
the same stage 3 role/workflow rerun.
