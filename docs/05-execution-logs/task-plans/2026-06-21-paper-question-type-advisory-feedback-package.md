# Paper Question Type Advisory Feedback Package

## Task Goal

Add advisory `question_type` distribution feedback for admin `paper` rows. This package must not introduce hard ratio
limits or block draft save/publish beyond the already approved question-count validation.

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
- `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`

## Implementation Approach

1. Extend the admin `paper` summary contract with `questionTypeDistribution` using canonical `questionType` values.
2. Add read-only aggregation from existing `paper_question.question_snapshot.questionType`; do not change schema,
   migrations, seed data, connections, or database contents.
3. Render a compact advisory in the admin `paper` row that summarizes present `question_type` values and recommends
   broader distribution when only one type appears.
4. Add focused jsdom coverage using mocked admin API responses; do not run dev server, Browser, Playwright, or e2e.

## TDD Order

1. RED: extend the admin paper UI test to expect a multi-type distribution summary and a single-type advisory.
2. GREEN: add contract field, read-only aggregation, sample data, UI rendering, and test fixture data.
3. REFACTOR: keep helper functions pure and avoid hard ratio enforcement.

## Validation Commands

- `npm.cmd run test:unit -- src/features/admin/paper-management/AdminPaperManagementClient.test.tsx tests/unit/phase-7-admin-flow-runtime-smoke.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check src\server\contracts\admin-content-knowledge-ops-contract.ts src\server\services\admin-content-knowledge-ops-service.ts src\server\repositories\admin-flow-runtime-repository.ts src\features\admin\paper-management\AdminPaperManagementClient.tsx src\features\admin\paper-management\AdminPaperManagementClient.test.tsx tests\unit\phase-7-admin-flow-runtime-smoke.test.ts docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-21-paper-question-type-advisory-feedback-package.md docs\05-execution-logs\evidence\2026-06-21-paper-question-type-advisory-feedback-package.md docs\05-execution-logs\audits-reviews\2026-06-21-paper-question-type-advisory-feedback-package.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId paper-question-type-advisory-feedback-package`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId paper-question-type-advisory-feedback-package -SkipRemoteAheadCheck`

## Risk Controls

- No hard `question_type` ratio policy is introduced.
- No schema, migration, seed, database connection, data mutation, dependency, env/secret, Provider, dev server, Browser,
  Playwright/e2e, deploy, PR, force-push, org_auth runtime, payment, external service, or Cost Calibration Gate work.
- Evidence records command summaries only and must not include secrets, tokens, database URLs, raw rows, plaintext
  `redeem_code`, raw prompts, Provider payloads, private answers, full paper/material content, internal numeric ids, or
  publicId inventories.
