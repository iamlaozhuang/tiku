# Content Admin Platform B3 Detail And Feedback Primitives Audit

Date: 2026-07-13

Task: `content-admin-platform-b3-detail-feedback-primitives-2026-07-13`

Verdict: `APPROVE`

No blocking findings.

Cost Calibration Gate remains blocked.

## Round 1 — Correctness, Data Integrity, Requirements, And Contracts

- Attacked Drawer callback churn. The prior effect depended on `onClose`, so a caller-created callback could restore and
  recapture focus during an open Drawer. B3 stores the current callback separately and runs focus capture/restoration only
  on actual mount/unmount; a rerender test proves focus stays put and Escape invokes the newest callback.
- Attacked the focus loop in both directions. Close is the deterministic initial target, Shift+Tab wraps to the last
  action, Tab wraps back, Escape closes, and the still-connected trigger regains focus after unmount.
- Attacked nested-modal behavior. The Drawer ignores already-handled events and events whose nearest modal dialog is a
  different dialog, preventing an inner modal from closing or trapping against the outer Drawer.
- Attacked feedback semantics. Success is a polite status; error and conflict are assertive alerts with distinct tone
  metadata and titles. Caller copy is safe and no raw response message or diagnostic is rendered.
- Attacked object update integrity. The pure helper replaces every matching public id without mutating the current list,
  preserves unrelated object identity, and prepends only genuinely new server-returned objects.
- Attacked mutation recovery. Question/material success updates only the returned object; rejected action requests leave
  the list unchanged; save failure and 409 conflict leave the active form and author input intact.

## Round 2 — Regression, Privilege, Exceptional Paths, Consistency, And Over-Design

- Attacked duplicate submission. The pre-existing in-flight save guard remains before the network call, the submit button
  and status explain the wait, and the focused test proves two submit intents produce one POST.
- Attacked authorization and lifecycle expansion. Existing session checks, endpoints, confirmation, locked/copy/disable
  rules, and server-returned DTO authority remain unchanged; no optimistic status or role inference was introduced.
- Attacked data leakage. Feedback uses fixed Chinese recovery copy and readable object names only. Tokens, raw API
  messages, stack traces, internal numeric ids, phone values, `redeem_code`, Prompt/Provider payloads, and authorization
  internals are absent.
- Attacked cross-consumer Drawer regression. Direct primitive tests plus content-detail and paper-composer focused suites
  pass, covering read-only content and interactive composer consumers.
- Attacked stale or inaccessible feedback. Toasts have atomic live regions, persistent caller-controlled lifetime, and a
  36px explicit dismiss target; no short auto-dismiss timer can erase an error before it is read.
- Attacked AI scope creep. Knowledge-recommendation request, result, feedback, and formal-content boundaries are not
  changed; only the behavior-equivalent generic returned-object helper is reused.
- Attacked over-design. B3 adds no global provider, portal manager, queue, timer, universal mutation state machine,
  dependency, API, database, build configuration, or broad page-family rollout.

## Approval

`APPROVE`: scope, focused validation, PIC accounting, and protected authorization/content-lifecycle boundaries match the
B3 contract.
