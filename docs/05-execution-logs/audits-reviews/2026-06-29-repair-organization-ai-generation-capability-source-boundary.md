# Repair Organization AI Generation Capability Source Boundary Audit Review

## Review Result

- Finding id: `role-inv-003`
- Severity: medium
- Category: authorization source-of-truth boundary
- Verdict: `approved_closed`
- Source/test repair executed: true
- APPROVE: focused repair and current evidence are approved as closed; no blocking findings remain within this task scope.

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

## Requirement Mapping Result

| Requirement                                                                       | Status | Evidence                                                                                                             |
| --------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- |
| Require service-computed organization capability source for AI generation.        | pass   | Runtime route validation in `src/server/services/admin-ai-generation-local-contract-route.ts`.                       |
| Use capability metadata as the organization owner/history source.                 | pass   | Organization task creation and history listing resolve organization public id from service-computed capability data. |
| Reject role-present sessions when service-computed capability is absent or false. | pass   | Focused route tests cover missing and false capability metadata before repository use.                               |
| Preserve Provider-disabled local-contract behavior.                               | pass   | Focused route and entry-surface validation passed.                                                                   |

## Residual Risk

- This task only covers the local-contract route and focused entry-surface tests in its allowed files.
- Other queued UI/UX, AI/Provider, DB/schema, dependency, and regression inventory items remain separate tasks and require their own materialized scope before execution.
- No DB, Provider, browser, release, dependency, package, lockfile, schema, migration, or seed action was performed.

## Audit Decision

- Decision: approved for task closeout after the closeout state commit, fast-forward merge, push, and short-branch cleanup complete under the materialized local repair-loop policy.
