# Security DB Migration Command Guard Implementation Traceability

## Task

- Task id: `security-db-migration-command-guard-implementation-2026-06-29`
- Branch: `codex/db-migration-command-guard-20260629`
- Authorization: current user approved local guard/script/test/governance docs minimal change.

## Requirement Mapping

| Requirement                                                                         | Implementation surface                                                                                                                                                | Verification                                                                   |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Prevent accidental full local DB mutation command execution                         | `scripts/local/Invoke-FreshValidationRun.ps1` requires explicit full-mode local DB mutation approval before reading env, rewriting env, or invoking external commands | `tests/unit/fresh-validation-runner.test.ts` full-mode blocked regression test |
| Preserve planned and preflight non-mutating flows                                   | Existing `-PlanOnly` and `-PreflightOnly` flows remain allowed                                                                                                        | Existing focused unit tests                                                    |
| Preserve explicit local full-run path for later separately approved runtime work    | Full mode can reach the first external command only when approval flag and matching database name confirmation are both provided                                      | Command shim unit test                                                         |
| Do not execute DB, migration, seed, Provider, browser, or release work in this task | Tests use temporary fake env fixtures and command shims only                                                                                                          | Validation command evidence                                                    |

## Boundary Confirmation

- No real DB connection, raw row read, DB mutation, schema change, migration execution, or seed execution is allowed.
- No real env, secret, credential, token, cookie, session, Authorization header, or connection string evidence is allowed.
- No dependency, package, lockfile, Provider, browser, staging/prod/cloud/deploy, release readiness, final Pass, or Cost Calibration work is allowed.
