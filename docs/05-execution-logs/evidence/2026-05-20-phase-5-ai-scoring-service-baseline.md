# Evidence: Phase 5 AI Scoring Service Baseline

## Summary

- Task id: `phase-5-ai-scoring-service-baseline`
- Branch: `codex/phase-5-ai-scoring-service-baseline`
- Phase: `phase-5-ai-rag`
- Security review: required by queue metadata
- Dependency changes: none

## Startup And Recovery

- Required startup documents were read from repository files.
- `project-state.yaml` confirmed `currentPhase: phase-5-ai-rag`, `currentTask: idle`, and handoff to this task.
- `task-queue.yaml` confirmed this task was `pending` with dependencies complete.
- Latest prior evidence read: `docs/05-execution-logs/evidence/2026-05-20-phase-5-rag-evidence-status-retrieval-baseline.md`.

## Baseline Commands

- Command: `git status --short --branch`
- Result: passed.
- Summary: root worktree was clean on `master...origin/master`.
- Command: `git remote -v`
- Result: passed.
- Summary: `origin` points to `https://github.com/iamlaozhuang/tiku` for fetch and push.
- Command: `git log --oneline -8`
- Result: passed.
- Summary: HEAD was `a62b8da docs(agent): record rag evidence retrieval closeout`.
- Command: `git worktree list --porcelain`
- Result: passed.
- Summary: only root worktree existed before this task branch.
- Command: `git branch --merged master`
- Result: passed.
- Summary: only `master` was listed.
- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- Result: passed.
- Summary: required standards, ADRs, SOPs, state files, scripts, npm scripts, plugin skill paths, and local skill paths were present.

## Claim And Worktree

- Command: `git worktree add .worktrees\phase-5-ai-scoring-service-baseline -b codex/phase-5-ai-scoring-service-baseline`
- Result: passed.
- Summary: created isolated worktree and branch from `a62b8da`.
- Command: `git status --short --branch`
- Result: passed.
- Summary: new worktree was on `codex/phase-5-ai-scoring-service-baseline`.
- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-5-ai-scoring-service-baseline`
- First result: failed in sandbox with PowerShell language mode dot-source restriction.
- Rerun result: passed outside constrained sandbox.
- Summary: task status `pending`, dependencies complete, allowed/blocked files and risk gates printed successfully.
- Command: `npm.cmd run test:unit`
- Result: passed.
- Summary: 73 files passed, 238 tests passed in the isolated worktree before implementation.

## TDD Evidence

- RED command: `npm.cmd run test:unit -- src/server/services/ai-scoring-service.test.ts`
- First result: failed in sandbox with Vite `spawn EPERM`; rerun elevated as required by sandbox policy.
- RED result: failed as expected.
- RED summary: missing `src/server/services/ai-scoring-service.ts` module.
- GREEN command: `npm.cmd run test:unit -- src/server/services/ai-scoring-service.test.ts`
- First GREEN result: failed.
- Failure summary: one assertion expected total score `5`, but rounded and point-capped scoring summed to `4.5`; test data was corrected to use question max score `4` so it covers total-score capping.
- Final GREEN result: passed.
- Final GREEN summary: 1 file passed, 6 tests passed.

## Implemented

- Added provider-free AI scoring service baseline in `src/server/services/ai-scoring-service.ts`.
- Added service tests in `src/server/services/ai-scoring-service.test.ts`.
- Covered:
  - AI scoring input/output contract through typed service inputs and results.
  - Unanswered subjective answers score zero and do not call the runner.
  - Existing successful results are returned without repeated scoring.
  - Scoring point scores are rounded to 0.5, point-capped, and total-capped by question max score.
  - Failed scoring increments retry count and records failed redacted log snapshots.
  - Retry attempts stop once the retry limit is reached.
  - Subjective scoring rejects fallback model configs.
  - Scoring locks `model_config` snapshot and prompt template version at start.
  - RAG evidence status and citations are attached without fabricated weak/none citations.
  - AI call log drafts use redacted snapshots for prompt, user answer, model output, provider payloads, and citations.

## Boundary Confirmation

- No real model provider integration.
- No real secret or environment value.
- No database migration file or migration execution.
- No dependency or lockfile change.
- No pgvector dependency, vector column, embedding storage, or vector query.

## Validation Commands

### Agent Readiness

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- Result: passed.
- Summary: required standards, ADRs, SOPs, state files, scripts, npm scripts, plugin skill paths, and local skill paths were present.

### Task Claim Readiness

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-5-ai-scoring-service-baseline`
- Result: passed.
- Summary: task status `implemented`, dependencies complete, allowed/blocked files and risk gates printed successfully.
- Rerun after temporary `done` status:
  - First rerun result: failed as expected because `done` tasks are not claimable.
  - Fix: restored status to `validated` until closeout.
  - Final rerun result: passed with task status `validated`.

