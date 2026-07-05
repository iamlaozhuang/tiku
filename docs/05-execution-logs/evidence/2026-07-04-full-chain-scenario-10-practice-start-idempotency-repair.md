# 2026-07-04 Full-Chain Scenario 10 Practice Start Idempotency Repair Evidence

Status: pass

## Scope

- Task id: `full-chain-scenario-10-practice-start-idempotency-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-10-practice-start-idempotency-repair-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Affected scenario: `full-chain-scenario-10-standard-employee-learning-rerun-after-marketing-3-content-provisioning-2026-07-04`
- Scope label: `marketing:3`
- Role label: `org_standard_employee`

## Evidence Lanes

| Lane                     | Status | Redacted summary                                                                                                         |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| Task materialization     | pass   | Plan, state, queue, evidence, and audit are being aligned before implementation.                                         |
| Root cause investigation | pass   | S10 evidence and source show duplicate active practice state after concurrent-prone read-before-create start flow.       |
| Failing test             | pass   | Concurrent same user/paper start test failed before implementation with two create calls.                                |
| Source repair            | pass   | Service-layer in-flight fresh practice guard now returns one shared practice for concurrent same user/paper start calls. |
| Focused validation       | pass   | Focused practice service, UI, route, and student flow runtime smoke tests passed.                                        |

## Redaction Guard

- Credential/private value output: false
- Token/session/cookie/localStorage/Authorization header output: false
- Connection string/env value/raw DB row/internal id output: false
- Screenshot/raw DOM/trace output: false
- Provider payload/raw Prompt/raw AI I/O output: false
- Full private material/question/paper/answer content output: false
- Plaintext card values output: false
- Release readiness/final Pass/production usability claimed: false

## Root Cause Evidence

Command name: focused practice service RED test.

| Check                                          | Result                 |
| ---------------------------------------------- | ---------------------- |
| concurrent same user/paper start test observed | fail_before_fix        |
| create calls before fix                        | 2                      |
| failure reason                                 | duplicate create calls |

## Source Repair Evidence

Command name: focused practice service GREEN test.

| Check                                         | Result |
| --------------------------------------------- | ------ |
| service-layer in-flight idempotency guard     | pass   |
| concurrent same user/paper create calls after | 1      |
| returned shared practice result               | pass   |
| schema/migration/seed/dependency changed      | false  |
| direct DB mutation executed in repair task    | false  |

## Focused Validation

| Command name                                                                                                                                                    | Result         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `npm.cmd run test:unit -- --run src/server/services/practice-service.test.ts`                                                                                   | pass, 24 tests |
| `npm.cmd run test:unit -- --run tests/unit/student-practice-ui.test.ts src/server/services/practice-service.test.ts src/server/services/practice-route.test.ts` | pass, 50 tests |
| `npm.cmd run test:unit -- --run tests/unit/phase-7-student-flow-runtime-smoke.test.ts`                                                                          | pass, 3 tests  |

## Closeout Gates

| Gate                               | Result |
| ---------------------------------- | ------ |
| scoped Prettier write              | pass   |
| scoped Prettier check              | pass   |
| `git diff --check`                 | pass   |
| blocked path diff                  | pass   |
| repository checkpoint alignment    | pass   |
| Module Run v2 pre-commit hardening | pass   |
| Module Run v2 pre-push readiness   | pass   |

## Non-Claims

Scenario 10 rerun completion, Scenario 11, Provider, AI generation submit, staging/prod, Cost Calibration, release readiness, final Pass, production usability, and complete full-chain acceptance are not claimed.
