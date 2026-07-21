# F-0018 / F-0020 Learner History Pagination Plan

## Boundary

- Task: `p1-remediation-rc-04-learner-history-pagination-2026-07-20`
- Findings: `F-0018`, `F-0020`
- Root invariant: authorization, user-removal, search and status define the visible collection before ordering, counting and pagination.
- Risk: bounded permission contraction and database application-layer read logic only; no schema/migration, persistent database execution, dependency, Provider, external service, secret/env, deployment or safety-mechanism work.
- Approval: `standing-bounded-medium-risk-closeout-approval-2026-07-20`.

Historical reports remain snapshot-backed after paper withdrawal. Stopped questions remain visible in the mistake book as required. Only the learner's explicit `is_removed` state is excluded from mistake-book lists.

## TDD

1. RED: prove repository list paths paginate only rows covered by current authorization, exclude user-removed mistake rows before count, use stable tie-break ordering, and read scopes/rows/total in one repeatable-read snapshot.
2. RED: prove services preserve repository `total` rather than replacing it with current-page length.
3. RED: prove report search/status are encoded in the server request, reset the page to one, find a result previously confined to a later page, and ignore a stale response during rapid filter switching.
4. GREEN: minimally move list visibility into the two repositories, consume their exact totals in services, and make the UI request the authoritative filtered page.

## Validation

- Focused: task contract focused profile.
- Regression: student mistake-book runtime and UI.
- Static: exact ESLint, TypeScript, Prettier check, `git diff --check`.
- Impact: production build plus P0 global and serial baselines after candidate freeze.
- Review: one main-thread adversarial review covering entitlement non-expansion, snapshot semantics, stable pagination, stale UI responses, schema absence, no real database, and exact diff.

## Recovery

- Base: `master` / `origin/master` at `5d49f9a4478332fe9b69fd8d7080239b5296b093`.
- Branch: `fix/learner-history-pagination`.
- Stop if scope must expand, an entitlement would broaden, schema/migration or real database becomes necessary, validation requires weakening, or kernel/guard/smoke changes are requested.
