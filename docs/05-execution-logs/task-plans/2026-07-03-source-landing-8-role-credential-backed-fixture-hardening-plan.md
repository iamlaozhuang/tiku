# 2026-07-03 Source Landing 8 Role Credential-Backed Fixture Hardening Plan

## Task

- Task ID: `source-landing-8-role-credential-backed-fixture-hardening-plan-2026-07-03`
- Branch: `codex/source-landing-8-role-credential-backed-fixture-hardening-plan-2026-07-03`
- Depends on: `source-landing-8-role-acceptance-coverage-review-2026-07-03`
- Goal: convert the current credential-backed versus fixture-first coverage review into an exact local fixture, account,
  data, and acceptance target plan for the next 8-role rerun.

## Read Set

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-03-source-landing-8-role-credential-backed-work-orchestration.md`
- `docs/05-execution-logs/acceptance/2026-07-03-source-landing-8-role-coverage-acceptance-checklist.md`
- `docs/05-execution-logs/evidence/2026-07-03-source-landing-8-role-local-acceptance-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-03-source-landing-8-role-local-acceptance-rerun.md`

## Scope

This task is docs/state only. It may record the already-known private fixture path as a path reference, but it must not
open, copy, summarize, normalize, or validate private account contents.

Known private account fixture path recorded by prior tasks:

- `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md`

## Output

- Credential-backed fixture target matrix.
- Next-step hardening execution standard.
- Evidence and adversarial audit.
- Updated `project-state.yaml` and `task-queue.yaml`.

## Non-Goals

- No acceptance rerun.
- No dev server or browser execution.
- No private credential file read.
- No product source, test source, fixture source, seed, script, schema, migration, dependency, env, DB, Provider,
  staging/prod, deployment, release readiness, final Pass, production usability, or Cost Calibration work.

## Validation

```powershell
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-03-source-landing-8-role-credential-backed-fixture-hardening-plan.md docs/05-execution-logs/acceptance/2026-07-03-source-landing-8-role-credential-backed-fixture-target-matrix.md docs/01-requirements/traceability/2026-07-03-source-landing-8-role-credential-backed-fixture-hardening-plan.md docs/05-execution-logs/evidence/2026-07-03-source-landing-8-role-credential-backed-fixture-hardening-plan.md docs/05-execution-logs/audits-reviews/2026-07-03-source-landing-8-role-credential-backed-fixture-hardening-plan.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId source-landing-8-role-credential-backed-fixture-hardening-plan-2026-07-03
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId source-landing-8-role-credential-backed-fixture-hardening-plan-2026-07-03 -SkipRemoteAheadCheck
```
