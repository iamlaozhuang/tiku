# Requirements SSOT Cross-Doc Alignment Audit Task Plan

Task id: `requirements-ssot-cross-doc-alignment-audit-2026-07-02`

Branch: `codex/requirements-ssot-cross-doc-alignment-audit`

## Objective

Create a docs-only cross-document alignment audit for requirement SSOT so later walkthrough, code audit, or repair tasks
do not start from stale historical residuals.

## Scope Guard

- Allowed: requirement traceability audit doc, task plan, evidence, audit review, project state, task queue.
- Blocked: source/test/script changes, dependency/package/lockfile changes, schema/migration/seed changes, DB access,
  Provider calls, browser/runtime validation, env/secret access, staging/prod deploy, PR, force push, Cost Calibration,
  release readiness, final Pass, and production usability claims.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/*.md`
- `docs/01-requirements/stories/*.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/*.md`
- `docs/01-requirements/advanced-edition/stories/*.md`
- `docs/superpowers/specs/*advanced-edition*.md`
- `docs/superpowers/plans/*advanced-edition*.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/requirement-fulfillment-matrix.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`

## Requirement Decision Map

| Decision area               | Active reading                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| Standard MVP baseline       | Standard root, modules, and stories remain authoritative for standard-only behavior.                |
| Advanced edition baseline   | Advanced index, advanced modules/stories, source specs, and handoff docs define advanced scope.     |
| Edition-aware authorization | Edition-aware authorization requirements and ADR-007 are required for `effectiveEdition` work.      |
| AI出题 / AI组卷             | 2026-07-02 AI generation SSOT alignment is the current first-read overlay.                          |
| Role-separated work         | 2026-06-24 role-separated alignment plus role experience matrix remain required.                    |
| Catalogs and matrices       | Capability/use-case/delta/technical matrices map coverage and candidate surfaces, not runtime pass. |
| Execution logs              | Evidence-only unless promoted into `docs/01-requirements/` or traceability.                         |

## Requirement Mapping

This task maps requirement documents to a normalized reading order and conflict register. It does not map code paths or
assert implementation coverage.

Output path:

- `docs/01-requirements/traceability/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md`

Required mapping results:

- Coverage manifest for requirement-related source surfaces.
- Authority order for standard, advanced, traceability, catalog, and evidence sources.
- Domain map for standard, advanced, AI generation, role-separated, authorization, quota, RAG, and governance surfaces.
- Conflict register with `resolved_by_source_order`, `resolved_by_scope`, or `resolved_by_adr_order`.
- Omission risk review and next recommended task.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-deterministic-acceptance-matrix-rollup.md`

These files are used only to understand current AI generation baseline closure. They do not create new requirements or
runtime claims.

## Conflict Check

Expected conflicts:

- Standard base AI generation non-goal versus advanced/content AI generation scope.
- Historical content-admin blocked wording versus later confirmed content AI entries.
- Catalog/use-case `blocked_until_gate_approved` wording versus current 2026-07-02 AI baseline.
- Role matrix release-blocked rows versus bounded AI generation goal completion evidence.
- OCR product non-goal versus local preprocessing evidence.
- Historical release/full-coverage wording versus current non-claim policy.

Decision rule: resolve conflicts by latest applicable traceability, scope boundary, or ADR order. If a conflict cannot
be resolved by existing sources, mark it `decision_required` and stop before implementation. No implementation work is
approved by this plan.

## Validation Plan

- `npm.cmd exec -- prettier --write --ignore-unknown docs/01-requirements/traceability/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md docs/05-execution-logs/evidence/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md docs/05-execution-logs/audits-reviews/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/01-requirements/traceability/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md docs/05-execution-logs/evidence/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md docs/05-execution-logs/audits-reviews/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId requirements-ssot-cross-doc-alignment-audit-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId requirements-ssot-cross-doc-alignment-audit-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId requirements-ssot-cross-doc-alignment-audit-2026-07-02 -SkipRemoteAheadCheck`

## Acceptance Criteria

- The audit records a requirement-related file coverage manifest and source authority order.
- Historical residuals are normalized against current AI generation and role-separated sources without deleting history.
- No unresolved product conflict remains for this docs-only alignment.
- project-state and task-queue record the task boundary, allowed files, blocked files, validation plan, and closeout
  policy.
- Evidence and audit review record redacted results only.
- The task closes without source/test/runtime/provider/browser/DB/dependency/schema/deploy changes or release/final
  claims.
