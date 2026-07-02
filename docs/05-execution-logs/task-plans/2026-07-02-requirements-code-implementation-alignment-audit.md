# Requirements Code Implementation Alignment Audit Task Plan

Task id: `requirements-code-implementation-alignment-audit-2026-07-02`

Branch: `codex/requirements-code-implementation-alignment-audit`

## Objective

Perform a read-only static alignment audit from the current requirement SSOT baseline to repository implementation
surfaces. The task identifies mapped implementation surfaces, static gaps, and next repair/audit candidates without
changing source code or claiming runtime pass.

## Scope Guard

- Allowed writes: requirement traceability audit, task plan, evidence, audit review, project state, task queue.
- Read-only: requirement docs, ADRs, governance docs, `src/**`, `tests/**`, `e2e/**`, `package.json`, existing evidence.
- Blocked: source/test/script/package/lockfile/schema/migration/seed changes, DB access, Provider calls, browser/runtime
  validation, env/secret access, staging/prod deploy, PR, force push, Cost Calibration, release readiness, final Pass,
  and production usability claims.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- Relevant standard and advanced modules/stories as needed by static scan findings.

## Requirement Decision Map

| Area                         | Current decision source                                                                                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| Requirement authority order  | `2026-07-02-requirements-ssot-cross-doc-alignment-audit.md`                                               |
| AI出题 / AI组卷 current base | `2026-07-02-ai-generation-requirements-ssot-alignment.md`                                                 |
| Role-separated surfaces      | `2026-06-24-role-separated-mvp-requirement-alignment.md` and `role-experience-fulfillment-matrix.md`      |
| Authorization and edition    | `advanced-edition/edition-aware-authorization-requirements.md` and ADR-007                                |
| Technical landing surfaces   | `unified-use-case-technical-matrix.md`, refined by actual repository paths discovered during static scan. |

## Requirement Mapping

The audit will map these domain items to code surfaces:

- standard account/session and authorization;
- content `question`/`paper` lifecycle;
- student practice, `mock_exam`, report, and `mistake_book`;
- standard AI scoring/explanation/RAG;
- advanced AI generation shared contracts, content backend, organization backend, and learner surfaces;
- role-separated backend workspaces and route denial;
- edition-aware authorization, `redeem_code`, `org_auth`, `auth_upgrade`, and quota surfaces;
- organization training and analytics;
- retention/log governance.

The output will classify each item as `static_mapped`, `static_partial`, `static_gap`, `not_in_current_scope`, or
`decision_required`.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-deterministic-acceptance-matrix-rollup.md`
- Existing execution logs referenced by requirement documents only as historical context.

Execution logs do not define implementation scope and do not prove runtime pass in this task.

## Conflict Check

Expected checks:

- Whether code surfaces still match stage 1 authority order.
- Whether static code has reusable shared AI generation contracts rather than role-specific forks.
- Whether role-separated workspace routes and authorization checks are represented in source.
- Whether edition-aware authorization fields and service checks are represented in source.
- Whether any current requirement has no static implementation landing surface.

If static scan finds an ambiguous requirement/code conflict that cannot be resolved by current SSOT, record
`decision_required` and do not repair it in this task.

## Static Scan Plan

- Enumerate `src/app` route groups and API routes.
- Enumerate `src/features`, `src/server/services`, `src/server/repositories`, `src/server/contracts`,
  `src/server/mappers`, `src/server/validators`, `src/db/schema`, `src/ai`, `tests`, and `e2e`.
- Search for domain terms: `effectiveEdition`, `auth_upgrade`, `redeem_code`, `org_auth`, `AI出题`, `AI组卷`,
  `personal-ai-generation`, `organization-ai-generation`, `content-ai`, `organization-training`, `quota`,
  `audit_log`, `ai_call_log`, `mistake_book`.
- Record only file paths, line references, status categories, and summarized observations.

## Validation Plan

- `npm.cmd exec -- prettier --write --ignore-unknown docs/01-requirements/traceability/2026-07-02-requirements-code-implementation-alignment-audit.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-requirements-code-implementation-alignment-audit.md docs/05-execution-logs/evidence/2026-07-02-requirements-code-implementation-alignment-audit.md docs/05-execution-logs/audits-reviews/2026-07-02-requirements-code-implementation-alignment-audit.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/01-requirements/traceability/2026-07-02-requirements-code-implementation-alignment-audit.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-requirements-code-implementation-alignment-audit.md docs/05-execution-logs/evidence/2026-07-02-requirements-code-implementation-alignment-audit.md docs/05-execution-logs/audits-reviews/2026-07-02-requirements-code-implementation-alignment-audit.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId requirements-code-implementation-alignment-audit-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId requirements-code-implementation-alignment-audit-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId requirements-code-implementation-alignment-audit-2026-07-02 -SkipRemoteAheadCheck`

## Acceptance Criteria

- Static code inventory maps current requirement domains to concrete repository surfaces.
- Findings are prioritized and separated into implementation gaps, validation gaps, and non-current-scope items.
- No source/test/package/schema/env/runtime behavior is changed.
- No runtime pass, release readiness, final Pass, production usability, or Cost Calibration claim is made.
- Evidence and audit review use redacted summaries only.

## Static Audit Result

- `AI出题` / `AI组卷` reuse is confirmed through shared task spec, shared Provider execution/redaction, shared
  instruction contracts, shared structured preview parsing, and role-specific bridges.
- Content backend, organization backend, personal learner, and employee learner AI generation now have concrete static
  surfaces.
- Role-separated guards, organization training, organization analytics, and student learning surfaces are statically
  mapped, but runtime allow/deny proof remains a later bounded walkthrough task.
- Historical AI组卷 "题量未识别" evidence is classified as a validation gap, not repaired in this task.
- `org_auth` multi-profession/multi-level remains a future product/schema decision.
- OCR and payment remain non-current-scope product features.
