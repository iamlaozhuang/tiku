# Layer 3 Cost Calibration Redacted Rollup Task Plan

Task id: `layer-3-cost-calibration-redacted-rollup-2026-06-27`

Branch: `codex/cost-calibration-rollup-20260627`

Task kind: `docs_state_rollup`

## Approval Boundary

This docs/state-only rollup consumes the current user's 2026-06-27 unattended serial high-risk package approval for
`layer-3-cost-calibration-redacted-rollup-2026-06-27`.

It may update only project state, task queue, task plan, evidence, audit review, and acceptance documents. It may seed the
next approved docs/state-only staging/prod/deploy pre-release approval package task.

It must not call Providers, open `.env*`, read credentials, execute Cost Calibration, connect to DB, run browser,
dev-server, or e2e, mutate runtime data, modify source/tests/scripts/package/lockfiles/schema/migration/seed, deploy,
touch payment/external-service, execute OCR/export, move archive/index entries, create PRs, force push, or claim release
readiness/final Pass.

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
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-cost-calibration-redacted-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-cost-calibration-redacted-execution.md`

## Requirement Decision Map

- Layer 1 remains complete by prior role/entry/permission evidence and is not revalidated here.
- Layer 2 remains at the local PostgreSQL test-owned `rejected` route/runtime smoke minimum.
- Layer 3 Provider smoke passed for `openai_compatible` / `alibaba-qwen` / `qwen3.7-max`.
- Layer 3 Cost Calibration has a minimum local single-sample estimate from the latest execution evidence.
- Staging/pre-release, prod/deploy, payment/external-service, OCR/export, archive/index movement, release readiness, and
  final Pass remain blocked until their own task evidence exists.

## Evidence-Only Sources

The Cost Calibration execution evidence is consumed as historical proof. This rollup does not rerun the Provider or Cost
Calibration command.

## Conflict Check

No conflict found between the cost execution evidence, queue closeout policy, and the user-approved serial task list.
Project status after the execution task shows no pending task, so this rollup will materialize itself and the next
approved staging/pre-release approval-package task in `task-queue.yaml`.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-layer-3-cost-calibration-redacted-rollup.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-cost-calibration-redacted-rollup.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-cost-calibration-redacted-rollup.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-cost-calibration-redacted-rollup.md`

## Approach

1. Register this rollup task with explicit allowed files, blocked files, validation commands, and closeout policy.
2. Record Layer 3 Cost Calibration status as `pass_minimum_local_single_sample`.
3. Record remaining blocked gates and the next approved task:
   `layer-3-staging-prod-deploy-pre-release-approval-package-2026-06-27`.
4. Write redacted rollup evidence, audit review, and acceptance.
5. Run scoped formatting, diff check, project status, precommit hardening, module closeout readiness, and pre-push
   readiness.
6. Commit, ff-only merge to `master`, run master gates, push `origin/master`, and delete the merged short branch.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-cost-calibration-redacted-rollup.md docs/05-execution-logs/evidence/2026-06-27-layer-3-cost-calibration-redacted-rollup.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-cost-calibration-redacted-rollup.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-cost-calibration-redacted-rollup.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-cost-calibration-redacted-rollup.md docs/05-execution-logs/evidence/2026-06-27-layer-3-cost-calibration-redacted-rollup.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-cost-calibration-redacted-rollup.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-cost-calibration-redacted-rollup.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-cost-calibration-redacted-rollup-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-cost-calibration-redacted-rollup-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-cost-calibration-redacted-rollup-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

Stop if any update would require Provider/Cost execution, env/credential access, DB/browser/e2e, source/test/package
changes, staging/prod/deploy execution, payment/external-service/OCR/export execution, archive/index movement, PR, force
push, release readiness, final Pass, unapproved files, or sensitive/raw evidence.
