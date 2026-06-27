# Active Queue Nonterminal Closeout Retirement Apply

## Task

- taskId: `active-queue-nonterminal-closeout-retirement-apply-2026-06-27`
- branch: `codex/high-risk-nonterminal-cleanup-20260627`
- task kind: docs/state-only high-risk package nonterminal cleanup
- approval: `current_user_fresh_unattended_serial_high_risk_package_2026_06_27`

## Scope

This task applies a redacted cleanup ledger for current Goal related high-risk approval packages. It may update only:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- this task evidence
- this task audit/review
- this task acceptance

This task does not move archive/index entries. `docs/04-agent-system/state/archive/**` and
`docs/04-agent-system/state/task-history-index.yaml` remain untouched for this task.

## Required Read List

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
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- related current Goal acceptance/evidence documents for Layer 2, Layer 3, archive/index approval, and nonterminal triage

## Cleanup Rules

The cleanup ledger uses these status decisions:

- `keep`: preserve a package as the canonical evidence or as a true remaining gate.
- `merge`: mark a package as superseded by a later canonical package/evidence path.
- `retire`: mark a package as no longer actionable because it is historical, blocked-and-superseded, or replaced.
- `blocked`: preserve a real remaining gate that still requires fresh approval or external setup.

The ledger is limited to current Goal related Layer 2 and Layer 3 high-risk package work. Broader historical nonterminal
queue items remain out of scope unless already explicitly registered in the current high-risk cleanup ledger.

## Implementation Plan

1. Update `project-state.yaml` current task to this cleanup task with explicit no-runtime, no-archive, no-final-pass scope.
2. Update `task-queue.yaml` for this task from `pending` to `closed` after recording the cleanup ledger.
3. Record current Goal related cleanup decisions:
   - Layer 2 route/local Postgres package chain.
   - Layer 3 Provider smoke package chain.
   - Layer 3 Cost Calibration package chain.
   - Layer 3 staging/pre-release package chain.
   - Layer 3 payment/external-service and OCR/export package gates.
4. Register or preserve the successor archive/index apply task boundary without moving archive/index entries in this task.
5. Write redacted evidence, audit/review, and acceptance.
6. Run scoped formatting and mechanism gates:
   - scoped Prettier write/check
   - `git diff --check`
   - `Get-TikuProjectStatus.ps1`
   - `Test-ModuleRunV2PreCommitHardening.ps1`
   - `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
   - `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`

## Hard Stops

Stop and write blocked evidence if any step requires:

- `.env*` read/write or credential value access
- source/test/e2e/schema/migration/seed/package/lockfile changes
- DB connection or read/write
- browser/dev-server/e2e
- Provider call/configuration
- Cost Calibration execution
- staging/prod/deploy/payment/external-service/OCR/export execution
- archive/index movement during this task
- release readiness or final Pass claim
- raw prompt/response/payload/generated content, DB rows, screenshots, traces, cookies, or localStorage in evidence

## Expected Outcome

The active queue has a clear redacted decision ledger for current Goal related high-risk packages. Canonical evidence
remains preserved, superseded packages are marked as merged/retired in the ledger, true remaining gates remain blocked,
and archive/index movement is deferred to a separate approved task.
