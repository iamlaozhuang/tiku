# Phase 23 Fresh DB First Run E2E Validation Evidence

## Summary

- Result: pass after approved minimal e2e hardening.
- Scope: local_verification.
- Changed surfaces: fresh local/dev DB target, `.env.local` target databaseName, migrated DB, dev seed, validation data prep.
- Gates: `createdb` pass; secret-safe `.env.local` databaseName update pass; `drizzle-kit migrate` pass; dev seed pass; validation data prep pass; full e2e failed once; targeted e2e pass after hardening; full e2e pass after hardening; build pass.
- Forbidden scope (`forbiddenScope`): no dependency, schema/migration/drizzle, raw SQL, destructive DB, `.env.example`, secret disclosure, staging/prod/cloud/deploy, real provider, or external service.
- Residual gaps (`residualGaps`): none for the verified fresh local/dev first-run path; final quality gates still pending in closeout.

## Fresh DB Target

- Command: `docker compose exec -T tiku-postgres createdb -U tiku tiku_fresh_phase23_20260601_001`
- Result: pass.
- Target classification: `hostClass=loopback`, `databaseName=tiku_fresh_phase23_20260601_001`.
- Secret handling: full DB URL, username, password, and env line were not printed or recorded.

## Migration

- Command: `npx.cmd drizzle-kit migrate`
- Result: pass.
- Output summary: migrations applied successfully.

## Dev Seed

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`
- Result: pass.
- Redacted summary: `auth_user_count=2`, `admin_count=1`, `student_user_count=1`, `organization_count=1`, `personal_auth_count=1`, `paper_count=1`, `paper_question_count=1`, `model_config_count=1`.

## Validation Data Prep

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-ValidationDataPrep.ps1`
- Result: pass.
- Output summary: `e2e/validation-data-prep.spec.ts` passed, `1 passed`.

## Full E2E Attempt 1

- Command: `npm.cmd run test:e2e`
- Result: fail.
- Output summary: `26 passed`, `1 failed`.
- Failed test: `e2e/student-practice-mock-entry.spec.ts`.
- Failure summary: `/mistake-book` for the fixed dev student showed `0` records after the test submitted answer `A`.
- Root cause: dev seed marks option `A` as correct, so the fixed dev student did not create a `mistake_book` entry on a fresh DB. Previous prepared DBs could pass due to existing historical wrong-answer data.
- Stop-the-line decision: continue only into the approved e2e order/data-isolation hardening assessment with the smallest test-only change.

## Targeted E2E After Hardening

- Command: `npm.cmd run test:e2e -- e2e/student-practice-mock-entry.spec.ts`
- Result: pass.
- Output summary: `1 passed`.

## Full E2E Attempt 2

- Command: `npm.cmd run test:e2e`
- Result: pass.
- Output summary: `27 passed`.

## Build

- Command: `npm.cmd run build`
- Result: pass.
- Output summary: compiled successfully, TypeScript completed, static pages generated.
