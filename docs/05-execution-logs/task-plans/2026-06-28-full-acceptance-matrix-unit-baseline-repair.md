# Full Acceptance Matrix + Full Unit Baseline Repair Plan

- Task id: `full-acceptance-matrix-unit-baseline-repair-requirements-2026-06-28`
- Branch: `codex/full-acceptance-matrix-unit-baseline-20260628`
- Status: in progress
- Date: `2026-06-28`

## Goal

Set the phased requirements for completing the final objective: full all-role/all-flow/all-function acceptance coverage plus a green full unit baseline.

This plan is the source of truth for this requirements-setting task only. Later implementation or runtime execution must use the queue entries created here, not chat memory.

## Required Standards Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-06-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`

## Requirement Decision Map

| Decision area                 | Active source                                                                                                                          | Decision for this task                                                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Standard MVP scope            | `docs/01-requirements/00-index.md` and `docs/01-requirements/modules/*`                                                                | Full matrix must include content, learner, authorization, AI/RAG, and admin ops loops, but this task is requirements setup only.     |
| Advanced edition role scope   | `docs/01-requirements/advanced-edition/00-index.md`                                                                                    | Advanced-only AI, organization training, organization analytics, and organization AI must be checked as role/editioned capabilities. |
| Authorization source of truth | `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md` and ADR-007                                        | `effectiveEdition` is service-computed; UI visibility is not an authorization boundary.                                              |
| Role-separated acceptance     | `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md` and `role-experience-fulfillment-matrix.md` | Acceptance must split standard/advanced personal, organization employee, organization admin, content, and ops roles.                 |
| Owner-facing gaps             | `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md` and prior redacted evidence                      | Existing gaps seed the matrix but do not close acceptance.                                                                           |

## Requirement Mapping

| Requirement source                                                                                       | Matrix or queue mapping                                                                                                                              |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standard user/auth, student, content, AI/RAG, and admin modules                                          | Role/workflow axes in `docs/01-requirements/traceability/2026-06-28-full-acceptance-matrix-unit-baseline-repair.md`.                                 |
| Advanced personal AI, organization training, organization analytics, organization AI, and ops quota docs | Advanced role rows and AI/organization workflow rows in the matrix.                                                                                  |
| Edition-aware authorization requirements                                                                 | Full unit repair and acceptance execution must preserve service-computed authorization behavior and redacted `redeem_code`/`org_auth` evidence.      |
| Role-separated traceability                                                                              | Follow-up task `full-acceptance-matrix-execution-2026-06-28` is blocked behind full unit green and must record row-level pass/fail/blocked evidence. |
| Prior unit baseline failure evidence                                                                     | Follow-up task `full-unit-baseline-repair-2026-06-28` must reproduce RED and repair until `npm run test:unit` is green.                              |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-owner-facing-local-experience-batch.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-owner-facing-local-experience-batch.md`
- `docs/05-execution-logs/acceptance/2026-06-28-owner-facing-local-experience-batch.md`

These files provide observed gaps and validation history only. They do not override `docs/01-requirements/` SSOT or ADRs.

## Conflict Check

- No conflict found between the requirements setup scope and the SSOT documents.
- The current requirements task deliberately does not execute runtime acceptance, source repair, Provider work, DB work, release readiness, or final Pass.
- Full acceptance cannot be claimed until the full unit baseline repair task is green and every matrix row has redacted pass/fail/blocked evidence.

## Current Task Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-matrix-unit-baseline-repair.md`
- `docs/05-execution-logs/task-plans/2026-06-28-full-acceptance-matrix-unit-baseline-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-matrix-unit-baseline-repair-requirements.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-full-acceptance-matrix-unit-baseline-repair-requirements.md`
- `docs/05-execution-logs/acceptance/2026-06-28-full-acceptance-matrix-unit-baseline-repair-requirements.md`

Blocked in this task:

