# Organization Training Draft Source Context Schema Approval Package

## Task

- Task id: `organization-training-draft-source-context-schema-approval-package`
- Branch:
  `codex/organization-training-draft-source-context-schema-approval-package`
- Execution profile: `docs_state_lite` with `local_experience_audit` read
  permissions
- Task kind: docs/state-only schema approval package
- Requested by current user prompt:
  `先做 organization-training-draft-source-context-schema-approval-package，因为 manual draft / source context / copy-to-new-draft 仍是 schema gate。`

## Required References Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-runtime-api-gap-boundary-audit.md`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-version-takedown-runtime-route-contract-tdd.md`
- `src/server/services/organization-training-service.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/db/schema/organization-training.ts`
- `src/db/schema/organization-training.test.ts`

## Scope

This task prepares the schema approval package for durable organization
training manual draft, source context, and copy-to-new-draft persistence. It
does not implement schema, migration, repository, route, UI, or e2e behavior.

Allowed edits:

- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-organization-training-draft-source-context-schema-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-draft-source-context-schema-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-organization-training-draft-source-context-schema-approval-package.md`

Blocked edits and actions:

- `.env*`
- product source, tests, e2e specs, scripts
- `src/db/schema/**`, `drizzle/**`, generated migrations
- `package.json`, lockfiles, dependency changes
- database execution, provider/model calls, dev server, Browser/Playwright
  runtime, full e2e, staging/prod/cloud/deploy/payment/external-service, PR,
  force push, Cost Calibration Gate
- secrets, tokens, cookies, Authorization headers, DB URLs, provider payloads,
  raw prompts, raw answers, public identifier inventories, row data, private
  data, screenshots, traces, or DOM dumps

## Local Facts To Package

- `organization_training_version` and `organization_training_answer` exist in
  schema.
- `organization_training_version.draft_public_id` exists, but there is no
  durable `organization_training_draft` table.
- There is no durable `organization_training_source_context` table.
- Service and contract types already model manual draft creation, source
  context attachment, and copy-to-new-draft policy.
- Prior runtime gap evidence says these three persistence areas require a
  separate schema approval package before implementation.

## Implementation Plan

1. Add the task plan before any state/evidence changes.
2. Write redacted evidence that records the approval package:
   - current schema gap;
   - proposed future schema surfaces;
   - non-goals and blocked gates;
   - future schema-isolated validation boundary.
3. Update the coverage matrix so the organization training content lifecycle
   row points from this approval package to a future schema-isolated migration
   task.
4. Add task-queue records for this closed approval package and the pending
   schema-isolated follow-up.
5. Update project-state with current task, repository SHA, quality gate result,
   local experience closure status, and next recommended action.
6. Run only declared local validation commands.
7. If validation and readiness gates pass, use the docs/state fast-lane closeout
   policy for commit, fast-forward merge to `master`, push `origin/master`, and
   short-branch cleanup.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npm.cmd run test:e2e -- --list`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-organization-training-draft-source-context-schema-approval-package.md docs/05-execution-logs/evidence/2026-06-17-organization-training-draft-source-context-schema-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-17-organization-training-draft-source-context-schema-approval-package.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-draft-source-context-schema-approval-package`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-draft-source-context-schema-approval-package`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-draft-source-context-schema-approval-package`
