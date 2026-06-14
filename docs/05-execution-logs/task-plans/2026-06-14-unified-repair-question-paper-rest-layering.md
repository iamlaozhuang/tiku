# Unified Repair Question Paper REST Layering Plan

## Task

- Task id: `unified-repair-question-paper-rest-layering`
- Branch: `codex/unified-repair-question-paper-rest-layering`
- Date: 2026-06-14
- Source story: `unified-standard-advanced-audit-campaign`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-question-paper-code-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-question-paper-code-audit.md`
- Completed repair evidence from earlier unified repair tasks in this serial run.

## Scope

This task may repair the standard `question` / `paper` REST and layering boundary:

- standard `paper` REST adapter presence under `/api/v1/exam-papers`;
- scoped `question-paper` service, repository, contract, mapper, and validator boundaries;
- material lifecycle verification boundaries;
- admin acceptance coverage for visible content page adapters.

The implementation must not change schema/migration, object storage, raw content import/export, AI generation, formal
adoption workflow, env/secret/provider configuration, dependency/package/lockfile, e2e, staging/prod/cloud/deploy,
payment, external-service, PR, force-push, or Cost Calibration surfaces.

## TDD Plan

1. Add `tests/unit/question-paper/question-paper-rest-layering.test.ts` first.
2. Run the target unit test and record RED.
3. Add the smallest scoped contracts, validators, mappers, service/repository stubs, and REST adapter needed for GREEN.
4. Re-run target unit test for GREEN.
5. Run all queued validation commands before closeout.

## Implementation Approach

- Keep REST paths `/api/v1/exam-papers` and `/api/v1/questions` in kebab-case plural nouns.
- Keep JSON fields camelCase and response envelopes `{ code, message, data, pagination? }`.
- Use `publicId` in route params and evidence; do not expose auto-increment ids.
- Keep route handlers thin and service-owned per ADR-002.
- Use contract and validator files to document blocked schema/storage/adoption boundaries without executing blocked
  gates.
- Stop if the fix requires schema/migration, storage/object operations, raw content, or feature modules outside
  allowedFiles.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- tests/unit/question-paper/question-paper-rest-layering.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-repair-question-paper-rest-layering`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-repair-question-paper-rest-layering`

## Risk Controls

- No raw question bank content, raw material content, original paper payload, storage URL, row data, secret, or database
  URL in evidence.
- No `.env.local`, `.env.*`, real secret, provider config, package, lockfile, schema, migration, scripts, or e2e edits.
- No object storage operations, import/export, provider/model requests, AI generation, formal adoption, deploy, payment,
  external-service, PR, force-push, or Cost Calibration.
