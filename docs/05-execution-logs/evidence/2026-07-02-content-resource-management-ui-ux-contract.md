# 2026-07-02 Content Resource Management UI/UX Contract Evidence

## Task

TaskId: `content-resource-management-ui-ux-contract-2026-07-02`

## Scope Evidence

result: pass

Branch: `codex/content-resource-management-uiux-contract-2026-07-02`

Batch range: UI/UX contract package 6 of 6, covering content resource management and content-admin UX.

Cost Calibration Gate remains blocked.
threadRolloverGate: after package-6 closeout, continue from this evidence, the state/queue records, and the six UI/UX
contract package documents.
automationHandoffPolicy: no automation handoff; continue manually from committed docs and state/queue only.
nextModuleRunCandidate: post-package implementation planning should start from the six contract gap registers, with
source changes split by role/surface and with fresh task materialization.

RED: current source has a resource management component and resource APIs, but the visible page is under operations
resources, the runtime write role still includes `ops_admin`, there is no content resources page, and ordinary copy still
exposes technical terms such as RAG, Markdown, vector, chunk, publicId, and local `.runtime`.

GREEN: package-6 contract records content-workspace ownership, non-technical workflow, role boundaries, current source
gaps, and follow-up source tasks without modifying product source.

Commit: `0000000` pending at pre-commit evidence authoring; final handoff records actual git commit.
localFullLoopGate: docs-only local validation required before commit, fast-forward merge, push, and branch cleanup.
blocked remainder: product source implementation, tests, schema/migration, dependency changes, browser/runtime
acceptance, DB actions, Provider/model actions, deployment, release readiness, final Pass, production usability, OCR,
cloud conversion provisioning, raw chunk editing, and Cost Calibration remain blocked for this package.

## Evidence Boundary

Allowed evidence: source file paths, requirement anchors, static implementation posture, redacted command summaries,
branch/commit/push/cleanup summaries.

Forbidden evidence: credentials, env values, sessions, cookies, Authorization headers, raw database rows, PII, plaintext
`redeem_code`, Provider payloads, raw Prompt, raw AI IO, raw employee answers, raw full resource content, raw Markdown
body, raw chunk text, screenshots, exports, object storage secret URLs, and full internal payloads.

## Source And Requirement Reads

Completed reads:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-admin-model-prompt-log-governance-ui-ux-contract.md`

## Static Source Observations

Inspected source paths:

- `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx`
- `src/app/(admin)/ops/resources/page.tsx`
- `src/app/(admin)/content/ContentKnowledgeOpsBaseline.tsx`
- `src/features/admin/content-admin-runtime.tsx`
- `src/app/(admin)/content/knowledge-nodes/page.tsx`
- `src/app/(admin)/content/materials/page.tsx`
- `src/app/api/v1/resources/**`
- `src/server/services/rag-resource-knowledge-runtime.ts`
- `src/server/repositories/rag-resource-knowledge-runtime-repository.ts`
- `src/server/contracts/admin-content-knowledge-ops-contract.ts`
- `src/server/services/admin-content-knowledge-ops-service.ts`
- `src/server/services/admin-content-knowledge-ops-route.ts`
- `src/server/validators/rag-resource-knowledge.ts`

Summary:

- Resource UI and APIs exist partially.
- The visible full resource page is currently under `/ops/resources`.
- No content resource page was found.
- Runtime resource write authorization still includes `ops_admin`.
- The resource component has upload, Markdown review, publish, rebuild, disable, enable, and confirmation states.
- The component still uses technical or local-runtime wording that is not suitable as the final non-technical content
  workflow.
- Source changes are intentionally not made in this package.

## Requirement To Source Gap Summary

- `CONTENT-RES-UX-01`: missing content workspace resource route/page.
- `CONTENT-RES-UX-02`: old operations resource route remains a write surface.
- `CONTENT-RES-AUTH-03`: resource write authorization includes `ops_admin`.
- `CONTENT-RES-UX-04`: ordinary copy still exposes technical/local-runtime terms.
- `CONTENT-RES-UX-05`: guided lifecycle is partial and not represented as the main content-admin IA.
- `CONTENT-RES-UX-06`: level coverage UI is a single numeric input instead of optional/multi-select/general material.
- `CONTENT-RES-UX-07`: visible pagination/sort/pageSize/URL-query controls are incomplete in the resource component.
- `CONTENT-RES-UX-08`: resource detail/timeline is missing.
- `CONTENT-RES-UX-09`: non-technical review UX needs preview/outline-first treatment while preserving Markdown source.
- `CONTENT-RES-UX-10`: raw chunk/embedding/storage/full-content/OCR boundaries must stay out of first-release scope.

## Files Written

- `docs/01-requirements/traceability/2026-07-02-content-resource-management-ui-ux-contract.md`
- `docs/05-execution-logs/task-plans/2026-07-02-content-resource-management-ui-ux-contract.md`
- `docs/05-execution-logs/evidence/2026-07-02-content-resource-management-ui-ux-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-content-resource-management-ui-ux-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Validation Results

### Format Write

PASS. `npm.cmd exec -- prettier --write --ignore-unknown` completed for the six package files.

### Format Check

PASS. `npm.cmd run format:check` reported all matched files use Prettier style.

### Diff Whitespace Check

PASS. `git diff --check` completed with no whitespace errors.

### Module Run v2 Pre-Commit Hardening

PASS. `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-resource-management-ui-ux-contract-2026-07-02`
reported scope, redaction, terminology, and Module Run v2 hardening checks passed for six files.

### Module Run v2 Module Closeout Readiness

PASS. `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-resource-management-ui-ux-contract-2026-07-02`
reported module-closeout readiness passed.

### Module Run v2 Pre-Push Readiness

PASS. `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-resource-management-ui-ux-contract-2026-07-02 -SkipRemoteAheadCheck`
reported pre-push readiness passed.

## Git Closeout

Pending until validation, commit, fast-forward merge, push, and branch cleanup complete.

## Non-Claims

- No source implementation is complete by this evidence.
- No runtime acceptance is claimed.
- No Provider, database, schema, migration, dependency, staging/prod, payment, Cost Calibration, release readiness,
  final Pass, or production usability is claimed.
