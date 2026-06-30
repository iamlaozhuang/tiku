# Security Auth Role Boundary Follow-up Candidate Traceability

- Task id: `security-auth-role-boundary-followup-candidate-2026-06-30`
- Branch: `codex/security-auth-role-boundary-recheck-20260630`
- Status: in progress.
- Authorization source: `securityFollowupCentralApproval20260630`.
- Cost Calibration Gate remains blocked.

## Requirement Alignment

| Requirement               | Current task alignment                                                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Recheck before repair     | Recheck current master for auth mapper, admin workspace guard, and organization capability-source boundaries before any source or test edit. |
| Minimal local repair only | Default action is no source/test repair; if a current issue is confirmed, split or materialize a narrower exact repair task first.           |
| ADR-002 layering          | Review route/service/mapper boundaries without moving business logic into UI or route handlers.                                              |
| ADR-007 source of truth   | Verify role-derived session summaries do not masquerade as service-computed `org_auth` authorization facts.                                  |
| Evidence redaction        | Record only paths, statuses, counts, commands, and redacted summaries.                                                                       |

## Covered Surfaces

| Surface                                 | Mode                                           | Expected invariant                                                                                                   |
| --------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Auth mapper capability projection       | read-only static review and focused unit tests | Role-derived organization capability stays `session_fallback` unless backed by service-computed authorization facts. |
| Admin workspace role guard              | read-only static review and focused unit tests | Advanced organization access trusts only service-computed `org_auth` capability summaries.                           |
| Organization training boundary          | read-only static review and focused unit tests | Admin training actions require the service-computed capability-source guard already repaired on 2026-06-29.          |
| Organization analytics boundary         | read-only static review and focused unit tests | Analytics admin actions require service-computed organization capability metadata.                                   |
| Organization AI local contract boundary | read-only static review and focused unit tests | Local contract access keeps Provider/AI execution disabled and capability-source checks explicit.                    |

## Blocked Surfaces

- Source/test repair is blocked unless the recheck confirms a current actionable issue and a narrower exact repair task is materialized.
- DB connection, raw row read, mutation, schema, migration, seed, and `drizzle-kit push` are blocked.
- Provider/AI call, Provider configuration, model config read/write, prompt payload, and raw AI I/O are blocked.
- Browser/dev-server/e2e/raw DOM/screenshot/trace are blocked.
- Env, secrets, credentials, cookies, tokens, sessions, localStorage, Authorization headers, and connection strings are blocked.
- Package/lockfile/dependency changes are blocked.
- Staging/prod/cloud/deploy, release readiness, final Pass, Cost Calibration, PR, and force-push are blocked.
