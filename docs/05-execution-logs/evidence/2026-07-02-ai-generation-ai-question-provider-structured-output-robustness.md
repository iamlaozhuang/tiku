# AI generation AI question Provider structured output robustness evidence

## Boundary

- Task id: `ai-generation-ai-question-provider-structured-output-robustness-2026-07-02`
- Branch: `codex/ai-generation-ai-question-provider-structured-output-robustness`
- Scope: shared AI出题 structured parser and Provider instruction repair.
- Provider/browser/DB/dependency/schema/deploy executed: false at task start.

## Implementation Evidence

- `src/server/services/route-integrated-provider-execution-service.ts`
  - AI出题 structured preview parser now accepts strict `questions`, root arrays, and compatible array envelopes such as `items`, `questionList`, and `question_set.question_items`.
  - Exact requested-count enforcement remains unchanged; compatible roots still fail safely when count mismatches.
  - AI组卷 paper-draft parser behavior remains object-based and unchanged for count acceptance.
- `src/server/services/route-integrated-provider-execution-service.test.ts`
  - Added coverage for root array, compatible envelopes, and mismatch failure.
  - Retained unsupported-root safe failure coverage.
- `src/server/services/route-integrated-provider-instruction-service.ts`
  - AI出题 instruction now requires one JSON object, top-level `questions`, exact count, and no Markdown/prose/table wrapper.
  - AI组卷 instruction also keeps the no-wrapper JSON output constraint.
- `src/server/services/route-integrated-provider-instruction-service.test.ts`
  - Added assertions for single JSON object, top-level `questions`, and no Markdown wrapper.

## Requirement Mapping Result

- `UC-ADV-CONTENT-ADMIN-AI-GENERATION`: shared content-admin AI出题/AI组卷 draft behavior remains reviewable structured draft output.
- `UC-ADV-PERSONAL-AI-QUESTION-GENERATION` and `UC-ADV-EMPLOYEE-AI-GENERATION`: shared learner/employee AI出题 parsing contract remains covered by focused route/runtime tests.
- `UC-ADV-ORG-ADMIN-AI-GENERATION`: shared structured-output compatibility avoids role-specific Provider exceptions.
- Admin ops AI draft/review boundary remains unchanged: no formal content adoption, DB mutation, Provider call, browser runtime, or release readiness action occurred in this task.

## Validation

| Command                                                                                                                                                                                                                                                 | Result                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/route-integrated-provider-instruction-service.test.ts`                                                                            | pass, 2 files, 33 tests  |
| `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts ...` | pass, 7 files, 107 tests |
| `npm.cmd run lint`                                                                                                                                                                                                                                      | pass                     |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                 | pass                     |
| `npm.cmd exec -- prettier --write --ignore-unknown ...`                                                                                                                                                                                                 | pass, unchanged          |
| `npm.cmd exec -- prettier --check --ignore-unknown ...`                                                                                                                                                                                                 | pass                     |
| `git diff --check`                                                                                                                                                                                                                                      | pass                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-ai-question-provider-structured-output-robustness-2026-07-02`                                              | pass                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-ai-question-provider-structured-output-robustness-2026-07-02 -SkipRemoteAheadCheck`                          | pass                     |

Interim governance gate note: the first Module Run v2 pre-commit attempt failed because the task plan used a non-standard read-list heading and the evidence lacked `Requirement Mapping Result`. The plan/evidence were corrected to the required SSOT headings and the gate passed afterward.

## Boundary Checks

- Provider call executed: false.
- Browser runtime or dev server action executed: false.
- Database connection or mutation executed: false.
- Package or lockfile changed: false.
- Schema, migration, or seed changed: false.
- `.env*` read or written: false.
- Raw Provider payload, prompt, AI output, full generated question, full generated paper, material, resource, or chunk content recorded: false.
- Credentials, cookies, tokens, sessions, Authorization header, localStorage, DB raw rows, internal ids, or PII recorded: false.
- Staging/prod/cloud/deploy executed: false.
- Release readiness, final Pass, production usability, and Cost Calibration claimed: false.
