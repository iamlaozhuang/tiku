# standard-core-student-local-full-flow-validation Audit

## Review Status

- Verdict: `APPROVE_BLOCKED_EVIDENCE_CLOSEOUT`
- Runtime verdict: `BLOCKED_LOCAL_FULL_FLOW_VALIDATION`
- Blocking evidence: targeted localhost Playwright runtime command failed with 10 passed and 2 failed tests.
- No product source, test source, e2e spec, schema, dependency, env, provider, deployment, PR, force-push, destructive DB,
  or Cost Calibration Gate work was performed.

## Blocking Findings

1. `local-business-flow.spec.ts` currently expects `tiku.localSessionToken` in browser localStorage after student login,
   but the current login contract and unit test baseline keep bearer tokens out of localStorage.
2. `student-practice-mock-entry.spec.ts` currently expects the runtime practice page to show `practice-resume-choice`,
   but the local runtime data in this run did not satisfy the resume-progress condition used by
   `StudentPracticePage.tsx`.

## Decision

- Do not seed or recommend `standard-core-student-experience-closure-readiness-audit` from this run.
- Keep `UC-STD-ACCOUNT-SESSION`, `UC-STD-PERSONAL-AUTH-REDEEM`, `UC-STD-PRACTICE`, `UC-STD-MOCK-EXAM`, and
  `UC-STD-REPORT-MISTAKE-BOOK` at `local_experience_ready` with blocked full-flow evidence.
- Recommended smallest follow-up task: `standard-core-student-local-full-flow-contract-repair`.
- The follow-up should decide and repair the local browser session/runtime API contract plus the practice resume fixture
  or UI contract before rerunning this local full-flow validation.

## Residual Risk

- The failing command exercised local writable runtime flows; evidence records only command results and redacted failure
  summaries.
- Because runtime evidence failed, no local experience closure or release readiness claim is justified.
- Release, staging/prod, provider/model, payment, external-service, dependency, schema/migration, `.env*`, destructive
  database operations, PR, force-push, and Cost Calibration Gate remain blocked.
