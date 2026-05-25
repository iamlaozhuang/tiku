# Evidence: Phase 11 Local E2E PostgreSQL Connection Pressure Fix

## Status

`closed`

## Scope Boundary

This task fixes local Playwright E2E concurrency only.

Forbidden actions not performed:

- no staging/prod connection;
- no deployment;
- no cloud resource, DNS, Tencent Cloud COS, or public object storage URL change;
- no dependency, package, lockfile, schema, migration, script, or environment file change;
- no `.env.local` read or output;
- no secret value, token, Authorization header, database URL, raw provider payload, raw prompt, raw answer, raw model response, full paper, full textbook, OCR full text, or customer/customer-like private content recorded.

## Root Cause Record

Previous evidence showed default Playwright parallelism exhausted local PostgreSQL connections, while the same suite passed with `--workers=1`.

The fix target is the Playwright default worker configuration for local runs.

During default E2E validation, the connection exhaustion no longer reproduced and Playwright reported `Running 15 tests using 1 worker`. A second deterministic local validation blocker appeared: `local-business-flow` clicked a `mistake_book` favorite/unfavorite action and navigated before the request settled, producing `net::ERR_ABORTED`. This is classified as local P1 E2E synchronization hygiene because it keeps the default local E2E gate red.

## TDD Record

| Step              | Command                                                                                                                                                                  | Result | Notes                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | -------------------------------------------------------------------------------- |
| Claim readiness   | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-e2e-postgres-connection-pressure-fix` | pass   | Task was pending and dependency was closed.                                      |
| RED               | `npm.cmd run test:unit -- tests/unit/phase-11-local-e2e-postgres-connection-pressure-fix.test.ts`                                                                        | fail   | Expected local Playwright workers to be `1`; current value was `undefined`.      |
| GREEN             | `npm.cmd run test:unit -- tests/unit/phase-11-local-e2e-postgres-connection-pressure-fix.test.ts`                                                                        | pass   | Local Playwright workers are capped at `1`.                                      |
| E2E blocker found | `npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts`                                                                                                                | fail   | `mistake_book` favorite/unfavorite request was aborted by subsequent navigation. |
| E2E blocker fixed | `npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts`                                                                                                                | pass   | The test now waits for the favorite/unfavorite response before navigating away.  |

## Validation Commands

| Command                                                                                                                             | Result | Notes                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| `npm.cmd run test:unit -- tests/unit/phase-11-local-e2e-postgres-connection-pressure-fix.test.ts`                                   | pass   | 1 test passed.                                                                                         |
| `npm.cmd run test:unit`                                                                                                             | pass   | 120 files and 450 tests passed.                                                                        |
| `npm.cmd run test:e2e`                                                                                                              | pass   | 15/15 passed using 1 worker; hydration mismatch logs remain for the next P2 task.                      |
| `npm.cmd run build`                                                                                                                 | pass   | Next.js production build passed; `.env.local` was detected but no secret value was output or recorded. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                      | pass   | Required files, scripts, npm scripts, and skill paths passed.                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                             | pass   | Lint, typecheck, 120 unit files / 450 tests, and format check passed after formatting this evidence.   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                         | pass   | Banned terms absent; route and DTO naming checks passed.                                               |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` | pass   | Inventory showed only current task files changed.                                                      |
| `git diff --check`                                                                                                                  | pass   | No whitespace errors.                                                                                  |

## Repository Hygiene Closeout Checklist

| Check                                                                              | Result |
| ---------------------------------------------------------------------------------- | ------ |
| Only allowed task files changed                                                    | pass   |
| No package or lockfile change                                                      | pass   |
| No schema, migration, or script change                                             | pass   |
| No `.env.local` or `.env.example` change                                           | pass   |
| No staging/prod, deployment, cloud, DNS, COS, public URL, or object storage change | pass   |
| No secret/token/raw provider/full content recorded                                 | pass   |

## Taste Compliance Self-Check

- Frontend visual taste: no UI styling, color, layout, or Tailwind behavior changed.
- Loading/empty/error states: no frontend state implementation changed in this task.
- Interaction feedback: no clickable UI component implementation changed.
- Tailwind class order: no Tailwind class changes were introduced.
- Backend/API contract: no API implementation changed; E2E still validates standard envelopes.
- N+1/SQL/schema: no query, schema, migration, or Drizzle code changed.
- Naming discipline: used registered terms including `mistake_book` and `mock_exam`.
- Clean logic: Playwright worker cap and E2E response wait are narrowly scoped to local gate stability.
- Secret hygiene: no secret, token, raw prompt, raw answer, raw provider payload, or raw model response recorded.
- Environment isolation: no staging/prod, deployment, cloud, DNS, COS, public URL, dependency, schema, migration, script, package, or lockfile change.
