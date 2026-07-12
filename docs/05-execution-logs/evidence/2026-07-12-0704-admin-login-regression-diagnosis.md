# 0704 Admin Login Regression Diagnosis Evidence

## Scope

- Task id: `0704-admin-login-regression-diagnosis-2026-07-12`
- Branch: `codex/0704-admin-login-regression-diagnosis`
- Result: runtime target recovery; no credential, authentication-source, or account repair required.

## Prior And Current Evidence

- 2026-07-09 account-matrix evidence records all core roles as passing against the explicit 0704 target.
- 2026-07-10 credential-catalog consolidation records the same 9-role matrix as passing.
- Current authentication source files have no diff from `fa65cbd9b` and their latest relevant source change predates
  both passing matrices.
- The current canonical credential catalog was copied faithfully from archived sources; all account/password pairs
  match their source material in memory. No value was printed or persisted.

## Reproduction Pattern

Before the decisive restart:

| Role category                        | Result                                                     |
| ------------------------------------ | ---------------------------------------------------------- |
| Platform/content/organization admins | 5 of 5 invalid-credential category                         |
| Personal standard learner            | invalid-credential category                                |
| Organization advanced employee       | invalid-credential category                                |
| Personal advanced learner            | pass                                                       |
| Organization standard employee       | pass                                                       |
| Service health                       | pass, which did not prove the intended database was active |

The current catalog contained no duplicate account or credential-pair groups.

## Root Cause Isolation

- Default localhost and canonical 0704 database labels are distinct.
- The prior process had a healthy listener and was described as using an override, but the intended target was not
  active. The exact lost/incorrect environment assignment cannot be reconstructed after that process was stopped.
- The service was relaunched from the canonical private target with `DATABASE_URL` overridden in the child process
  only and Provider explicitly disabled. `.env.local` was not modified.
- The same `content_admin` credential immediately changed from invalid-credential to pass after that restart.
- The remaining 8 core roles then passed once each. The final matrix is 9 of 9 pass.

Conclusion: the observed login failure was caused by the localhost process targeting the wrong database, not incorrect
credentials, authentication code, disabled accounts, or credential-catalog drift.

## Safety And Validation

| Check                                               | Result       |
| --------------------------------------------------- | ------------ |
| Explicit process-only 0704 target startup           | pass         |
| Provider enabled                                    | false        |
| `.env.local` modified                               | false        |
| Localhost health                                    | pass         |
| Core role login matrix                              | pass, 9 of 9 |
| Credential/session/cookie/token output              | none         |
| DB URL/env value/raw row/internal id output         | none         |
| Direct database access or mutation                  | not executed |
| Private credential file edit                        | not executed |
| Product source/test/package/schema/migration change | not executed |
| Screenshot/trace/raw DOM                            | not captured |
| Provider/staging/prod/deploy/Cost Calibration       | not executed |
