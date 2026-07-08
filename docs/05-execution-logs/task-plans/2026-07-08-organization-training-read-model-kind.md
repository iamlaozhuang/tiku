# 2026-07-08 Organization Training Read Model Kind

## Scope

Stage 2 of the approved four-stage organization training repair plan.

Change only the read-only organization training lifecycle read model, route query handling, and list UI filters:

- add metadata-only `sourceKind` and `contentKind` to lifecycle DTO items;
- infer source/shape from existing draft/version lineage, source context, and admin AI generation task metadata;
- add route-level pagination and filters for lifecycle status, source kind, and content kind;
- keep unknown values as `unknown` when the source cannot be proven;
- keep responses metadata-only and free of raw payloads or internal database identifiers.

Out of scope:

- no DB, schema, migration, seed, fixture, or destructive DB operation;
- no Provider execution, Provider config, prompt payload, raw AI output, or Provider call-chain change;
- no package or lockfile change, no new dependency;
- no write interface change for publish, copy, takedown, or source-context attach;
- no new creation UI split, draft preview, publish gating, employee answer flow, content backend flow, or formal content adoption;
- no staging, prod, deploy, env, secret, or Cost Calibration work.

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
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`

## Source Mapping

- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/mappers/organization-training-mapper.ts`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/services/organization-training-route.test.ts`

## Implementation Plan

1. Add failing route/service/UI tests for `sourceKind`, `contentKind`, source/content filters, and service-side pagination.
2. Add DTO enum types:
   - `sourceKind`: `ai_question`, `ai_paper`, `platform_paper`, `manual_group`, `unknown`;
   - `contentKind`: `question_training`, `paper_training`, `unknown`.
3. Add read-only source metadata inputs to the lifecycle read model. Use existing source context and AI task metadata; never parse titles or raw payload.
4. Normalize query parameters in the route: `page`, `pageSize`, `status`, `sourceKind`, `contentKind`; invalid values fall back to safe defaults.
5. Apply filtering and pagination in the service read model and return standard `pagination` metadata.
6. Update the UI list to request server pagination/filters and render Chinese source/shape labels.
7. Keep existing local pagination as a compatibility fallback only when server pagination is absent.
8. Run targeted tests, adjacent tests, lint, typecheck, full unit if required, diff checks, and Module Run v2 hardening.

## Risk Controls

- All new enum values are product metadata only; they do not grant permission.
- Unknown is preferred over mislabeling when source evidence is incomplete.
- AI metadata read is limited to task type/kind metadata; no prompt, Provider payload, raw AI I/O, or generated content is exposed.
- No formal `question`, `paper`, `mock_exam`, `exam_report`, or `mistake_book` writes are introduced.
- Evidence records only file paths, code symbols, command status, and redacted behavior results.
