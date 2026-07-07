# 2026-07-07 Content Lifecycle And AI Adoption Source Remediation Plan

Task id: `content-lifecycle-ai-adoption-2026-07-07`

Branch: `codex/content-lifecycle-ai-adoption-2026-07-07`

## Goal

Close branch 5 of the full-role UIUX source remediation matrix by aligning content-admin and super-admin content workspace surfaces to lifecycle-first content management, resource state-machine language, and governed content AI draft adoption.

This branch is UI/source/test/docs only. It does not change authorization semantics, login, accounts, DB, Provider execution/configuration, env, dependency/package/lockfile, schema, migration, seed, fixture, e2e, screenshots, staging/prod/deploy, release readiness, production usability, or Cost Calibration.

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
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-06-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-5-content-admin-cross-role-closure.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/05-execution-logs/task-plans/2026-07-07-full-role-uiux-source-remediation-control-matrix.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/README.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/manifest.redacted.json`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/page-matrix.html`

## Baseline Items Implemented By This Branch

| Baseline                             | Source                                       | Implementation Target                                                                                                         |
| ------------------------------------ | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Content workspace lifecycle-first    | Batch 5 P1.1, page matrix content rows       | Add compact lifecycle context bands and status summaries before paper/question/material/resource/knowledge lists.             |
| Content AI adoption review path      | Batch 5 P1.2/P1.3, 2026-07-06 AI recontract  | Make content AI question/paper outputs read as draft/review/adoption only, with AI paper as plan/select/draft/review wording. |
| Resource and knowledge state machine | Batch 5 P1.5, RAG module 6.6-6.8, CT-REQ-059 | Show upload, parse draft, publish, index, retrieval-ready, and failed states without raw storage/chunk identifiers.           |
| Super-admin content workspace parity | Batch 5 P1.6                                 | Same lifecycle/redaction rules apply; no super-admin bypass or alternate formal-publish language.                             |

## Allowed Files

- `src/app/(admin)/content/**`
- `src/features/admin/paper-management/**`
- `src/features/admin/question-material-management/**`
- `src/features/admin/resource-knowledge-management/**`
- `src/features/admin/knowledge-node-management/**`
- `src/features/admin/ai-generation/**`
- `tests/unit/admin-paper-ui.test.ts`
- `tests/unit/admin-question-material-ui.test.ts`
- `tests/unit/admin-resource-knowledge-ui-layout.test.ts`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`
- branch task plan/evidence/audit and state/queue files

## Forbidden Files And Actions

- `.env*`, `package.json`, lockfiles
- `src/db/schema/**`, `drizzle/**`, `migrations/**`, `seed/**`, fixtures
- DB read/write/migration/seed/destructive operations
- Provider execution/configuration, prompt payload, raw AI input/output
- screenshots, traces, raw DOM, e2e artifacts
- staging/prod/deploy, release readiness, production usability, Cost Calibration

## Implementation Approach

1. Add failing focused tests for the missing lifecycle context/status contracts in papers, question/materials, resource/knowledge pages, and content AI review.
2. Add reusable local UI helpers only inside the touched feature files where they reduce duplication without creating a new dependency or shared package.
3. Keep all runtime fetches and mutation payloads unchanged unless a test proves UI copy must be passed differently.
4. Make disabled action reasons visible near controls, especially draft/review/adoption and resource publish/rebuild paths.
5. Keep public ids out of primary explanatory copy where they are not required for user action; keep existing technical test-only public-id attributes untouched.

## Validation Plan

Red phase:

```powershell
.\node_modules\.bin\vitest.cmd run tests/unit/admin-paper-ui.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-resource-knowledge-ui-layout.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts
```

Green and closeout:

```powershell
.\node_modules\.bin\vitest.cmd run tests/unit/admin-paper-ui.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-resource-knowledge-ui-layout.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts
npm run lint
npm run typecheck
.\node_modules\.bin\prettier.cmd --check src/features/admin/paper-management/AdminPaperManagementClient.tsx src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx tests/unit/admin-paper-ui.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-resource-knowledge-ui-layout.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts docs/05-execution-logs/task-plans/2026-07-07-content-lifecycle-ai-adoption.md docs/05-execution-logs/evidence/2026-07-07-content-lifecycle-ai-adoption-evidence.md docs/05-execution-logs/audits-reviews/2026-07-07-content-lifecycle-ai-adoption-adversarial-audit.md
.\node_modules\.bin\vitest.cmd run
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-lifecycle-ai-adoption-2026-07-07
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-lifecycle-ai-adoption-2026-07-07 -SkipRemoteAheadCheck
```

After fast-forward merge to `master`, run `npm run lint`, `npm run typecheck`, full `vitest run`, write closeout evidence, push `origin/master`, delete the short branch, and confirm clean/aligned before branch 6.

## Requirement Mapping Result

| Requirement                                       | Branch 5 Mapping                                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Content workspace lifecycle-first                 | Papers, questions, materials, resources, and knowledge nodes expose lifecycle/context bands before list work. |
| Content AI adoption review path                   | Content AI question/paper pages show draft adoption, review, and publish-check wording, not direct publish.   |
| AI组卷 plan-and-select wording                    | Content paper generation shows plan, local platform question selection,待审试卷草稿, and manual review.       |
| Resource state machine and retrieval freshness    | Resource page shows uploaded, draft, published-to-index, retrieval-ready, failed, and freshness states.       |
| Knowledge node path and recommendation binding    | Knowledge node page shows path-change review, recommendation binding, linked question, and freshness context. |
| Super-admin content workspace parity              | No super-admin bypass path added; shared content components carry the same lifecycle and redaction rules.     |
| No Provider / no DB / no sensitive evidence scope | Only UI source, tests, docs, evidence, audit, and state/queue changed; evidence remains redacted.             |

## Adversarial Checks

- Content AI output must not imply direct formal publish.
- AI paper generation must not imply Provider-created full question bodies; wording must say plan, local selection, draft, review.
- Resource pages must not expose raw chunk, embedding, storage, DB URL, or private file path details.
- `ops_admin` must not regain resource write ownership through branch 5 changes.
- `super_admin` content pages must follow the same lifecycle and redaction rules as `content_admin`.
- No login, role, authorization, edition, org-context, DB, Provider, env, package, schema/migration/seed, or fixture behavior changes.

## Current Status

- Branch created from current `origin/master` at `a7f0691e05f5b785b86d576285f889a2249c64f4`.
- Read gate completed.
- TDD red phase, implementation, focused validation, lint, typecheck, scoped Prettier check, diff check, full unit validation, and Module Run v2 hardening/readiness completed on the short branch.
- Feature commit `ebd828cf5eefdfa7720596a3586bf3f6cc2e5aaf` fast-forward merged to `master`; master lint, typecheck, and full unit gates passed.
- Push, branch cleanup, and branch 6 handoff remain in the fixed closeout flow.
