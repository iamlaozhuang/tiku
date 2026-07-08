# Admin AI knowledge parameter UI

## Scope

Task id: `admin-ai-knowledge-parameter-ui-2026-07-08`

Branch: `codex/admin-ai-knowledge-parameter-ui-2026-07-08`

Matrix row: `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`

This branch only updates backend AI generation UI parameter handling for `org_advanced_admin` and `content_admin`.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md` through `adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- Repository-external design board index only: `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux`
- Source inspected: `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`, related admin AI tests.

## Implementation Plan

1. Replace backend AI free-text knowledge-point fields with a structured knowledge coverage panel.
2. Preserve existing profession, level, subject, count, difficulty, goal, and paper source controls.
3. Map coverage mode, include-descendants flag, optional supplement, public-id list, and organization source preference into `generationParameters`.
4. Show an explicit empty/disabled state when `指定知识点` is selected but no public-id option is available in this UI scope.
5. Keep content AI in content draft/review domain and organization AI in enterprise training draft domain.
6. Update targeted tests for default parameters, request payload, disabled state, source preference, and redaction boundaries.

## Boundaries

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-08-admin-ai-knowledge-parameter-ui.md`
- `docs/05-execution-logs/evidence/2026-07-08-admin-ai-knowledge-parameter-ui-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-08-admin-ai-knowledge-parameter-ui-audit.md`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`

Blocked:

- Provider execution or Provider configuration.
- DB read/write, schema, migration, seed, fixture, rawfiles changes.
- Auth, role, authorization, `effectiveEdition`, quota, or organization-context semantic changes.
- `package.json`, lockfiles, env files, staging/prod/deploy, Cost Calibration.
- Evidence containing credentials, sessions, cookies, tokens, env values, DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI output, full question/paper/material/resource content.

## Validation

- `npm.cmd exec -- vitest run src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-knowledge-parameter-ui-2026-07-08`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-knowledge-parameter-ui-2026-07-08 -SkipRemoteAheadCheck`

## Adversarial Checks

- Standard organization admin must still see unavailable state, not AI form.
- Content admin must not receive organization source preference or organization draft wording.
- Organization admin must not receive platform content-adoption wording.
- `指定知识点` without public ids must not submit.
- Free-text supplement must remain a soft constraint and must not masquerade as an internal id.
- Submit payload must not include raw Provider, session, cookie, env, or private fixture material.
