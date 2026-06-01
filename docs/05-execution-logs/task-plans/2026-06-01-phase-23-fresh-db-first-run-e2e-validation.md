# Phase 23 Fresh DB First Run E2E Validation Plan

## Scope

- Confirm fresh local/dev target classification without recording secrets.
- Use reviewed Drizzle migrate workflow only if target confirmation is safe.
- Run dev seed/bootstrap.
- Run validation data prep.
- Run full e2e and build.

## Stop Conditions

- Need for DB reset/drop/truncate/delete/volume reset or other destructive operation.
- Need for raw SQL, migration table repair, `drizzle-kit push`, schema/migration edits, or dependency changes.
- Target is not local/dev or cannot be classified safely.
- Any secret-bearing output cannot be safely redacted.

## Validation Commands

- Reviewed Drizzle migrate workflow for confirmed fresh local/dev target.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`
- Validation data prep command.
- `npm.cmd run test:e2e`
- `npm.cmd run build`
