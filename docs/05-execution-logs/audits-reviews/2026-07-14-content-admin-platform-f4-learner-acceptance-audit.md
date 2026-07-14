# Content Admin Platform F4 Learner Acceptance Audit

Date: 2026-07-14

Task: `content-admin-platform-f4-learner-acceptance-2026-07-13`

Verdict: `APPROVE`

No blocking findings.

Cost Calibration Gate remains blocked.

## Round 1 — Correctness, Data Integrity, Requirements, And Contracts

- Attacked identity and target correctness with separate standard/advanced personal sessions against the process-only
  0704 target. Session and authorization responses proved personal ownership and the expected effective edition; the UI
  did not choose or upgrade authorization.
- Attacked formal-learning integrity. Home paper cards proved current selections without following practice/mock links;
  no-parameter routes remained non-mutating guards. The standard report detail was GET-only and the advanced empty report
  state remained truthful. No start, answer, save, submit or retry path ran.
- Attacked personal-AI separation. Standard direct access rendered no advanced controls. Advanced personal AI retained
  four accountable zones, Provider-closed disabled generation, empty histories and no resume action. It wrote no formal
  question, paper, practice, mock, report or mistake-book record.
- Attacked session cleanup. Login/logout were the only product writes. The final login's single-active-session contract
  superseded any earlier temporary session, DELETE revoked the current session and the post-logout probe failed closed.
- The standard catalog credential drift is private acceptance-data maintenance, not a product or authorization defect.
  The successful credential came from the exact 0704 source named by the catalog under the user's explicit permission;
  no value entered repository evidence.

## Round 2 — Regression, Privilege, Exceptional Paths, Consistency, And Over-Design

- Attacked discovery versus authorization: the standard home hid AI and its direct route failed closed; the advanced home
  exposed AI while runtime availability still blocked generation. Profile, home and direct-route edition labels agreed.
- Attacked empty/loading timing. The first report assertion ran before the async list terminal state and was rejected as
  harness timing, not product evidence. Waiting for non-empty, truthful-empty, failure or authorization terminal state
  produced stable acceptance without source changes.
- Attacked historical recovery and data fabrication. Current advanced history had no resumable paper; F4 did not create
  one. Focused route/history tests prove only persisted sufficient assembled snapshots can expose resume.
- Attacked regression and exceptional behavior with nine focused learner/auth/AI files. All 160 tests passed, including
  stale history, direct standard denial, cookie-session, report state, formal-write isolation and persisted-resume paths.
- Attacked accessibility and layout at desktop and 390 px mobile widths. Representative pages had no page-level overflow
  and accepted keyboard focus. Browser/API/console/page-error counters were zero.
- No product/test/dependency/schema/environment artifact changed. Build/full regression correctly remains F5-owned;
  adding a new framework or fixture would have been over-design.

## Approval

`APPROVE`: F4 provides bounded representative learner acceptance with truthful current data, fail-closed edition and AI
boundaries, no business mutation, clean session/runtime teardown and passing focused quality gates. F5 retains cumulative
full regression, global PIC reconciliation and final Program closeout. Deployment remains blocked.
