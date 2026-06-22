# Close Question Reference And Material Lock Surface

## Task Goal

Close the content_admin reference and lock-state surface for `question` and `material` by showing clear reference counts,
lock reasons, and linked `paper` / `question` public references without changing schema, database state, or runtime
locking persistence.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-06-21-admin-experience-gap-closure-plan.md`

## Implementation Approach

1. Reuse existing `MaterialDto.references` and `lockedAt` data; do not alter contract shape or persistence.
2. Add material row reference summaries with explicit `question` and `paper` counts plus publicId/status details.
3. Add question/material lock summaries that distinguish editable rows from locked rows and explain the public reason.
4. Add focused jsdom tests for reference count rendering, locked-state reasons, and publicId-only output.

## TDD Order

1. RED: add UI tests expecting material reference counts/details and question/material lock reason summaries.
2. GREEN: add presentational helpers in the content admin question/material UI.
3. REFACTOR: keep formatting helpers pure, token-styled, and publicId-safe.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check src\features\admin\question-material-management\AdminQuestionMaterialManagementClient.tsx tests\unit\admin-question-material-ui.test.ts docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-21-close-question-reference-and-material-lock-surface.md docs\05-execution-logs\evidence\2026-06-21-close-question-reference-and-material-lock-surface.md docs\05-execution-logs\audits-reviews\2026-06-21-close-question-reference-and-material-lock-surface.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId close-question-reference-and-material-lock-surface`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId close-question-reference-and-material-lock-surface -SkipRemoteAheadCheck`

## Risk Controls

- No schema, migration, seed, database connection, data mutation, dependency, env/secret, Provider, dev server, Browser,
  Playwright/e2e, deploy, PR, force-push, org_auth runtime, payment, external service, or Cost Calibration Gate work.
- New feedback must use publicId values only and must not expose internal numeric IDs, auth tokens, raw DB rows, full
  material/question content dumps, plaintext `redeem_code`, prompts, Provider payloads, or private answers.
