# Close Question Material Binding Experience

## Task Goal

Close the content_admin `question` binding experience for `material`, `knowledge_node`, and `tag` without schema,
database, Provider, dependency, dev-server, browser, or e2e work.

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

1. Preserve existing question create/update payload behavior for `materialPublicId`, `knowledgeNodePublicIds`, and
   `tagPublicIds`.
2. Add visible row-level binding feedback for `material`, `knowledge_node`, and `tag`, including explicit empty states.
3. Add form-level binding preview feedback so content_admin users can see the parsed binding state before saving.
4. Add focused jsdom coverage for payload, list/detail rendering, and validation feedback. Existing validator/service
   behavior is reused unless tests expose a gap.

## TDD Order

1. RED: add focused UI expectations for row-level binding feedback and form-level binding preview.
2. GREEN: implement small presentational helpers in `AdminQuestionMaterialManagementClient`.
3. REFACTOR: keep helpers pure, publicId-safe, and aligned with existing token-based styles.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check src\features\admin\question-material-management\AdminQuestionMaterialManagementClient.tsx tests\unit\admin-question-material-ui.test.ts docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-21-close-question-material-binding-experience.md docs\05-execution-logs\evidence\2026-06-21-close-question-material-binding-experience.md docs\05-execution-logs\audits-reviews\2026-06-21-close-question-material-binding-experience.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId close-question-material-binding-experience`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId close-question-material-binding-experience -SkipRemoteAheadCheck`

## Risk Controls

- No schema, migration, seed, database connection, data mutation, dependency, env/secret, Provider, dev server, Browser,
  Playwright/e2e, deploy, PR, force-push, org_auth runtime, payment, external service, or Cost Calibration Gate work.
- UI must expose publicId values only and must not expose internal numeric IDs, auth tokens, raw DB rows, full
  material/question content dumps, plaintext `redeem_code`, prompts, Provider payloads, or private answers.
