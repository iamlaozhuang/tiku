# Traceability: Security Unit B Auth Role Boundary Static Review

- Task id: `security-unit-b-auth-role-boundary-static-review-2026-06-29`
- Branch: `codex/unit-b-auth-boundary-review-20260629`
- Base commit: `6ab7fa41d958ef7d5cab96a7cebbb7d2cfcc95ba`
- Scope: bounded static review and first minimal repair task split only.
- Scan mode: parent-agent bounded static review, not an exhaustive Codex Security scan.

## Requirement Mapping

| Requirement                                                                                                                  | Verification Surface                                                                     | Status   |
| ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------- |
| Keep release, deploy, final Pass, Cost Calibration, DB, Provider, browser, dependency, and sensitive evidence gates blocked. | State, queue, task plan, evidence, audit, and acceptance docs.                           | complete |
| Confirm current Unit A baseline before Unit B.                                                                               | Latest Unit A plan, evidence, audit, acceptance, and base commit.                        | complete |
| Review permission and role boundary surfaces without source/test edits.                                                      | Selected route, service, mapper, auth, and focused test files.                           | complete |
| Split the first minimal executable repair task without executing it.                                                         | `repair-organization-training-capability-source-boundary-2026-06-29` in state and queue. | complete |

## Static Review Matrix

| Area                                | Reviewed Surface                                                                                                          | Static Finding                                                                                                                          | Status         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Shared organization workspace guard | `src/server/services/admin-workspace-role-guard-service.ts`                                                               | Advanced organization routes require service-computed `org_auth` capability metadata and reject fallback summaries.                     | covered        |
| Organization analytics              | `src/server/services/organization-analytics-route.ts` and focused route tests                                             | Runtime access checks service-computed organization capability before analytics reads.                                                  | covered        |
| Organization AI generation          | `src/server/services/admin-ai-generation-local-contract-route.ts` and focused route tests                                 | Runtime access checks service-computed organization capability before local-contract task actions.                                      | covered        |
| Organization training admin runtime | `src/server/services/organization-training-route.ts` and focused route tests                                              | Admin context is role-gated plus visible-scope-gated, but does not yet mirror the service-computed capability-source guard.             | candidate risk |
| Student and employee training       | `src/server/services/organization-training-route.ts` and service helpers                                                  | Employee routes require employee user type and advanced org authorization context before answer/list operations.                        | covered        |
| Session and auth mapper             | `src/server/services/session-service.ts`, `src/server/auth/local-session-runtime.ts`, `src/server/mappers/auth-mapper.ts` | Capability summary is projected from session/auth account metadata; deeper org_auth SSOT computation remains a larger follow-up review. | deferred       |

## Findings

| Finding                | Severity | Status            | Evidence Summary                                                                                                                                                   | Follow-up Task                                                       |
| ---------------------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `unit-b-auth-role-001` | medium   | blocked follow-up | Organization training runtime admin context lacks the same service-computed capability-source guard already present in analytics and organization AI generation.   | `repair-organization-training-capability-source-boundary-2026-06-29` |
| `unit-b-auth-role-002` | medium   | deferred          | Session capability projection still deserves deeper ADR-007 alignment review because source-of-truth org_auth calculation has broader schema/service implications. | future auth mapper SSOT review task                                  |

## Next Minimal Task

Recommended next task: `repair-organization-training-capability-source-boundary-2026-06-29`.

Execution remains blocked until fresh source/test repair approval materializes the task branch, allowed files, blocked
files, validation commands, evidence redaction, and closeout policy.
