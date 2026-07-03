# 2026-07-02 Organization AI Post-Actions UI/UX Contract Task Plan

## Task

Create package 4 of the serial UI/UX requirement contracts: organization AI generation post-actions and result-to-training
draft handoff.

## Scope

Docs-only requirement and UI/UX contract work for organization `AI出题` / `AI组卷` task history, generated-output review,
copy-to-organization-training-draft behavior, evidence status handling, role boundaries, and redaction boundaries.

No product source, tests, schema, migration, database, Provider, browser/runtime, dependency, deploy, Cost Calibration,
release readiness, final Pass, or production usability work is allowed.

## Branch

`codex/organization-ai-post-actions-uiux-contract-2026-07-02`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`

## Source Inspection

Read-only source inspection targets:

- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx`
- `src/features/admin/organization-workspace/admin-organization-workspace-access.ts`
- `src/app/(admin)/organization/ai-question-generation/page.tsx`
- `src/app/(admin)/organization/ai-paper-generation/page.tsx`
- `src/server/contracts/admin-ai-generation-local-contract.ts`
- `src/server/repositories/admin-ai-generation-task-persistence-repository.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/repositories/organization-training-repository.ts`

## Implementation Plan

1. Reconcile existing organization AI decisions from advanced requirements, AI generation baseline evidence, and
   current-thread traceability.
2. Inspect current source for organization navigation, route boundaries, generated result DTOs, history UI, formal
   adoption boundaries, and training draft integration.
3. Write a docs-only UI/UX contract that separates:
   - existing decisions;
   - generated-output visibility contract;
   - training draft handoff contract;
   - evidence status behavior;
   - current source alignment;
   - follow-up source gaps.
4. Write redacted evidence with command summaries only.
5. Record two self-review passes.
6. Update `project-state.yaml` and `task-queue.yaml` for the package.
7. Run formatting and Module Run v2 gates.
8. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch only after gates pass.

## Risk Controls

- Do not expose credentials, env values, raw DB rows, sessions, cookies, Authorization headers, plaintext
  `redeem_code`, Provider payloads, raw prompts, raw AI IO, raw employee answers, or full paper/material/resource
  content.
- Do not run browser, Provider, database, schema, migration, or dependency commands.
- Do not modify `src/**`.
- Treat implementation observations as static evidence only, not runtime acceptance.
- Do not reopen 2026-07-02 closed AI generation issue classes without fresh current-baseline failure evidence.
- Stop for user decision if a new product conflict appears. This package found source gaps against already confirmed
  decisions, not a new decision conflict.

## Validation Commands

Planned:

- `npm.cmd exec -- prettier --write --ignore-unknown <package files>`
- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-ai-post-actions-ui-ux-contract-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-ai-post-actions-ui-ux-contract-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-ai-post-actions-ui-ux-contract-2026-07-02 -SkipRemoteAheadCheck`

## Closeout

Closeout is approved by the user's serial package instruction, limited to this docs-only package and subject to passing
the declared gates.