- Source, unit test, e2e, script, package, lockfile, schema, migration, seed, and generated runtime artifact changes.
- Browser, dev server, DB, AI/Provider, Provider configuration, credential, Cost Calibration, staging/prod/deploy, payment/OCR/export/external-service, PR, force-push, release readiness, and final Pass actions.

## Boundary Rules

- `.env*` must not be read, displayed, modified, or committed.
- No credential, token, cookie, session, localStorage, Authorization header, API key, DB URL, connection string, prompt payload, raw AI input/output, raw DOM, screenshot, trace, raw DB row, internal id, plaintext contact, redeem code, complete question, answer, paper, material, resource, or chunk content may appear in evidence.
- Private local resources under `D:\tiku-local-private\acceptance` and `D:\tiku-local-private\owner-facing-fixtures\2026-06-28-rawfiles-curated` are blocked for the current task and may only be used by later tasks when those tasks explicitly allow read-only local input use.
- DB access is blocked in this task. Later DB work must be local Docker/dev only, aggregate/status only unless separately approved, and never staging/prod/cloud/customer data.
- AI/Provider calls are blocked in this task. Later AI acceptance defaults to zero Provider-call budget until a future task materializes an explicit budget.
- Local commit is approved for this requirements task. Merge, push, branch cleanup, PR, force-push, release readiness, and final Pass require fresh approval.

## Phased Execution Requirements

1. Requirements setup: write the matrix, queue entries, project state, evidence, audit, and acceptance summary.
2. Full unit baseline repair: reproduce the current `npm run test:unit` RED baseline, cluster failures, repair with TDD/systematic debugging, and reach full-unit GREEN.
3. Full acceptance matrix execution: after full unit is green, execute the redacted all-role/all-flow matrix using only materialized local runtime boundaries.
4. Gap repair batches: split any source/test repairs from acceptance execution when they exceed deterministic low-risk UI/copy/contract fixes.
5. Closeout decision: do not claim release readiness or final Pass unless a later task records fresh owner approval and all hard gates pass.

## Full Unit Baseline Repair Entry Criteria

- Requirements task closed with evidence.
- Full unit repair task claimed from `docs/04-agent-system/state/task-queue.yaml`.
- Its task plan re-materializes allowedFiles/blockedFiles and redaction rules before source/test edits.
- Initial `npm run test:unit` is captured as RED evidence.
- No dependency, schema, migration, DB, Provider, browser, or e2e work is performed in the repair task.

Known failure classes from the previous batch:

- Cookie/header baseline assertions.
- Organization authorization service validation.
- Organization analytics mapper baseline.
- Personal AI component mock export.
- Organization portal link expectation.
- Ops/content runtime expectations.

## Acceptance Matrix Entry Criteria

- `npm run test:unit` is green before acceptance runtime work starts.
- The acceptance execution task re-materializes browser/dev-server, DB, AI/Provider, credential, evidence, and closeout boundaries before runtime.
- Every matrix row records `pass`, `fail`, or `blocked` with a redacted gap id and owner-facing summary.
- Critical permission gaps must be repaired or explicitly blocked by a fresh high-risk gate.

## Validation For This Task

- `npx.cmd prettier --write --ignore-unknown <task-scoped docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <task-scoped docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-matrix-unit-baseline-repair-requirements-2026-06-28`

## Risks And Defenses

- Risk: treating matrix setup as acceptance completion. Defense: this task explicitly forbids release readiness and final Pass claims.
- Risk: Provider or DB scope drift. Defense: current task blocks all DB and AI/Provider access; future tasks must materialize exact budgets and targets.
- Risk: unit baseline repair hides product regressions by weakening tests. Defense: require RED reproduction, root-cause notes, focused GREEN, and full-unit GREEN.
- Risk: all-role wording overclaims unavailable roles/accounts. Defense: matrix rows may be `blocked` only with explicit blocker class and next approval requirement.
