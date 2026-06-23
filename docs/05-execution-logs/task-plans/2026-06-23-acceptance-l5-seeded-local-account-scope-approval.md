# Acceptance L5 Seeded Local Account Scope Approval Plan

taskId: acceptance-l5-seeded-local-account-scope-approval-2026-06-23
status: closed
createdAt: "2026-06-23T00:11:44-07:00"
branch: codex/runtime-blocker-evidence-batch-20260623
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Human Approval Boundary

Laozhuang approved proceeding according to the recommended order. Codex interprets the first step as preparing the
seeded local account scope approval package, not executing database seed or credentialed role flow yet.

This task does not approve running seed, logging in, creating accounts, or database writes. It prepares the exact package
that must be explicitly approved before those actions.

## Standards Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- latest fixture-only evidence and audit review
- `package.json`
- `scripts/db/Seed-DevDatabase.ps1`
- `src/db/dev-seed.ts`
- relevant seeded / DB-backed e2e specs

## Documentation Approach

1. Register a docs-only approval package task in `project-state.yaml` and `task-queue.yaml`.
2. Produce `L5_SEEDED_LOCAL_ACCOUNT_SCOPE_2026_06_23` with:
   - local-only boundary;
   - account and role matrix;
   - allowed commands;
   - redaction rules;
   - stop conditions;
   - cleanup policy;
   - explicit approval phrase.
3. Record evidence that no seed, DB connection, credentialed login, browser runtime, Provider, env/secret, staging,
   dependency, payment, or Cost Calibration work was executed.
4. Run docs formatting and Module Run v2 hardening before commit.

## Risk Controls

- Existing seed/e2e files are read-only in this task.
- The package must state that existing static seed accounts are limited to `student` and `super_admin`.
- The package must not overclaim dedicated `content_admin`, `ops_admin`, `org_admin`, or `auditor` account coverage.
- Evidence must not include credentials already visible in read-only source snippets.
- Cost Calibration Gate remains blocked.

## Validation Commands

- `npx.cmd prettier --check --ignore-unknown docs/05-execution-logs/acceptance/2026-06-23-l5-seeded-local-account-scope-approval-package.md docs/05-execution-logs/task-plans/2026-06-23-acceptance-l5-seeded-local-account-scope-approval.md docs/05-execution-logs/evidence/2026-06-23-acceptance-l5-seeded-local-account-scope-approval.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-l5-seeded-local-account-scope-approval.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-l5-seeded-local-account-scope-approval-2026-06-23`

## Stop Conditions

Stop before execution if the next step needs seed, DB connection, `.env*`, credentialed login, browser runtime,
Provider, staging/prod/cloud, dependency, payment, external-service, Cost Calibration, or any source/test/script change
not covered by a fresh task approval.
