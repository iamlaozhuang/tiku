# Content AI Formal Draft Adoption UI Loop Evidence

Task id: `content-ai-formal-draft-adoption-ui-loop-2026-07-05`

Branch: `codex/content-ai-formal-draft-adoption-2026-07-05`

Evidence status: pass.

## Baseline

`npm.cmd exec -- vitest run tests/unit/admin-ai-generation-entry-surface.test.ts src/server/services/admin-ai-generation-formal-adoption-service.test.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts`

Result: pass, 3 files / 39 tests.

## RED

`npm.cmd exec -- vitest run tests/unit/admin-ai-generation-entry-surface.test.ts`

Result: fail as expected, 1 file / 31 tests, 3 failures.

- Current-session content question adoption did not reach the adopted success state because the UI did not submit a `reviewedDraft`.
- Current-session content paper adoption did not reach the adopted success state because the UI did not submit a `reviewedDraft`.
- History-only content adoption remained enabled even though the UI only had a redacted summary and could not build a reviewed formal draft payload.

## GREEN

`npm.cmd exec -- vitest run tests/unit/admin-ai-generation-entry-surface.test.ts`

Result: pass, 1 file / 31 tests.

`npm.cmd exec -- vitest run tests/unit/admin-ai-generation-entry-surface.test.ts src/server/services/admin-ai-generation-formal-adoption-service.test.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts`

Result: pass, 3 files / 41 tests.

## Validation

- `npm.cmd run typecheck`: pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run format:check`: pass.
- `git diff --check`: pass, no output.
- Blocked path diff check: pass, no output.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-formal-draft-adoption-ui-loop-2026-07-05`: pass.
- First `Test-ModuleRunV2PrePushReadiness.ps1 ... -SkipRemoteAheadCheck`: blocked by repository SHA checkpoint drift; state checkpoint was aligned to current `master` / `origin/master`.
- Rerun `Test-ModuleRunV2PrePushReadiness.ps1 ... -SkipRemoteAheadCheck`: pass.

## Boundaries

- Provider call executed: false.
- DB connection used: false.
- DB mutated: false.
- Schema/migration/seed changed: false.
- Dependency changed: false.
- Browser/e2e/dev server executed: false.
- Env/secret/credential read or modified: false.
- Staging/prod/cloud/deploy executed: false.
- Release readiness/final Pass/production usability claimed: false.
- Cost Calibration executed: false.

Cost Calibration Gate remains blocked.
