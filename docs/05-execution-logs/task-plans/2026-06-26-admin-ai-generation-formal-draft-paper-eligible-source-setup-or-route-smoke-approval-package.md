# Admin AI generation formal draft paper eligible source setup or route smoke approval package plan

Task id:
`admin-ai-generation-formal-draft-paper-eligible-source-setup-or-route-smoke-approval-package-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Requirement Decision Map

- Content question formal adoption has a local route smoke pass.
- Content paper formal adoption is not yet proven because the local DB has no eligible content paper generated result.
- The next step must obtain an eligible paper source without direct seed/fixture insertion and without Provider calls.

## Scope

Allowed:

- Create a docs/state approval package for the next content paper source setup and route smoke task.
- Decide whether the next task may use existing content admin AI generation local route to create or reuse a content
  paper generated result.
- Define route-call caps, evidence redaction, and stop conditions.

Blocked:

- Executing local DB route smoke or connecting to DB in this approval task.
- Source/test/schema/migration/package/env changes.
- Direct DB insert/update/delete, seed, fixture creation, cleanup deletes, or data repair.
- Provider/model calls or provider credential access.
- Organization-scoped adoption.
- Formal publish, paper section/question composition, or student-visible content.
- Staging/prod, payment, external service, deployment/release readiness, Cost Calibration, and final Pass claims.

## Execution Approach

1. Confirm from existing route code that content admin AI paper generation local route persists redacted generated result
   records with Provider disabled by default.
2. Approve only the route-based setup path for a later execution task.
3. Record next-task caps and evidence redaction.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-draft-paper-eligible-source-setup-or-route-smoke-approval-package.md docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-draft-paper-eligible-source-setup-or-route-smoke-approval-package.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-paper-eligible-source-setup-or-route-smoke-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-paper-eligible-source-setup-or-route-smoke-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-draft-paper-eligible-source-setup-or-route-smoke-approval-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-draft-paper-eligible-source-setup-or-route-smoke-approval-package-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Approval would require direct DB seed/data repair, Provider, source change, migration, formal publish, paper
  composition, or staging/prod work.
- Evidence would require raw generated result, raw reviewed draft, DB URL, cookie, token, Authorization header, raw DB
  row, raw prompt/output, or Provider payload.
