# 2026-07-10 0704 Release Candidate Local Gates Plan

## Goal

Produce the final local release-candidate confidence packet for the owner-approved 0704 post-AI acceptance sequence.

## Read Gate

Read before execution:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/handoffs/2026-07-10-0704-private-account-usage-guide.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- Stage 1 through Stage 5 evidence and audit files listed in the coverage ledger.
- Private credential index and canonical catalog under `D:\tiku-local-private\acceptance`, read in memory only.

## Scope

- Branch: `codex/0704-release-candidate-local-gates`.
- Mode: validation-only release-candidate local gates.
- Allowed writes: state, queue, roadmap/ledger status, task plan, redacted evidence, adversarial audit.
- Blocked writes: product source, tests, package files, lockfiles, schema, migrations, seed, env files, runtime artifacts.
- Blocked execution: Provider-enabled run, staging/prod/deploy, Cost Calibration, destructive DB, direct DB mutation, screenshots, raw DOM, trace capture.

## Steps

1. Confirm current branch is `codex/0704-release-candidate-local-gates`, based on `origin/master`, and worktree is clean.
2. Update queue and project state to materialize this Stage6 task and repository checkpoint.
3. Read private index and canonical catalog in memory; record only role labels and readiness categories.
4. Verify prior Stage1-Stage5 evidence/audit files exist.
5. Run a sensitive-evidence scan that reports only category counts and pass/fail.
6. Run the RC targeted vitest confidence packet covering authorization, organization boundary, non-AI learning, content non-AI publishing, and exception/degradation contracts.
7. Run scoped Prettier check, `git diff --check`, blocked-path diff guard, lint, typecheck, and Module Run v2.
8. Perform adversarial review for role boundary, data boundary, evidence hygiene, unauthorized file changes, Provider/env/DB/deploy gates, and release-claim boundaries.
9. Write redacted evidence and audit.
10. Mark Stage6 closed in roadmap/ledger/state/queue, commit, fast-forward merge to `master`, rerun master-side gates, push, delete short branch, and confirm clean/aligned.

## Acceptance Criteria

- `master` and `origin/master` are aligned before and after closeout.
- Coverage ledger has no mandatory pending post-AI acceptance item.
- Stage1 through Stage5 evidence and audits exist and remain redacted.
- Stage6 diff contains no unapproved product source, test source, package, lockfile, schema, migration, seed, env, secret, Provider, staging/prod/deploy, or Cost Calibration work.
- Targeted tests, lint, typecheck, format check, `git diff --check`, sensitive-evidence scan, and Module Run v2 pass.
- No release readiness, production readiness, final Pass, staging/prod, Provider readiness, or Cost Calibration claim is made.

## Risk Controls

- If readiness or evidence scan fails, stop and record a blocked category without entering business validation.
- If targeted tests reveal a current product defect, stop this validation task and open a separate `codex/*` repair branch.
- Evidence records only role labels, status categories, file labels, command results, and counts.
- Private credential values remain in memory only and are not written to chat, evidence, audit, logs, or repository.
