# Phase 20 Fix RA-03-04 Practice Resume Choice Evidence

- Task id: `phase-20-fix-ra-03-04-practice-resume-choice`
- Branch: `codex/phase-20-fix-ra-03-04-practice-resume-choice`
- Finding: `F-RA-03-04-001`
- Started at: `2026-05-27T04:00:05-07:00`
- Human approval: low-risk task registered by Phase 18 RA-03 audit; no high-risk approval required.

## Startup And Claim

- `git status --short --branch` - `## master...origin/master`.
- `git rev-list --left-right --count master...origin/master` - `0 0`.
- Protected-branch guard: initial `Test-TaskClaimReadiness.ps1` on `master` failed with `Task claim readiness cannot run on protected branch: master`; no files were modified.
- `git switch -c codex/phase-20-fix-ra-03-04-practice-resume-choice` - pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-03-04-practice-resume-choice` - pass.

## Scope Controls

- Allowed files: `docs/04-agent-system/state/project-state.yaml`, `docs/04-agent-system/state/task-queue.yaml`, `docs/05-execution-logs/task-plans/**`, `docs/05-execution-logs/evidence/**`, `docs/05-execution-logs/audits-reviews/**`, `src/**`, `tests/**`, `e2e/**`.
- Blocked files: `.env.local`, `.env.example`, package manifests/lockfiles, `src/db/schema/**`, `drizzle/**`, `scripts/**`.
- High-risk gates: not triggered.

## Implementation Evidence

- Changed `src/features/student/practice/StudentPracticePage.tsx`:
  - Added runtime-only resume choice detection through returned `answerRecords`, `currentQuestionIndex`, and `lastAnsweredAt`.
  - Added `PracticeResumeChoicePanel` with continue and restart actions.
  - Continue action reveals the existing practice surface without another API call.
  - Restart action reuses `POST /api/v1/practices/{publicId}/restart`, clears local answer state, and hides the choice panel.
  - UI uses existing design tokens/classes and only exposes `data-public-id`; no internal `id`.
- Changed `tests/unit/student-practice-ui.test.ts`:
  - Added coverage for continue-from-saved-progress prompt.
  - Added coverage for restart-from-saved-progress prompt.
- Changed `e2e/student-practice-mock-entry.spec.ts`:
  - Updated the browser flow to expect `practice-resume-choice`, restart from that panel, and then verify the answer surface.

## Validation Evidence

- `node .\node_modules\prettier\bin\prettier.cjs --write ...` - pass for changed TSX, test, e2e, Markdown, and YAML files.
- `npm.cmd run test:unit -- student-practice-ui.test.ts` - pass; 1 file, 17 tests.
- `npm.cmd run test:unit` - pass; 131 files, 531 tests.
- `npm.cmd run lint` - initial sandbox run failed with `EPERM` reading `node_modules`; escalated rerun passed.
- `npm.cmd run typecheck` - initial sandbox run failed with `EPERM` reading `node_modules`; escalated rerun passed.
- `npm.cmd run build` - pass; Next.js compiled successfully. Build log mentioned `.env.local` existence via framework environment loading only; contents were not read or copied.
- `npm.cmd run test:e2e` - first run failed in `e2e/student-practice-mock-entry.spec.ts` because the test still expected `practice-surface` before handling the new resume choice.
- `npm.cmd run test:e2e -- e2e/student-practice-mock-entry.spec.ts` - pass after updating the test to exercise the new prompt.
- `npm.cmd run test:e2e` - pass; 25/25 tests.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1` - pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` - pass inventory.
- `git diff --check` - pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1` - pass.
- Changed-file Prettier check - pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1` - pass; `lint`, `typecheck`, `test:unit` (131 files, 531 tests), and `format:check` passed.

## Closeout

- implementationCommit: `7a5ca4085f9869c5b09d2157f00294e3a305eb0f` (`fix(student): add practice resume choice`).
- closeoutEvidenceCommit: `cc90fcb853352fb56857ea5d7881a1826af9e567` (`docs(audit): record practice resume merge validation`).
- merge: fast-forward merged into `master`, `2e1c386..7a5ca40`.
- post-merge master validation:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1` - pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` - pass; master ahead of origin/master by one implementation commit before closeout evidence commit.
  - `git diff --check` - pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1` - pass.
  - Changed-file Prettier check - pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1` - pass; `lint`, `typecheck`, `test:unit` (131 files, 531 tests), and `format:check` passed.
  - `npm.cmd run test:e2e` - pass; 25/25 tests.
  - `npm.cmd run build` - pass. Build log mentioned `.env.local` existence via framework environment loading only; contents were not read or copied.
- push:
  - pre-push `git fetch origin` - pass.
  - pre-push `git rev-list --left-right --count master...origin/master` - `2 0`.
  - `git push origin master` - pass, `2e1c386..cc90fcb master -> master`.
- cleanup:
  - initial `git branch -d codex/phase-20-fix-ra-03-04-practice-resume-choice` - failed in sandbox with ref lock permission denied.
  - escalated `git branch -d codex/phase-20-fix-ra-03-04-practice-resume-choice` - pass; deleted already-merged branch at `7a5ca40`.
- final inventory before this evidence update:
  - `git status --short --branch` - `## master...origin/master`.
  - `git rev-parse master` - `cc90fcb853352fb56857ea5d7881a1826af9e567`.
  - `git rev-parse origin/master` - `cc90fcb853352fb56857ea5d7881a1826af9e567`.
