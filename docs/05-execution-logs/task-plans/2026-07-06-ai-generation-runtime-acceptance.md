# 2026-07-06 AI Generation Runtime Acceptance Plan

## Task

- Task id: `ai-generation-runtime-acceptance-2026-07-06`
- Branch: `codex/ai-generation-runtime-acceptance-2026-07-06`
- Base: `master` at `8b9e72d265e82c417212b028e6b7234b9b36a618`
- Goal: verify the 0704 local DB, current code, browser runtime, and small Provider path can close the AI出题 / AI组卷 loops without reopening closed source/unit work.

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
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-05-ai-generation-learning-session-loop.md`
- `docs/05-execution-logs/evidence/2026-07-05-content-ai-formal-draft-adoption-ui-loop.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-05-stage-c-1-provider-freshness-bounded-smoke-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-05-stage-c-1-provider-freshness-env-local-single-key-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-05-stage-c-5-provider-cost-staging-residual-risk-closeout.md`
- `docs/05-execution-logs/evidence/2026-07-06-learner-ai-training-db-repository-loop.md`
- `docs/05-execution-logs/evidence/2026-07-06-learner-ai-training-api-ui-loop.md`
- `docs/05-execution-logs/evidence/2026-07-06-organization-ai-training-closed-loop.md`
- `docs/05-execution-logs/evidence/2026-07-06-organization-training-admin-ui-loop.md`
- `docs/05-execution-logs/evidence/2026-07-06-content-admin-history-adoption-loop.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `package.json`
- `playwright.config.ts`
- `e2e/` and existing runtime helpers as read-only references only.

## Scope

- Read-only/runtime actions first: worktree check, 0704 DB schema precheck, localhost service run, browser role matrix, Provider-disabled flow, Provider-enabled small sample when local secret boundary is available.
- Evidence/status docs only unless a current runtime failure proves a code bug.
- If a code bug is proven, stop this docs/runtime task and create a separate fix branch with its own plan, evidence, and validation.

## Boundaries

- Allowed files for this task: project state, task queue, this plan, the runtime evidence file, and the audit review file.
- No source, test, package, lockfile, schema, migration, seed, e2e, generated report, or environment file changes.
- DB usage is limited to the local 0704 acceptance target. Only schema existence and selector-scoped aggregate status may be recorded.
- If precheck proves the 0704 target is missing current master's reviewed closed-loop schema, the only allowed DB write is exact execution of `drizzle/20260706031000_add_personal_ai_learning_session.sql` and `drizzle/20260706052000_add_organization_ai_training_closed_loop.sql` against that target. No migration file changes, broad migration runner, reset, cleanup, or data repair is allowed.
- No destructive DB operation: no drop, truncate, reset, broad delete, broad update, or cleanup.
- Browser evidence records only route/workflow labels, role labels, business status, and aggregate pass/fail/block summaries.
- Provider evidence records only public provider/model labels, request count, duration/token summaries, status labels, and failure category.
- Do not record credentials, sessions, cookies, tokens, env values, connection strings, raw DB rows, internal ids, raw Provider payload, raw Prompt, raw AI output, screenshots, raw DOM, traces, complete question, complete paper, material content, private fixture values, or plaintext card values.

## Acceptance Mapping Result

| Requirement                                          | Runtime acceptance target                                                                                                                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Standard roles denied or unavailable for advanced AI | Role matrix confirms `personal_standard_student`, `org_standard_employee`, and `org_standard_admin` cannot use advanced AI flows.                                                                      |
| Advanced learner AI training loop                    | Generated result creates a persisted learning session, accepts answers, and exposes progress/feedback/statistics.                                                                                      |
| Organization AI training loop                        | Generated result can become organization training draft, publish to employee path, accept answer, and contribute aggregate organization training statistics.                                           |
| Content-admin formal separation                      | AI result or history can be adopted into a formal draft/review path without direct publish.                                                                                                            |
| Provider small sample                                | If available, grounding is sufficient, structured preview parses, requested AI出题 count is met, AI组卷 count is recognizable, and raw output stays out of evidence.                                   |
| Non-claims                                           | Source/unit pass, DB-backed runtime pass, browser pass, Provider sample pass are reported separately; no release readiness, final Pass, production usability, staging/prod, or Cost Calibration claim. |

