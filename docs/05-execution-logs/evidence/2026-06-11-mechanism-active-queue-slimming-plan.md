# Mechanism Active Queue Slimming Plan Evidence

## Task

- id: `mechanism-active-queue-slimming-plan`
- branch: `codex/mechanism-active-queue-slimming`
- task kind: `docs_only`
- productClosureContribution: `none; mechanism budget item`

## Approval Boundary

User approved serial mechanism tuning while keeping local automation paused. This task may create a planning-only active
queue slimming policy and update scoped docs/state/evidence, then commit, fast-forward merge to `master`, push
`origin/master`, and clean the merged branch.

Blocked surfaces remain untouched: task entry move/delete/archive, product code, dependencies, lockfiles, schema,
migrations, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, PR, force push, and Cost
Calibration Gate.

## Changed Files

- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- task plan, evidence, and audit review for this task

## Validation Output

### Scoped Prettier Check

Command:

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs/04-agent-system/sop/active-queue-slimming-plan.md docs/04-agent-system/operating-manual.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/mechanism-source-of-truth-index.yaml docs/05-execution-logs/task-plans/2026-06-11-mechanism-active-queue-slimming-plan.md docs/05-execution-logs/evidence/2026-06-11-mechanism-active-queue-slimming-plan.md docs/05-execution-logs/audits-reviews/2026-06-11-mechanism-active-queue-slimming-plan.md
```

Result:

```text
Checking formatting...
All matched files use Prettier code style!
```

Exit code: `0`.

### Required Anchor Check

Command:

```powershell
Select-String -Path docs/04-agent-system/sop/active-queue-slimming-plan.md,docs/05-execution-logs/evidence/2026-06-11-mechanism-active-queue-slimming-plan.md -Pattern 'Active Queue Definition','Archive Eligibility','Non-Blocking Historical Findings','Future Archival Task Boundary','Cost Calibration Gate remains blocked','authorization','paper','mock_exam','redeem_code','audit_log','ai_call_log'
```

Result: all required anchors were found in the scoped SOP or evidence files.

Exit code: `0`.

### Diff Whitespace Check

Command:

```powershell
git diff --check
```

Result: no whitespace errors.

Exit code: `0`.

## Required Anchors

- `Active Queue Definition`
- `Archive Eligibility`
- `Non-Blocking Historical Findings`
- `Future Archival Task Boundary`
- `authorization`
- `paper`
- `mock_exam`
- `redeem_code`
- `audit_log`
- `ai_call_log`
- `Cost Calibration Gate remains blocked`

## Residual Risk

The plan is governance-only and does not perform actual task queue archival. Future archival still needs a separately
approved task with before/after counts, archive/index updates, and deterministic next-action/project-status checks.

## Taste Compliance Checklist

- No UI changes.
- No product code, database, schema, migration, API, dependency, lockfile, env/secret, provider, deployment, payment, PR,
  force-push, queue archival, or deletion changes.
- Cost Calibration Gate remains blocked.
