# Org Admin AI Generation Result UX

- Task id: `org-admin-ai-generation-result-ux-2026-07-08`
- Branch: `codex/org-admin-ai-generation-result-ux`
- Date: 2026-07-08
- Scope: organization advanced admin `AI出题` / `AI组卷` result, history, and next-action UI wording only.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-02-organization-ai-post-actions-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `src/app/(admin)/organization/ai-question-generation/page.tsx`
- `src/app/(admin)/organization/ai-paper-generation/page.tsx`
- `src/app/(admin)/content/ai-question-generation/page.tsx`
- `src/app/(admin)/content/ai-paper-generation/page.tsx`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`

## Change Plan

1. Keep shared AI generation contracts, routes, DTOs, services, Provider chain, and persistence unchanged.
2. For `workspace="organization"` only, replace content-review wording with enterprise-training wording:
   - `草稿评审` becomes a training publish/check concept.
   - `资料依据` becomes an evidence-status concept close to training publish readiness.
   - history labels avoid `正式采用`.
3. Make the generated question draft list easier to scan for organization admins:
   - title as enterprise training question draft;
   - metadata chips for type, difficulty, and knowledge coverage;
   - answer and analysis hidden behind collapsible controls by default;
   - visible next actions remain training-draft actions, not formal-content actions.
4. Preserve content admin wording and learner/employee surfaces for later branches.

## Boundaries

- No API, DTO, service, repository, DB, schema, migration, seed, fixture, Provider, prompt, dependency, package, or lockfile change.
- No staging/prod/deploy/env/secret/Cost Calibration work.
- No DB read/write and no Provider-enabled execution.
- Evidence records only file names, symbols, statuses, and redacted command summaries.
- No full question, full paper, material text, raw prompt, raw AI output, Provider payload, internal id, cookie, token, session, DB URL, or env value.

## Validation Plan

- RED then GREEN targeted unit:
  - `npm.cmd exec -- vitest run tests/unit/admin-ai-generation-entry-surface.test.ts --reporter=dot`
- Gates:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd exec -- prettier --check --ignore-unknown docs/05-execution-logs/task-plans/2026-07-08-org-admin-ai-generation-result-ux.md docs/05-execution-logs/evidence/2026-07-08-org-admin-ai-generation-result-ux-evidence.md docs/05-execution-logs/audits-reviews/2026-07-08-org-admin-ai-generation-result-ux-audit.md src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`
  - `git diff --check`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId org-admin-ai-generation-result-ux-2026-07-08`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId org-admin-ai-generation-result-ux-2026-07-08 -SkipRemoteAheadCheck`

## Adversarial Checks

- `org_standard_admin` must remain denied or unavailable for organization AI generation.
- Organization AI output must remain organization training draft domain only.
- Content admin AI draft/review wording must not regress.
- Learner AI wording is out of this branch and must not be changed.
- No raw sensitive or full content appears in UI labels, tests, evidence, or final report.
