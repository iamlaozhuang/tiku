# Content AI Review Result UX Task Plan

- Task id: `content-ai-review-result-ux-2026-07-08`
- Branch: `codex/content-ai-review-result-ux`
- Approved scope: content backend AI question and AI paper result/review UI wording, layout hierarchy, and focused unit tests only.

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
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `docs/05-execution-logs/evidence/2026-07-07-content-lifecycle-ai-adoption-evidence.md`
- `docs/05-execution-logs/evidence/2026-07-08-admin-ai-knowledge-parameter-ui-evidence.md`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`

## Implementation Scope

- Keep content backend `草稿评审` semantics.
- Make current generated result titles and cards say `待审题目草稿` / `待审试卷草稿` instead of generic generated-result wording.
- Make the content review panel emphasize `审阅 -> 编辑/驳回/采纳 -> 发布校验`.
- Make history summaries use content governance labels such as review summary, adoption status, and evidence status.
- Keep organization admin, learner, API, DTO, service, DB, Provider, package, schema, migration, seed, and fixture paths unchanged.

## Risk Controls

- UI visibility remains non-authorizing; existing route and service guards stay untouched.
- Content AI output remains reviewable draft content and does not directly publish formal `question` or `paper`.
- AI paper UI keeps plan-and-select semantics and platform formal question source wording.
- Evidence records only file paths, command statuses, and redacted summaries.

## Validation Plan

- RED: focused unit assertions fail for missing content review wording and card hierarchy.
- GREEN: update content-only UI copy and focused tests.
- Run `npm.cmd exec -- vitest run tests/unit/admin-ai-generation-entry-surface.test.ts --reporter=dot`.
- Run `npm.cmd run lint`.
- Run `npm.cmd run typecheck`.
- Run scoped Prettier check and `git diff --check`.
- Run Module Run v2 precommit and prepush readiness gates.
