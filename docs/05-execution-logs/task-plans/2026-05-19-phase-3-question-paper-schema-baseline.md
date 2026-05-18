# Phase 3 Question Paper Schema Baseline Task Plan

## Task

- Task id: `phase-3-question-paper-schema-baseline`
- Branch: `codex/phase-3-question-paper-schema-baseline`
- Phase: `phase-3-question-paper`
- Human approval: user requested `推进下一步`; this authorizes the queued schema baseline task only.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/security-review-gate.md`

## Scope

Create the Phase 3 Drizzle schema and TypeScript model type baseline for:

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

The baseline must preserve external URL safety by using `public_id` for URL-facing resources. `paper_question` will also get `public_id` because the approved API route contract includes `{paperQuestionPublicId}`.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-19-phase-3-question-paper-schema-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-3-question-paper-schema-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-question-paper-schema-baseline-security-review.md`
- `src/db/schema/**`
- `src/server/models/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `drizzle/**`
- `src/app/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`

## Design Notes

- Keep ORM schema source in `src/db/schema/` per ADR-002.
- Keep `src/server/models/` as typed model adapters over Drizzle schema, not a second schema source.
- Use database `snake_case`, TypeScript exports aligned with existing schema style, and no standalone `section` or `option` terminology.
- Add JSONB snapshot columns for paper publish immutability, but do not implement publish logic in this task.
- Defer `question_knowledge_node` and `question_tag` relationship tables until `knowledge_node` and `tag` schema contracts exist, and record this explicitly in evidence.
- Do not create or generate any migration file.
- Do not introduce dependencies.

## Risk Controls

- `schema`: implement compile-time schema only; no database mutation.
- `migration`: migration generation is explicitly out of scope.
- `data_contract`: mirror the approved contract and record any deliberate deferral.
- `securityReviewRequired`: true.
- Security review path: `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-question-paper-schema-baseline-security-review.md`

## Validation Commands

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `Select-String -Path 'src\db\schema\*.ts' -Pattern 'question|paper|material|paper_section|question_group|question_option|scoring_point|paper_asset'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `npm.cmd run format:check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## TDD Note

This task queue item does not allow `tests/**`, so no new tests will be added. Existing unit tests, lint, typecheck, naming, and format gates will be used as regression evidence. Functional tests belong to subsequent API/service tasks where `tests/unit/**` is allowed.
