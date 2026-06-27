# Layer 2 Business Closure Evidence Rollup Refresh After PostgreSQL Test-Owned Target Smoke Plan

Task id: `layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke-2026-06-27`

Branch: `codex/layer-2-postgres-smoke-rollup-20260627`

Task kind: `docs_state_acceptance_rollup`

moduleRunVersion: 2

## Objective

Refresh the Layer 2 and three-layer acceptance evidence after
`content-admin-review-adoption-local-postgres-test-owned-target-setup-execution-2026-06-27` passed the local PostgreSQL
test-owned target setup plus one `rejected` route/runtime smoke.

This task records the Layer 2 status change only. It does not execute a browser, dev server, e2e, DB action, Provider
call, Cost Calibration, mutation, formal publish, student-visible runtime, staging/prod/deploy/payment external service,
OCR/export, archive/index movement, PR, force push, release readiness, or final Pass.

## Approval And Closeout Boundary

Approval source:

- current user fresh approval for this docs/state-only Layer 2 evidence rollup refresh;
- `standingDocsStateFastLaneCloseoutApproval` recorded in `project-state.yaml`;
- current user instruction that each task uses an independent short branch and, after scoped completion, performs local
  commit, ff-only merge to `master`, push `origin/master`, and cleanup.

Allowed:

- update `project-state.yaml`, `task-queue.yaml`, and this task's task plan, evidence, audit review, and acceptance
  documents;
- register and close this docs/state-only rollup task;
- provide copyable approval text for the next Layer 2 optional strengthening and Layer 3 Provider/cost/pre-release gates.

Blocked:

- `src/**`, `tests/**`, `e2e/**`, `.env*`, `package.json`, lockfiles, schema, migration, seed, scripts, archive, and
  index files;
- browser, dev-server, e2e, DB connection/read/write, credential reads, Provider calls/configuration, Cost Calibration,
  real mutation, formal publish, student-visible runtime, staging/prod/deploy/payment external-service work,
  OCR/export, PR, force push, release readiness, and final Pass.

## Documents Read

Normative sources:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

SOPs:

- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`

State and queue:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-postgres-test-owned-target-setup-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-postgres-test-owned-target-setup-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-local-postgres-test-owned-target-setup-execution.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-postgres-test-owned-target-setup-execution.md`

## Requirement Decision Map

| Requirement decision                                                                                 | Impact on this task                                                                                                         |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Content-admin AI output remains isolated until governed review/adoption                              | The rollup can count the `rejected` PostgreSQL smoke as local review-command evidence, not direct formal content readiness. |
| Formal adoption into `question` or `paper` requires review, attribution, validation, and `audit_log` | The rejected path did not create formal drafts; approved/formal draft proof remains separate if owner requires it.          |
| Direct publish and student-visible runtime remain blocked without separate approval                  | The rollup must not claim publish, student visibility, release readiness, or final Pass.                                    |
| Provider/env/cost gates require fresh approval                                                       | Layer 3 stays blocked and must be split into separate approval/execution tasks.                                             |
| Role-separated runtime pass remains separate from docs/source contract and local command evidence    | Layer 1 remains a no-regression status only; no new browser role-matrix evidence is created.                                |
| Docs-only evidence rollups may refresh state but do not create runtime behavior                      | This task consumes evidence and updates state only.                                                                         |

## Requirement Mapping

The rollup maps to the formal content separation requirement:

- AI generated content must remain in an isolated review surface before formal adoption.
- A content admin may reject or adopt only through governed review semantics.
- The latest local PostgreSQL smoke proved one synthetic test-owned `rejected` command and readback without formal draft
  creation.
- The evidence does not prove Provider execution, approved/formal draft creation, browser observation, formal publish,
  or student-visible runtime.

## Conflict Check

No conflict was found between SSOT and latest evidence:

- Requirement SSOT permits governed adoption/rejection but blocks direct formal writes and publish.
- The latest evidence proves only one local PostgreSQL-backed synthetic test-owned `rejected` route/runtime command.
- ADR-006 keeps installed AI SDK packages as dependency availability only, not Provider approval.
- ADR-004 and ADR-005 keep staging/prod/deploy boundaries separate.

The remaining decision is owner-facing: whether the current rejected PostgreSQL proof is enough for the Layer 2 minimum
local business-closure slice, or whether an optional `approved` formal draft smoke and/or credentialed browser smoke is
required before moving to Layer 3. This task records that as an approval boundary, not as execution authorization.

## Documentation Approach

1. Register this docs/state-only task in `task-queue.yaml`.
2. Update `project-state.yaml` current task and next recommended task.
3. Write acceptance, evidence, and audit review documents.
4. Record Layer 2 as locally rolled up for the rejected PostgreSQL path while keeping approved/formal draft, browser,
   publish, and Layer 3 gates separate.
5. Provide copyable next approval text without executing blocked actions.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke.md docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke.md docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke.md docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke.md docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke-2026-06-27 -SkipRemoteAheadCheck`

No lint, typecheck, browser, dev-server, e2e, DB, Provider, or Cost Calibration command is needed because this task does
not change source, tests, runtime, schema, or environment files.

## Stop Conditions

- Any next step requires `.env*`, credential, DB, Provider, browser/e2e, formal publish, staging/prod, payment,
  external-service, OCR/export, PR, force push, release readiness, or final Pass.
- Changed files exceed this task's docs/state allowed files.
- Evidence would need to record raw generated content, Provider payload, DB rows, secrets, tokens, Authorization
  headers, localStorage/cookie values, full `paper`/`material`, private answer text, or plaintext `redeem_code`.
- Required docs/state validation or mechanism readiness fails and cannot be repaired within this docs/state-only scope.
