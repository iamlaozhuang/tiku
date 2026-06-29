# Security DB Runtime Connection Boundary Hardening Traceability

- Task id: `security-db-runtime-connection-boundary-hardening-2026-06-29`
- Branch: `codex/security-db-runtime-boundary-20260629`
- Status: closed
- Updated at: `2026-06-29T12:55:47-07:00`
- Base commit: `7107e79a5ac9e91b9e9e51410664009c7feb8eba`

## Scope Mapping

| Requirement                                                                             | Implementation evidence                                                                             | Status |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------ |
| Centralize runtime database URL and local env loading behind one helper                 | `src/server/repositories/runtime-database.ts` exports schema-aware `createRuntimeDatabaseForSchema` | pass   |
| Remove scoped duplicate local env DB factories                                          | Scoped auth/repository runtime files delegate local DB creation to the central helper               | pass   |
| Preserve missing `DATABASE_URL` behavior                                                | Existing per-runtime error message strings are passed to the central helper                         | pass   |
| Add no-env-read injected database coverage                                              | `tests/unit/runtime-database-baseline.test.ts` covers injected `createDatabase` caching path        | pass   |
| Avoid DB connection, schema, migration, seed, Provider, browser, package, release gates | Validation uses source/test/static/local commands only; prohibited runtime actions remain blocked   | pass   |

## Changed Runtime Files

| File                                                                         | Boundary effect                                                                                  |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/server/repositories/runtime-database.ts`                                | Adds reusable schema-aware runtime DB factory and keeps shared client/cache behavior centralized |
| `src/server/auth/local-session-runtime.ts`                                   | Removes duplicate local env loader and delegates session runtime DB creation                     |
| `src/server/auth/local-session-logout-route.ts`                              | Delegates logout runtime DB creation                                                             |
| `src/server/repositories/admin-flow-runtime-repository.ts`                   | Removes duplicate local env loader and delegates admin flow DB creation                          |
| `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`           | Removes duplicate local env loader and delegates AI audit log DB creation                        |
| `src/server/repositories/admin-redeem-code-runtime-repository.ts`            | Removes duplicate local env loader and delegates redeem_code DB creation                         |
| `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`  | Removes duplicate local env loader and delegates organization/org_auth DB creation               |
| `src/server/repositories/mistake-book-repository.ts`                         | Removes duplicate local env loader and delegates mistake_book DB creation                        |
| `src/server/repositories/student-authorization-redeem-runtime-repository.ts` | Removes duplicate local env loader and delegates student authorization redeem DB creation        |
| `src/server/repositories/student-flow-runtime-repository.ts`                 | Removes duplicate local env loader and delegates student flow DB creation                        |

## Validation Mapping

| Command                                                                                                               | Current result                                                                     |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/runtime-database-baseline.test.ts src/server/auth/local-session-runtime.test.ts` | pass, 2 files / 9 tests                                                            |
| `npm.cmd run lint`                                                                                                    | pass                                                                               |
| `npm.cmd run typecheck`                                                                                               | pass                                                                               |
| scoped duplicate-loader search                                                                                        | pass, only central `runtime-database.ts` retains env loading and `drizzle()` setup |
| `git diff --check`                                                                                                    | pass                                                                               |
| scoped Prettier, Module Run v2 pre-commit, and pre-push readiness                                                     | pass                                                                               |
| Module Run v2 closeout readiness                                                                                      | pass                                                                               |

## Remaining Gates

Release readiness, final Pass, Cost Calibration, staging smoke, staging/prod/cloud/deploy, DB connection/read/write/raw
row/schema/migration/seed, Provider/AI runtime, browser/dev-server/e2e, package/lockfile/dependency change, PR,
force-push, env/secret/connection string value access, credentials, cookies, tokens, sessions, localStorage, Authorization
headers, raw DOM, screenshots, traces, raw DB rows, internal IDs, PII, email, phone, plaintext redeem_code, Provider
payloads, prompts, raw AI input/output, and complete question/paper/material/resource/chunk content remain blocked.
