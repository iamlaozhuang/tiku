# 2026-07-07 学员端桌面可读壳层 Evidence

Task id: `learner-desktop-readable-shell-2026-07-07`

Branch: `codex/learner-desktop-readable-shell-2026-07-07`

Evidence status: branch validation passed; ready for commit, merge, master gate, push, and cleanup.

## Requirement Mapping Result

| Requirement                          | Evidence status                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Desktop-readable learner shell       | pass - header/main/bottom nav now expose constrained shell surfaces with line-icon tab semantics.       |
| Learner context band near page title | pass - home renders a compact context band from existing authorization context DTOs without raw ids.    |
| Standard/advanced boundary preserved | pass - advanced entries remain capability-driven; standard contexts do not receive advanced entries.    |
| Empty/error/disabled state coverage  | pass - existing empty/loading/error/unavailable state tests remain green in branch-specific validation. |
| No forbidden path changes            | pass - changed paths are scoped to allowed docs, student shell/home source, and targeted student tests. |

## Redaction Boundary

Evidence will record file labels, command names, exit status, and safe counts only. It will not record credentials, sessions, cookies, tokens, env values, DB URLs, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, plaintext `redeem_code`, full question/paper/material/resource content, screenshot pixels, raw DOM, or private fixture values.

## Validation Results

| Command                                                                                                                                                                                                                                                                                                                            | Status | Redacted summary                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| `.\node_modules\.bin\vitest.cmd run src/components/StudentAppLayout/StudentAppLayout.test.tsx tests/unit/student-home-ui.test.ts` before implementation                                                                                                                                                                            | pass   | Expected red: missing learner shell containers/line icons and missing home context band were detected.            |
| `.\node_modules\.bin\vitest.cmd run src/components/StudentAppLayout/StudentAppLayout.test.tsx tests/unit/student-home-ui.test.ts`                                                                                                                                                                                                  | pass   | 2 files / 16 tests passed after implementation.                                                                   |
| `.\node_modules\.bin\vitest.cmd run src/components/StudentAppLayout/StudentAppLayout.test.tsx tests/unit/student-home-ui.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts tests/unit/organization-training-employee-entry-surface.test.ts` | pass   | 6 files / 82 tests passed.                                                                                        |
| `npm run lint`                                                                                                                                                                                                                                                                                                                     | pass   | ESLint completed successfully.                                                                                    |
| `npm run typecheck`                                                                                                                                                                                                                                                                                                                | pass   | `tsc --noEmit` completed successfully.                                                                            |
| `.\node_modules\.bin\prettier.cmd --check` scoped to changed docs/source/tests                                                                                                                                                                                                                                                     | pass   | All matched files use Prettier code style.                                                                        |
| `npm run test:unit`                                                                                                                                                                                                                                                                                                                | pass   | Full unit suite passed: 342 files / 1722 tests.                                                                   |
| `git diff --check`                                                                                                                                                                                                                                                                                                                 | pass   | No whitespace errors.                                                                                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-desktop-readable-shell-2026-07-07`                                                                                                                                                          | pass   | Task-scoped precommit hardening passed for 9 changed files.                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-desktop-readable-shell-2026-07-07 -SkipRemoteAheadCheck`                                                                                                                                      | pass   | First run detected stale repository checkpoint; checkpoint was aligned to current master/origin and rerun passed. |

## Changed Files

- `src/components/StudentAppLayout/StudentAppLayout.tsx`
- `src/components/StudentAppLayout/StudentAppLayout.test.tsx`
- `src/features/student/home/StudentHomePage.tsx`
- `tests/unit/student-home-ui.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Branch 2 task plan, evidence, and adversarial audit files.

## Boundary Checks

- DB/account/fixture/env/package/lockfile/schema/migration/seed changes: none.
- Provider-enabled path execution: none.
- Screenshot, raw DOM, staging/prod/deploy, release readiness, production usability, Cost Calibration: none claimed or executed.
- Sensitive evidence: command names, file labels, and safe counts only; no credentials, sessions, cookies, tokens, env values, DB URL/raw rows, internal ids, Provider payload, raw prompt/output, or full question/paper/material/resource content recorded.

## Post-Merge Master Gate

| Command                                                               | Status   | Redacted summary                                                                                                               |
| --------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `git merge --ff-only codex/learner-desktop-readable-shell-2026-07-07` | pass     | Master fast-forwarded to the branch 2 implementation commit.                                                                   |
| `npm run lint` on `master`                                            | pass     | ESLint completed successfully after merge.                                                                                     |
| `npm run typecheck` on `master`                                       | pass     | `tsc --noEmit` completed successfully after merge.                                                                             |
| `npm run test:unit` on `master`                                       | pass     | Full unit suite passed: 342 files / 1722 tests.                                                                                |
| `powershell.exe ... Test-ModuleRunV2PrePushReadiness.ps1` on `master` | repaired | First run detected expected post-merge master checkpoint drift; task was moved to closeout state for ancestry-based readiness. |

Cost Calibration Gate remains blocked.
