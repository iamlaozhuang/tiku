# 2026-07-05 Full-chain Scenario 11 Advanced Employee Affected-node Rerun After Question Count Boundary Repair Evidence

## Scope

- Task id: `full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair-2026-07-05`
- Branch: `codex/full-chain-scenario-11-affected-node-rerun-after-question-count-boundary-repair-2026-07-05`
- Status: pass
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Selector label: `fc_org_advanced_employee`
- Role label: `org_advanced_employee`
- Scope label: `marketing:3`

## Redaction

Evidence is limited to labels, aggregate counts, command names, pass/fail/block, and redacted summaries. No credentials, tokens, sessions, cookies, raw DB rows, internal ids, DOM, screenshots, traces, Provider payloads, raw prompts, raw AI I/O, full content, private fixture contents, or raw employee answers are recorded.

## Lanes

| Lane                                 | Status | Redacted summary                                                             |
| ------------------------------------ | ------ | ---------------------------------------------------------------------------- |
| Task materialization                 | pass   | Plan/evidence/audit/state/queue created before runtime.                      |
| Read gate                            | pass   | Required requirements, evidence, audit, source, and tests read.              |
| Minimum pre-browser checklist        | pass   | Selector, DB target, auth, employee, content, and training baseline present. |
| Browser login readiness smoke        | pass   | Login inputs waited until hydrated/interactable before private input.        |
| Enterprise training answerability    | pass   | Affected training row exposed the capped answerable question count.          |
| Enterprise training product UI write | pass   | One selector-scoped training answer was submitted through product UI.        |
| AI training no-submit boundary       | pass   | AI training surface was available; no AI submit or Provider call executed.   |
| Selector-scoped aggregate DB verify  | pass   | Post-runtime aggregate counts matched the expected submitted answer state.   |
| Runtime cleanup                      | pass   | Local runtime was stopped after observation.                                 |
| Closeout gates                       | pass   | Final scoped validation and Module Run v2 gates passed.                      |

## Preflight Evidence

Command label: `selector-scoped aggregate DB preflight after question count boundary repair`

| Check                                     | Count/Result |
| ----------------------------------------- | ------------ |
| target DB matched                         | 1            |
| private account plan present              | 1            |
| private employee selector present         | 1            |
| active advanced `marketing:3` auth        | 1            |
| active advanced `marketing:3` employee    | 6            |
| published `marketing:3` training          | 1            |
| published training question count         | 4            |
| training source context count             | 1            |
| training source context question count    | 4            |
| paper-source question snapshot candidates | 7            |
| expected capped question snapshot count   | 4            |
| existing advanced training answers        | 0            |
| direct DB read executed                   | 1            |
| direct DB write executed                  | 0            |

Preflight result: pass. The source repair leaves more paper-source candidates than the training count, but the current DTO boundary is expected to expose only the capped count. Continue to browser login readiness smoke.

## Runtime Evidence

Command labels:

- `browser login readiness smoke`
- `affected-node enterprise training product UI runtime`
- `AI training no-submit boundary observation`
- `selector-scoped aggregate DB post-runtime verification`
- `runtime cleanup`

| Check                                  | Count/Result |
| -------------------------------------- | ------------ |
| browser login readiness smoke          | 1            |
| private employee selector input loaded | 1            |
| product browser login succeeded        | 1            |
| visible enterprise training rows       | 1            |
| exposed training question count        | 4            |
| answerable question fields             | 4            |
| product UI draft action executed       | 1            |
| product UI submit succeeded            | 1            |
| AI training surface available          | 1            |
| AI submit executed                     | 0            |
| Provider/staging/prod/Cost executed    | 0            |
| employee import repeated               | 0            |
| S10 learning data repeated             | 0            |
| S1-S10 runtime repeated                | 0            |
| source/test/dependency/schema changed  | 0            |

Runtime note: an initial non-authoritative private account source probe was rejected before the affected-node flow; the authoritative S11 employee-import selector input was then used. No raw values were captured, and no product source repair was made.

## Post-runtime Aggregate DB Verification

Command label: `selector-scoped aggregate DB post-runtime verification`

| Check                             | Count/Result |
| --------------------------------- | ------------ |
| target DB matched                 | 1            |
| target employee count             | 1            |
| visible `marketing:3` training    | 1            |
| visible training question count   | 4            |
| training answer total count       | 1            |
| in-progress training answer count | 0            |
| submitted training answer count   | 1            |
| submitted-at present count        | 1            |
| score summary present count       | 1            |
| direct DB read executed           | 1            |
| direct DB write executed          | 0            |

Post-runtime result: pass. Scenario 11 affected-node enterprise training answerability and product-UI submission are verified for the authoritative selector scope.

## Runtime Cleanup

Runtime cleanup result: pass. The local dev server used for this task was stopped after browser and aggregate DB verification.

## Closeout Gates

| Command label                          | Result |
| -------------------------------------- | ------ |
| scoped unit validation                 | pass   |
| scoped Prettier write                  | pass   |
| scoped Prettier check                  | pass   |
| `git diff --check`                     | pass   |
| blocked path diff                      | pass   |
| Module Run v2 pre-commit hardening     | pass   |
| Module Run v2 pre-push readiness       | pass   |
| repository checkpoint/status alignment | pass   |

Closeout result: pass. No source/test/dependency/schema/migration/seed files changed in this runtime rerun task.

## Non-Claims

No Scenario 12, Provider readiness, Cost Calibration, staging/prod readiness, release readiness, final Pass, production usability, durable training-question snapshot persistence, per-question employee answer storage, or complete full-chain acceptance is claimed.
