# Content AI 0704 Next Proof Approval Package Plan

## Scope

- Task id: `content-ai-0704-next-proof-approval-package-2026-07-09`
- Branch: `codex/content-ai-0704-next-proof-approval-package`
- Mode: docs/state approval package only.

## Required Reading Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-final-localhost-acceptance.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-final-acceptance-closeout-state.md`

## Code Context Checked

- `src/app/api/v1/content-ai-generation-requests/route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/admin-ai-generation-runtime-bridge-service.ts`
- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts`
- `src/server/services/admin-ai-generation-formal-adoption-service.ts`

## Current Finding

Current 0704 localhost history does not prove the final content AI business loop:

- AI出题 history has readable generated results, but no publishable formal question target.
- AI组卷 history has a formal paper target, but the target remains an unpublished draft and does not satisfy the publish replay precondition.
- The account matrix is no longer the blocker.
- This task does not classify the residual gap as a source defect.

The source path also confirms that ordinary no-Provider generation cannot create a fresh adoptable result: the content
generation route needs acceptable generated content before creating/reusing the draft result, while the default blocked
runtime has no generated content.

## Approval Paths To Materialize

Prepare one approval package with two mutually exclusive next proof paths:

1. Fresh Provider-enabled localhost replay.
2. Approved local 0704 fixture/history refresh.

Neither path is executed in this task.

## Hard Boundaries

- No source/test/package/lockfile/schema/migration/seed change.
- No direct database connection or mutation.
- No Provider call.
- No env/secret read.
- No private credential value output.
- No browser runtime action, screenshot, raw DOM, session, cookie, token, localStorage, or Authorization header capture.
- No staging/prod/deploy/Cost Calibration.

## Validation Plan

- Scoped Prettier write/check for touched docs/state files.
- `git diff --check`
- `corepack pnpm@10.26.1 lint`
- `corepack pnpm@10.26.1 typecheck`
- `Test-ModuleRunV2PreCommitHardening.ps1`
- `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`

Targeted unit tests are not applicable because this task changes docs/state only.
