# Content Admin Review Adoption Local Route Smoke Execution Plan

Task id: `content-admin-review-adoption-local-route-smoke-execution-2026-06-27`

Branch: `codex/content-admin-route-smoke-execution-20260627`

moduleRunVersion: 2

## Objective

Execute one capped local route/runtime smoke for the content-admin generated-result review adoption loop under the fresh
approval boundary.

The selected decision is `rejected` because it proves the source-defined review decision path without formal draft
creation, formal publish, or student-visible runtime.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`
- `src/app/api/v1/content-ai-generation-results/[publicId]/formal-adoptions/route.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.ts`
- `src/server/services/admin-ai-generation-formal-adoption-service.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.ts`
- `src/server/repositories/runtime-database.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`

## Requirement Decision Map

| Requirement source        | Decision used by this task                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Approval package          | Future execution may run one local route/service smoke with one review decision and redacted evidence.                |
| Fresh user approval       | Allows one local dev route/runtime smoke, one decision mutation, one metadata readback, and the defined cap/boundary. |
| Formal content separation | Content-admin generated output can only move through governed review; direct formal publish remains blocked.          |
| Command-contract TDD      | `approved` and `rejected` route/service decisions are source/test-covered.                                            |
| ADR-002                   | Route handlers are thin adapters over service/repository logic.                                                       |
| ADR-004/005               | Local `dev` evidence cannot imply staging/prod readiness.                                                             |

## Conflict Check

- The user approved local route/runtime smoke execution but still blocks browser/dev-server/e2e, Provider, Cost
  Calibration, schema/migration/seed/destructive DB, formal publish, student-visible runtime, staging/prod/deploy/payment
  external service, OCR/export, PR, force push, release readiness, and final Pass.
- The previous approval package says execution must stop if it needs `.env*` or credential reads.
- Source inspection shows the default PostgreSQL runtime loads `.env.local` to obtain `DATABASE_URL`; that path is not
  used here.
- Source inspection also shows the route handler supports dependency injection for `adoptionRepository`, session, clock,
  and formal draft adapter. The route-level `rejected` focused runtime test uses those injection points and does not
  start a dev server, browser, Provider, or DB connection.

## Execution Surface

Route surface:

```text
POST /api/v1/content-ai-generation-results/{publicId}/formal-adoptions
```

Source-defined implementation path:

```text
route handler -> admin AI generation formal adoption service -> injected adoption repository -> redacted response
```

Selected focused command:

```text
npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts -t "allows content admin to reject a generated question without formal draft creation"
```

## Test Data And Mutation Boundary

- Test target: existing test-owned synthetic generated-result public id from the focused route runtime test.
- Decision: `rejected`.
- Mutation cap: exactly one route handler invocation in the focused command.
- Persistence boundary: injected test repository only. The default PostgreSQL path is not consumed because it would read
  `.env.local`; local DB execution remains blocked pending explicit credential/env handling approval.
- Readback: route response asserts redacted review traceability, rejected status, blocked formal target write status, no
  formal draft adapter invocation, and no raw generated content or Authorization token exposure.

## Rollback And Archive Strategy

The selected smoke uses an injected in-process test repository, so no persistent DB artifact is created. Cleanup is the
test process exit. No archive/index movement, destructive DB operation, formal draft cleanup, seed, migration, or
rollback command is needed or approved.

## Evidence And Redaction Rules

Evidence may record only:

- command name and focused test name;
- role label `content_admin`;
- decision kind `rejected`;
- pass/fail/blocked result;
- assertion categories and counts;
- masked public-id style labels already present in source tests.

Evidence must not record credentials, `.env*`, tokens, cookies, localStorage, Authorization headers, DB URLs, DB rows,
SQL output, raw prompts, Provider payloads, raw generated output, screenshots, traces, page dumps, full `paper`, full
`material`, private answer text, plaintext `redeem_code`, or public identifier inventories.

## Validation Commands

```text
npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts -t "allows content admin to reject a generated question without formal draft creation"
npm.cmd run lint
npm.cmd run typecheck
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-adoption-local-route-smoke-execution-2026-06-27
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-admin-review-adoption-local-route-smoke-execution-2026-06-27
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-adoption-local-route-smoke-execution-2026-06-27 -SkipRemoteAheadCheck
```

## Stop Conditions

Stop before execution if the next step requires:

- reading `.env*`, credentials, tokens, cookies, localStorage, or Authorization headers;
- default PostgreSQL runtime initialization through `.env.local`;
- browser/dev-server/e2e;
- Provider call/configuration or Cost Calibration;
- schema, migration, seed, destructive DB, broad table scan, raw row dump, or data export;
- formal publish, student-visible runtime, staging/prod/deploy/payment/external service, OCR/export;
- source/test/package/lockfile/schema/script/archive/index edits;
- PR, force push, release readiness, or final Pass.
