# 2026-07-08 Profile Information Hierarchy Evidence

## Scope

- Branch: `codex/profile-information-hierarchy`
- Surface: learner `/profile`
- Roles covered by unit regression:
  - personal standard learner
  - personal advanced learner
  - organization standard employee
  - organization advanced employee
- Evidence is redacted. No credentials, session values, cookies, tokens, env values, DB URLs, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, screenshots, raw DOM, full question, full paper, full material, or raw resource content are recorded.

## Root Cause Confirmation

The existing profile page rendered account support, session expiry, effective authorization, edition authorization, authorization detail, and personal authorization records as default top-level content for all learner and employee roles. Because the same component serves personal learners and organization employees, enterprise employee profiles also saw personal-card-oriented affordances too prominently.

This was confirmed as a frontend information hierarchy issue. No API, service, repository, authorization computation, database, schema, migration, seed, fixture, Provider, package, lockfile, env, staging, prod, or deploy changes were made.

## Red Test

Command:

```text
npm.cmd exec -- vitest run tests/unit/student-profile-redeem-ui.test.ts
```

Expected result before implementation:

- Failed on compact profile expectations.
- Failure reasons matched missing masked account display, missing `student-profile-current-authorization` summary, and details/help being visible by default.

## Green Validation

| Command                                                                                        | Result                   |
| ---------------------------------------------------------------------------------------------- | ------------------------ |
| `npm.cmd exec -- vitest run tests/unit/student-profile-redeem-ui.test.ts`                      | Passed: 1 file, 10 tests |
| `npm.cmd exec -- vitest run tests/unit/phase-11-contact-config-purchase-guidance-loop.test.ts` | Passed: 1 file, 3 tests  |
| `npm.cmd run lint`                                                                             | Passed                   |
| `npm.cmd run typecheck`                                                                        | Passed                   |
| `git diff --check`                                                                             | Passed                   |

## Behavior Verified

- Profile header keeps the account recognizable while masking the account phone-like value.
- Default profile view shows a compact current authorization summary.
- Account/password help and session expiry are hidden until the user opens account help.
- Effective authorization, edition authorization, authorization detail, and personal authorization records are hidden until the user opens authorization details.
- Personal standard and personal advanced learners keep a primary redeem-code entry.
- Organization standard and organization advanced employees do not see a primary redeem-code entry by default.
- Organization employees without personal authorization do not see default waiting-card or purchase-guidance prompts.
- Authorization details remain available after explicit expansion, preserving support and acceptance visibility.

## Requirement Mapping Result

- `D13` learner auth/login/redeem/profile: profile now separates account, current authorization summary, account actions, and detail-only support information.
- Batch 0 global foundation: default page structure now follows context, summary, work area, evidence/status instead of one long expanded detail stack.
- Batch 3 organization employee profile recommendation: organization employees see organization authorization clearly without default personal-card prompts.
- Batch 4 personal student profile recommendation: personal authorization, effective edition, upgrade status, expiry, and quota owner remain available while low-frequency details are collapsed by default.
- ADR-007: `effectiveEdition` remains displayed as derived runtime data only; no source authorization record is overwritten or reinterpreted by UI.

## Files Changed

- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `tests/unit/student-profile-redeem-ui.test.ts`
- `e2e/edition-aware-authorization-local-flow.spec.ts`
- `e2e/local-business-flow.spec.ts`
- `docs/05-execution-logs/task-plans/2026-07-08-profile-information-hierarchy.md`
