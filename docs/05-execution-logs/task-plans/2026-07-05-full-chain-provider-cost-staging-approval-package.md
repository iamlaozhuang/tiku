# 2026-07-05 Full-chain Provider Cost Staging Approval Package Plan

Task id: `full-chain-provider-cost-staging-approval-package-2026-07-05`

Status: closed, docs-only closeout gates passed.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-05-full-chain-post-acceptance-queue-cleanup.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-post-acceptance-queue-cleanup.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-post-acceptance-queue-cleanup.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-provider-staging-cost-calibration-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-1-read-only-provider-target-inventory.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-read-only-provider-target-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-stage-c-1-read-only-provider-target-inventory.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-1-provider-smoke.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-provider-smoke.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-stage-c-1-provider-smoke.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-1-secret-availability-decision.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-secret-availability-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-stage-c-1-secret-availability-decision.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-1-provider-smoke-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-provider-smoke-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-stage-c-1-provider-smoke-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-02-phase4-requirements-agent-baseline-alignment.md`

## Scope

This task prepares a single docs-only decision package for the residual Provider, Cost Calibration, and staging gates
after local S1-S12 acceptance and queue cleanup.

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-05-full-chain-provider-cost-staging-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-07-05-full-chain-provider-cost-staging-approval-package.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-provider-cost-staging-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-provider-cost-staging-approval-package.md`

Blocked actions:

- no Provider call;
- no Cost Calibration run;
- no staging/prod/cloud/deploy action;
- no `.env*` read/write and no secret access;
- no DB connection, read, write, schema, migration, seed, or destructive operation;
- no browser, dev server, e2e, screenshot, trace, or raw DOM capture;
- no source, test, dependency, package, lockfile, script, or runtime config change;
- no release readiness, final Pass, production usability, Provider readiness, staging readiness, or production claim.

## First-principles Assessment

Local full-chain acceptance proves the local product flow against the isolated DB target. It does not prove external
Provider behavior, cost economics, staging isolation, production safety, or release readiness.

The prior Stage C-1 evidence proves only a single approved local Provider smoke target under a redacted one-call
boundary. It is useful input for the next decision, not a blanket Provider readiness result and not a Cost Calibration
substitute.

Cost Calibration requires its own budget, pricing source/date, sample size, outlier/failure counting, and stop threshold.
Staging requires its own isolated resources, owners, secret boundary, deployment/rollback plan, data policy, and no-prod
proof. These gates must remain serial and separately approved.

## Requirement Mapping Result

| Requirement or governance source                                                                             | Mapping result                                                                                                       |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `docs/01-requirements/00-index.md`                                                                           | Local MVP AI/RAG and role flow goals remain bounded; release, staging, production, and Cost Calibration are outside. |
| `docs/01-requirements/advanced-edition/00-index.md`                                                          | Advanced AI and organization training surfaces stay in scope only as governed, redacted, approval-bound flows.       |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`                          | Quota defaults and production economics remain undecided until Cost Calibration is separately approved.              |
| `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`                  | AI出题 / AI组卷 baseline is current for declared local/bounded scope; stale historical blockers are not reopened.    |
| `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`               | Future AI generation work starts from current baseline and does not repeat old residual repairs without fresh proof. |
| ADR-005 and ADR-006                                                                                          | Staging and installed AI SDK capability do not imply execution approval; Provider/env/staging gates stay separate.   |
| `docs/05-execution-logs/acceptance/2026-07-04-stage-c-provider-staging-cost-calibration-approval-package.md` | Provider, staging, and Cost Calibration remain separate fresh-approval gates.                                        |

## Work Plan

1. Materialize the docs-only approval package and serial decision matrix.
2. Record what previous local and Stage C evidence can and cannot be reused.
3. Provide copyable future approval text for Provider, Cost Calibration, and staging without consuming those approvals.
4. Update state and queue so the current task boundary matches this docs-only package.
5. Run scoped closeout gates and update evidence/audit from pending to pass only after the commands pass.

## Validation Commands

- `npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-05-full-chain-provider-cost-staging-approval-package.md docs/05-execution-logs/acceptance/2026-07-05-full-chain-provider-cost-staging-approval-package.md docs/05-execution-logs/evidence/2026-07-05-full-chain-provider-cost-staging-approval-package.md docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-provider-cost-staging-approval-package.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-05-full-chain-provider-cost-staging-approval-package.md docs/05-execution-logs/acceptance/2026-07-05-full-chain-provider-cost-staging-approval-package.md docs/05-execution-logs/evidence/2026-07-05-full-chain-provider-cost-staging-approval-package.md docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-provider-cost-staging-approval-package.md`
- `git diff --check`
- `git diff --name-only -- package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests scripts src/db drizzle migrations seed e2e compose.yaml playwright-report test-results .next .runtime .env docs/04-agent-system/state/archive docs/04-agent-system/state/task-history-index.yaml docs/05-execution-logs/archive docs/05-execution-logs/execution-log-index.yaml`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-provider-cost-staging-approval-package-2026-07-05`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-chain-provider-cost-staging-approval-package-2026-07-05 -SkipRemoteAheadCheck`

## Closeout Policy

Local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch cleanup are approved by
the current user request for this single materialization task after all declared docs-only gates pass.
