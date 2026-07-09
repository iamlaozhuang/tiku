# 2026-07-09 content AI traceability summary panel task plan

## Task

- Task id: `content-ai-traceability-summary-panel-2026-07-09`
- Branch: `codex/content-ai-traceability-summary-panel`
- Goal: content-admin AI generation history shows a redacted field-level summary of whether the current generation followed parameters, RAG scope, evidence status, and paper assembly structure.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- Latest relevant evidence/audits for 2026-07-08 and 2026-07-09 content AI, organization AI parameters, RAG scope, and training-loop regression.

## Code Read List

- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`
- `src/server/contracts/admin-ai-generation-local-contract.ts`
- `src/server/contracts/route-integrated-provider-execution-contract.ts`
- `src/server/contracts/ai-generation-task-request-contract.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`

## Requirement Mapping Result

- Content-admin AI出题 must show whether generated question count and evidence status match the submitted parameters and selected RAG scope, without exposing raw prompts, provider payloads, or full question content.
- Content-admin AI组卷 must show submitted distribution, paper structure, selected formal question counts, and section counts at field level, while preserving the 2026-07-06 plan-and-select contract.
- The summary is a content-admin review aid only. It does not change adoption, publish, formal draft creation, personal advanced AI, organization employee AI, or organization advanced admin AI semantics.

## Implementation Plan

1. Add red unit coverage for content-admin current AI question traceability summary.
2. Add red unit coverage for content-admin current AI paper traceability summary.
3. Implement a UI-only redacted summary model from current local contract summary plus submitted generation parameters.
4. Render the summary inside the existing content-admin review traceability panel.
5. Keep historical-only rows safe: no fabricated parameters or raw structured content when the current local contract is unavailable.

## Boundary

- No Provider execution.
- No DB connection, DB mutation, schema, migration, seed, or fixture change.
- No env/secret/session/cookie/token/localStorage/Auth header value read or recorded.
- No package or lockfile change.
- No screenshots, raw DOM, browser trace, staging/prod/deploy, or Cost Calibration.
- Evidence records only paths, code symbols, field labels, command statuses, and aggregate test counts.

## Validation Plan

- Red: `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts --reporter=dot`
- Green targeted: `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts --reporter=dot`
- Adjacent role boundary: `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- `corepack pnpm@10.26.1 run typecheck`
- `corepack pnpm@10.26.1 run lint`
- `git diff --check`
- Module Run v2 pre-commit and pre-push readiness for this task id.
