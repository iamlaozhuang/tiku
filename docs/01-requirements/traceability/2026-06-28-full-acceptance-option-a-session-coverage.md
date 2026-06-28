# Full Acceptance Option A Session Coverage Matrix

## Scope

This matrix tracks Option A only: localhost/127.0.0.1 test-owned account/session switching or approved safe role switching, with redacted role/route/status evidence only.

## Governance Gates

- threadRolloverGate: pass; resume from `project-state.yaml`, `task-queue.yaml`, task plan, and evidence only.
- automationHandoffPolicy: no automation handoff; continue by the next queued task after local commit/merge/push cleanup.
- Cost Calibration Gate remains blocked.

## Coverage Rows

| Role                        | Required Evidence                                                | Status  | Notes                                                                                           |
| --------------------------- | ---------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| `org_advanced_admin`        | Organization admin landing plus organization AI route status     | pass    | Organization routes observed; no Provider submit, no mutation.                                  |
| `org_standard_admin`        | Organization admin landing plus standard capability/route status | pass    | Standard-limited AI route/status surfaces observed; no generation/write action.                 |
| `org_advanced_employee`     | Organization employee learning/training route status             | pass    | Learner and organization-training route/status surfaces observed; no subjective answer content. |
| `org_standard_employee`     | Organization employee standard route status                      | pass    | Learner and organization-training route/status surfaces observed; no subjective answer content. |
| `ops_admin`                 | Ops/admin shell route status                                     | blocked | Approved acceptance input lacks usable `ops_admin` login fields for current session proof.      |
| `content_admin`             | Content/admin shell route status                                 | pass    | Content AI route/status surfaces observed; no Provider submit, no publish mutation.             |
| `personal_advanced_student` | Student advanced route/status surface                            | pass    | Learner routes observed; no answer content.                                                     |
| `personal_standard_student` | Student standard route/status surface                            | pass    | Learner routes observed; AI route/status observed only as limited surface.                      |

## Explicitly Out Of Scope

- Local UI/API mutation or write-flow execution.
- Provider/AI generation or scoring execution.
- Direct DB, schema, migration, or seed work.
- Dependency/package/lockfile changes.
- Release readiness or final Pass.
- Cost Calibration Gate.

## Residual Gap

- `ops_admin` current-session proof remains blocked until a later task either receives usable test-owned local login
  material or consumes Stage D read-only local DB aggregate proof to locate the seeded local `ops_admin` account source
  without exposing secrets, raw rows, internal ids, PII, or plaintext `redeem_code`.
