# AI Generation Product Boundary Execution Package Approval Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use the repository Module Run v2 lifecycle and batch execution package governance before executing any child task. This plan is an approval package only; it does not authorize implementation, Provider calls, DB mutation, publish, browser/e2e, staging/prod, payment, external-service work, or final Pass.

**Task id:** `ai-generation-product-boundary-execution-package-approval-2026-06-26`

**Branch:** `codex/ai-generation-product-boundary-package-20260626`

**Task kind:** `docs_state_ai_generation_product_boundary_execution_package`

**Goal:** Create a docs/state approval package that resolves AI generation product boundaries and splits the next 3-5 verifiable follow-up closures without implementing them.

**Architecture:** The package keeps AI generated content in separated domains: learner private, organization-owned, content review, and platform formal content. Formal publish and student-visible content remain separate fresh-approval gates.

**Tech Stack:** Documentation/state only. No TypeScript, schema, Provider, DB, route, browser, or package changes.

---

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

- Advanced learner and organization employee AI output stays in the learner AI learning domain and cannot automatically create formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Organization admin AI output belongs to the `organization` and is not platform formal content.
- Content admin AI output remains in an isolated draft/review domain until a governed adoption flow creates an editable formal draft.
- Formal publish and student-visible content require a separate fresh approval and must not be included in this package.
- Organization analytics can show summary counts and status only; raw employee answers and raw learner AI content remain hidden.
- Provider packages being installed is dependency availability only. Real Provider calls and Cost Calibration remain gated.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-provider-disabled-product-closure-or-generated-result-storage-decision.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-storage-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-generated-result-storage-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-content-organization-ai-generation-product-loop-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-26-content-organization-ai-generation-product-loop-implementation-plan.md`
- `docs/05-execution-logs/acceptance/2026-06-26-formal-paper-draft-composition-adoption-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-formal-paper-draft-composition-route-integration-local-smoke.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-formal-paper-draft-composition-route-integration-local-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-provider-cost-real-provider-paper-composition-smoke-execution.md`
- `docs/05-execution-logs/acceptance/2026-06-26-formal-publish-student-visible-content-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-formal-publish-student-visible-content-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-formal-publish-student-visible-content-approval-package.md`

## Requirement Mapping

This task maps to the advanced AI generation, organization AI generation, formal content separation, organization analytics, and content admin review boundaries. It does not implement those requirements. It produces a package that decides which future tasks are required before those requirements can be locally validated.

## Conflict Check

No SSOT conflict is observed. The only tension is sequencing: recent evidence proves some content-admin formal draft composition and one local Provider smoke, while SSOT still forbids direct publish and organization-to-platform formal content writes. The package must preserve that distinction instead of treating the smoke as product completion.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-product-boundary-execution-package-approval.md`

## Blocked Scope

- No `src/**`, `tests/**`, `e2e/**`, `scripts/**`, `package.json`, lockfile, schema, drizzle, or `.env*` changes.
- No DB connection, DB mutation, migration, seed, Provider call, Provider credential read, Cost Calibration, browser/e2e, dev server, publish, student-visible content, staging/prod, payment, external service, deployment, PR, force push, release readiness, or final Pass.

## Boundary Decisions To Record

1. Organization advanced admin AI generation: decide between generated_result/history only, organization-owned draft adoption, and platform formal draft adoption.
2. Personal advanced and organization advanced employee AI generation: decide whether real generated result, history, private use/adoption, practice entry, and AI `paper` entry are required.
3. Publish execution: preserve as a separate fresh approval task.
4. Organization backend statistics UX: classify as current closure requirement or second-layer enhancement.
5. Content operations review UX: classify batch review, retry, diff, and adoption traceability as necessary closure or second-layer enhancement.

## Implementation Approach

- Create an acceptance approval package under `docs/05-execution-logs/acceptance/`.
- Create evidence and audit-review files with redacted, docs-only validation results.
- Update `project-state.yaml` with the current task summary and checkpoint.
- Add this closed approval package task to `task-queue.yaml`.
- Add 3-5 blocked follow-up task boundaries to `task-queue.yaml`; use `status: blocked` so `Get-TikuProjectStatus.ps1` does not auto-select implementation without fresh approval.

## Follow-Up Task Boundaries Planned

1. `org-ai-generation-owned-draft-boundary-and-local-contract-loop-approval-2026-06-26`
2. `learner-ai-generation-private-result-use-loop-approval-2026-06-26`
3. `formal-publish-student-visible-content-execution-approval-2026-06-26`
4. `organization-admin-ai-usage-statistics-ux-enhancement-approval-2026-06-26`
5. `content-admin-ai-review-ux-enhancement-approval-2026-06-26`

## Validation Commands

Run after writing final docs/state files:

```powershell
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-ai-generation-product-boundary-execution-package-approval.md docs/05-execution-logs/acceptance/2026-06-26-ai-generation-product-boundary-execution-package-approval.md docs/05-execution-logs/evidence/2026-06-26-ai-generation-product-boundary-execution-package-approval.md docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-product-boundary-execution-package-approval.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-ai-generation-product-boundary-execution-package-approval.md docs/05-execution-logs/acceptance/2026-06-26-ai-generation-product-boundary-execution-package-approval.md docs/05-execution-logs/evidence/2026-06-26-ai-generation-product-boundary-execution-package-approval.md docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-product-boundary-execution-package-approval.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-product-boundary-execution-package-approval-2026-06-26
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-product-boundary-execution-package-approval-2026-06-26 -SkipRemoteAheadCheck
```

## Stop Conditions

- Stop if implementation code, DB mutation, Provider execution, publish, student-visible runtime validation, browser/e2e, staging/prod, payment, external-service, deployment, dependency, schema, or secret access becomes necessary.
- Stop if evidence would need raw prompts, raw generated output, Provider payload, credentials, DB rows, public-id lists, full `question`, full `paper`, or private answer content.
- Stop if the queue script would make a follow-up implementation task executable without fresh approval.
