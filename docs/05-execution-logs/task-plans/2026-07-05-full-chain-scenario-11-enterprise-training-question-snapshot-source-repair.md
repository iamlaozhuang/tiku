# 2026-07-05 Full-chain Scenario 11 Enterprise Training Question Snapshot Source Repair Plan

## Task

- Task id: `full-chain-scenario-11-enterprise-training-question-snapshot-source-repair-2026-07-05`
- Branch: `codex/full-chain-scenario-11-enterprise-training-question-snapshot-source-repair-2026-07-05`
- Scope: repair the S11 employee enterprise-training visible-list/detail DTO path so paper-source published trainings expose answerable question snapshots to the employee surface.
- Boundary: source/test/docs/state only. No browser/runtime, DB writes, schema/migration/seed, dependency, Provider, staging/prod, Cost Calibration, release readiness, final Pass, or production usability claim.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/001-ui-architecture-boundary.md`
- `docs/02-architecture/adr/002-api-response-and-error-contract.md`
- `docs/02-architecture/adr/003-auth-permission-model.md`
- `docs/02-architecture/adr/004-ai-generation-boundary-and-provider-contract.md`
- `docs/02-architecture/adr/005-db-local-and-ci-strategy.md`
- `docs/02-architecture/adr/006-material-ingestion-and-processing.md`
- `docs/02-architecture/adr/007-advanced-edition-authorization-architecture.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-07-03-source-landing-16-package-acceptance-materials-pack.md`
- `docs/05-execution-logs/acceptance/2026-07-03-source-landing-16-package-role-acceptance-matrix.md`
- `docs/05-execution-logs/task-plans/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-preflight.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-preflight.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-preflight.md`
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/validators/organization-training.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/mappers/organization-training-mapper.ts`
- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/db/schema/organization-training.ts`
- `src/db/schema/paper.ts`
- `tests/unit/organization-training-employee-entry-surface.test.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/repositories/organization-training-repository.test.ts`
- `src/server/services/organization-training-route.test.ts`

## Diagnosis

S11 preflight proved the `marketing:3` enterprise training baseline exists and advertises a non-zero question count, but the employee visible-list/detail DTO returned zero `questions`. The employee UI already renders real question controls when `version.questions` is present; the missing path is the server-side DTO population for published paper-source training.

The minimal repair is to attach question snapshots from the already published source paper to `OrganizationTrainingPublishedVersionDto.questions` for paper-source trainings. This avoids duplicate provisioning and avoids schema changes. It does not close the broader durable training-question snapshot or per-question answer-storage gap recorded in earlier acceptance materials.

## Implementation Plan

1. Add a failing repository unit test proving employee visible training versions include paper-source question snapshots without exposing internal ids.
2. Implement a repository gateway query that joins training source context to the published source paper and paper question snapshots by public selectors only.
3. Map paper question snapshots into `OrganizationTrainingQuestionSnapshotDto` with conservative field extraction and no raw DB row exposure.
4. Re-run scoped unit tests, then repository/service/route/UI boundary tests as needed.
5. Update evidence/audit/state/queue after final validation.

## Stop Rules

- Stop and split if a schema, migration, seed, dependency, DB write, Provider call, staging/prod access, Cost Calibration, or product decision is required.
- Stop and split if the available source data cannot safely provide answerable paper-source question snapshots.
- Stop on any redaction risk involving credentials, tokens, sessions, cookies, connection strings, raw DB rows, internal ids, DOM, screenshots, traces, Provider payloads, raw prompts, raw AI I/O, or full question/paper/material content.

## Validation Commands

- `npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts`
- `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts tests/unit/organization-training-employee-entry-surface.test.ts`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-05-full-chain-scenario-11-enterprise-training-question-snapshot-source-repair.md docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-enterprise-training-question-snapshot-source-repair.md docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-enterprise-training-question-snapshot-source-repair.md src/server/repositories/organization-training-repository.ts src/server/repositories/organization-training-repository.test.ts`
- `git diff --check`
- blocked path diff against task boundary
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-11-enterprise-training-question-snapshot-source-repair-2026-07-05`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-scenario-11-enterprise-training-question-snapshot-source-repair-2026-07-05 -SkipRemoteAheadCheck`
