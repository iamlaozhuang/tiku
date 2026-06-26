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
- Bounded queue drain may continue across multiple low-risk batches in one wake when eligibility, startup, dispatcher,
  closeout, registry, and supervisor budgets remain green. Low-risk product-code implementation tasks default to
  `low_risk_local_code` drain eligibility when their task metadata satisfies the full local implementation gate.
- Post-merge evidence-only commits are not required by default; use final handoff or `project-state.yaml` for final SHAs
  unless durable post-merge evidence is needed for recovery or a gate explicitly requires it.
- Module Run v2 may group Batches, but every Batch still needs focused evidence and a reviewable boundary.
- Batch execution packages are the preferred shape for 3-5 serial tasks that share one verifiable closure. The package
  records approval boundaries, preflight, validation layering, and blocked gates up front, but each child task still
  keeps its own branch, plan, evidence, audit, validation, commit, and closeout decision.

## Recovery Read Order

1. `AGENTS.md`.
2. `docs/03-standards/code-taste-ten-commandments.md`.
3. `docs/02-architecture/adr/`.
4. This manual.
5. `docs/04-agent-system/state/project-state.yaml`.
6. `docs/04-agent-system/state/task-queue.yaml`.
7. `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`.
8. Latest task plan, evidence, and audit review referenced by durable state.
9. `docs/04-agent-system/sop/requirement-ssot-reading-governance.md` when the task may affect requirements, docs,
   mechanism gates, acceptance, or implementation.
10. Relevant SOPs linked by `project-state.yaml` or `mechanism-source-of-truth-index.yaml`.

## Single Source Of Truth Rules

- Task execution status is sourced from `docs/04-agent-system/state/task-queue.yaml`.
- Module target mapping is sourced from `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`.
- Module completion should be derived from queue status plus evidence, not manually duplicated in multiple active files.
- `project-state.yaml` stores mode, current recovery pointer, approval boundaries, and accepted repository checkpoints.
- Evidence and audit reviews store observed validation and review conclusions.
- Requirement SSOT is rooted in `docs/01-requirements/00-index.md`; advanced edition tasks must additionally read
  `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/05-execution-logs/` is evidence and history, not a standalone requirement source.
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

## Local Experience Repair Selection Rule

When the current task is terminal and local full-flow evidence is blocked, first inspect the current handoff and
`docs/04-agent-system/state/local-experience-coverage-matrix.yaml` before selecting an unrelated pending task. If those
sources identify an unseeded repair candidate, report `request_local_experience_task_seed:<taskId>`. If the candidate is
already pending and dependency-satisfied, prefer that candidate over unrelated ready work. This rule preserves queue
discipline while preventing valid blocked evidence from being bypassed accidentally.

Blocked validation closeout is valid only for validation tasks with redacted evidence, a failure summary, a next minimal
repair, blocked-gate remainder, and an audit verdict of `APPROVE_BLOCKED_EVIDENCE_CLOSEOUT`. It does not mark any row
`experience_closed`.

## Bounded Queue Drain Rule

Use `Invoke-ModuleRunV2QueueDrainSupervisor.ps1` as the default executable entry for queue-drain automation. The
supervisor remains an outer protocol over the existing runner, dispatcher, eligibility gate, and approved closeout flow;
it does not replace those gates. Every default-entry result must emit:

```text
queueDrainDefaultEntry: true
queueDrainEntryContract: startup_guardian_then_runner_dispatcher_eligibility_closeout
queueDrainDecision: ready_for_agent_task
queueDrainNextAction: agent_execute_task
moduleApprovalWindowDecision: approved|approval_required|not_applicable
hardStopState: ready_task|idle|budget_stop|needs_human_approval|hard_block_recovery
recoveryPacketRequired: true|false
```

The agent layer may then execute only that task and must return to the supervisor after validation or closeout. The
supervisor writes its run manifest outside the repository under `%USERPROFILE%\.codex\tiku\drain-runs`.

Module approval windows are executable only when the supervisor reports `moduleApprovalWindowDecision: approved`.
Seed proposals, missing approvals, owner handoff, and manual decisions must report `approval_required` and stop. Budget
and idle states report `not_applicable`.

Hard-stop handling is a state machine. `ready_task` is the only state that may continue into agent task execution or
approved closeout. `idle` and `budget_stop` are controlled terminal states. `needs_human_approval` stops for an approval
window. `hard_block_recovery` must set `recoveryPacketRequired: true`, generate or reuse a redacted recovery packet
outside the repository, and stop before the next queue-drain wake resumes.

Do not drain when a non-implementation task lacks `drainPolicy`, risk metadata is high or ambiguous, fresh approval is
required, validation fails, evidence/audit is missing, blocked files are touched, a repeated `blockerFingerprint` is
seen, or the wake exceeds its task/time/diff budgets. Low-risk product-code implementation tasks without an explicit
`drainPolicy` are treated as `low_risk_local_code` only after approval anchors, structured closeout, validation surface,
allowed/blocked files, and redaction-safe evidence paths are present.

Drain eligibility accepts `validationPolicy` as the current field and `validationProfile` as a legacy compatibility
field. `local_full_flow` remains single-task only and must not be batched by queue drain or goal packet logic.

Guarded goal packet v1 is read-only until a task explicitly adopts it. `Test-ModuleRunV2GuardedGoalPacket.ps1` may group
ready docs/state/audit-only tasks for guarded serial packet closeout when their allowed files stay inside mechanism
state/SOP/operating-manual/evidence/task-plan/audit paths, evidence and audit paths exist, and local commit closeout is
task-scoped. Product or runtime scope must keep one task and one closeout. `local_full_flow` is always single-task only.

