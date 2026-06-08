# Module Run v2 Local Experience Closure Alignment Task Plan

## Task

- Task id: `module-run-v2-local-experience-closure-alignment`
- Task kind: `governance_alignment`
- Branch: `codex/module-run-v2-local-experience-closure-alignment`
- Goal: align Module Run v2 domain partitioning, task queue handoff, and automation startup state with the target of a
  locally runnable, locally verifiable advanced-edition experience loop.

## Scope

Allowed:

- Update Module Run v2 matrix with `localExperienceClosureGate`.
- Update project state and task queue so automation can resume from one durable source of truth.
- Tighten the pending `ai-task-and-provider` planning task so it must plan toward local experience closure.
- Seed a follow-up local experience acceptance planning task without starting implementation.
- Write plan, evidence, and audit review for this governance alignment task.

Blocked:

- Product implementation or source changes under `src/**`.
- Script or hook changes.
- Provider call or provider configuration.
- Env/secret reading or changes.
- Staging/prod/cloud/deploy, payment, external-service work.
- Dependency, package, lockfile, schema, migration, `src/db/schema/**`, `drizzle/**`, tests, and `e2e/**`.
- Cost Calibration Gate execution.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Advanced-edition requirements index and implementation handoff plans
- Latest Module Run v2 automation hardening evidence and audit review

## Batch Plan

### Batch 1: State And Queue Alignment

- RED: project state still points at the completed autopilot hardening task and stale repository SHA.
- GREEN: current task is registered as in progress, repository SHA matches Git reality, and automation handoff points to
  the local experience closure alignment work.
- localFullLoopGate: L1.

### Batch 2: Domain Matrix Closure Gate

- RED: execution modules can progress as isolated service contracts without naming a user-visible local experience chain.
- GREEN: matrix contains `localExperienceClosureGate`, experience chains, promotion rules, automation startup requirement,
  and contribution notes for each execution module.
- localFullLoopGate: L1.

### Batch 3: Automation-Ready Follow-Up Queue

- RED: the next pending `ai-task-and-provider` task is proposal-only but does not require local experience closure
  analysis.
- GREEN: the next pending task must reference `localExperienceClosureGate`, and a follow-up local acceptance planning task
  is seeded for API/UI/e2e bridge planning without approving implementation.
- localFullLoopGate: L1.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-work -TaskId module-run-v2-local-experience-closure-alignment`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit -TaskId module-run-v2-local-experience-closure-alignment -PlannedFiles docs/04-agent-system/state/project-state.yaml,docs/04-agent-system/state/task-queue.yaml,docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml,docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-local-experience-closure-alignment.md,docs/05-execution-logs/evidence/2026-06-08-module-run-v2-local-experience-closure-alignment.md,docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-local-experience-closure-alignment.md,docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-ai-task-and-provider-planning.md,docs/05-execution-logs/evidence/2026-06-08-module-run-v2-ai-task-and-provider-planning.md,docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-ai-task-and-provider-planning.md,docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-local-experience-acceptance-planning.md,docs/05-execution-logs/evidence/2026-06-08-module-run-v2-local-experience-acceptance-planning.md,docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-local-experience-acceptance-planning.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --write --ignore-unknown ...changed files...`
- `node .\node_modules\prettier\bin\prettier.cjs --check --ignore-unknown ...changed files...`
- required anchor check for `localExperienceClosureGate`, `module-run-v2-ai-task-and-provider-planning`,
  `module-run-v2-local-experience-acceptance-planning`, `localFullLoopGate`, and
  `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-local-experience-closure-alignment`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop immediately if this alignment would require product code, tests/e2e implementation, provider/env/secret/deploy,
payment, external-service, dependency, schema/migration, script/hook changes, or Cost Calibration Gate execution.
