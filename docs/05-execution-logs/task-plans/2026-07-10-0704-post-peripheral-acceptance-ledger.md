# 2026-07-10 0704 Post-Peripheral Acceptance Ledger Task Plan

## Task

- Task id: `0704-post-peripheral-acceptance-ledger-2026-07-10`
- Branch: `codex/0704-post-peripheral-acceptance-ledger`
- Kind: docs/state acceptance planning
- Objective: materialize the owner-approved 17-task pre-launch peripheral acceptance sequence and seed queue/state for
  serial execution.

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
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md`
- `docs/05-execution-logs/handoffs/2026-07-10-0704-private-account-usage-guide.md`

## Scope

Allowed changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- `docs/05-execution-logs/task-plans/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-post-peripheral-acceptance-ledger-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-post-peripheral-acceptance-ledger-audit.md`

Blocked:

- source code and tests;
- package and lockfile;
- schema, migration, seed, and direct DB actions;
- Provider execution, env/secret access, staging/prod/deploy, payment, external service, Cost Calibration;
- browser screenshots, raw DOM, traces, credentials, session/cookie/token/header capture.

## Plan

1. Create the post-peripheral acceptance ledger with all 17 serial tasks, acceptance standards, and stop rules.
2. Seed queue/state so future work can resume from the documented current task and next pending task.
3. Record redacted evidence for reading, git baseline, files changed, validation commands, and boundary compliance.
4. Perform adversarial review for scope creep, redaction, task independence, repair-before-continue behavior, and closeout
   policy.
5. Run scoped formatting and local gates.
6. Commit, fast-forward merge to `master`, run master-side gates, push `origin/master`, delete the short branch, and
   confirm clean/aligned.

## Validation Commands

- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md docs/05-execution-logs/task-plans/2026-07-10-0704-post-peripheral-acceptance-ledger.md docs/05-execution-logs/evidence/2026-07-10-0704-post-peripheral-acceptance-ledger-evidence.md docs/05-execution-logs/audits-reviews/2026-07-10-0704-post-peripheral-acceptance-ledger-audit.md`
- `git diff --check`
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-post-peripheral-acceptance-ledger-2026-07-10`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-post-peripheral-acceptance-ledger-2026-07-10 -SkipRemoteAheadCheck`

## Acceptance Criteria

- The ledger exists and includes all 17 tasks in serial order.
- Enterprise multi-scope authorization and employee roster import have explicit priority repair gates.
- Each task has acceptance standards and redaction boundaries.
- Queue/state reference the ledger and current/next task.
- No disallowed runtime action is executed.
- Evidence and audit remain redacted.
