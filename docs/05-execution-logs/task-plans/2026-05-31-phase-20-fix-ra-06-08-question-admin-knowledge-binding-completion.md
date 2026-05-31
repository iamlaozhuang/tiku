# Phase 20 Fix RA-06-08 Question Admin Knowledge Binding Completion Plan

**Task id:** `phase-20-fix-ra-06-08-question-admin-knowledge-binding-completion`

**Branch:** `codex/phase-20-fix-ra-06-08-question-admin-knowledge-binding-completion`

## Approval Boundary

- Human approval: user approved claiming the recommended task and approved the required high-risk permission in the 2026-05-31 session.
- Approved local scope: question admin knowledge_node/tag binding UI/runtime/test/evidence closure using the existing `question_knowledge_node` and `question_tag` local model.
- Explicitly blocked: `.env.local`, `.env.example`, package/lockfile/dependency changes, `src/db/schema/**`, `drizzle/**`, schema/migration changes, cloud/deploy/staging/prod/real provider, external service config, destructive data operation, and `drizzle-kit push`.
- Stop condition: if durable binding cannot be completed without schema or migration work, stop and record blocked evidence instead of modifying schema/migration files.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/02-architecture/interfaces/phase-10-local-release-candidate-contract.md`
- `docs/02-architecture/interfaces/phase-11-role-based-full-flow-acceptance-contract.md`
- `docs/02-architecture/interfaces/phase-11-cloud-adapter-readiness-contract.md`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/02-architecture/interfaces/phase-11-staging-resource-plan.md`
- `docs/02-architecture/interfaces/phase-11-staging-secret-and-env-plan.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `superpowers:test-driven-development`

## Finding

`F-RA-06-08-001`: question/material admin UI exists, but the question admin binding closure still depends on knowledge_node/tag binding and recommendation-review completion. The prerequisite RA-02-01 persistent binding task is closed, and the current code already persists and hydrates `knowledgeNodePublicIds` and `tagPublicIds`; this task should therefore complete the admin UI/runtime evidence without changing schema or migrations.

## Implementation Plan

1. Use TDD: add a focused UI test that proves content admin can edit a question's `knowledgeNodePublicIds` and `tagPublicIds` in the question form, save them through `PATCH /api/v1/questions/{publicId}`, and see the updated bindings in the question row.
2. Confirm RED failure before production code changes.
3. Extend the question form state with bounded publicId-list inputs for knowledge_node and tag bindings.
4. Preserve existing bindings when editing, normalize comma/newline/whitespace-separated public identifiers, and keep create defaults as empty arrays.
5. Reuse the existing question update route, DTO envelope, publicId fields, and repository binding persistence.
6. Run focused tests, full task validation commands, local CI gates, build, and browser/e2e verification where available.
7. Record evidence, security review notes, and closeout git inventory.

## Risk Controls

- No schema or migration file will be touched.
- No numeric internal `id` is introduced into URL, DTO, UI state, or evidence.
- All JSON fields remain camelCase and API responses stay `{ code, message, data, pagination? }`.
- The UI sends only public identifiers and existing question fields through the already-authenticated admin route.
- `.env.local` and `.env.example` remain unopened and unmodified.
- Staging/prod/cloud/real provider/deploy/destructive data gates remain blocked.
