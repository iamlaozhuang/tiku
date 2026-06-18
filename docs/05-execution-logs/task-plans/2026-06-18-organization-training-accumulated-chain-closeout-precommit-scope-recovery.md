# organization-training-accumulated-chain-closeout-precommit-scope-recovery

## Scope

Recover the accumulated organization-training local experience chain so Module Run v2 pre-commit hardening evaluates the whole current dirty branch as one governed closeout scope instead of blocking on prior task files.

## Approval Boundary

- User requested creating this dedicated accumulated-chain closeout / pre-commit scope recovery task in the current 2026-06-18 prompt.
- Allowed edits: current accumulated organization-training chain files, task plan/evidence/audit, task queue, project state, and coverage matrix.
- Allowed repair: address local seed fixture `secret_assignment` scanner findings without changing the seed semantics.
- Not approved in this task: local commit, fast-forward merge, push, PR, force-push, staging/prod/cloud/deploy/payment/external-service, provider/model, package/lockfile/dependency, `.env*`, schema/drizzle/migration, destructive database operations, dev server, Browser/Playwright runtime, and Cost Calibration Gate.
- The outcome should be a recommendation on whether a later closeout task can commit/merge/push after fresh approval.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## Current Blockers

1. `Test-ModuleRunV2PreCommitHardening.ps1` blocks because the current branch carries several prior organization-training task files outside the last closure audit task scope.
2. The same pre-commit gate flags local seed fixture hash assignments as `secret_assignment`, even though they are local-only hashed fixture values rather than cleartext credentials.

## Plan

1. Materialize this task with an allowedFiles list covering the accumulated organization-training local experience chain.
2. Refactor local seed fixture code/tests to avoid the pre-commit `secret_assignment` pattern while preserving object shape and seed SQL semantics.
3. Run focused seed/unit checks plus the organization-training unit and e2e list checks.
4. Run scoped Prettier, lint, typecheck, `git diff --check`, Module Run v2 pre-commit/module-closeout/pre-push gates.
5. Record results and leave commit/merge/push for a later explicitly approved closeout.

## Risk Controls

- Do not output `.env*`, database URLs, tokens, Authorization headers, row data, public identifier inventories, provider payloads, prompts, raw answers, screenshots, or traces in evidence.
- Keep release, staging/prod, provider/payment, dependency, schema/migration, deploy, and Cost Calibration gates blocked.
- Do not run full e2e or browser runtime in this recovery task.
