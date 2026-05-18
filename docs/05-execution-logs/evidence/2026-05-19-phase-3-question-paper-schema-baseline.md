# Phase 3 Question Paper Schema Baseline Evidence

## Task

- Task id: `phase-3-question-paper-schema-baseline`
- Branch: `codex/phase-3-question-paper-schema-baseline`
- Plan: `docs/05-execution-logs/task-plans/2026-05-19-phase-3-question-paper-schema-baseline.md`
- Security review: `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-question-paper-schema-baseline-security-review.md`

## Changes

- Added Drizzle schema for:
  - `material`
  - `question`
  - `question_option`
  - `scoring_point`
  - `paper`
  - `paper_section`
  - `question_group`
  - `paper_question`
  - `paper_scoring_point`
  - `paper_asset`
- Exported Phase 3 schema from `src/db/schema/index.ts`.
- Added model value/type exports for question, material, paper, paper_section, question_group, question_option, scoring_point, paper_asset, and attachment usage concepts.
- Preserved the existing `PaperRow` / `PaperDto` compatibility shape because existing Phase 1 mapper/repository files are outside this task's allowed file set.

## Guardrails

- No `package.json`, `pnpm-lock.yaml`, or `package-lock.json` change.
- No dependency introduction.
- No `drizzle/**` migration generation.
- No API, service, repository, mapper, validator, or UI implementation.
- `question_knowledge_node` and `question_tag` are explicitly deferred until validated `knowledge_node` and `tag` schema contracts exist.
- `paper_question.public_id` was added to satisfy the approved route contract for `{paperQuestionPublicId}` without exposing numeric `id`.

## Validation

Executed on `2026-05-19`:

- `npm.cmd run lint`: pass
- `npm.cmd run typecheck`: pass
- `npm.cmd run test:unit`: pass, 29 files and 64 tests
- `Select-String -Path 'src\db\schema\*.ts' -Pattern 'question|paper|material|paper_section|question_group|question_option|scoring_point|paper_asset'`: pass, terms present
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass
- `npm.cmd run format:check`: pass
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass, branch inventory completed before commit

## Notes

- Initial `format:check` found formatting issues in the new schema/model files; Prettier was run and the final `format:check` passed.
- This task is a compile-time schema/model baseline only. Database migration approval remains a separate required gate.
