# Module Run v2 Auto-Seed Bridge Implementation Plan

## Task

Implement the Module Run v2 three-layer auto-seed bridge:

1. seed proposal;
2. seed transaction;
3. seed self-review;
4. runner integration from `no_executable_task` into guarded seed proposal or approved seed transaction.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- latest closeout evidence and audit for `module-run-v2-idle-and-hygiene-hardening`

## Scope

Allowed:

- Add deterministic local PowerShell scripts for proposal, transaction, and self-review.
- Add smoke tests using temporary fixture repositories only.
- Update runner control flow for `no_executable_task`.
- Update governance SOP/schema/index/state/queue/evidence/audit for this mechanism task.

Blocked:

- `package.json` or lockfile changes.
- Dependency installation or package upgrades.
- Schema, migration, destructive DB operation, raw SQL.
- Env/secret writes or reads.
- Provider calls or Cost Calibration Gate execution.
- Product implementation tasks beyond seeded queue metadata.
- Staging/prod/cloud/deploy/payment/external-service work.

## Implementation Plan

### Step 1: Durable Task Setup

- Add this task plan.
- Add `module-run-v2-auto-seed-bridge` to the active queue.
- Update `project-state.yaml` current task to this mechanism task.

### Step 2: Seed Proposal Layer

- Create `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`.
- The script must be read-only.
- It must identify the next seedable execution module from:
  - current queue state;
  - execution module dependency order;
  - matrix `targetLocalClosure`;
  - lack of executable pending tasks.
- It must output:
  - `seedProposalDecision`;
  - `seedModule`;
  - `seedSourcePlanningTask`;
  - `seedCandidateTaskCount`;
  - candidate task ids;
  - required approval text;
  - blocked remainder anchors.
- If dependencies are unclear or no module is seedable, it must return a zero-exit proposal/no-candidate result, not write files.

### Step 3: Seed Transaction Layer

- Create `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`.
- Default mode must be `-PlanOnly`, with no repository writes.
- Apply mode must require:
  - explicit `-Apply`;
  - explicit `-ApprovalStatement`;
  - clean `task-queue.yaml` candidate task id uniqueness;
  - max batch count no greater than matrix policy.
- It must write only queue entries and optional plan/evidence/audit paths that the transaction owns.
- It must not mark seeded tasks done.

### Step 4: Seed Self-Review Layer

- Create `scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.ps1`.
- It must validate:
  - target module coverage or explicit blocked remainder;
  - every seeded task has required fields;
  - every seeded task has `autoDriveLocalImplementationApproval`;
  - allowed/blocked files do not cross high-risk surfaces;
  - validation commands include lint, typecheck, focused test anchor, diff check, closeout readiness;
  - evidence redaction anchors are present;
  - Cost Calibration Gate remains blocked.

### Step 5: Runner Integration

- Update `Invoke-ModuleRunV2AutopilotRunner.ps1`.
- On `no_executable_task`:
  - call seed proposal;
  - if no candidate, return quiet idle;
  - if candidate and auto-seed is not explicitly allowed, return `seed_proposal_available`;
  - if auto-seed is explicitly allowed and approval is present, run seed transaction and self-review, then loop back to startup readiness.

### Step 6: Smoke Tests

- Add smoke tests for proposal, transaction, self-review, and runner bridge behavior.
- Use temporary fixtures; do not modify durable repo state during smoke.
- Verify:
  - proposal-only path;
  - no-approval path;
  - apply path in fixture;
  - self-review pass and hard-block cases;
  - runner no-executable bridge does not idle when a proposal is available.

### Step 7: Governance Updates

- Update `automated-advancement-governance.md`.
- Update `code-stage-task-seeding-governance.md`.
- Update `autodrive-control-schema.yaml`.
- Update `mechanism-source-of-truth-index.yaml`.

### Step 8: Full Self-Check

- Run smoke tests.
- Run startup readiness in the current branch.
- Run autodrive schema readiness for this task.
- Run control loop acceptance.
- Run lint/typecheck if local tooling is available.
- Run `git diff --check`.
- Write evidence and audit review.

## Expected Result

`no_executable_task` becomes a guarded bridge:

```text
no_executable_task
-> seed proposal
-> approved seed transaction when allowed
-> seed self-review
-> startup readiness sees pending tasks
```

The default remains safe: without approval, automation returns a seed proposal and does not write queue entries.

## Risks

- Queue parsing is line-oriented YAML-like parsing. Keep generated task blocks simple and deterministic.
- The seed transaction must avoid broad product implementation claims.
- Runner integration must not write on normal scheduled wakeups unless durable approval is explicit.
- Self-review must stop on high-risk surfaces instead of silently downgrading them.
