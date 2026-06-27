# Layer 2 Business Closure Evidence Rollup Refresh After Local Route Smoke Plan

Task id: `layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke-2026-06-27`

Branch: `codex/layer-2-route-smoke-rollup-20260627`

Task kind: `docs_state_acceptance_rollup`

moduleRunVersion: 2

## Objective

Refresh the three-layer acceptance and Layer 2 business-closure evidence after
`content-admin-review-adoption-local-route-smoke-execution-2026-06-27` passed the focused `rejected` route-handler
runtime smoke with an injected local repository.

This task must preserve the important residual boundary: the prior route smoke does not prove default PostgreSQL
runtime read/write, credentialed browser observation, Provider readiness, Cost Calibration readiness, formal publish,
student-visible runtime, staging/prod, payment, OCR, export, release readiness, or final Pass.

## Approval And Closeout Boundary

Approval source:

- `standingDocsStateFastLaneCloseoutApproval` recorded in `project-state.yaml`.
- Current user instruction that every task must use an independent branch and, after scoped completion, perform local
  commit, ff-only merge to `master`, push `origin/master`, and cleanup.

Allowed:

- Update `project-state.yaml`, `task-queue.yaml`, and this task's task plan, evidence, audit review, and acceptance
  documents.
- Register and close this docs/state-only rollup task.
- Provide copyable approval text for the next high-risk steps.

Blocked:

- `src/**`, `tests/**`, `e2e/**`, `.env*`, `package.json`, lockfiles, schema, migration, seed, and scripts.
- Browser, dev-server, e2e, DB connection/read/write, credential read, Provider call/configuration, Cost Calibration,
  real mutation, formal publish, student-visible runtime, staging/prod/deploy/payment/external-service, OCR/export,
  archive/index movement, PR, force push, release readiness, and final Pass.

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
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`

State and queue:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md`

## Requirement Decision Map

| Requirement decision                                                                                           | Impact on this task                                                                     |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Content-admin AI output remains isolated until governed review/adoption                                        | The rollup must not claim formal content writes or direct publish from the route smoke. |
| Content-admin adoption into `question`/`paper` requires human review, attribution, validation, and `audit_log` | The rollup can count command/route evidence only as partial Layer 2 progress.           |
| Direct publish and student-visible runtime remain blocked without separate approval                            | The rollup must keep those gates outside the minimum route smoke closure.               |
| Provider/env/cost gates require fresh approval                                                                 | Layer 3 remains blocked.                                                                |
| Role-separated runtime pass remains separate from docs/source contract coverage                                | Layer 1 is preserved as no-regression only; no new browser role-matrix claim is made.   |

## Conflict Check

The requirement sources and latest execution evidence agree:

- Formal content separation requires isolated review/adoption before formal writes.
- The route smoke execution proved only one `rejected` route-handler path with an injected repository.
- The default PostgreSQL path remains blocked because it would load `.env.local` for `DATABASE_URL`.
- No source of truth supports release readiness or final Pass.

No conflict was found. The only ambiguity is product/owner choice: whether Layer 2 minimum closure accepts the injected
route smoke as sufficient local route evidence, or whether the next step must be a real local PostgreSQL-backed route
smoke and/or credentialed browser observation. This task records that as an approval decision, not as a conclusion.

## Documentation Approach

1. Register this docs/state-only task in `task-queue.yaml` with concrete allowed and blocked files.
2. Update `project-state.yaml` current task to this rollup and set `nextRecommendedTask` to the next approval-required
   boundary.
3. Write acceptance, evidence, and audit review documents.
4. Keep Layer 2 status precise: stronger partial closure, not full business closure.
5. Provide copyable next approval text for local PostgreSQL-backed route smoke, credentialed browser smoke, and Layer 3
   Provider/cost/staging refresh.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke.md docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke.md docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke.md docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke.md docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke-2026-06-27 -SkipRemoteAheadCheck`

No lint, typecheck, browser, dev-server, e2e, DB, Provider, or Cost Calibration command is needed because this task
does not change source, tests, runtime, schema, or environment files.

## Stop Conditions

- Any next step requires `.env*`, credential, DB, Provider, browser/e2e, formal publish, staging/prod, payment,
  external-service, OCR/export, PR, force push, release readiness, or final Pass.
- Changed files exceed this task's docs/state allowed files.
- Evidence would need to record raw generated content, Provider payload, DB rows, secrets, tokens, Authorization
  headers, localStorage/cookie values, full `paper`/`material`, private answer text, or plaintext `redeem_code`.
- Required docs/state validation or mechanism readiness fails and cannot be repaired within this docs/state-only scope.
