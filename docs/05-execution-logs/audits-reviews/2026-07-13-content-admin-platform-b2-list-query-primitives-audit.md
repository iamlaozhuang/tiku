# Content Admin Platform B2 List-Query Primitives Audit

Date: 2026-07-13

Task: `content-admin-platform-b2-list-query-primitives-2026-07-13`

Verdict: `APPROVE`

No blocking findings.

Cost Calibration Gate remains blocked.

## Round 1 — Correctness, Data Integrity, Requirements, And Contracts

- Attacked URL normalization with missing, negative, non-integer, oversized, unknown-sort, and invalid-order values.
  The pure codec admits only positive integer pages, the existing 20/50/100 page-size contract, caller-approved sort
  fields, and asc/desc; focused tests prove deterministic fallbacks and canonical serialization.
- Attacked debounce semantics. The input and chip use current local intent while requests and URL state use the 250 ms
  debounced keyword. A rapid two-value material test proves only the final non-null keyword reaches the list API.
- Attacked stale writes. Every async session/list completion checks a monotonic intent before changing list data,
  pagination, unauthorized/error state, or readiness. An out-of-order question test resolves the newer request first and
  proves the older completion cannot overwrite it.
- Attacked two-consumer proof and pagination preservation. The same client contract drives distinct question and material
  API paths; a material URL restoration test proves page, pageSize, sort order, profession, and keyword survive parsing.
- Attacked chip correctness. Each chip owns one filter id, removal resets that filter plus page state, and the consumer
  test proves keyword removal updates the input and canonical URL.
- During review, the request gate was changed to lazy stable initialization and filter removal was changed to an
  exhaustive switch so render-time allocation and unknown-id side effects could not hide in the implementation.

## Round 2 — Regression, Privilege, Exceptional Paths, Consistency, And Over-Design

- Attacked authorization and lifecycle expansion. Existing session/admin checks, question/material endpoints, status
  transitions, locks, copy semantics, and service authorization remain untouched; B2 adds no new role or action path.
- Attacked data leakage. Chips render keyword or approved human-readable labels. Knowledge-node/tag references resolve to
  names and fall back to `名称不可用`; tokens, raw diagnostics, internal numeric ids, phone values, `redeem_code`, AI
  payloads, and authorization internals are never rendered.
- Attacked exceptional request ordering. Cancellation invalidates the current intent, a later begin supersedes all prior
  intents, and stale exceptions cannot demote a newer ready result to error.
- Attacked browser-history regression. B2 preserves the existing replace-state model and deliberately does not claim
  popstate, scroll, or focus restoration; those remain D3 acceptance work.
- Attacked cross-page inconsistency. B2 applies the primitives only to the required question/material family and defers
  paper/knowledge/resource rollout to E instead of silently changing unrelated consumers.
- Attacked duplicate abstraction and over-design. The codec delegates page-size vocabulary to the existing interaction
  contract; the latest-intent helper knows nothing about fetch/session/API envelopes; no universal list framework,
  AbortController policy, state machine, dependency, API, database, or build change was introduced.

## Approval

`APPROVE`: scope, focused validation, PIC accounting, and protected authorization/content-lifecycle boundaries match the
B2 contract.
