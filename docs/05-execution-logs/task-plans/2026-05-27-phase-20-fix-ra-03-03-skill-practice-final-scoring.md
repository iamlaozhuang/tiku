# Phase 20 Fix RA-03-03 Skill Practice Final Scoring Plan

**Task id:** `phase-20-fix-ra-03-03-skill-practice-final-scoring`

**Branch:** `codex/phase-20-fix-ra-03-03-skill-practice-final-scoring`

## Recovery and Required Reading

- Read `docs/03-standards/code-taste-ten-commandments.md` and ADR/interface/SOP/state documents during the repository recovery pass before continuing Phase 20 queue work.
- Re-read RA-03 finding `F-RA-03-03-001` in `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-03-student-experience.md`.
- Re-read Phase 21 implementation breakdown guidance for Phase 22-D student and AI runtime tasks.
- Ran `Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-03-03-skill-practice-final-scoring`; claim readiness passed on the short-lived branch.

## Scope

- Add final local deterministic AI scoring for subjective `skill` practice after retry or direct scoring request.
- Preserve the existing first-submission hint and one-retry budget.
- Keep scoring local/mock only; do not call real provider, staging/prod/cloud, or external services.
- Do not change dependencies, env files, schema, drizzle migrations, auth permission model, or deployment configuration.

## TDD Plan

1. RED service test: subjective practice second submission should return a scored feedback row with non-null `score`, `aiHintStatus = null`, and no remaining retry.
2. RED service test: direct scoring request for an existing submitted subjective answer should update/return final scoring without creating another answer record.
3. RED UI test: subjective practice feedback with final scoring should render the final score and make the direct scoring button actionable in runtime mode.
4. GREEN implementation: add minimal validator/service/repository/UI changes to satisfy the tests using local deterministic scoring.
5. Verify focused tests, full unit, e2e, build, readiness, Git completion inventory, diff, changed-file Prettier, naming, and quality gate.

## Risk Controls

- `ai_runtime`: use deterministic local scoring based on answer completeness and scoring point/max score data already present in the paper snapshot.
- `local_human_verification`: record command outputs in evidence before closeout.
- `evidence_integrity`: keep state/evidence updates scoped to this task.
- High-risk gates not approved: no `database_migration`, `auth_permission_model`, `secret_or_env_change`, `external_service_config`, `dependency_change`, deploy/cloud, or destructive data operation.

## 2026-05-28 Recovery Decision

- Recovery found the implementation and closeout commits already in current `master`, but `task-queue.yaml` still marked the task as `pending`.
- This resumed pass is limited to state/evidence reconciliation: mark the task `closed`, update `project-state.yaml`, and record the Git-history proof in evidence.
- No additional business code, tests, schema, dependency, env, provider, cloud, deploy, or destructive data changes are planned for this recovery pass.
