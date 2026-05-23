# Evidence: phase-9-ai-scoring-explanation-hint-runtime

## Metadata

- Task id: `phase-9-ai-scoring-explanation-hint-runtime`
- Branch: `codex/phase-9-ai-scoring-explanation-hint-runtime`
- Base: `master`
- Evidence created at: `2026-05-23T00:00:00+08:00`
- Security review: `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-ai-scoring-explanation-hint-runtime-security-review.md`

## Scope

Allowed files followed:

- task plan, evidence, and security review
- `src/app/api/v1/mock-exams/**`
- `src/app/api/v1/mistake-books/**`
- `src/server/contracts/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `tests/unit/**`
- agent state files

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Implementation Summary

- Added deterministic local subjective AI scoring to mock-exam submit runtime when the runtime is configured.
- Added `POST /api/v1/mock-exams/{publicId}/retry-scoring` for failed subjective scoring retries.
- Kept successful subjective scoring fixed by retrying only `scoring_failed` answer records.
- Scored unanswered subjective questions as `0.0` without invoking the AI scoring runtime.
- Persisted mock-exam aggregate scoring states as `completed` or `scoring_partial_failed` without schema or migration changes.
- Added safe AI scoring snapshots to service/repository inputs for report-time context without exposing raw prompts or secrets.
- Upgraded mistake-book `ai-explanation` from Phase 4 not-available to local deterministic `ai_explanation` runtime.
- Wired default local mock model snapshots and versioned prompt templates for scoring and explanation.
- Reused existing `ai_call_log` append/redaction infrastructure for `ai_scoring` and `ai_explanation`.
- Kept `ai_hint` in the deterministic explanation/hint service boundary; no practice hint route was added because practice routes are outside this task's allowed files.

## TDD Notes

- RED: `npm.cmd run test:unit -- src/server/services/mock-exam-service.test.ts`
  - Failed because mock-exam service lacked AI scoring runtime integration and `retryMockExamScoring`.
- GREEN: same focused command passed with `12` tests.
- RED: `npm.cmd run test:unit -- src/server/services/mistake-book-service.test.ts src/server/services/mistake-book-route.test.ts`
  - Failed because mistake-book AI explanation still returned Phase 4 not-available.
- GREEN: same focused command passed with `2` files and `11` tests.
- Focused route/service regression passed with `4` files and `27` tests.
- Full unit regression passed with `99` files and `363` tests.

## Boundary Notes

- No dependency, schema, migration, lockfile, `.env.example`, real provider, production resource, or deploy change.
- No raw prompt, raw user answer, raw model output, API key, secret, password, session token, or internal numeric id is returned in DTOs.
- The async scoring queue requirement is recorded as a residual risk because queue/schema changes are blocked for this task.

## Validation

Required commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-ai-scoring-explanation-hint-runtime
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results:

- `Test-TaskClaimReadiness.ps1 -TaskId phase-9-ai-scoring-explanation-hint-runtime`: pass.
- `npm.cmd run test:unit`: final pass, `99` files and `363` tests passed.
- First `Invoke-QualityGate.ps1`: failed only on `format:check` for four modified service files.
- Prettier write: formatted the four task-scoped files reported by `format:check`.
- Final `Invoke-QualityGate.ps1`: pass after evidence and state updates.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `99` files and `363` tests passed.
  - format:check: pass.
- Final `npm.cmd run build`: pass. Next.js compiled successfully and included `/api/v1/mock-exams/[publicId]/retry-scoring`.
- `Test-NamingConventions.ps1`: pass; banned terms absent, route folders kebab-case/public-id params, DTO fields camelCase.
- Final `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; branch has no upstream and changes are task scoped.
- Pending task count after queue update: `7`.

## Git Closeout

- implementationCommit: `afe05e2 feat(ai): add deterministic scoring explanation runtime`.
- merge: `1245248 merge: phase 9 ai scoring explanation hint runtime`.
- postMergeValidation:
  - `Invoke-QualityGate.ps1`: pass on `master`.
    - lint: pass.
    - typecheck: pass.
    - test:unit: pass, `99` files and `363` tests passed.
    - format:check: pass.
  - `npm.cmd run build`: pass on `master`.
  - `Test-NamingConventions.ps1`: pass on `master`.
  - `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory on `master`; branch ahead of `origin/master` by implementation and merge commits before closeout docs/push.
- push: pending closeout docs commit.
