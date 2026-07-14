# Content Admin Platform E5 Cross-Role Exception Closure Audit

Date: 2026-07-14

Task: `content-admin-platform-e5-cross-role-exception-closure-2026-07-13`

Verdict: `APPROVE`

No blocking findings. No approved exception remains.

Cost Calibration Gate remains blocked.

## Round 1 — Correctness, Data Integrity, Requirements, And Contracts

- Attacked the `(dev)` route assumption from first principles: route groups do not alter URLs, so a source comment was
  not a production boundary. The new server layout fails closed outside exact development. Direct invocation and
  production build metadata independently prove Next's 404 behavior while local development remains available.
- Attacked the legacy organization alias. It no longer imports or renders organization UI under a content pathname; it
  redirects to the canonical organization route, where organization role and server-derived context are mandatory.
- Attacked resource and log ownership. Operations resource compatibility cannot restore content write authority, and the
  AI-audit alias cannot bypass the redacted audit-log surface. Exact redirects and destination guard decisions pass.
- Attacked public discovery versus authentication. Root links remain public navigation only; role-specific server-session
  landing and runtime workspace guards independently deny empty or non-owning roles.
- Finding repaired: the first proof relied on source text for the production `notFound()` call and omitted an explicit
  empty-role discovery attack. Runtime layout invocation and all three discovery destinations now fail closed in tests.

## Round 2 — Regression, Privilege, Exceptional Paths, Consistency, And Over-Design

- Attacked production/test environment drift. Only literal `development` enables the route; `production`, `test` and
  absent/default non-development values deny. The assertion now requires `NEXT_HTTP_ERROR_FALLBACK;404`, not any throw.
- Attacked redirect chains and contaminated roles. Content and operations admins are denied at canonical destinations;
  mixed organization/operations roles are denied on the content alias before redirect; missing organization context is
  denied; only `super_admin` crosses workspaces and still needs organization context.
- Attacked client bypass and menu-only authorization. The change is entirely server-side and leaves the existing
  service-computed guard unchanged. No query flag, edition fallback, organization selector or UI visibility grant exists.
- Attacked sensitive data and regressions. Authorization, phone, card, log-redaction, organization training, AI and
  historical paper boundaries receive focused/full regression. No credential, secret, raw prompt/answer, plaintext
  `redeem_code`, DB row or design-board payload entered source, tests or evidence.
- Finding repaired: generic throw matching could hide an unrelated failure, and contaminated-role alias behavior lacked
  direct proof. Exact digest and mixed-role regressions close both. No middleware, shared route registry or generalized
  permission abstraction was introduced.

## Approval

`APPROVE`: E0-G01 through E0-G04 are closed with minimal server-side gates and executable role proofs. UI consistency
does not become an authorization path, the exception ledger remains empty, E6 retains cumulative ownership and no
deployment was performed.
