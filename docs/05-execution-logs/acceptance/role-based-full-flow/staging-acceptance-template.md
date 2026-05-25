# Role-Based Full-Flow Staging Acceptance Template

## Status

Template only. Not executed against `staging`.

## Approval Gate

Record approval before use:

- Approval owner:
- Approval time:
- Staging URL:
- Staging database/resource isolation reviewed:
- Secret/env separation reviewed:
- Evidence redaction reviewer:

## Environment Boundary

- `dev` local evidence source:
- `staging` target:
- `prod` untouched confirmation:
- No production data import confirmation:
- No shared writable object storage prefix confirmation:

## Execution Order

| Step                         | Staging action                                                                                                                                                           | Expected result                                                | Evidence path                                     | Result  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------- | ------- |
| 1. Preflight Data Inventory  | Inventory staging test-only user, organization, `org_auth`, `redeem_code`, `contact_config`, material, question, published paper, `audit_log`, and `ai_call_log` anchors | Prerequisites classified as present, missing, stale, or unsafe | Redacted table only                               | Pending |
| 2. System Ops Data Readiness | Verify or create staging test-only user, organization, `org_auth`, `redeem_code`, and `contact_config`                                                                   | Managed entities visible through system ops surfaces           | Public identifiers or labels only                 | Pending |
| 3. Content Ops Readiness     | Verify or create bounded material/question/paper data and publish it                                                                                                     | Published paper can bridge to student visibility               | Public identifiers and short labels only          | Pending |
| 4. Student Positive Flow     | Log in as authorized staging student, answer practice/mock, submit, and view report or feedback                                                                          | Authorized role completes learning loop                        | Screenshot/trace in ignored runtime artifact path | Pending |
| 5. Student Negative Flow     | Log in as no-auth or missing-scope staging student                                                                                                                       | Purchase guidance visible; content not leaked                  | Screenshot/trace in ignored runtime artifact path | Pending |
| 6. Oversight Flow            | Review `audit_log` and `ai_call_log` entries                                                                                                                             | Logs are present, read-only, and redaction-safe                | Redacted summaries only                           | Pending |
| 7. Closeout                  | Run staging-specific validation and repository hygiene                                                                                                                   | Decision recorded with unresolved issues                       | Evidence file                                     | Pending |

## AC-To-Runtime Matrix

| Acceptance criterion                       | Runtime proof | Status  | Remaining issue |
| ------------------------------------------ | ------------- | ------- | --------------- |
| Data prerequisites known before role flows |               | Pending |                 |
| System ops readiness                       |               | Pending |                 |
| Content ops readiness                      |               | Pending |                 |
| Student positive flow                      |               | Pending |                 |
| Student negative flow                      |               | Pending |                 |
| Oversight flow                             |               | Pending |                 |
| Evidence hygiene                           |               | Pending |                 |

## Problem Grading

| Severity | Role | Reproduction path | Expected | Actual | Status | Follow-up |
| -------- | ---- | ----------------- | -------- | ------ | ------ | --------- |
| P0       |      |                   |          |        |        |           |
| P1       |      |                   |          |        |        |           |
| P2       |      |                   |          |        |        |           |
| P3       |      |                   |          |        |        |           |

## Evidence Hygiene Checklist

| Check                                                                           | Result  |
| ------------------------------------------------------------------------------- | ------- |
| No secret/token/Authorization header recorded                                   | Pending |
| No raw provider payload, raw prompt, raw answer, or raw model response recorded | Pending |
| No full paper, full textbook, or OCR full text recorded                         | Pending |
| No customer-like private data recorded                                          | Pending |
| Screenshots/traces/reports kept in ignored runtime artifact paths               | Pending |
| Committed files limited to approved evidence/template paths                     | Pending |

## stagingDecision

`pending_staging_approval`

Allowed final values for a future approved staging run:

- `ready_for_owner_review`
- `blocked_by_p0`
- `blocked_by_p1`
- `blocked_by_approval_gate`
- `template_only_not_executed`
