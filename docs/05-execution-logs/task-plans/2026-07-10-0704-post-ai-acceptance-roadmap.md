# 2026-07-10 0704 Post-AI Acceptance Roadmap Task Plan

## Objective

Materialize the owner-approved post-AI acceptance roadmap before executing the next validation stages.

## Read Gates Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`

## Scope

- Create a roadmap that defines the six next acceptance stages, sequence, evidence rules, stop conditions, and exit
  criteria.
- Seed the six stages in `task-queue.yaml` as pending roadmap tasks.
- Update state and coverage ledger with the roadmap pointer.

## Boundaries

- No source, test, package, lockfile, schema, migration, seed, Provider, browser, raw DOM, screenshot, direct DB,
  destructive DB, staging, prod, deploy, env, secret, payment, or Cost Calibration work.
- No credential value, password, cookie, token, session, localStorage, Authorization header, env value, DB URL, DB row,
  internal numeric id, Provider payload, raw prompt, raw AI output, full question, full paper, material, resource, chunk,
  employee raw answer, or plaintext `redeem_code` in evidence.

## Implementation Steps

1. Create `2026-07-10-0704-post-ai-acceptance-roadmap.md` under acceptance logs.
2. Add task plan, evidence, and adversarial audit files.
3. Update `project-state.yaml` and `task-queue.yaml` with the roadmap task and six pending stages.
4. Update the existing 0704 coverage ledger to reference the roadmap.
5. Run scoped Prettier, `git diff --check`, blocked-path guard, lint, typecheck, and Module Run v2 gates.

## Validation Commands

- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <roadmap files>`
- `git diff --check`
- blocked-path diff guard for source/test/package/schema/runtime paths
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-post-ai-acceptance-roadmap-2026-07-10`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-post-ai-acceptance-roadmap-2026-07-10 -SkipRemoteAheadCheck`

## Adversarial Checks

- Does any stage reopen already closed 0704 AI full-chain evidence without new risk?
- Does any stage mix validation and repair in one branch?
- Does any evidence rule allow credentials, raw content, raw DB rows, Provider payloads, raw prompts, or raw AI output?
- Does any stage require Provider, DB write, screenshot/raw DOM, staging/prod, deployment, or Cost Calibration without
  fresh approval?
- Are standard/advanced, organization/employee, admin/learner, and content/operations boundaries explicit?
