# Content Admin Review Adoption Local PostgreSQL Route Smoke Execution Plan

Task id: `content-admin-review-adoption-local-postgres-route-smoke-execution-2026-06-27`

Branch: `codex/content-admin-postgres-smoke-execution-20260627`

Task kind: `local_postgres_route_runtime_smoke_execution`

moduleRunVersion: 2

## Objective

Execute the lower-risk Layer 2 local PostgreSQL-backed route/runtime smoke for one content-admin generated-result review
target using only the `rejected` decision.

The task must prove either:

- one local `dev` DB-backed route/service command creates or reuses a safe redacted `rejected` review result for one
  test-owned target; or
- the command stops safely because the single candidate target is unavailable, ineligible, or cannot be proven inside
  the approved boundary.

It must not broaden into setup, seed, migration, browser, Provider, Cost Calibration, formal publish, student-visible
runtime, staging/prod, payment, external-service, PR, force push, release readiness, or final Pass.

## Approval And Closeout Boundary

Approval source:

- Current user fresh approval for
  `content-admin-review-adoption-local-postgres-route-smoke-execution-2026-06-27`.
- The approval selects only `rejected`.
- The approval allows existing runtime use of `.env.local` `DATABASE_URL` by the application process only.
- The approval forbids opening, outputting, copying, recording, or committing any `.env*` content, secret, token, DB URL,
  or credential value.
- The current user instruction requires independent branch execution, local commit, ff-only merge, push, and cleanup
  when mechanism gates pass.

Allowed:

- Read source/tests/docs only to identify the existing route/service command surface.
- Use the existing runtime DB path through application code.
- Execute at most one route/service command for one test-owned content-admin generated-result review target.
- Use at most one targeted redacted pre-read and one redacted post-readback, or the equivalent bounded reads inside the
  existing repository command.
- Record only role label, selected decision, pass/fail/blocked category, counts, redaction status, and red-line
  confirmations.
- Update `project-state.yaml`, `task-queue.yaml`, and this task's plan/evidence/audit/acceptance documents.

Blocked:

- Browser, dev-server, e2e, Provider, Cost Calibration, schema/migration/seed/destructive DB, raw SQL, raw row dump,
  broad scan, formal publish, student-visible runtime, staging/prod/deploy/payment external service, OCR/export, PR,
  force push, release readiness, and final Pass.
- Source/test/package/lockfile/schema/migration/script edits.
- Manual `.env*` read, grep, cat, echo, output, copy, edit, or evidence capture.
- Multiple targets, multiple decisions, retry loops, setup route calls, seed/bootstrap, or cleanup requiring destructive
  DB work.

## Documents Read

Normative sources:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

SOPs and state:

- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Source inspection:

- `src/app/api/v1/content-ai-generation-results/[publicId]/formal-adoptions/route.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.ts`
- `src/server/services/admin-ai-generation-formal-adoption-service.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts`
- `src/server/repositories/runtime-database.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md`

## Requirement Decision Map

| Requirement decision                                                                                    | Execution impact                                                                                           |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Content-admin AI output must remain isolated until governed review/adoption                             | The command targets only generated-result review metadata, not publish or student-visible content.         |
| Rejection and adoption require reviewer attribution and redacted traceability                           | Evidence records role label and status categories only.                                                    |
| `rejected` keeps formal draft creation blocked                                                          | The smoke must confirm no formal question/paper draft metadata is created for this decision.               |
| Provider/env/cost gates remain separately approved                                                      | The task uses no Provider and performs no Cost Calibration.                                                |
| Local DB evidence must not expose secrets, DB rows, raw generated content, prompts, or Provider payload | The command output is reduced to pass/fail/blocked categories and counts before being written to evidence. |

## Execution Shape

Command surface:

`POST /api/v1/content-ai-generation-results/{publicId}/formal-adoptions`

Implementation path:

`route handler -> content-admin formal adoption runtime -> service -> PostgreSQL adoption repository`

Session handling:

- Use the route handler factory with an in-memory `content_admin` session service.
- Do not use browser, dev-server, cookies, localStorage, Authorization header capture, or credentialed account material.

Candidate target:

- Use the single synthetic test-owned generated-result public reference from the focused runtime route test as the only
  candidate.
- Do not search the DB for alternatives.
- If the target is absent or ineligible, stop after the first command and record the blocked category.

Decision:

- `rejected` only.

Post-smoke state:

- `test_owned_state_can_remain` applies only if the command creates a `rejected` local test artifact.
- If the command returns `reused`, record that no new mutation was proven and do not retry.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId content-admin-review-adoption-local-postgres-route-smoke-execution-2026-06-27 -Capability localDockerDatabase -Intent use_capability`
- `node_modules\.bin\tsx.cmd - < redacted inline route/service smoke harness`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-execution.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-execution.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-execution.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-execution.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-execution.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-execution.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-adoption-local-postgres-route-smoke-execution-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-admin-review-adoption-local-postgres-route-smoke-execution-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-adoption-local-postgres-route-smoke-execution-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

- The inline harness cannot keep output redacted.
- The only candidate target is absent, ineligible, already adopted in a way that does not prove a new rejected mutation,
  or cannot be proven test-owned inside the approved boundary.
- Any step needs a second target, second mutation, retry loop, setup route, seed, migration, raw SQL, destructive DB
  operation, raw row dump, broad scan, browser, dev-server, e2e, Provider, Cost Calibration, staging/prod, payment,
  external service, OCR/export, PR, force push, release readiness, or final Pass.
- Any command output would need to reveal `.env*`, secrets, DB URL, credentials, tokens, cookies, Authorization headers,
  localStorage, raw generated content, prompts, Provider payloads, full `paper`/`material`, private answers, SQL output,
  or raw DB rows.
