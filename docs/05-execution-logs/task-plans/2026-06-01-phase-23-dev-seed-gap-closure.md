# Phase 23 Dev Seed Gap Closure Plan

## Scope

- Inspect current `src/db/dev-seed.ts` and `src/db/dev-seed.test.ts`.
- Verify idempotent baseline data needed before validation prep.
- Make only minimum seed/test changes if a confirmed gap exists.
- Run focused seed unit tests and, when safe, the existing dev seed command.

## Stop Conditions

- Any need for schema/migration/drizzle changes.
- Any need for dependency changes.
- Any need for raw SQL or destructive DB operations.
- Any output would reveal `.env.local`, DB URL, credentials, or plaintext `redeem_code`.

## Validation Commands

- `npm.cmd run test:unit -- src/db/dev-seed.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`
