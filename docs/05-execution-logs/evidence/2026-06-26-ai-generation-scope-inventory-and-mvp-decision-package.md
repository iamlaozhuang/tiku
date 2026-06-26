# AI Generation Scope Inventory And MVP Decision Package Evidence

Task id: `ai-generation-scope-inventory-and-mvp-decision-package-2026-06-26`

Branch: `codex/ai-generation-scope-inventory-20260626`

Task kind: `docs_only_ai_generation_scope_inventory_and_decision_package`

## Summary

Prepared a docs-only AI generation scope inventory and MVP decision package. The package separates:

- learner personal AI local-contract scaffolding;
- organization employee partial local-contract scaffolding;
- content and organization admin entry-only surfaces;
- gated Provider bridge code;
- blocked formal adoption and missing product loops.

No runtime behavior was changed.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md`

## Approval Boundary

Owner request:

- Create `ai-generation-scope-inventory-and-mvp-decision-package-2026-06-26`.
- Owner added authorization allowing Provider/Cost and real model calls.

Task handling:

- This task records that authorization as a successor-gate input only.
- This task did not execute Provider/Cost, read env/secrets, call a model, run browser/e2e, inspect DB/accounts, or change
  source.

## Requirement Mapping Result

Mapped to:

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

Mapping conclusion:

- Local browser role acceptance may prove AI entry visibility and role guards.
- It does not prove AI generation product completion, real Provider behavior, Cost Calibration, or formal `question`/`paper`
  adoption.
- If final Pass remains local-product only, incomplete AI product loops must be explicitly excluded or deferred.
- If final Pass includes advanced AI generation completion, content/org AI generation implementation and Provider/Cost
  gate evidence remain blocking.

## Static Source Inventory Findings

Personal learner AI:

- `StudentPersonalAiGenerationPage.tsx` has `AI出题` and `AI组卷` actions and states that the current surface shows local
  contract summary and redacted status.
- `personal-ai-generation-requests/route.ts` wires the public request route without `runtimeBridgeControl`.
- `personal-ai-generation-local-browser-experience-service.ts` returns `runtimeStatus: local_contract_only`.
- `personal-ai-generation-result-route.ts` reads result history/detail from repository and does not invoke Provider.

Organization employee AI:

- The personal AI request route can resolve employee organization context for local browser experience.
- The persistence input helper only accepts the personal-auth persistence shape, so organization employee generation
  persistence/product lifecycle remains incomplete.

Content and organization admin AI:

- Content and organization admin AI pages render `AdminAiGenerationEntryPage`.
- That component checks roles through `/api/v1/sessions` and displays entry/boundary cards.
- Static route scan found no content or organization AI generation request API under `src/app/api/v1`.

Provider bridge:

- `package.json` includes AI SDK packages.
- ADR-006 says installed packages are dependency availability only.
- Provider adapter and route-integrated execution services exist, but normal public routes do not execute Provider calls.

Formal adoption:

- A personal AI formal-adoption review route exists, but the DTO reports `formalTargetWriteStatus:
blocked_without_follow_up_task`.
- Formal target writes and content/org adoption loops remain unimplemented or blocked.

## Validation Results

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Result |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md docs/05-execution-logs/acceptance/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md docs/05-execution-logs/evidence/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md` | pass   |
| `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md docs/05-execution-logs/acceptance/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md docs/05-execution-logs/evidence/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md` | pass   |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | pass   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-scope-inventory-and-mvp-decision-package-2026-06-26`                                                                                                                                                                                                                                                                                                                                                                  | pass   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-scope-inventory-and-mvp-decision-package-2026-06-26 -SkipRemoteAheadCheck`                                                                                                                                                                                                                                                                                                                                              | pass   |

Pre-push readiness initially reported repository SHA drift because `project-state.yaml` still recorded the previous
accepted checkpoint `2868df351336663348a86c97d8d05547e0c1cf42` while both local `master` and `origin/master` were at
`97b0e24745a0f7aeb4733243d4009623a8f1a887`. The state checkpoint was updated inside this docs/state task scope, and the
same pre-push readiness command then passed.

## Blocked Work Statement

Not executed in this task:

- Provider/model calls;
- Provider configuration or `.env*`/secret reads or writes;
- Cost Calibration Gate;
- browser, Playwright, or dev server runtime;
- DB/seed/account inspection or mutation;
- source/test/package/lockfile/schema/migration/script edits;
- staging/prod/cloud/deploy, payment, or external-service work;
- PR, force push, or final MVP Pass.

## Residual Gaps

- Content AI generation product loop is not complete.
- Organization AI generation product loop is not complete.
- Organization employee AI generation persistence/product lifecycle is incomplete.
- Real Provider behavior and Cost evidence are not yet executed.
- Formal adoption into `question`/`paper` requires separate implementation and evidence.

## Next Step

Recommended next task:

`ai-generation-provider-cost-gate-package-2026-06-26`

Alternative if the owner wants implementation before Provider smoke:

`content-organization-ai-generation-product-loop-implementation-plan-2026-06-26`

No MVP final Pass is claimed.
