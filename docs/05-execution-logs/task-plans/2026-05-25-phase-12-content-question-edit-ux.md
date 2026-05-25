# Task Plan: Phase 12 Content Question Edit UX

## Task

- id: `phase-12-repair-content-question-edit-ux`
- branch: `codex/phase-12-content-question-edit-ux`
- source: Phase 12 SSOT audit repair queue

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-12-mvp-requirements-runtime-audit.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

Repair the local content question/material authoring edit context so row-level edit actions open an understandable, adjacent editing surface tied to the selected row.

This task does not add question enum values, schema fields, migrations, dependencies, scripts, cloud resources, staging/prod access, deployments, or env/secret changes.

## SSOT Acceptance Focus

- Content admins can still create/edit/disable/copy questions and materials through protected runtime calls.
- Question row edit no longer opens a detached top-of-page form.
- Selected question/material is visibly tied to the edit panel.
- Existing question-type controls remain available for schema-supported question types only.
- Evidence remains redacted and references publicId/runtime state only.

## Implementation Approach

1. Move active question/material forms into a contextual editing panel beside the current list.
2. Add selected-row visual state and data attributes for unit/E2E assertions.
3. Keep existing request payload construction and protected API wiring unchanged.
4. Extend allowed unit/E2E tests to cover contextual edit UX and selected-row behavior.
5. Validate rendered behavior in the local browser after code tests pass.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-content-question-edit-ux`
- `npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts`
- `npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Controls

- No package/lockfile, schema, migration, script, `.env*`, staging/prod, deploy, or cloud changes.
- No real provider calls.
- No raw secret/token/Authorization header in evidence.
- No full教材/试卷/OCR全文 or customer-like private data in evidence.
