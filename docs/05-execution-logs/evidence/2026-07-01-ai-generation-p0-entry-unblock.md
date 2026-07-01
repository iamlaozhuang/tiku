# Evidence: ai-generation-p0-entry-unblock

- Task id: `ai-generation-p0-entry-unblock-2026-07-01`
- Branch: `codex/ai-generation-p0-entry-unblock`
- Date: `2026-07-01`
- Status: `closed`
- Evidence mode: redacted role/route/status/count/validation summary only

## Root Cause Summary

| Issue | Root cause                                                                                                                                                        | Reuse decision                                                                                                    |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| OP-03 | Student practice, mock_exam, and exam_report runtime pages treated missing client-side stored session value as expired authorization before same-origin fallback. | Reuse `fetchStudentApi()` credentials behavior and existing cookie-aware request authorization.                   |
| OP-04 | Organization admin session payload exposed only fallback workspace capability instead of org_auth-derived service-computed capability.                            | Reuse `AdminWorkspaceCapabilitySummary`, existing route guard contract, and Drizzle-backed local session runtime. |

## Implementation Summary

- OP-03: removed premature client-side stored-session checks from practice, mock_exam, and exam_report runtime paths so existing same-origin cookie-backed requests can run.
- OP-03: preserved existing stored-session request support for local automation and unit coverage.
- OP-04: added optional service-computed organization admin workspace capability to the local session runtime and mapper.
- OP-04: computed active organization edition from existing organization authorization and upgrade sources without schema, seed, migration, or raw data inspection.

## RED Checks

| Check            | Command                                                                                                                                                        | Result                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| focused unit RED | `npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts src/server/auth/local-session-runtime.test.ts` | pass_expected_failure: 4 scoped failures reproduced OP-03/OP-04 before implementation. |

## GREEN Checks

| Check                    | Command                                                                                                                                                                                       | Result                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| focused unit GREEN       | `npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts src/server/auth/local-session-runtime.test.ts`                                | pass: 3 files, 55 tests.                                         |
| prettier check           | `npm.cmd exec -- prettier --check --ignore-unknown <changed-docs-source-and-tests>`                                                                                                           | pass: all changed files formatted.                               |
| lint                     | `npm.cmd run lint`                                                                                                                                                                            | pass.                                                            |
| typecheck                | `npm.cmd run typecheck`                                                                                                                                                                       | pass.                                                            |
| diff check               | `git diff --check`                                                                                                                                                                            | pass: no whitespace errors.                                      |
| Module Run v2 pre-commit | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-p0-entry-unblock-2026-07-01`                     | pass: task-scoped hardening gate passed.                         |
| Module Run v2 pre-push   | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-p0-entry-unblock-2026-07-01 -SkipRemoteAheadCheck` | pass: local/remote checkpoint aligned for task-scoped push gate. |

## Boundary Confirmation

- Browser/dev-server/e2e executed: no.
- Provider call or Provider configuration executed: no.
- Direct local database connection, reset, seed, import, mutation, or raw row inspection executed: no.
- `.env*` read or modified: no.
- Package or lockfile changed: no.
- Schema, migration, or seed files changed: no.
- Staging/prod/cloud/deploy executed: no.
- Release readiness, final Pass, and Cost Calibration claimed/executed: no.

## Redaction Checklist

- credentials/tokens/cookies/sessions/localStorage/Auth headers: not recorded
- `.env` values or DB connection strings: not read or recorded
- raw DB rows/internal numeric ids/PII: not recorded
- Provider payloads/prompts/raw AI I/O: not recorded
- full question/paper/material/resource/chunk content: not recorded
- raw DOM/screenshots/traces/HTML dumps: not recorded

## Closeout

- Commit: approved after validation
- Fast-forward merge to `master`: approved after validation
- Push `origin/master`: approved after validation
- Short branch cleanup: approved after validation and merge