### Unit Tests

- Command: `npm.cmd run test:unit`
- Result: passed.
- Summary: 74 files passed, 244 tests passed.

### Quality Gate

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- First result: failed at `format:check`.
- Failure summary: `src/server/services/ai-scoring-service.ts` needed Prettier formatting and had one unused helper warning.
- Fix command: `F:\tiku\node_modules\.bin\prettier.cmd --write src\server\services\ai-scoring-service.ts src\server\services\ai-scoring-service.test.ts docs\05-execution-logs\task-plans\2026-05-20-phase-5-ai-scoring-service-baseline.md docs\05-execution-logs\evidence\2026-05-20-phase-5-ai-scoring-service-baseline.md`
- Fix result: passed.
- Second result: passed with one lint warning for an unused type import.
- Final result: passed.
- Final summary: `lint`, `typecheck`, `test:unit`, and `format:check` passed. Unit test summary during gate: 74 files passed, 244 tests passed.
- Evidence/state rerun result: failed at `format:check` after `Update-TaskStatus.ps1` rewrote `task-queue.yaml`.
- Fix command: `F:\tiku\node_modules\.bin\prettier.cmd --write docs\04-agent-system\state\task-queue.yaml`
- Final evidence/state rerun result: passed.
- Final evidence/state rerun summary: `lint`, `typecheck`, `test:unit`, and `format:check` passed. Unit test summary during gate: 74 files passed, 244 tests passed.
- Final code-cleanup rerun result: passed.
- Final code-cleanup rerun summary: `lint`, `typecheck`, `test:unit`, and `format:check` passed. Unit test summary during gate: 74 files passed, 244 tests passed.

### Naming Conventions

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- Result: passed.
- Summary: banned terms absent, risky generic terms absent, API route folders valid, DTO fields camelCase.

### Build

- Command: `npm.cmd run build`
- First result: failed before compile because the new worktree did not have a complete local `node_modules` package graph for Next/Turbopack.
- Recovery command: `corepack pnpm@10 install --frozen-lockfile`
- Recovery result: passed. Lockfile was up to date; packages were reused from the existing store; no package or lockfile changes were made.
- Retry command: `npm.cmd run build`
- Retry result: passed.
- Summary: Next.js 16.2.6 compiled successfully, TypeScript completed, and static pages generated.
- Final code-cleanup rerun result: passed.

### Git Completion Readiness

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Result: passed.
- Summary: inventory completed on branch `codex/phase-5-ai-scoring-service-baseline`; changed files were task-scoped and unstaged/untracked.
- Final rerun result: passed after formatting `task-queue.yaml`.

## Security Review

- Review path: `docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-ai-scoring-service-baseline-security-review.md`
- Verdict: `APPROVE`.

## Scope Guards

- Command: `git diff --name-only`
- Result:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
- Command: `git ls-files --others --exclude-standard`
- Result:
  - `docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-ai-scoring-service-baseline-security-review.md`
  - `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-scoring-service-baseline.md`
  - `docs/05-execution-logs/task-plans/2026-05-20-phase-5-ai-scoring-service-baseline.md`
  - `src/server/services/ai-scoring-service.test.ts`
  - `src/server/services/ai-scoring-service.ts`
- Command: `git diff --name-only -- package.json pnpm-lock.yaml package-lock.yaml drizzle/** .env.example`
- Result: no output.
- Command: `git status --short --branch`
- Result: changed files were within allowed scope; no blocked files were changed.
- Final status:
  - modified `docs/04-agent-system/state/project-state.yaml`
  - modified `docs/04-agent-system/state/task-queue.yaml`
  - untracked `docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-ai-scoring-service-baseline-security-review.md`
  - untracked `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-scoring-service-baseline.md`
  - untracked `docs/05-execution-logs/task-plans/2026-05-20-phase-5-ai-scoring-service-baseline.md`
  - untracked `src/server/services/ai-scoring-service.test.ts`
  - untracked `src/server/services/ai-scoring-service.ts`

## Handoff

- Current task status before commit: `validated`.
- Next recommended action after closeout: `phase-5-ai-rag / phase-5-ai-explanation-and-hint-baseline`.
