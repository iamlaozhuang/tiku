# Module Run v2 Unattended Autodrive Activation Plan

## Scope

Activate the already implemented Module Run v2 unattended autodrive mechanism after the auto-seed bridge closeout.

This task only updates durable mechanism state and records evidence. The external Codex automation prompt/status update is performed after repository closeout with the Codex app automation tool.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## Intended Changes

- Set `automation.unattendedControl.codexAutomationStatus` to `ACTIVE` in `project-state.yaml`.
- Register `module-run-v2-autodrive-activation` as a closed mechanism activation task in `task-queue.yaml`.
- Harden the runner so an applied auto-seed transaction stops at `seed_transaction_applied` for closeout before any seeded task is claimed.
- Make the seed transaction write minimal seed evidence and audit review paths.
- Record plan, evidence, and audit review for the activation.
- Keep the automation guardian-first and bounded by the runner, startup readiness, auto-seed proposal/transaction/self-review, capability gates, branch hygiene, and stopped automation hygiene.

## Explicit Non-Goals

- No product implementation.
- No `package.json` or lockfile changes.
- No dependency install.
- No env/secret read or write.
- No provider call or provider configuration.
- No schema, migration, or destructive DB operation.
- No real local Docker DB operation.
- No project material, paper, or paper_asset reads for tests.
- No PR, force push, deploy, payment, external service, or Cost Calibration Gate.

## Validation Plan

1. Run task work readiness for the activation file set.
2. Run seed transaction smoke.
3. Run runner smoke and confirm applied auto-seed stops at `seed_transaction_applied`.
4. Run runner plan-only and confirm it bridges no executable work to `seed_proposal_available`.
5. Run control-loop acceptance.
6. Run startup readiness.
7. Run stopped automation and branch hygiene summaries.
8. Run lint, typecheck, and `git diff --check`.
9. Verify activation and approval anchors are present in durable state and evidence.

## Closeout Plan

If validation passes, commit this branch, fast-forward merge to `master`, push `origin/master`, clean the short-lived branch/worktree, then update the existing Codex automation to ACTIVE with the guarded auto-seed runner prompt.
