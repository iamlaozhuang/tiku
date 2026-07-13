# Content Admin Platform D0 List Request Contract Tests Audit

Date: 2026-07-13

Task: `content-admin-platform-d0-list-request-contract-tests-2026-07-13`

Verdict: `APPROVE`

No blocking findings.

Cost Calibration Gate remains blocked.

## Round 1 — Correctness, Data Integrity, Requirements, And Contracts

- Attacked whether RED was asserted rather than observed. All four tests first ran as normal `it` cases and failed:
  question/material lacked a refreshing status, popstate did not change current controls, and edit cancel did not restore
  trigger focus or scroll. Existing list rows and requests reached the intended precondition before the missing assertion.
- Attacked race and URL regression. The existing normal tests for invalid URL normalization, canonical material initial
  restore, debounce, and out-of-order question responses remain unchanged and passed with the new contracts.
- Attacked owner ambiguity. Test names bind question refreshing to D1, material refreshing to D2, and popstate plus
  focus/scroll return to D3; none depends on C editor-route implementation.
- Attacked public contract accuracy. Assertions observe visible status copy and async-state role, accessible form controls,
  canonical URL/request values, DOM focus, and `window.scrollTo`; no private hook state or component internals are read.

## Round 2 — Regression, Privilege, Exceptional Paths, Consistency, And Over-Design

- Attacked test weakening. Final RED contracts use executable `it.fails`; Vitest reports four expected failures and will
  fail the suite if an owner makes a contract pass without removing `.fails`. No case is skipped, todo, commented out,
  snapshot-only, or excluded from the focused command.
- Attacked false-green masking inherent in expected-failure tests. Existing normal tests independently prove component
  mount, initial data, filter requests, row rendering, URL serialization and latest-intent behavior; D1-D3 must convert
  each owner case to normal tests rather than retain inversion after implementation.
- Attacked timing flakiness. Deferred requests wait for the exact filter URL before checking refreshing; popstate waits
  on the public control; return assertions are synchronous after explicit focus and cancel actions.
- Attacked scope and privilege expansion. D0 changes no runtime source, API, pagination vocabulary, authorization,
  content lifecycle, AI, database, Provider, dependency, build configuration, or deployment behavior.
- Attacked over-design. No test harness, alternate request state model, fixture package, browser automation, or framework
  dependency was added; contracts extend the existing focused consumer suite.

## Approval

`APPROVE`: RED evidence is fresh and executable, GREEN baselines remain active, and D1-D3 ownership is unambiguous.
