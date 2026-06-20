# Task Plan: blocked-validation-repair-state-reconciliation-2026-06-20

## Scope

Reconcile historical `blocked_validation_failure` queue entries whose blockers have already been repaired by independent
closed/pass repair packets.

Targets:

- `organization-training-entry-route-path-contract-repair` -> repaired by
  `organization-training-route-runtime-contract-repair`.
- `organization-training-draft-source-context-local-migration-execution-approval` -> repaired by
  `organization-training-admin-visible-scope-no-migration-repair`.

`module-run-v2-personal-ai-local-ui-browser-flow-validation` remains blocked and is intentionally left for the next
independent auth/session repair packet.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- Relevant historical evidence and current task queue entries for the two organization-training repairs.

## Implementation Plan

1. Materialize the current approval as this docs/state-only reconciliation packet.
2. Mark only the two already-repaired historical organization-training blocked entries as `closed` with repair task and
   repair commit metadata.
3. Keep the personal AI blocked validation task untouched for the next repair packet.
4. Record redacted evidence and audit review.
5. Run docs/state validation, lint/typecheck, diff, hardening, closeout readiness, and pre-push readiness.

## Risk Controls

- No product source, test, e2e, schema, migration, package, lockfile, dependency, env, provider, deployment, payment, PR,
  force-push, destructive DB, headed/debug browser, or Cost Calibration Gate work.
- No sensitive evidence: secrets, tokens, database URLs, Authorization headers, raw DB rows, raw prompts, raw generated
  AI content, provider payloads, plaintext `redeem_code`, full `paper`, full `material`, or raw answer text are not
  recorded.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- scoped Prettier check for changed docs/state files
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId blocked-validation-repair-state-reconciliation-2026-06-20`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId blocked-validation-repair-state-reconciliation-2026-06-20`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId blocked-validation-repair-state-reconciliation-2026-06-20`