## Role Mapping Result

| Role-separated row          | Runtime mapping                                                                                          |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | Current 0704 private fixture input missing; row remains a fixture gap, no runtime pass claim.            |
| `personal_advanced_student` | Browser entry visible; learner Provider and learning-session closed loop passed.                         |
| `org_standard_employee`     | UI unavailable and backend direct personal AI generation denied with `403057` after separate fix commit. |
| `org_advanced_employee`     | Browser entry visible; Provider generation and organization training answer loop passed.                 |
| `org_standard_admin`        | Browser/runtime organization advanced AI unavailable.                                                    |
| `org_advanced_admin`        | Browser entry visible; organization AI generation, draft, publish, and analytics loop passed.            |
| `content_admin`             | Browser entry visible; content AI generation formal approve/reject loop passed.                          |
| `ops_admin`                 | Out of scope for this AI generation runtime task; no new claim.                                          |

## Execution Steps

1. Confirm branch, clean working tree baseline, and current master SHA.
2. Locate the safe local 0704 DB runtime source without printing connection values.
3. Run a redacted DB schema precheck for required tables and columns.
4. If the exact reviewed migration pair is missing and the target label matches 0704, execute only those reviewed migration files and rerun the schema precheck.
5. Start or reuse localhost service with the 0704 DB target.
6. Run browser role matrix for the seven requested roles without screenshots, traces, DOM dumps, cookies, or sessions.
7. Run Provider-disabled checks for clear business error codes and visible UI copy.
8. Run Provider-enabled small sample only if the local Provider boundary is available; otherwise record a redacted blocked reason.
9. Verify the three closed-loop paths through product routes or existing runtime helpers.
10. Write redacted evidence and audit review.
11. Run typecheck, lint, scoped Prettier check, diff check, and Module Run v2 gates.

## Adversarial Checks

- Treat UI visibility as insufficient; require backend denial or allowed response status.
- Treat successful generation as insufficient; require the next business action in the appropriate domain.
- Treat Provider text as unsafe; only structured/count/status summaries may enter evidence.
- Treat DB access as risky; record only schema/column presence and aggregate state.
- Treat old closed source tasks as closed unless current runtime evidence reproduces a current blocker.
- Stop on any redaction risk, missing local target, missing role credential boundary, unavailable Provider secret, insufficient RAG data, Provider balance/network block, or requirement ambiguity.

## Validation Commands

- `git status --short --branch`
- Redacted 0704 DB schema precheck command.
- Exact reviewed migration execution for the two 0706 closed-loop migrations only if precheck requires it.
- Localhost browser role matrix runtime walkthrough.
- Provider-disabled runtime walkthrough.
- Provider-enabled small-sample runtime walkthrough when allowed by local boundary.
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-generation-runtime-acceptance.md docs/05-execution-logs/evidence/2026-07-06-ai-generation-runtime-acceptance.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-runtime-acceptance.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-runtime-acceptance-2026-07-06`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-runtime-acceptance-2026-07-06 -SkipRemoteAheadCheck`

## Runtime Result

- 0704 DB precheck initially found the reviewed learner and organization closed-loop schema pair missing; only the two reviewed non-destructive local migration files were executed, then precheck passed.
- Browser role matrix passed for six role labels; `personal_standard_student` remains blocked by missing current 0704 private fixture input, so no pass claim is made for that role.
- Provider-disabled path produced clear local business status and standard employee backend denial after the separate fix commit.
- Provider-enabled small samples passed for personal, organization, and content AI出题 / AI组卷.
- Closed-loop runtime passed for learner AI training, organization AI training/statistics, and content admin formal approve/reject separation.
- Separate code fix commit: `edd48ccfb fix(ai-generation): enforce personal generation authorization gate`.
- Release readiness, production usability, final Pass, staging/prod health, and Cost Calibration remain explicitly unclaimed.
