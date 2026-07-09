# 2026-07-09 Learner AI Paper Parameters Contract Evidence

## Scope

- Task id: `learner-ai-paper-parameters-contract-2026-07-09`
- Branch: `codex/learner-ai-paper-parameters-contract`
- Change type: learner AI组卷 parameter contract source and targeted unit tests only.
- Sensitive boundary: no credentials, tokens, sessions, cookies, headers, env values, DB URLs, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full questions, papers, or materials recorded.

## Implementation Evidence

- Learner AI组卷 request creation now submits visible `questionTypeDistribution`, `paperStructure`, difficulty, and learning objective values in `generationParameters`.
- Personal AI组卷 keeps `sourcePreference: null`; organization employee AI组卷 preserves organization source preference.
- Request validation now preserves valid `questionTypeDistribution` and `paperStructure` values and rejects invalid enum values.
- AI出题 request shape remains unchanged for the added AI组卷-only fields.

## Requirement Mapping Result

- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`: eligible personal advanced users and organization advanced employees use learner `AI训练` for AI出题 and AI组卷.
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`: learner generated content remains in the learner AI domain and organization employee output stays employee-scoped.
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`: AI组卷 is an assembly plan plus local formal-source selection; submitted plan parameters must match visible UI controls.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md` and ADR-007: runtime authorization context and source preference must remain explicit and must not silently switch context.

## Validation Commands

- `corepack pnpm@10.26.1 exec vitest run src/server/validators/personal-ai-generation-request.test.ts tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`
  - Result: pass, 2 files, 43 tests.
- `corepack pnpm@10.26.1 typecheck`
  - Result: pass.
- `corepack pnpm@10.26.1 lint`
  - Result: pass.
- `corepack pnpm@10.26.1 exec prettier --write --ignore-unknown src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx src/server/validators/personal-ai-generation-request.ts`
  - Result: pass, scoped formatting repair only.
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`
  - Result: pass.
- `git diff --check`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-paper-parameters-contract-2026-07-09`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-ai-paper-parameters-contract-2026-07-09 -SkipRemoteAheadCheck`
  - Result: pass.

## Boundary Evidence

- No Provider execution.
- No browser automation, screenshots, traces, raw DOM, localStorage, cookies, sessions, or auth headers captured.
- No direct DB connection or DB mutation.
- No schema, migration, seed, package, or lockfile changes.
- No staging, production, deploy, Cost Calibration, PR, or force push action in this task.
- No paper assembly, learning-session creation, organization admin training, content admin AI adoption, or formal `practice` / `answer_record` write path changed.
