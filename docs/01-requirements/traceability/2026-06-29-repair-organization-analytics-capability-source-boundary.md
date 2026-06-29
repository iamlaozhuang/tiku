# Repair Organization Analytics Capability Source Boundary Traceability

## Scope

- Task id: `repair-organization-analytics-capability-source-boundary-2026-06-29`
- Finding id: `role-inv-002`
- Source verification: `verify-organization-analytics-admin-capability-source-boundary-2026-06-29`
- Execution mode: focused local source/test repair under centralized local repair-loop authorization.

## Requirement Alignment

| Requirement                                                                                                                                                     | Evidence                                                                                                                                     | Status                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Organization analytics advanced access must be derived from service-computed organization capability source, not route-synthesized role/query context.          | Runtime resolver now requires service-computed organization workspace capability metadata before building analytics admin context.           | pass_pending_full_gate_validation |
| Visible organization scope must remain enforced before repository-backed analytics reads.                                                                       | Service base access no longer relies on route query synthesis; repository visible-scope resolution remains the requested organization guard. | pass_pending_full_gate_validation |
| Focused tests must reject role-present sessions when service-computed organization capability is absent or false.                                               | `src/server/services/organization-analytics-route.test.ts` adds missing-capability and false-capability rejection coverage.                  | pass_pending_full_gate_validation |
| Evidence must not record credential, cookie, token, session, localStorage, Authorization header, env, DB, Provider, raw DOM, screenshot, trace, or raw content. | Evidence records file paths, risk category, status, counts, and redacted summaries only.                                                     | pass                              |

## Finding Repair

`role-inv-002` was confirmed as a medium-severity capability-source mismatch. The repaired route still uses the current session to identify the admin, but it now requires service-computed organization workspace capability metadata before creating an organization analytics admin context.

No credential values, cookie values, session values, Authorization headers, env content, DB rows, Provider payloads, raw DOM, screenshots, traces, or complete question/paper/material/resource/chunk content are recorded in this traceability file.

## Next Task

- `repair-organization-ai-generation-capability-source-boundary-2026-06-29`
- Status: pending task materialization under centralized local security repair-loop authorization if selected next.
- Intent: repair the next confirmed service-computed capability-source boundary with separate task-scoped materialization before source/test changes.
