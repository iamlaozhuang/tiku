# Admin AI generation content paper generated result local route setup and formal draft route smoke plan

Task id:
`admin-ai-generation-content-paper-generated-result-local-route-setup-and-formal-draft-route-smoke-2026-06-26`

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

## Approval Consumed

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-draft-paper-eligible-source-setup-or-route-smoke-approval-package.md`

## Scope

Allowed:

- Run at most one content admin AI paper generation local route POST to create or reuse a redacted paper generated
  result.
- Run at most one content paper formal adoption route POST against that route-produced result.
- Connect to local DB only through existing runtime route code.
- Record only redacted workflow/status/count/latency/public-id-state evidence.

Blocked:

- Source/test/schema/migration/package/env changes.
- Direct DB seed, fixture creation, data repair, cleanup delete, or raw DB mutation.
- Provider/model calls or provider credential access.
- Organization-scoped adoption.
- Formal publish, paper section/question composition, or student-visible content.
- Staging/prod, payment, external service, deployment/release readiness, Cost Calibration, and final Pass claims.

## Execution Approach

1. Resolve an existing active content admin or super admin actor.
2. POST `generationKind: "paper"` to the existing content AI generation route handler with Provider disabled/default.
3. Use the returned generated result only in memory for the formal adoption route.
4. POST a minimal reviewed paper draft to the content formal adoption route.
5. Record only redacted outcome fields and hard-stop on any failure.

## Validation Commands

- `node_modules\.bin\tsx.cmd <transient-route-smoke-harness>`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-content-paper-generated-result-local-route-setup-and-formal-draft-route-smoke.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-content-paper-generated-result-local-route-setup-and-formal-draft-route-smoke.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-content-paper-generated-result-local-route-setup-and-formal-draft-route-smoke.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-content-paper-generated-result-local-route-setup-and-formal-draft-route-smoke-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-content-paper-generated-result-local-route-setup-and-formal-draft-route-smoke-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- Content paper setup route fails or returns no generated result state.
- Content paper formal adoption route does not return `draft_created`.
- Any evidence would require raw generated result, raw reviewed draft, DB URL, cookie, token, Authorization header, raw DB
  row, raw prompt/output, Provider payload, or full formal paper content.
- Any next step requires migration, seed, source repair, Provider, organization adoption, publish, external service, or
  staging/prod work.
