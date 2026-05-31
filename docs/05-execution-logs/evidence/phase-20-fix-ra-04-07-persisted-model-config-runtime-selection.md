# Phase 20 Fix RA-04-07 Persisted Model Config Runtime Selection Evidence

## Summary

result: pass
scope: implementation/local_verification
changed surfaces: model_config runtime catalog mapper, student mock_exam AI scoring runtime selection, unit tests, task plan/state
gates: lint/typecheck/test:unit/test:e2e/build/format/readiness/naming/quality/git diff
forbiddenScope: no env read or modification; no dependency/package/lockfile; no schema/drizzle/migration; no staging/prod/cloud/deploy/real provider; no destructive data operation
residualGaps: none

## TDD Evidence

- RED: `npm.cmd run test:unit -- tests/unit/phase-20-ra-04-07-persisted-model-config-runtime-selection.test.ts`
  - First failure: `createPersistedModelConfigRuntimeCatalog` was missing.
  - Second failure: default AI scoring runtime did not expose/support persisted catalog loader.
- GREEN: `npm.cmd run test:unit -- tests/unit/phase-20-ra-04-07-persisted-model-config-runtime-selection.test.ts`
  - Result: pass, 1 file, 2 tests.
- Targeted regression: `npm.cmd run test:unit -- tests/unit/phase-11-model-config-fallback-runtime.test.ts tests/unit/phase-12-model-config-local-mock-runtime.test.ts tests/unit/phase-12-model-config-server-runtime.test.ts tests/unit/phase-8-student-mistake-book-runtime.test.ts tests/unit/phase-11-ai-call-log-coverage-hardening.test.ts tests/unit/phase-20-ra-04-07-persisted-model-config-runtime-selection.test.ts`
  - Result: pass, 6 files, 22 tests.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
  - First run: failed at typecheck due a new test fixture shape mismatch.
  - Second run: passed lint, typecheck, full unit; failed format:check on two changed service files.
  - Final run: pass; lint, typecheck, test:unit, and format:check passed.
  - Final unit summary: 147 files, 607 tests.
- `npm.cmd run test:e2e`
  - Result: pass, 26 tests.
- `npm.cmd run build`
  - Result: pass.
  - Note: Next.js printed `.env.local` as an environment source name only; no env file was opened, copied, or recorded.
- `git diff --check`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Result: pass inventory on task branch.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - Result: pass.

## Security Review

- `ai_runtime`: local deterministic/mock runtime only. Persisted admin metadata drives local runtime selection; no real provider call is introduced.
- `secret_or_env_change`: no env file reads or writes. Provider secret fields, masked secret values, and prompt previews are intentionally not copied into runtime selection snapshots or evidence.
- `external_service_config`: no provider, base URL, staging/prod, cloud, or deployment configuration changes.
- `local_human_verification`: full local unit/e2e/build/readiness gates were run.
- `evidence_integrity`: evidence omits token, secret, password, raw prompt, raw provider payload, and internal auto-increment ids.
- API/runtime contract: existing response envelope remains unchanged; model_config JSON remains camelCase at API boundary.

## Git Closeout

- branch: `codex/phase-20-fix-ra-04-07-persisted-model-config-runtime-selection`
- base: `master`
- changed files: model_config runtime catalog mapper, student AI scoring runtime loader, tests, task plan, evidence, state
- commit: `c9748e10112788a043c9b28e8665e08b786633d9` (`fix(ai): use persisted model config runtime selection`)
- merge: `a7eb06b4dda4d6e65890a4dd7fb72330bec7380f` (`merge: phase 20 persisted model config runtime selection`) into `master`
- master validation: pass after merge; quality gate, e2e, build, diff check, readiness, git completion readiness, and naming conventions all passed
- push: pending cleanup docs commit
- cleanup: task status set to closed; short branch deletion pending final push
