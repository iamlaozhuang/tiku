# Organization AI Paper Section Contract Validation Evidence

- Task id: `org-ai-paper-section-contract-validation-2026-07-09`
- Branch: `codex/org-ai-paper-section-contract-validation`
- Evidence mode: redacted code symbol and test status only.
- Provider execution: not executed.
- DB connection or mutation: not executed.
- Dependency/package/lockfile change: none.

## Requirement Mapping Result

| Requirement                                                                     | Evidence                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI组卷 `questionTypeDistribution` cannot pass only by matching top-level fields | Added structured-preview and route-assembly tests that reject mismatched section counts for fixed distributions.                                                                                           |
| AI组卷 `paperStructure` must match deep section shape                           | Added tests for `by_question_type` mixed/invalid section types and `by_knowledge_node` missing explicit section knowledge scope.                                                                           |
| Plan-only boundary                                                              | Route assembly still rejects generated question bodies and only accepts structured paper plans for local selection.                                                                                        |
| Failure categories remain contract-bounded                                      | Structured preview uses existing `question_type_distribution_mismatch` / `paper_structure_mismatch`; route assembly uses existing `invalid_plan_shape`.                                                    |
| Sensitive data boundary                                                         | Evidence and tests use synthetic/redacted symbols only; no env, credential, DB row, internal numeric id, Provider payload, raw prompt, raw AI output, or full question/paper/material content is recorded. |

## TDD Evidence

- RED command:
  - `corepack pnpm@10.26.1 exec vitest run src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts --reporter=dot`
- RED result:
  - Failed as expected before implementation: 4 new section-contract tests failed because invalid section plans were still accepted or only treated as ordinary source insufficiency.

## Verification

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Result                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts --reporter=dot`                                                                                                                                                                                                                                                                  | Pass: 2 files, 45 tests. |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts --reporter=dot` | Pass: 6 files, 65 tests. |
| `corepack pnpm@10.26.1 run typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                       | Pass.                    |
| `corepack pnpm@10.26.1 run lint`                                                                                                                                                                                                                                                                                                                                                                                                                            | Pass.                    |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                          | Pass.                    |
| `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown ...changed files...`                                                                                                                                                                                                                                                                                                                                                                          | Pass.                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId org-ai-paper-section-contract-validation-2026-07-09`                                                                                                                                                                                                                                                                         | Pass.                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId org-ai-paper-section-contract-validation-2026-07-09 -SkipRemoteAheadCheck`                                                                                                                                                                                                                                                     | Pass.                    |

## Change Summary

- Structured preview now validates AI组卷 section counts against fixed question type distribution contracts.
- Structured preview now validates section shape for `by_question_type` and `by_knowledge_node`.
- Route assembly now rejects invalid section contracts before local question selection.
- Local-contract fake Provider test fixture now emits section-valid synthetic paper plans so regression tests cover the stricter contract.

## Boundary Check

- No UI/browser runtime.
- No Provider-enabled execution.
- No DB/schema/migration/seed/fixture change.
- No formal question, formal paper, mock_exam, organization training publish, or employee answer flow change.
- No package or lockfile change.
