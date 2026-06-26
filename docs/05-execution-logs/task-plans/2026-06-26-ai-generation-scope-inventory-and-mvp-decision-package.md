# AI Generation Scope Inventory And MVP Decision Package Plan

Task id: `ai-generation-scope-inventory-and-mvp-decision-package-2026-06-26`

Branch: `codex/ai-generation-scope-inventory-20260626`

Task kind: `docs_only_ai_generation_scope_inventory_and_decision_package`

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
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- Standard baseline MVP excludes AI出题 and AI组卷, while the standard/advanced role-separated addendum confirms advanced
  learner, organization admin, and content admin AI generation entries.
- Advanced learner AI generation requires discoverable `AI训练` with `AI出题` and `AI组卷`, but generated output must remain
  outside formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book` records.
- Organization AI generation requires discoverable organization backend `AI出题` and `AI组卷` entries for
  `org_advanced_admin`, with `org_standard_admin` denied or standard-unavailable.
- Content admin AI generation requires content backend `AI出题` and `AI组卷` draft/review entries, not direct formal writes.
- ADR-006 records installed AI SDK packages as dependency availability only. Provider execution, provider configuration,
  env/secret work, raw payload evidence, and Cost Calibration remain separate gates.

## Requirement Mapping

This task maps the observed implementation state to the AI generation requirement surface. It does not modify product
behavior.

Expected mapping outputs:

- distinguish entry/permission surfaces from executable generation workflows;
- distinguish local contract request/result scaffolding from real Provider execution;
- distinguish personal learner scaffolding from content/organization admin product loops;
- record the newly provided owner authorization for Provider/Cost and real model calls as a successor gate input, not as
  executed evidence.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-mvp-final-pass-decision-criteria-package.md`
- Static read-only source inspection of AI generation pages, route handlers, services, and `package.json`.

Execution logs are used as recovery context only. Requirement authority remains in `docs/01-requirements/` and ADRs.

## Conflict Check

No requirement conflict is expected. The likely ambiguity is acceptance wording: a passed role-separated browser matrix
can prove AI entry discoverability and route guards, but not content/organization AI generation business completion or
Provider/Cost readiness. The decision package will make that distinction explicit.

## Allowed Scope

- Create the AI generation scope inventory and MVP decision package.
- Create redacted evidence and audit review.
- Update `project-state.yaml` and `task-queue.yaml` for task recovery and closeout.
- Read source files only for static inventory.

## Blocked Scope

- No source, test, e2e, script, schema, migration, package, lockfile, or env edits.
- No browser, Playwright, dev server, DB, seed, account, credential, or raw row work.
- No Provider call, Provider configuration, env/secret read/write, raw prompt, provider payload, raw model output, or Cost
  Calibration execution in this task.
- No staging/prod/cloud/deploy, payment, external service, PR, force push, or final MVP Pass claim.

## Documentation Approach

1. Inventory AI generation surfaces by audience: personal advanced learner, organization advanced employee, content admin,
   organization admin, and Provider/ops governance.
2. Classify each surface as `entry_only`, `local_contract_scaffold`, `provider_bridge_gated`, `blocked_adoption_review`,
   or `undeveloped_product_loop`.
3. State the MVP decision implication: local product final Pass can exclude incomplete AI product loops only if the owner
   explicitly accepts that scope; including AI generation completion requires new implementation and Provider/Cost gate
   evidence.
4. Recommend the next task based on owner intent.

## Risk Defenses

- Treat installed AI SDKs as capability availability, not runtime readiness.
- Treat content/org admin AI pages as entry/guard surfaces unless an API/workflow proves otherwise.
- Treat the new Provider/Cost authorization as a successor-gate approval input, not as evidence from this docs-only task.
- Keep evidence redacted and avoid raw model, prompt, credential, DB, or browser data.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md docs/05-execution-logs/acceptance/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md docs/05-execution-logs/evidence/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md docs/05-execution-logs/acceptance/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md docs/05-execution-logs/evidence/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md docs/05-execution-logs/audits-reviews/2026-06-26-ai-generation-scope-inventory-and-mvp-decision-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-scope-inventory-and-mvp-decision-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-scope-inventory-and-mvp-decision-package-2026-06-26 -SkipRemoteAheadCheck`

## Evidence And Audit Requirements

- Evidence must include changed files, source inventory findings, validation outputs, blocked scopes, and next step.
- Audit review must check requirement mapping, scope containment, redaction, and MVP decision wording.
- No Standard/Advanced MVP final Pass statement is allowed.
