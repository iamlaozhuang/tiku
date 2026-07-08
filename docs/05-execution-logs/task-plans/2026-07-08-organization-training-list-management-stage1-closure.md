# 2026-07-08 Organization Training List Management Stage 1 Closure

## Scope

Stage 1 of the approved four-stage organization training repair plan.

Only change the organization advanced admin enterprise-training lifecycle list surface:

- draft rows show `继续配置` and existing `发布`;
- published rows show `查看`, `复制为新草稿`, and `下架`;
- taken-down rows show `查看` and `复制为新草稿`;
- lifecycle filters stay visible as `全部`, `草稿`, `已发布`, and `已下架`;
- internal identifiers and raw JSON stay hidden from the UI and evidence;
- takedown keeps the existing two-step confirmation and existing backend route.

Out of scope:

- no DB, schema, migration, seed, fixture, or destructive DB operation;
- no Provider execution, Provider config, prompt payload, raw AI output, or Provider call-chain change;
- no package or lockfile change, no new dependency;
- no formal `question`, `paper`, `mock_exam`, `mistake_book`, or `exam_report` writes;
- no AI generation page, employee answer flow, content backend, or authorization service rewrite;
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

- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/services/organization-training-route.ts`

## Implementation Plan

1. Add a failing unit assertion that draft lifecycle rows show `继续配置` plus `发布` and do not expose copy/takedown actions.
2. Implement the smallest UI change in `TrainingLifecycleItemCard`: the existing view action becomes `继续配置` for draft rows and stays `查看` for published or taken-down rows.
3. Keep action posting on existing `publish`, `take-down`, and `copy-to-new-draft` routes.
4. Keep standard organization admin unavailable-state coverage.
5. Run targeted and adjacent tests, lint, typecheck, full unit if required, diff checks, and Module Run v2 hardening.
6. Write redacted evidence and adversarial audit before commit and closeout.

## Risk Controls

- Authorization still comes from existing workspace access and service-side checks.
- UI actions are rendered from metadata-only `availableActions`; no new write capability is introduced.
- Published versions remain immutable; direct edit is not added.
- Evidence records only file paths, code symbols, command status, and redacted behavior results.
- No credentials, session values, cookies, tokens, localStorage values, env values, DB URLs, DB raw rows, Provider payloads, raw prompts, raw AI output, or full question/paper/material text may be captured.
