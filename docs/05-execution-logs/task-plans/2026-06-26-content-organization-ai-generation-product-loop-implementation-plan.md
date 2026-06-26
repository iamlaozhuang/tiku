# Content Organization AI Generation Product Loop Implementation Plan

Task id: `content-organization-ai-generation-product-loop-implementation-plan-2026-06-26`

Branch: `codex/content-org-ai-loop-plan-20260626`

Task kind: `docs_only_implementation_plan_package`

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
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

- Content admin and organization admin AI generation entries must be discoverable, but entry visibility alone is not
  product-loop completion.
- Generated content must stay outside formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and
  `mistake_book` until a governed adoption path is approved.
- Organization-owned AI output belongs to the `organization` and must remain separate from platform formal content.
- Provider smoke passed locally, but Cost Calibration, production quota, staging/prod, payment, and external-service
  readiness remain blocked.

## Requirement Mapping

This plan maps the next implementation sequence for:

- content admin `AI出题`;
- content admin `AI组卷`;
- organization admin `AI出题`;
- organization admin `AI组卷`.

It does not implement those loops and does not approve persistence/schema, Provider calls, Cost Calibration, browser
runtime, staging/prod, payment, or final MVP Pass.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-ai-generation-provider-smoke-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-provider-smoke-execution.md`

## Conflict Check

No conflict found. Requirements call for real product loops, while source inspection confirms current content and
organization admin AI generation pages are entry-only. The honest next step is a staged implementation plan, not an MVP
final Pass claim.

## Allowed Scope

- docs/state/task queue/task plan/plan package/evidence/audit updates only;
- static read-only inspection of relevant source and tests.

## Blocked Scope

- no source/test/package/lockfile/script/env/schema/migration edits;
- no credential read or Provider call;
- no Cost Calibration;
- no DB, seed, account, browser/e2e, staging/prod, payment, external-service, PR, force push, or final MVP Pass.

## Planning Approach

1. State current implementation facts.
2. Define the minimum source repair sequence.
3. Separate DB/schema/persistence gates from source-only local contract repairs.
4. Separate Provider execution from product loop scaffolding.
5. Define tests, evidence, and blocked claims for each future task.

## Risk Defenses

- Do not combine content and organization completion claims with Provider smoke pass.
- Do not claim durable draft/review queue completion without persistence evidence.
- Do not allow generated content to write formal `question` or `paper` records directly.
- Keep real Provider calls out of future unit tests unless a fresh task explicitly approves a runtime smoke.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-content-organization-ai-generation-product-loop-implementation-plan.md docs/05-execution-logs/acceptance/2026-06-26-content-organization-ai-generation-product-loop-implementation-plan.md docs/05-execution-logs/evidence/2026-06-26-content-organization-ai-generation-product-loop-implementation-plan.md docs/05-execution-logs/audits-reviews/2026-06-26-content-organization-ai-generation-product-loop-implementation-plan.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-content-organization-ai-generation-product-loop-implementation-plan.md docs/05-execution-logs/acceptance/2026-06-26-content-organization-ai-generation-product-loop-implementation-plan.md docs/05-execution-logs/evidence/2026-06-26-content-organization-ai-generation-product-loop-implementation-plan.md docs/05-execution-logs/audits-reviews/2026-06-26-content-organization-ai-generation-product-loop-implementation-plan.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-organization-ai-generation-product-loop-implementation-plan-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-organization-ai-generation-product-loop-implementation-plan-2026-06-26 -SkipRemoteAheadCheck`

## Evidence And Audit Requirements

- Evidence must record the chosen first source task and blocked gates.
- Audit must verify the plan does not turn Provider smoke pass into AI product completion.
- No MVP final Pass may be claimed.
