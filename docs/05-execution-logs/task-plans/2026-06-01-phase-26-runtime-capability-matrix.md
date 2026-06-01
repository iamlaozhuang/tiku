# Phase 26 Runtime Capability Matrix Plan

## Summary

- Task id: `phase-26-runtime-capability-matrix`.
- Scope: docs-only/read-only capability matrix.
- Output: capability matrix in the Phase 26 readiness baseline report.

## Sources

- `src/app/api/v1` route inventory.
- `src/server/services`, `src/server/repositories`, `src/server/contracts`, `src/server/mappers`, and `src/db/schema` inventories.
- `src/app/(student)` and `src/app/(admin)` route inventories.
- Unit/e2e file inventory.
- Phase 22-25 runtime and fresh validation evidence.

## Method

1. Inventory core runtime surfaces without editing source.
2. Assign capability status: `implemented`, `verified`, `mock-only`, `fixture-only`, `blocked`, or `missing`.
3. Prefer evidence from local e2e, unit tests, build, and fresh validation runner over source-file existence alone.
4. Record risks where evidence is synthetic, seeded, or local/mock-only.

## Stop-The-Line Conditions

- Capability proof would require running fresh DB full validation, reading env values, calling providers, or changing product code.
