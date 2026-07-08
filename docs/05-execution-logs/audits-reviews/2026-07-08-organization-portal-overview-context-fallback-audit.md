# 2026-07-08 organization portal overview context fallback adversarial audit

## Reviewed Change

- Route resolver now prefers service-computed organization capability when available.
- If service-computed capability is missing, the resolver allows readonly overview only when the session still has:
  - an organization admin role;
  - a non-empty admin public id;
  - a non-empty session organization public id.
- Fallback passes `authorizationPublicId: null` and `effectiveEdition: "standard"` to avoid granting advanced capability from session role alone.

## Requirement Mapping Result

- The change maps to the organization-admin portal/status rows in the role-separated alignment and role-experience matrix.
- The change does not implement or relax the advanced organization training, analytics, or organization AI rows.
- The fallback is intentionally read-only and standard-context-only when service-computed capability is absent.

## Adversarial Checks

| Risk                                                          | Review Result                                                                                                        |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Non-organization admin can read portal overview               | Covered by unit test: non-org role returns `403189` and does not call reader.                                        |
| Organization admin without organization context can read data | Covered by unit test: missing organization context returns `403189` and does not call reader.                        |
| Fallback grants advanced organization abilities               | Not introduced. Fallback uses standard readonly context only; advanced training/analytics/AI routes are not changed. |
| Client-supplied organization id changes scope                 | Existing test still verifies client query organization id is ignored.                                                |
| Raw or sensitive data exposure in DTO                         | Existing tests verify no technical public ids leak from overview payload; evidence remains redacted.                 |
| Organization write authority accidentally added               | No write route, repository mutation, UI write action, schema, or seed change was introduced.                         |

## Conclusion

The original failure was a route-level guard mismatch, not missing UI data. The fix narrows to the organization portal readonly overview context resolver and preserves service-layer authorization for advanced-only organization capabilities.
