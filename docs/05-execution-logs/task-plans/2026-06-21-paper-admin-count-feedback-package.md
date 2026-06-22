# Paper Admin Count Feedback Package

## Task Goal

Implement low-risk admin `paper` composition feedback so content_admin can see current question count against the
published `paper` boundary and understand publish risk before pressing publish.

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

1. Add focused jsdom unit tests for the actual admin `paper` page client at
   `src/features/admin/paper-management/AdminPaperManagementClient.tsx`.
2. Mock only local session/fetch responses; do not start dev server, browser, Playwright, database, Provider, or
   external services.
3. Add count feedback derived from `questionCount`: current count, 100-question limit, remaining capacity, and publish
   risk for zero or over-limit draft papers.
4. Keep behavior advisory at the UI layer. The hard publish block remains in the existing backend validator/service.

## TDD Order

1. RED: add tests expecting 0/100, 100/100, and 101/100 admin count feedback plus publish-risk copy.
2. GREEN: add small pure helper and render the feedback in paper rows.
3. REFACTOR: keep UI text compact and do not add nested cards or new dependencies.

## Validation Commands

- `npm.cmd run test:unit -- src/features/admin/paper-management/AdminPaperManagementClient.test.tsx`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check src\features\admin\paper-management\AdminPaperManagementClient.tsx src\features\admin\paper-management\AdminPaperManagementClient.test.tsx docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-21-paper-admin-count-feedback-package.md docs\05-execution-logs\evidence\2026-06-21-paper-admin-count-feedback-package.md docs\05-execution-logs\audits-reviews\2026-06-21-paper-admin-count-feedback-package.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId paper-admin-count-feedback-package`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId paper-admin-count-feedback-package -SkipRemoteAheadCheck`

## Risk Controls

- Browser/dev-server/e2e/runtime screenshot validation remains blocked by the current batch instructions.
- No schema, migration, seed, database connection, dependency, env/secret, Provider, PR, deploy, force-push, org_auth
  runtime, payment, external service, or Cost Calibration Gate work.
- Evidence records command summaries only and must not include secrets, tokens, database URLs, raw rows, plaintext
  `redeem_code`, raw prompts, Provider payloads, private answers, full paper/material content, internal numeric ids, or
  publicId inventories.
