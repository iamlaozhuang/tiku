# Traceability: Verify Local Acceptance Session Boundary

- Task id: `verify-local-acceptance-session-boundary-2026-06-29`
- Source story: `sec-redlog-003_from_security_data_redaction_log_boundary_inventory_2026_06_29`
- Branch: `codex/verify-local-acceptance-boundary-20260629`
- Scope: local unit security regression only.

## Requirement Mapping

| Requirement                                                                                      | Verification Surface                                    | Status |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ------ |
| Local acceptance bootstrap must stay unavailable in production mode.                             | `tests/unit/local-acceptance-session-bootstrap.test.ts` | pass   |
| Bootstrap creation must be limited to localhost-style origins.                                   | `tests/unit/local-acceptance-session-bootstrap.test.ts` | pass   |
| Credential-like material must be carried by cookie boundary only, not response body or evidence. | `tests/unit/local-acceptance-session-bootstrap.test.ts` | pass   |
| Unsupported roles must be rejected.                                                              | `tests/unit/local-acceptance-session-bootstrap.test.ts` | pass   |

## Boundary Mapping

- No browser runtime, dev server, DB connection, Provider/AI call, release readiness, final Pass, or Cost Calibration.
- No account fixture read or session switching.
- Evidence may record only file paths, test names, command status, counts, and redacted assertion summaries.
