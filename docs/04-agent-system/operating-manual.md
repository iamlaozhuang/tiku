# Tiku Advancement Operating Manual

## Status

Active concise entry point for human and Codex recovery. This manual summarizes the current mechanism; it does not replace the detailed SOPs, task queue, evidence, audit reviews, or state files.

## Purpose

Use this file as the first short read after `AGENTS.md`, code taste rules, and ADRs when deciding how to advance Tiku work. If this manual and a detailed SOP disagree, stop and treat the detailed SOP plus durable state as authoritative until the conflict is repaired.

## Current Mode

- Current automation mode: `local_auto_candidate`.
- Current local automation registration may be intentionally `PAUSED` while
  `project-state.yaml` records `plannedPauseStatus: active`.
- Default rhythm: queue-first, local-first, evidence-first, guardian-first.
- Default execution shape: one focused task, one focused local commit, then an explicit closeout decision.
- Module Run v2 may group Batches, but every Batch still needs focused evidence and a reviewable boundary.

## Recovery Read Order

1. `AGENTS.md`.
2. `docs/03-standards/code-taste-ten-commandments.md`.
3. `docs/02-architecture/adr/`.
4. This manual.
5. `docs/04-agent-system/state/project-state.yaml`.
6. `docs/04-agent-system/state/task-queue.yaml`.
7. Latest task plan, evidence, and audit review referenced by durable state.
8. Relevant SOPs linked by `project-state.yaml` or `mechanism-source-of-truth-index.yaml`.

## Single Source Of Truth Rules

- Task execution status is sourced from `docs/04-agent-system/state/task-queue.yaml`.
- Module target mapping is sourced from `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`.
- Module completion should be derived from queue status plus evidence, not manually duplicated in multiple active files.
- `project-state.yaml` stores mode, current recovery pointer, approval boundaries, and accepted repository checkpoints.
- Evidence and audit reviews store observed validation and review conclusions.
- Chat memory is never a durable source of truth.

## Active Queue Status Policy

New active queue tasks should use only these statuses:

```text
pending
claimed
planned
implemented
validated
reviewed
ready_for_closeout
closed
blocked
```

Legacy `done`, `merged`, and `pushed` may remain in historical or archived entries when evidence exists. Empty status in active entries is a diagnostic finding and must not be selected for new execution until repaired or explicitly grandfathered.

Active queue slimming rules live in `docs/04-agent-system/sop/active-queue-slimming-plan.md`. That plan is
planning-only until a future archival task is explicitly approved.

## Task Selection Rule

Select the next task only when:

- planned pause is not active;
- status is `pending`;
- dependencies are terminal and have evidence;
- `taskKind`, `allowedFiles`, `blockedFiles`, `riskTypes`, and validation commands are concrete;
- no active owner, lease, dirty worktree, remote divergence, or blocked gate is present;
- the task does not require dependency, schema, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, PR, force push, or Cost Calibration Gate work without fresh approval.

If no task qualifies, report `no-executable-task-seed-or-approve-next-task` instead of speculating.

When `plannedPauseStatus: active` and `plannedPauseKeepsAutomationPaused: true` are recorded in `project-state.yaml`,
diagnostics should report `planned_pause_for_tuning`. This is an intentional human-controlled stop state, not approval
to resume automation, claim tasks, seed tasks, merge, push, deploy, call providers, or execute Cost Calibration Gate.

## Auto Seed Approval Decision Rule

Seed proposal diagnostics are not seed execution approval. The current `ai-task-and-provider` proposal decision is
recorded in `docs/04-agent-system/state/ai-task-and-provider-auto-seed-approval-decision.yaml`.

While that record says `status: pending_human_decision`, the default action is `keep_automation_paused_for_tuning`.
Agents must not run `New-ModuleRunV2ImplementationSeed.ps1`, append seeded implementation tasks, resume automation, or
claim `ai-task-and-provider` work unless a later task records fresh explicit
`autoDriveLocalImplementationApproval for module ai-task-and-provider`.

## Completion Standard

Every task closeout must record:

- task plan;
- evidence with command results;
- audit review when governance, queue, state, scope, approval, evidence, or blocked-gate behavior changes;
- changed-file inventory;
- validation result;
- blocked remainder;
- next task or stop reason.

Docs-only work may claim governance completion only. It must not claim runtime behavior for `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log` without task-specific runtime evidence.

## Mechanism Work Budget

Mechanism repair may interrupt product-facing progress only when one of these is true:

- the mechanism is hard-blocked;
- queue, state, evidence, or matrix drift affects task selection;
- a safety gate is missing or incorrectly allows high-risk work;
- automation cannot recover or close out safely.

Otherwise, mechanism work should wait until the current business Batch group closes. A mechanism-only task must record `productClosureContribution: none; mechanism budget item`.

## Push Boundary

Local commit and remote push are separate decisions.

- Docs-only or mechanism-only tasks may be prepared for push only when task-scoped approval and closeout gates allow it.
- Source-code tasks should default to local commit and local review; remote push requires explicit task-scoped push approval.
- Dependency, schema, migration, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, PR, force push, and Cost Calibration Gate actions always require fresh explicit approval.

## Product Closure Contribution

Every Module Run or Batch evidence must include:

```text
productClosureContribution:
```

Use it to name the user path advanced by the task, such as `student`, `admin`, `employee`, `organization`, or `ops`. If the task only improves the mechanism, write `none; mechanism budget item`.

## Blocked Gates

These remain blocked unless a fresh task records explicit approval and evidence:

- dependency, package, CLI, SDK, or lockfile change;
- schema, migration, destructive database operation, or `drizzle-kit push`;
- env/secret, `.env.local`, `.env.example`, token, password, API key, database URL, or Authorization header work;
- provider call, provider configuration, provider quota, provider cost measurement, or provider fallback work;
- staging, prod, cloud, deploy, domain, TLS, object storage, payment, or external-service work;
- PR creation or update, force push, production release, or cloud resource change;
- Cost Calibration Gate execution.

Cost Calibration Gate remains blocked.

## Stop Rules

Stop before editing or continuing when:

- the next action exceeds `allowedFiles` or touches `blockedFiles`;
- durable state and Git reality disagree in a way that affects task selection;
- evidence would expose secrets, provider payloads, raw prompts, raw generated content, cleartext `redeem_code`, full `paper` content, private answer text, database URLs, or Authorization headers;
- validation fails three times for the same blocker;
- ownership, branch, worktree, merge order, or approval scope is ambiguous;
- the user asks to pause or inspect.

## Next Action Diagnostic

The intended human-facing project status entry point is:

```powershell
.\scripts\agent-system\Get-TikuProjectStatus.ps1
```

The command is read-only. It summarizes Git state, next-action decision, automation registration, stopped automation
hygiene, seed proposal, and the final `projectStatusDecision`.

The lower-level next-action diagnostic is:

```powershell
.\scripts\agent-system\Get-TikuNextAction.ps1
```

The command is read-only. It should summarize repository state, current task, queue decision, next executable task,
blocked gates, validation needed, recommended action, and stop reason.

When no pending task is executable and the current task is terminal, the next-action diagnostic should also summarize
the guarded Module Run v2 seed proposal as `seedProposalDecision`, `seedModule`, `seedRequiredApproval`, and
`recommendedHumanDecision`. This is proposal-only. It does not write queue entries or approve implementation.
