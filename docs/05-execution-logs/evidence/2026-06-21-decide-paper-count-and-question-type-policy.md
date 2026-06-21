# Evidence: Decide Paper Count And Question Type Policy

**Date:** 2026-06-21
**Task id:** `decide-paper-count-and-question-type-policy`
**Branch:** `codex/decide-paper-count-question-type-policy`
**Evidence mode:** command/result summary only.

## Source Facts

- `src/db/schema/paper.ts` defines canonical `question_type` values: `single_choice`, `multi_choice`, `true_false`, `fill_blank`, `short_answer`, `case_analysis`, and `calculation`.
- `src/db/schema/paper.ts` defines `paper_question` as the relation between `paper` and `question`; no static question-count limit was found in the schema.
- `src/server/contracts/student-paper-contract.ts` exposes `questionCount` for student paper summaries.
- The 2026-06-21 audit found no product/system maximum question count for a `paper`.
- Student practice/mock_exam runtime paths still normalize or tolerate legacy aliases `multiple_choice` and `subjective`.

## Decision Result

Decision package recorded: published `paper` is limited to 1 through 100 `paper_question` rows; draft `paper` may have zero through 100 questions; formal data must use the canonical seven `question_type` values; legacy aliases remain read/input compatibility only until alias inventory and deprecation evidence are complete.

## Validation Results

| command                                                                                                                                                                     | result | evidence                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------- |
| `git diff --check`                                                                                                                                                          | pass   | Exit 0, no whitespace errors.                                                          |
| `node .\node_modules\prettier\bin\prettier.cjs --check ...`                                                                                                                 | pass   | `All matched files use Prettier code style!`                                           |
| `rg placeholder marker set ...`                                                                                                                                             | pass   | No placeholder or unselected-option markers found in the new policy package artifacts. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId decide-paper-count-and-question-type-policy` | pass   | Changed files stayed inside the task allowed scope; pre-commit hardening passed.       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId decide-paper-count-and-question-type-policy`   | pass   | Git readiness passed; evidence and audit paths present; pre-push readiness passed.     |

## Runtime Boundary

No source, test, e2e, schema, migration, seed, database, script, package, lockfile, dependency, `.env`, Provider, browser/dev-server runtime, deploy, PR, force-push, payment, external-service, or Cost Calibration Gate work was performed.
