# Full Chain Centralized Approval And Continuity Addendum

Task id: `full-chain-centralized-approval-and-continuity-addendum-2026-07-04`

Status: approved.

## Approval Record

Approved at: `2026-07-04T10:05:10-07:00`

Approved by: `laozhuang`

Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`

Approved text: the copyable approval text in this document.

## Purpose

This addendum prepares a single bounded authorization package so the full-chain local acceptance goal can continue
serially without repeatedly stopping for predictable local acceptance, local repair, local provisioning, validation, Git
closeout, and rerun steps.

This addendum does not execute runtime acceptance, browser/e2e, DB access, source repair, Provider calls, staging/prod
actions, Cost Calibration, or Git closeout by itself.

## Centralized Local Continuity Authorization

This package authorizes the following local-only actions for the `2026-07-04 full-chain acceptance` goal, provided each
action is first materialized in its own task plan, state/queue entry, evidence file, audit file, exact allowed files,
blocked files, validation commands, evidence redaction rules, and closeout policy:

- Current Scenario 1 blocked-package closeout: commit the redacted block package, fast-forward merge it to `master`, push
  `origin/master`, delete the merged short branch, then create the repair branch.
- Scenario 1 repair: add the minimal governed product flow that lets `super_admin` create admin-domain `ops_admin` and
  `content_admin` accounts, with server-side authorization and focused tests.
- Later local acceptance scenarios: start the local app, use browser/e2e, use private credentials in memory only, execute
  the approved product runtime flow, and write redacted evidence.
- Local isolated DB work: connect only to `tiku_full_chain_acceptance_20260704_001`, perform selector-scoped reads,
  selector-scoped non-destructive writes needed by approved product flows or provisioning tasks, and selector-scoped
  aggregate verification.
- Local repair tasks: make minimal root-cause source/test/doc repairs required to continue acceptance, including
  authorization repair only when it strengthens or implements the documented boundary and does not weaken checks.
- Local provisioning tasks: create or import missing prerequisite data only through approved product/runtime or
  documented provisioning flows, using selector labels and private material outside the repository.
- Non-destructive schema/migration/seed repair: allowed only when a task plan proves it is required by a current
  root-cause block, names exact files/commands, is local isolated DB only, and preserves reviewed redaction and rollback
  evidence. Destructive DB work remains excluded.
- Task closeout: after declared validation passes, commit one reviewable task, fast-forward merge to `master`, push
  `origin/master`, delete the merged short branch, and rerun from the affected node or from Scenario 1 when narrower
  restart is not defensible.

## Mandatory Per-Task Gates

Centralized authorization does not permit a mega-branch or implicit execution. Every acceptance, repair, or provisioning
task must still:

- Start from clean `master` on a short `codex/` branch.
- Read the task-relevant SSOT, traceability, evidence, audit, source, and tests before execution.
- Record the read list in the task plan.
- Preserve product authorization boundaries; no bypass, no weakened permission, no fake data, no fixture expansion for
  convenience.
- Stop on validation failure, redaction risk, impossible scope mismatch, or unresolved product decision.
- Keep evidence to labels, counts, command names, pass/fail/block status, and redacted expected/observed summaries.

## Still Excluded Unless Separately Bounded

The following remain blocked unless a later approval names the exact task, target, command class, limit, evidence shape,
and stop rules:

- Provider execution beyond local no-call UI flow.
- Provider credential reads or configuration changes.
- Staging, production, cloud deploy, payment, external service, or release operations.
- Cost Calibration or budget-bearing runs.
- Destructive DB operations, including drop, truncate, reset, broad delete, broad unscoped update, or cleanup outside the
  selector-scoped isolated local target.
- Dependency install, removal, upgrade, lockfile change, package manager change, or dependency audit fix.
- PR creation, force push, or force-with-lease.
- Release readiness, final Pass, or production usability claims.

## Evidence Red Lines

No repository file, evidence file, audit file, task plan, or chat output may contain credentials, passwords, account
private values, phone, email, connection strings, environment values, tokens, sessions, cookies, localStorage,
Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, trace files, Provider payloads, raw Prompt, raw
AI I/O, full materials, full questions, full papers, employee answers, plaintext card values, or private fixture file
contents.

## Copyable Approval Text

Approve centralized local continuity authorization for the `2026-07-04 full-chain acceptance` goal: allow each future
local acceptance, repair, or provisioning task to run serially on its own short `codex/` branch after task-scoped
materialization of read lists, allowed files, blocked files, boundaries, validation commands, redacted evidence, audit,
and closeout policy. This approval covers current Scenario 1 blocked-package closeout, the Scenario 1 governed
`super_admin` admin-account creation repair, local app/browser/e2e execution, in-memory private credential use,
selector-scoped isolated local DB reads/writes/aggregate verification against `tiku_full_chain_acceptance_20260704_001`,
minimal root-cause source/test/doc repairs, local provisioning through approved product/runtime or documented
provisioning flows, non-destructive local schema/migration/seed repair only when task-scoped and required, validation,
commit, fast-forward merge to `master`, push `origin/master`, branch cleanup, and rerun from the affected node or from
Scenario 1 when needed. The approval does not allow Provider execution or Provider credential/config changes,
staging/prod/cloud/deploy/payment/external service, Cost Calibration, destructive DB operations, dependency or lockfile
changes, PR creation, force push, release readiness, final Pass, production usability claims, evidence redaction
violations, permission weakening, fake data, or fixture expansion for convenience.