## Batch Execution Package Rule

Use `docs/04-agent-system/sop/batch-execution-package-governance.md` before a serial chain would otherwise require
repeated approval packages for the same closure. A package can pre-approve only the child capabilities it names, such as
docs/state changes, focused source TDD, readonly preflight, capped local route smoke, draft-only local DB mutation, or one
named Provider smoke. Anything not named remains blocked.

Before mutating or costly validation, prefer a readonly or low-cost preflight that checks actor, route, local data,
migration journal, command, and evidence readiness without expanding the task scope. Route smoke should use capped
request/write counts and redacted evidence. Provider/cost and publish/student-visible content remain separate gates.

Validation should be layered by changed surface:

- docs/state tasks use scoped Prettier write/check, `git diff --check`, and relevant Module Run gates;
- mechanism script tasks add focused script smoke;
- source tasks run focused unit tests first, then lint/typecheck;
- route smoke tasks avoid unrelated full validation unless shared source changed.

Queue slimming/self-repair v1 is diagnostic-only. `Get-ModuleRunV2QueueSlimmingSelfRepair.ps1` reports terminal
active-queue archive candidates outside the recovery window and separates safe mechanism docs/state task-packet metadata
repair candidates from high-risk blocked candidates. It must not move queue history, edit task packets, touch product
source, or apply high-risk repairs without a later task-scoped approval and closeout.

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

`Invoke-ModuleRunV2AutopilotRunner.ps1` must also enforce that decision as a hard execution gate. If
`automation.autoSeedApprovalDecisionPath` points to a record whose `status` is `pending_human_decision` for the proposed
seed module, the runner must stop with `runnerDecision: stop_for_manual_decision` before `Invoke-SeedTransaction`, even
when the command line includes `-AllowAutoSeed` and an `autoDriveLocalImplementationApproval` statement.

If that record instead says `status: approved_by_controlled_auto_seed_policy`, the runner may auto-apply the seed only
for the matching module, only when it is not `-PlanOnly`, and only when `seedCandidateTaskCount` is less than or equal to
the policy `maxTasksPerSeed`. This policy does not approve local automation resume, task claim outside the seeded queue,
provider/env/schema/deploy/dependency changes, payment/external-service work, PR/force push, or Cost Calibration Gate.

Every auto-seed transaction must pass seed self-review with explicit MECE outputs: `meceReviewDecision`,
`meceCoverageStatus`, `meceGapCount`, and `meceOverlapCount`. Duplicate target closures, uncovered target closures
without blocked remainder, or missing seed metadata must hard-block before the runner can claim seeded work.

Every runner or dispatcher terminal stop must emit a compact stop card in addition to legacy compatibility fields:
`stopCardDecision`, `canAutoRecover`, `blockerClass`, `nextCommand`, and `statePolicy`. The stop card must fit on one
screen and state why execution stopped, whether automated recovery is allowed, the single recommended next command, and
whether durable state was written or intentionally skipped with accounting.

## Completion Standard

Every task closeout must record:

- task plan;
- evidence with command results;
- audit review when governance, queue, state, scope, approval, evidence, or blocked-gate behavior changes;
- SSOT read list and `Requirement Mapping Result`, `Role Mapping Result`, or `Acceptance Mapping Result` when required
  by task kind;
- changed-file inventory;
- validation result;
- blocked remainder;
- next task or stop reason.

Post-merge evidence-only commits are required only when validation or closeout facts were not already recorded, a failed
merge/push/cleanup needs durable recovery facts, `project-state.yaml` or handoff SHA state must be repaired on disk, the
task policy explicitly requires persistent post-merge evidence, or a downstream gate requires file-based evidence. In the
ordinary successful case, record final SHAs and cleanup results in the final handoff or `project-state.yaml` instead of
creating another evidence-only commit.

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
- For low-risk Module Run v2 auto-seeded implementation tasks, a complete task `closeoutPolicy` materialized from
  `automation.unattendedControl.standingUnattendedLocalCloseoutApproval` counts as explicit task-scoped push approval
  only for local commit, fast-forward merge to `master`, push to `origin/master`, merged branch cleanup, and worktree
  parking after all required gates pass.
- For bounded low-risk experience ready-set batches, a complete task `closeoutPolicy` materialized from
  `automation.unattendedControl.standingLocalLowRiskExperienceAdvancementApproval` counts as explicit task-scoped
  approval only when `executionProfile: local_low_risk_experience_batch`, parent/child evidence, low-risk batch
  readiness, module closeout readiness, pre-push readiness, and blocked-files gates all pass. It allows local commit,
  fast-forward merge to `master`, push to `origin/master`, merged branch cleanup, and worktree parking; it does not
  approve runtime browser/e2e execution, production source fixture repair, PRs, force push, dependency, schema,
  provider, env/secret, deploy, payment, external-service, or Cost Calibration Gate work.
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

## Mechanism Smoke Tools

Requirement SSOT readiness is enforced through pre-commit hardening:

```powershell
.\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId <task-id>
```

The focused smoke for that gate is:

```powershell
.\scripts\agent-system\Test-ModuleRunV2RequirementSsotReadiness.Smoke.ps1
```

The governed redacted command wrapper for future approved local smoke commands is:

```powershell
.\scripts\agent-system\Invoke-ModuleRunV2RedactedSmokeRunner.ps1
```

Its focused smoke is:

```powershell
.\scripts\agent-system\Invoke-ModuleRunV2RedactedSmokeRunner.Smoke.ps1
```

The runner records summary-only JSON and does not authorize Provider, DB, env/secret, browser/e2e, staging/prod, payment,
external-service, publish, Cost Calibration, or final Pass work by itself.
