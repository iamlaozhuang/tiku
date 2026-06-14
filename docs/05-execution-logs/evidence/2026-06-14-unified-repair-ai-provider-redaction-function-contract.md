# Unified Repair AI Provider Redaction Function Contract Evidence

result: pass

## Task

- Task id: `unified-repair-ai-provider-redaction-function-contract`
- Branch: `codex/unified-repair-ai-provider-redaction-function-contract`
- Batch range: scoped implementation repair, task 1 of 1
- Commit: `c5c1609f06f4250ab2fe5f868dd98ec6c3ddda0e` pre-task master baseline before the local task commit
- Date: 2026-06-14
- Source story: `unified-standard-advanced-audit-campaign`

## Gates

- localFullLoopGate: pass with `git diff --check`, lint, typecheck, target unit test, affected prompt template unit
  test, Module Run v2 PreCommitHardening, and ModuleCloseoutReadiness.
- threadRolloverGate: no rollover requested; stop after the local independent commit on this short branch.
- automationHandoffPolicy: do not claim any task outside `unified-repair-ai-provider-redaction-function-contract`.
- nextModuleRunCandidate: none authorized; all other `unified-repair-*` tasks remain pending and blocked without fresh
  user instruction.
- Cost Calibration Gate remains blocked.

## RED / GREEN

- RED: `npm.cmd run test:unit -- tests/unit/ai/provider-redaction-function-contract.test.ts` failed with two expected
  failures:
  - mock provider output still contained raw provider request/response shape instead of redacted envelopes;
  - prompt template function keys still used legacy short values for scoring, explanation, and hint.
- GREEN: the target unit test now passes with two tests:
  - mock provider returns redacted provider request/response envelopes and a blocked provider execution gate;
  - prompt registry exposes glossary-compatible AI function values.

## Finding Coverage

- `AI-RAG-AUDIT-002`: fixed within `src/ai/mock-provider.ts` by replacing raw provider request/response payload
  construction with redacted envelopes.
- `AI-RAG-AUDIT-003`: fixed within `src/ai/prompts/templates.ts` by normalizing legacy prompt function aliases into
  glossary-compatible function values.
- `AI-RAG-AUDIT-005`, `SE-AUDIT-004`, and `ADMIN-OPS-LOGS-AUDIT-005`: bounded by a blocked provider execution gate and
  redaction-only provider metadata. No real provider/model request, quota use, env/secret, provider configuration, or
  backend provider surface was executed or modified.

## Change Scope

- Added `src/server/contracts/ai/function-contract.ts`.
- Added `src/server/contracts/ai/provider-redaction-contract.ts`.
- Updated `src/ai/mock-provider.ts`.
- Updated `src/ai/prompts/templates.ts`.
- Updated `src/ai/prompts/templates.test.ts`.
- Added `tests/unit/ai/provider-redaction-function-contract.test.ts`.
- Added this task plan, evidence, and audit review.
- Updated task queue and project state metadata for this task.

## Compatibility Repair

The first post-implementation `npm.cmd run typecheck` failed because `providerExecutionGate` and the redacted payload
envelope were too strict for existing local provider mocks. The implementation was adjusted to preserve the existing
`unknown` provider payload compatibility surface while ensuring `createMockAiProvider()` returns only redacted envelopes
and blocked gate metadata.

## Validation Summary

| Command                                                                                                                                                                                     | Result                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `npm.cmd run test:unit -- tests/unit/ai/provider-redaction-function-contract.test.ts`                                                                                                       | RED failed for expected reason |
| `npm.cmd run test:unit -- tests/unit/ai/provider-redaction-function-contract.test.ts`                                                                                                       | pass, 1 file / 2 tests         |
| `npm.cmd run test:unit -- src/ai/prompts/templates.test.ts`                                                                                                                                 | pass, 1 file / 2 tests         |
| `git diff --check`                                                                                                                                                                          | pass                           |
| `npm.cmd run lint`                                                                                                                                                                          | pass                           |
| `npm.cmd run typecheck`                                                                                                                                                                     | pass after compatibility fix   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-repair-ai-provider-redaction-function-contract`      | pass                           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-repair-ai-provider-redaction-function-contract` | pass                           |

## Blocked Remainder

- Real provider/model request/quota use: blocked and not executed.
- Env/secret/provider configuration: blocked and not read or modified.
- Cost Calibration Gate: blocked and not executed.
- Schema/migration: blocked and not modified.
- e2e: blocked and not executed.
- Dependency/package/lockfile: blocked and not modified.
- Staging/prod/cloud/deploy: blocked and not executed.
- Payment/external-service: blocked and not executed.
- PR/force-push: blocked and not executed.
- Other repair candidates remain pending and were not claimed.

## Evidence Redaction

No raw prompt, raw answer, provider request, provider response, API key, Authorization header, model secret, token,
database URL, row data, real provider payload, env value, or provider configuration value is recorded in this evidence.

## Taste Compliance Self-Check

- Naming: pass; new AI contract names use glossary-compatible `ai_scoring`, `ai_explanation`, `ai_hint`,
  `kn_recommendation`, and `learning_suggestion`.
- Scope: pass; changes stayed inside the target task allowed files.
- Architecture: pass; no route/service/schema/provider execution refactor was introduced outside the allowed AI
  contract and mock-provider boundary.
- Validation: pass for local gates and Module Run v2 hardening/closeout readiness.
- Evidence hygiene: pass; this evidence records summaries only.
