# Organization Admin AI Usage Statistics UX Enhancement Approval Plan

Task id: `organization-admin-ai-usage-statistics-ux-enhancement-approval-2026-06-26`

Branch: `codex/org-admin-ai-statistics-ux-approval-20260626`

Task kind: `docs_only_approval_package`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

Organization analytics is a legitimate advanced organization requirement. The AI generation product boundary package
classifies organization AI usage/statistics UX as a second-layer acceptance enhancement for the current AI generation
boundary, unless a future organization-owned draft or organization training task makes employee-visible organization
content part of its closed loop.

## Requirement Mapping

- Current AI generation closure needs generated-result/history and ownership/adoption boundaries first.
- Organization statistics UX can add redacted usage counts, quota rollups, completion state, and score/time summaries.
- Statistics must not expose raw employee subjective answers, raw learner AI content, raw prompts, raw Provider output,
  or generated content detail.
- Export and external-service sharing are out of scope without fresh approval.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- Recent organization analytics and role-separated runtime evidence under `docs/05-execution-logs/`.

## Conflict Check

No conflict was found. The safe interpretation is that statistics UX is not needed to close the current AI generation
product boundary, but it becomes more important once organization-owned draft/training content is employee-visible.

## Scope

Allowed changes are limited to:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- the matching acceptance, evidence, and audit-review package

Blocked:

- source, tests, e2e, scripts, package/lockfile, schema, drizzle, and `.env*`;
- DB connection or mutation;
- browser/e2e/dev server;
- raw employee answer or raw AI content access;
- export or external-service integration;
- staging/prod/deploy/payment work;
- PR, force push, release readiness, and final Pass.

## Approval Package Approach

This task consumes the batch approval only for docs/state approval-package closure. It classifies organization admin AI
usage statistics UX and outlines future design-first and implementation gates.

## Validation Commands

1. `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
2. `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
3. `git diff --check`
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-ai-usage-statistics-ux-enhancement-approval-2026-06-26`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-ai-usage-statistics-ux-enhancement-approval-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

Stop if the next step would require code, tests, DB, browser/e2e/dev server, raw employee answer or raw AI content
access, export/external-service work, staging/prod/deploy/payment work, PR, force push, release readiness, or final
Pass.
