# 2026-07-06 AI组卷 Route Plan Select Wiring Evidence

## Scope

- Task id: `ai-paper-route-plan-select-wiring-2026-07-06`
- Branch: `codex/ai-paper-route-plan-select-wiring-2026-07-06`
- Scope: source/test/docs only.
- Runtime boundaries: no DB runtime, no Provider call, no browser/dev server/e2e, no staging/prod/deploy, no Cost Calibration.
- Dependency/schema boundaries: no package/lockfile/dependency/schema/migration/seed change.

## Redacted Evidence Policy

Evidence records only command names, exit status, test file names, role labels, source categories, counts, and safe failure categories.

Not recorded: credentials, sessions, cookies, tokens, env values, connection strings, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full question/paper/material/resource/chunk content, screenshots, traces, raw DOM, private fixture values, employee raw answers, or plaintext `redeem_code`.

## TDD RED

- Command: `npm.cmd run test:unit -- src/server/services/ai-paper-route-plan-select-wiring-service.test.ts`
- Result: expected failure.
- Failure category: missing service import.
- Red reason: `ai-paper-route-plan-select-wiring-service` did not exist before implementation.

## GREEN And Focused Regression

- Command: `npm.cmd run test:unit -- src/server/services/ai-paper-route-plan-select-wiring-service.test.ts`
- Result: pass.
- Coverage: 1 file, 4 tests.
- Covered behavior:
  - `content_admin` platform formal sources resolve and assemble into a redacted paper container.
  - `org_advanced_admin` same-organization enterprise snapshots are available to local assembly.
  - missing organization context is rejected before repository access.
  - unsafe Provider-generated question bodies are rejected before returning assembled paper.

- Command: `npm.cmd run test:unit -- src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts`
- Result: pass.
- Coverage: 5 files, 21 tests.

## Static Gates

- Command: `git diff --check`
- Result: pass.

- Command: `npm.cmd run typecheck`
- First result: fail in test helper type only, because training snapshot questions can be optional.
- Fix: test helper uses `NonNullable` for snapshot question element type.
- Rerun result: pass.

- Command: `npm.cmd run lint`
- Result: pass.

- Command: `npm.cmd exec -- prettier --check --ignore-unknown ...`
- First result: failed because evidence/audit files had not yet been created.
- Final rerun: pass.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-route-plan-select-wiring-2026-07-06`
- Result: pass.

## Implementation Summary

- Added `resolveAndAssembleAiPaperFromRoute`.
- The service composes:
  - route-visible AI组卷 plan output;
  - role-aware source resolution;
  - local plan-and-select assembly.
- Returned output contains status, source diagnostics, assembled/insufficient result, or safe failure category.
- No persistence, DB runtime, Provider, browser, UI, schema, migration, dependency, staging/prod/deploy, or Cost Calibration execution was introduced.

## Non-Claims

- Does not claim DB-backed runtime pass.
- Does not claim browser pass.
- Does not claim Provider-disabled or Provider-enabled pass.
- Does not claim release readiness.
- Does not claim production usability.
- Staging/prod/deploy not executed and still require fresh approval.
- Cost Calibration not executed and still requires fresh approval.
