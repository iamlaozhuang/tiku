# 2026-07-08 Organization Training Create Guide Dedup

## Task

- Task id: `organization-training-create-guide-dedup-2026-07-08`
- Branch: `codex/org-training-create-guide-dedup`
- Goal: remove duplicated step guidance inside the organization training creation surface.
- User approval boundary: current user approved a small short branch, merge, push, and cleanup.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `docs/05-execution-logs/evidence/2026-07-08-organization-training-draft-preview-publish-evidence.md`

## Requirement Mapping Result

- `CT-REQ-016`: organization training requires a clear four-step creation wizard.
- `CT-REQ-055`: advanced organization training remains an `org_advanced_admin` surface.
- Advanced-edition module 04: keep the four steps, but avoid duplicate step labels in the same creation surface.
- Batch 2 org-admin workspace baseline P1 item 3: wizard should show clear step progress and not compete with the list.

## Scope

Allowed:

- Rename the creation section heading from a wizard-specific title to a simpler `新建企业训练` if needed.
- Keep the top four-step progress bar.
- Remove or neutralize repeated step-number headings inside the four content columns.
- Use clearer lower-card headings such as source/config/scope/check labels.
- Update only the existing organization-training admin entry unit test.

Out of scope:

- No API, DTO, service, repository, DB, schema, migration, seed, fixture, Provider, AI generation, employee answer flow, package, or lockfile change.
- No new dependency.
- No staging/prod/deploy/env/secret/Cost Calibration.
- No raw prompt, Provider payload, raw AI output, full question, full paper, material content, session, cookie, token, DB URL, or raw DB row in evidence.

## Source Mapping

- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`

## TDD Plan

1. Add a failing unit assertion that the creation surface has one top four-step progress list and does not repeat the same numbered step headings in the content columns.
2. Verify the new test fails for the current implementation.
3. Apply the smallest UI copy/layout change.
4. Re-run the focused unit test until green.

## Validation Plan

- `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-08-organization-training-create-guide-dedup.md src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx tests/unit/organization-training-admin-entry-surface.test.ts`
- `git diff --check`
- Browser validation on localhost if the current running app can be inspected without credentials or sensitive capture.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-create-guide-dedup-2026-07-08`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-create-guide-dedup-2026-07-08 -SkipRemoteAheadCheck`

## Adversarial Review

- Verify the top four-step creation model remains visible.
- Verify content-column headings no longer duplicate the same numbered steps.
- Verify standard organization admin access boundaries are not touched.
- Verify no formal content, DB, Provider, dependency, or hidden identifier behavior is touched.
- Verify evidence stays redacted.
