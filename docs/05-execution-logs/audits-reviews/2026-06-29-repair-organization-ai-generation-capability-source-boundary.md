# Repair Organization AI Generation Capability Source Boundary Audit Review

## Finding

- Finding id: `role-inv-003`
- Severity: medium
- Category: authorization source-of-truth boundary
- Status: repaired pending final closeout validation

## Review Summary

The organization AI generation local-contract route previously allowed organization workspace access from privileged organization role plus organization binding. The repair makes the organization workspace path require service-computed organization capability metadata and uses that metadata as the organization owner/history source.

This remains a local-contract boundary repair. It does not prove or execute any real Provider path, and it does not perform DB, browser, deployment, release readiness, final Pass, or Cost Calibration work.

## Security Controls

| Control                                        | Review Result |
| ---------------------------------------------- | ------------- |
| Service-computed capability required           | pass          |
| `org_auth` authorization source required       | pass          |
| Advanced edition required                      | pass          |
| `canUseOrganizationAdvancedWorkspace` required | pass          |
| Non-null organization public id required       | pass          |
| Missing/false capability regression coverage   | pass          |
| Provider-disabled local contract preserved     | pass          |
| Sensitive evidence redaction                   | pass          |

## Residual Risk

- This task only covers the local-contract route and focused entry-surface tests in its allowed files.
- Other queued role/API/logging findings remain separate tasks and require their own materialized scope before execution.

## Audit Decision

- Decision: acceptable for task closeout after final scoped formatting, diff check, focused tests, and Module Run v2 readiness gates pass.
