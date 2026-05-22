# Evidence: phase-9-student-practice-runtime-completion

## Metadata

- Task id: `phase-9-student-practice-runtime-completion`
- Branch: `codex/phase-9-student-practice-runtime-completion`
- Base: `master`
- Evidence created at: `2026-05-23T00:00:00+08:00`

## Scope

Allowed files followed:

- task plan, evidence, security review
- `src/app/api/v1/practices/**`
- `src/app/api/v1/student-papers/**`
- `src/app/api/v1/mistake-books/**`
- `src/server/auth/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- agent state files

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Recovery And Readiness

- `git status --short --branch`: pass; started on clean `master...origin/master`.
- `git log -5 --oneline`: latest `4550b22 docs(agent): record content admin ui push closeout`.
- `git branch --list`: only `master` before task branch creation.
- `git branch -r`: `origin/HEAD -> origin/master`, `origin/master`.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master` on `master`: pass; no tracked, staged, untracked, or upstream differences.
- Created branch: `codex/phase-9-student-practice-runtime-completion`.
- `Test-TaskClaimReadiness.ps1 -TaskId phase-9-student-practice-runtime-completion`: pass.

## TDD Notes

- RED: `npm.cmd run test:unit -- src/server/services/practice-service.test.ts`
  - Failed because practice detail did not return saved `answerRecords`, `currentQuestionIndex` stayed `0`, and `partial_credit` multiple-choice scoring returned `0.0`.
- GREEN: implemented practice answer record listing, progress mapping, and multiple-choice partial scoring.
- Focused GREEN: `npm.cmd run test:unit -- src/server/services/practice-service.test.ts src/server/services/practice-route.test.ts src/server/mappers/practice-mapper.test.ts` passed with `3` files and `14` tests.
- Regression: `npm.cmd run test:unit` passed with `99` files and `351` tests.

## Implementation Summary

- Added `answerRecords` to practice result DTOs so practice detail/resume can return saved answer progress.
- Added runtime repository support for listing owned practice answer records through user + practice public identifiers.
- Derived `currentQuestionIndex` from paper snapshot order and saved answer records instead of always returning `0`.
- Implemented `multiChoiceRule: partial_credit` scoring for multiple-choice practice answers while keeping full correctness separate from partial score.
- Preserved wrong objective answer insertion into `mistake_book`; subjective answers still do not create mistake-book rows.
- No dependency, schema, migration, `.env.example`, external provider, production resource, or package/lockfile changes.

## Security Review

- Security review path: `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-student-practice-runtime-completion-security-review.md`
- Verdict: `APPROVE`

## Validation

Required commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-student-practice-runtime-completion
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
npm.cmd run test:e2e
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results:

- `Test-TaskClaimReadiness.ps1 -TaskId phase-9-student-practice-runtime-completion`: pass on `pending`, then pass again after task status `implemented`.
- Focused RED command: failed as expected before implementation with missing `answerRecords`, stale `currentQuestionIndex`, and `partial_credit` score `0.0`.
- Focused GREEN command: pass, `3` files and `14` tests passed.
- `npm.cmd run typecheck`: sandbox run failed with `EPERM` reading `node_modules` TypeScript entrypoint; escalated re-run passed.
- `npm.cmd run test:unit`: pass, `99` files and `351` tests passed.
- First `Invoke-QualityGate.ps1`: failed at `format:check` because `src/server/mappers/practice-mapper.ts` needed Prettier formatting. Lint, typecheck, and unit tests passed before the format failure.
- Prettier: sandbox run failed with `EPERM` reading `node_modules` Prettier entrypoint; escalated re-run formatted only task-scoped modified files.
- Re-run `Invoke-QualityGate.ps1`: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `99` files and `351` tests passed.
  - format:check: pass.
- Final `Invoke-QualityGate.ps1` after evidence/status updates: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `99` files and `351` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass; Next.js compiled successfully and generated practice/student/mistake-book route entries.
- `npm.cmd run test:e2e`: pass, `2` Playwright tests passed.
- `Test-NamingConventions.ps1`: pass; banned terms absent, route folders kebab-case/public-id params, DTO fields camelCase.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; changed files are limited to task allowed files and branch has no upstream.

## Residual Risks And Deferred Items

- AI explanation auto-generation and subjective AI hint/re-answer remain deferred to `phase-9-ai-scoring-explanation-hint-runtime`; this task does not claim provider execution or `ai_call_log` writes.
- Browser retry UX for failed answer save remains deferred to `phase-9-student-experience-ui-completion`.
- No database-backed integration test was added; repository behavior is covered by unit route/service tests and final local gates.

## Git Closeout

- implementationCommit: `67052e0 feat(practice): complete student practice runtime`.
- merge: `073c342 merge: phase 9 student practice runtime completion`.
- postMergeValidation:
  - `Invoke-QualityGate.ps1`: pass on `master`.
    - lint: pass.
    - typecheck: pass.
    - test:unit: pass, `99` files and `351` tests passed.
    - format:check: pass.
  - `npm.cmd run build`: pass on `master`.
  - `npm.cmd run test:e2e`: pass on `master`, `2` Playwright tests passed.
  - `Test-NamingConventions.ps1`: pass on `master`.
  - `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory on `master`; branch ahead of `origin/master` by implementation and merge commits.
- push: `git push origin master` completed; `origin/master` advanced from `4550b22` to `9535b12`.
- cleanup: local branch `codex/phase-9-student-practice-runtime-completion` deleted after merge and push. Initial sandbox delete failed with `.git` ref lock permission denied; escalated re-run succeeded.
