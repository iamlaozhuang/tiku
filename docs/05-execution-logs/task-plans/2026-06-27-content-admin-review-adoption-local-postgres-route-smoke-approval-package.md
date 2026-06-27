# Content Admin Review Adoption Local PostgreSQL Route Smoke Approval Package Plan

Task id: `content-admin-review-adoption-local-postgres-route-smoke-approval-package-2026-06-27`

Branch: `codex/content-admin-postgres-smoke-approval-20260627`

Task kind: `docs_state_approval_package`

moduleRunVersion: 2

## Objective

Prepare a docs/state-only approval package for the next Layer 2 local PostgreSQL-backed route/service smoke of the
content-admin generated-result review adoption path.

This task does not execute the smoke. It only defines the future execution boundary for test data, secret-safe local DB
handling, single mutation/readback cap, rollback/recovery, redaction, and copyable approval text.

## Approval And Closeout Boundary

Approval source:

- `standingDocsStateFastLaneCloseoutApproval` recorded in `project-state.yaml`.
- Current goal continuation and the user's independent-branch closeout instruction.
- The latest Layer 2 route-smoke rollup states this exact package can run without fresh high-risk execution approval
  because it is docs/state-only.

Allowed:

- Update `project-state.yaml`, `task-queue.yaml`, and this task's task plan, evidence, audit review, and acceptance
  documents.
- Register and close this approval-package task.
- Provide copyable fresh approval text for future local PostgreSQL-backed execution.

Blocked:

- `src/**`, `tests/**`, `e2e/**`, `.env*`, `package.json`, lockfiles, schema, migration, seed, and scripts.
- Browser, dev-server, e2e, DB connection/read/write, manual or printed credential read, Provider call/configuration,
  Cost Calibration, real mutation, formal publish, student-visible runtime, staging/prod/deploy/payment/external-service,
  OCR/export, archive/index movement, PR, force push, release readiness, and final Pass.

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
- `docs/04-agent-system/sop/standing-autonomy-policy-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
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

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-route-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-route-smoke-execution.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke.md`

## Requirement Decision Map

| Requirement decision                                                                                    | Impact on this package                                                                                                  |
| ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Content-admin generated output is isolated before governed review/adoption                              | The future smoke must prove only the review decision path; it must not publish content.                                 |
| Formal adoption into `question` or `paper` needs human review, validation, attribution, and `audit_log` | If a future `approved` smoke is selected, its approval must explicitly name formal draft metadata and cleanup/recovery. |
| Rejection and adoption require redacted audit attribution                                               | Future evidence may record only status categories and redacted audit/action summaries.                                  |
| Provider/env/cost gates require fresh approval                                                          | This package cannot run Provider or Cost Calibration and cannot infer Layer 3 readiness.                                |
| Local DB validation is useful but must not expose secrets or DB rows                                    | Future execution must use secret-safe local dev DB handling and redacted metadata only.                                 |

## Conflict Check

No conflict was found:

- Latest evidence proves route-handler runtime behavior with an injected repository only.
- Latest rollup names true local PostgreSQL-backed route smoke as the next docs-only package and execution boundary.
- ADR-004 allows local `dev` validation in principle but keeps `.env.local` as non-committed secret material.
- The fresh local DB playbook says `.env.local` handling and DB access require explicit future approval and redacted
  evidence.

This task therefore prepares the approval package but does not execute DB access.

## Documentation Approach

1. Register this docs/state-only approval package in `task-queue.yaml`.
2. Update `project-state.yaml` current task and next recommended task.
3. Write acceptance, evidence, and audit review.
4. Split future execution choices:
   - Option A: `rejected` local PostgreSQL-backed smoke, lower blast radius, no formal draft creation expected.
   - Option B: `approved` local PostgreSQL-backed smoke, higher risk, may create formal draft metadata and needs a
     stronger cleanup/recovery plan.
5. Preserve all high-risk blocks and provide copyable approval text for the owner.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-local-postgres-route-smoke-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-adoption-local-postgres-route-smoke-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-admin-review-adoption-local-postgres-route-smoke-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-adoption-local-postgres-route-smoke-approval-package-2026-06-27 -SkipRemoteAheadCheck`

No lint, typecheck, browser, dev-server, e2e, DB, Provider, or Cost Calibration command is needed because this task
does not change source, tests, runtime, schema, or environment files.

## Stop Conditions

- Any step requires `.env*`, credential, DB, Provider, browser/e2e, formal publish, staging/prod, payment,
  external-service, OCR/export, PR, force push, release readiness, or final Pass.
- Changed files exceed this task's docs/state allowed files.
- Evidence would need to record raw generated content, Provider payload, DB rows, secrets, tokens, Authorization
  headers, localStorage/cookie values, full `paper`/`material`, private answer text, or plaintext `redeem_code`.
- Required docs/state validation or mechanism readiness fails and cannot be repaired within this docs/state-only scope.
