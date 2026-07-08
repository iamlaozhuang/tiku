# 2026-07-08 Organization Training List Management

## Scope

Stage 1 of the approved organization training UX repair plan.

Fix only the organization advanced admin enterprise-training list management surface:

- show lifecycle filters for `全部`, `草稿`, `已发布`, and `已下架`;
- render existing lifecycle actions from the metadata-only DTO;
- keep published versions read-only, with visible `查看`, `复制为新草稿`, and `下架` entries;
- keep draft publish entry visible;
- avoid raw internal identifiers and raw content in UI and evidence.

Out of scope:

- no DB, schema, migration, seed, fixture, or data mutation beyond local UI/API test mocks;
- no Provider execution or Provider call-chain changes;
- no package or lockfile changes;
- no formal `question`, formal `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` writes;
- no organization AI generation page rewrite;
- no employee answer flow rewrite;
- no staging/prod/deploy/env/secret/Cost Calibration work.

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
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/README.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/manifest.redacted.json`

## Source Mapping

- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-service.ts`

## Implementation Plan

1. Add failing unit tests for lifecycle filters and visible list actions.
2. Implement the smallest UI changes in `AdminOrganizationTrainingPage.tsx`.
3. Keep action posts on the existing `publish`, `take-down`, and `copy-to-new-draft` routes.
4. Keep the existing manual copy form for compatibility, but make list actions the primary path for selected items.
5. Run targeted unit tests, adjacent role-boundary tests, lint, typecheck, prettier check on touched files, and `git diff --check`.
6. Use localhost browser screenshot validation only with redacted screenshots; do not capture raw DOM, storage, sessions, cookies, tokens, env values, raw DB rows, Provider payloads, raw prompts, raw AI output, or full question/paper/material content.

## Risk Controls

- UI visibility does not grant authorization; runtime service checks remain unchanged.
- `org_standard_admin` remains blocked from `企业训练`.
- Published versions remain immutable; list action is `复制为新草稿` instead of direct edit.
- Takedown requires explicit confirmation and reason input.
- Evidence remains metadata-only and redacted.
- No dependency, schema, migration, seed, fixture, Provider, env, staging/prod/deploy, or Cost Calibration changes.
