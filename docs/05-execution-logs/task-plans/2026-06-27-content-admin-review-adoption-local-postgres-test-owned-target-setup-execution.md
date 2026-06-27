# Content Admin Review Adoption Local PostgreSQL Test-Owned Target Setup Execution Plan

Task id: `content-admin-review-adoption-local-postgres-test-owned-target-setup-execution-2026-06-27`

Branch: `codex/content-admin-test-target-execution-20260627`

moduleRunVersion: 2

## Fresh Approval Boundary

Current user fresh-approves one Layer 2 local PostgreSQL test-owned target setup/selection plus `rejected`
route/runtime smoke execution.

Allowed:

- local dev only;
- use existing runtime database configuration through application code, without opening, outputting, copying, recording,
  or committing any `.env*` content, secret, token, DB URL, or credential value;
- prepare exactly one synthetic test-owned content-admin generated-result review target through an existing app-level
  local path, because the user did not provide an owner-supplied known target;
- perform at most one redacted pre-read, one `rejected` route/service command, and one redacted post-readback;
- write evidence with role label, decision, pass/fail/blocked category, counts, redaction status, target ownership
  classification, formal target state category, and red-line confirmations only.

Blocked:

- browser/dev-server/e2e;
- Provider call/configuration or credential read;
- Cost Calibration;
- schema/migration/seed/destructive DB/raw SQL/raw row dump/broad scan;
- formal publish, student-visible runtime, staging/prod/deploy/payment external service, OCR/export;
- second target, second mutation, retry loop;
- PR, force push, release readiness, or final Pass.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/sop/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-execution.md`
- `src/app/api/v1/content-ai-generation-requests/route.ts`
- `src/app/api/v1/content-ai-generation-results/[publicId]/formal-adoptions/route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.ts`
- `src/server/services/admin-ai-generation-formal-adoption-service.ts`
- `src/server/repositories/admin-ai-generation-task-persistence-repository.ts`
- `src/server/repositories/admin-ai-generation-result-persistence-repository.ts`
- `src/server/repositories/admin-ai-generation-result-persistence-db-adapter.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.ts`
- `src/server/repositories/runtime-database.ts`

## Execution Approach

1. Register the execution task in state and queue, including allowed files, read-only source surfaces, and blocked
   capability list.
2. Run the local capability gate for local database usage before runtime.
3. Use `createAdminAiGenerationLocalContractRouteHandlers("content")` to prepare one synthetic test-owned target through
   the app-level local contract path. The default runtime bridge must remain provider-blocked with
   `providerCallExecuted=false`, `envSecretAccessed=false`, `providerConfigurationRead=false`, and
   `costCalibrationExecuted=false`.
4. Use `createAdminAiGenerationFormalAdoptionRuntimeRouteHandlers` with the PostgreSQL-backed adoption repository and a
   synthetic content-admin session to execute exactly one `rejected` formal adoption command for that single target.
5. Perform a single redacted post-readback through the repository/API response data only.
6. Record redacted evidence, audit, and acceptance without identifiers, secrets, raw rows, or raw generated content.

## Validation Plan

- local capability gate for local database usage;
- redacted inline TSX runtime smoke harness;
- `npm.cmd run lint`;
- `npm.cmd run typecheck`;
- scoped Prettier write/check on the changed docs/state files;
- `git diff --check`;
- `Get-TikuProjectStatus.ps1`;
- Module Run v2 pre-commit hardening;
- Module Run v2 module closeout readiness;
- Module Run v2 pre-push readiness with remote-ahead skip before local commit.

## Risk Defenses

- The harness must not print `.env*` contents, DB URL, secrets, tokens, Authorization headers, raw IDs, raw rows, raw
  generated content, SQL output, provider payloads, or public identifier inventories.
- The route target setup count, route invocation count, mutation count, and post-readback count are capped at one.
- Any need for a second target, broad scan, retry loop, seed/migration/destructive DB/raw SQL, or Provider access stops
  the task as blocked.
- A `rejected` decision must not create formal question/paper drafts, publish, or expose student-visible runtime.
