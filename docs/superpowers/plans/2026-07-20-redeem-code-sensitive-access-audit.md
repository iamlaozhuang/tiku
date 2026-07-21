# Redeem Code Sensitive Access Audit Plan

> Main-thread execution only. No subagent or independent reviewer is authorized.

## Goal

Close `F-0010` without widening plaintext entitlement. Ordinary list and detail reads remain useful but return only
masked values. Eligible `ops_admin` and `super_admin` users obtain plaintext through explicit no-store reveal actions,
and every UI copy waits for a successful server-side copy audit before writing to the clipboard.

## Authority And Boundary

- SSOT: the July 2 plaintext operations decision, advanced operations authorization module/story, `CT-REQ-052`,
  edition-aware authorization requirements, and ADR-007.
- Existing eligible roles stay exactly `ops_admin | super_admin`; `content_admin` and all other roles remain denied.
- Audit metadata may contain actor, action, target public ID or generation group, source surface, count, result, request IP,
  and timestamps supplied by persistence. It must never contain plaintext values or card hashes.
- No schema/migration, real or persistent database execution, dependency, Provider/external call, export, secret/env,
  deployment, PR, force-push, or safety-kernel change.
- Bounded approval: `standing-bounded-medium-risk-closeout-approval-2026-07-20`.
- Scope addition approval: the user approved `tests/unit/admin-user-org-auth-ops-baseline.test.ts` after its affected
  regression exposed two obsolete direct-plaintext assertions; no product or risk boundary changed.

## Root Cause And Adversarial Cases

The list and detail repositories currently return plaintext in ordinary GET payloads. The UI renders that value directly
and copies it locally, so neither viewing nor copying is a governed server event.

Attack cases:

- a base list/detail request discloses plaintext without a view audit;
- `content_admin`, an unauthenticated caller, or an invalid public ID reaches a disclosure action;
- reveal returns plaintext before its audit succeeds;
- copy reaches the clipboard when its audit fails;
- generation single/batch copy omits a target public ID or generation-group audit;
- audit metadata, errors, fixtures, or evidence contain plaintext or hashes;
- a repository adapter returns plaintext in a base DTO and bypasses service-level masking.

## TDD And Implementation

1. RED the existing runtime and UI tests for masked base reads, explicit reveal, audited single/batch copy, denied and
   missing targets, no-store responses, and redacted metadata.
2. Mask list/detail at both repository and service boundaries.
3. Add one explicit per-card reveal action and one single-or-batch copy action. Resolve exact public IDs before success,
   audit before returning plaintext or acknowledging copy, and fail closed when the disclosure repository or audit sink
   is unavailable.
4. Change the UI to reveal on demand, keep immutable per-card revealed state, await copy audit before clipboard write,
   and use generation group attribution for copy-all.
5. Keep the generation response window authorized and append a redacted plaintext-view audit for that returned batch;
   do not fold F-0017 generation transaction/retry work into this task.

## Verification And Metrics

- Focused and affected regression commands are frozen in `task-safety.json`; then run lint, typecheck, build, exact-file
  Prettier check, `git diff --check`, P0 global, and P0 serial, all serially.
- Main-thread adversarial review must prove no entitlement expansion, base-read leakage, clipboard-before-audit path,
  plaintext/hash audit content, schema/migration, real database execution, external call, or extra file.
- approvalRequests: `1` (affected regression allowlist omission); approvalIdMismatch: `0`;
  postApprovalCandidateTreeChanges: `0`; repeatedBlockerReports: `2`; validationRetryCount: `3` (one type correction and
  two affected-regression corrections); fullRuns: at most `1`.
