# Docs-Only Fast Lane Governance SOP

## Status

Active after Module Run v2 docs-only fast lane readiness scripts pass in hard-block mode. Shadow mode may be used before activation, but shadow mode alone never authorizes merge or push.

## Purpose

Reduce repeated closeout friction for low-risk docs-only work while preserving all high-risk blocked gates.

The fast lane is a batch closeout mechanism. It does not approve product implementation, dependency changes, schema work, DB access, provider/model calls, e2e/browser/dev-server, deploy, payment, external-service, PR creation, force-push, or Cost Calibration Gate execution.

## Eligible Task Kinds

Fast lane eligibility is limited to:

- readonly audit;
- readonly recheck;
- boundary decision;
- queue seeding;
- state, evidence, or audit repair.

Fast lane tasks may only change:

- `docs/04-agent-system/state/project-state.yaml`;
- `docs/04-agent-system/state/task-queue.yaml`;
- `docs/05-execution-logs/task-plans/**`;
- `docs/05-execution-logs/evidence/**`;
- `docs/05-execution-logs/audits-reviews/**`.

Any changed file under product source, tests, mechanism scripts, schema/migration, package/lockfile, e2e artifacts, generated browser artifacts, private environment file patterns, materials, or paper assets is a hard block for a fast lane batch.

## Queue Fields

Fast lane metadata uses flat YAML keys so existing PowerShell parsers keep working:

- `fastLaneEligible: true`
- `fastLaneLane: docs_only`
- `fastLaneBatchId: <batch-id>`
- `fastLaneBatchRole: parent|child`
- `fastLaneBatchChildren` on the parent task only.

The parent task is a real queue task that owns batch rollup evidence and audit. Each child is also a real queue task and must keep its own plan, evidence, and audit review.

## Evidence Rules

Every parent and child evidence file must contain:

- `result`
- `Batch range`
- `RED`
- `GREEN`
- `Commit`
- `localFullLoopGate`
- `threadRolloverGate`
- `automationHandoffPolicy`
- `nextModuleRunCandidate`
- `Cost Calibration Gate remains blocked`

If an evidence or audit file declares `needs_recheck`, it must also declare one of:

- `nextTaskPolicy: seeded` and a queued next task named by `nextModuleRunCandidate`;
- `nextTaskPolicy: intentionally_not_seeded` plus `nextTaskPolicyReason`.

## Readiness Modes

`Test-ModuleRunV2DocsOnlyBatchReadiness.ps1` supports:

- `-Mode shadow`: always exits 0 and reports `docsOnlyBatchShadowDecision: would_pass|would_block`.
- `-Mode hard_block`: exits non-zero on any blocker and reports `docsOnlyBatchDecision: pass` only when all checks pass.

Shadow mode is for rollout confidence and historical replay only. It cannot replace hard-block closeout.

## Integration Policy

Existing PreCommit, ModuleCloseout, and PrePush scripts keep their legacy behavior unless both batch parameters are supplied:

- `-DocsOnlyBatchId`
- `-DocsOnlyBatchMode shadow|hard_block`

When batch parameters are supplied, the scripts delegate to docs-only batch readiness in addition to their existing gates.

## Rollout

1. Add SOP, template, shadow readiness, and smoke coverage.
2. Replay shadow readiness against at least two historical docs-only tasks and one intentionally failing fixture.
3. After shadow passes, enable explicit hard-block batch mode in PreCommit, ModuleCloseout, and PrePush.
4. First real batch trial is limited to two or three docs-only child tasks and must keep all high-risk gates blocked.
