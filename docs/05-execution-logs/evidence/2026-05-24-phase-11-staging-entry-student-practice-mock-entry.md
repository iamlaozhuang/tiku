# Evidence: phase-11-staging-entry-student-practice-mock-entry

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-staging-entry-student-practice-mock-entry`
- Finding closed: `LPR-RP-003`
- Goal: student `/home` practice and `mock_exam` entry links reach actionable answer flows in local dev.

## Changes

- Added Playwright coverage for logged-in student navigation from `/home` into `practice` and `mock_exam`.
- Replaced stale active `practice` sessions when their stored `paper_snapshot` has no questions but the current published paper snapshot has questions.
- Replaced stale active `mock_exam` sessions under the same empty-snapshot condition.
- Made student practice/mock UI parsers accept runtime-normalized snapshots where section title lives on `paperSections[].title` and option content lives on `contentRichText`.
- Added unit coverage for stale empty snapshots and runtime-normalized UI snapshots.

No package, lockfile, schema, migration, script, `.env`, staging/prod, deployment, or cloud resource changes were made.

## TDD Evidence

- Red: `npm.cmd run test:e2e -- --grep "student practice mock entry"` failed because `practice?paperPublicId=...` rendered the empty practice state instead of an answer flow.
- Red: `npm.cmd run test:unit -- --run src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts` failed for the new stale empty snapshot cases; both services resumed the old empty active session.
- Green: service unit tests passed after expiring/terminating stale empty active sessions and creating fresh sessions.
- Green: UI unit tests passed after accepting runtime snapshot title/option field shapes.
- Green: Playwright student entry test passed after service and UI fixes.

## Validation Commands

| Command                                                                                                                                                                 | Result                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-staging-entry-student-practice-mock-entry` | PASS                                                                                   |
| `npm.cmd run test:unit -- --run tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts`                                                  | PASS, 2 files / 17 tests                                                               |
| `npm.cmd run test:unit -- --run src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts`                                             | PASS, 2 files / 22 tests                                                               |
| `npm.cmd run test:e2e -- --grep "student practice mock entry"`                                                                                                          | PASS, 1 Chromium test                                                                  |
| `docker compose ps`                                                                                                                                                     | PASS, `tiku-postgres-dev` healthy                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                          | PASS                                                                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                 | PASS after Prettier formatting; lint, typecheck, unit, format check passed             |
| `npm.cmd run build`                                                                                                                                                     | PASS                                                                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                             | PASS                                                                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                     | PASS inventory; branch had only current task changes and no staged files at that point |

## Evidence Hygiene

- No `.env.local` content was read or recorded.
- No token, Authorization header, raw provider payload, raw prompt, raw answer, raw model response, full paper/OCR text, or customer/private data is recorded here.
- Local session API spot checks were used only to confirm bounded counts and public ids; token values are intentionally omitted.

## Outcome

- `stagingDecision`: proceed for this finding after merge, subject to remaining Phase 11 fix-scope tasks.
- `LPR-RP-003`: closed locally by regression tests and browser verification.
