# Unified Standard MVP Question Paper Code Audit Plan

## Task

- Task id: `unified-standard-mvp-question-paper-code-audit`
- Branch: `codex/unified-standard-mvp-question-paper-code-audit`
- Source story: `unified-standard-advanced-audit-campaign`
- Task kind: read-only code audit candidate
- Date: 2026-06-14

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`

## Scope

This task audits standard MVP formal `question`, `material`, `question_group`, `question_option`, `analysis`,
`scoring_point`, `paper`, `paper_section`, `paper_asset`, and paper lifecycle surfaces.

Traceability anchors:

- `landingIds`: `LAND-FORMAL-CONTENT-QUESTION-PAPER`
- `sourceIds`: `STD-REQ-02`, `STD-STORY-02`, `STD-REQ-06`, `STD-STORY-06`
- `capabilityIds`: `CAP-STD-QUESTION-CONTENT`, `CAP-STD-PAPER-LIFECYCLE`
- `useCaseIds`: `UC-STD-QUESTION-MATERIAL-MANAGE`, `UC-STD-PAPER-LIFECYCLE`
- `deltaIds`: `DELTA-FORMAL-CONTENT`

## Allowed Writes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-standard-mvp-question-paper-code-audit.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-question-paper-code-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-question-paper-code-audit.md`

## Read-Only Code Scope

- `docs/**`
- `scripts/**`
- `src/app/(admin)/**`
- `src/app/api/v1/questions/**`
- `src/app/api/v1/exam-papers/**`
- `src/server/services/question-paper/**`
- `src/server/repositories/question-paper/**`
- `src/server/contracts/question-paper/**`
- `src/server/mappers/question-paper/**`
- `src/server/validators/question-paper/**`

## Blocked Work

- No source code edits.
- No tests, e2e, schema, migration, Drizzle, package, lockfile, dependency, env, secret, provider, deploy, payment,
  external-service, PR, force-push, merge, push, or Cost Calibration Gate work.
- No raw question bank content, original paper content, row data, database URL, raw provider payload, raw response,
  prompt payload, cleartext `redeem_code`, student answer text, or employee answer text in evidence.
- No formal content separation implementation, AI generation, organization training content, storage/schema/UI changes,
  or formal adoption review write.

## Audit Method

1. Inventory only the allowed read-only code paths.
2. Check route handler, service, repository, contract, mapper, and validator layering against ADR-002.
3. Check admin route surfaces for formal question/material and paper lifecycle coverage.
4. Record findings with severity, evidence references, traceability ids, and explicit no-fix boundary.
5. Update evidence, audit review, state, and queue only.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-standard-mvp-question-paper-code-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-standard-mvp-question-paper-code-audit`

## Stop Condition

After validation and one local commit, stop. Do not claim `unified-standard-mvp-student-experience-code-audit` or any
later task.
