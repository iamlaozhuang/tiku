# Advanced Edition Module Run v2 Mechanism Upgrade

## Task

- task id: `advanced-edition-module-run-v2-mechanism-upgrade`
- task kind: `docs_only`
- branch: `codex/module-run-v2-mechanism-upgrade`
- date: `2026-06-08`
- approval: User requested implementation of the Module Run v2 mechanism upgrade plan.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/sop/security-review-gate.md`

## Scope

Upgrade the advanced edition advancement mechanism from the v1 small Batch rhythm to Module Run v2 local business closure rhythm.

Allowed changes:

- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- matching evidence and audit review

Blocked changes:

- product code under `src/**`
- tests under `tests/**` or `e2e/**`
- scripts or hook implementation under `scripts/**` or `.husky/**`
- dependency, package, or lockfile changes
- schema, migration, `src/db/schema/**`, or `drizzle/**`
- `.env.local`, `.env.example`, provider, secret, staging/prod/cloud/deploy, payment, or external-service work
- Cost Calibration Gate execution

## Implementation Steps

1. Update the domain module matrix to `moduleRunVersion: 2`, with six execution modules and seven-source-module traceability.
2. Add `localFullLoopGate`, `localProviderSandboxGate`, `threadRolloverGate`, `automationHandoffPolicy`, and `hookIntegrationMatrix`.
3. Update lifecycle, local-first, thread rollover, automated advancement, and code-stage seeding SOPs to consume Module Run v2.
4. Update `project-state.yaml` and `task-queue.yaml` with the active docs-only task and current Git recovery SHA.
5. Write evidence and audit review, including the two required reviews: mechanism consistency and dry-run review.
6. Run docs-only validation and formatting finalization before committing.

## Review Requirements

Mechanism Consistency Review must confirm:

- ADR environment boundaries remain intact.
- blocked gates are not weakened.
- `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log` evidence redaction remains explicit.
- Cost Calibration Gate remains blocked.

Dry-Run Review must simulate:

- `authorization-and-access`
- `ai-task-and-provider`

The dry run must not change product code and must verify eight-Batch limit, thread rollover thresholds, local provider sandbox decisions, and hook matrix decisions.

## Validation Commands

- `git diff --check`
- scoped `prettier --write`
- scoped `prettier --check`
- required anchor check for `Module Run v2`, `localFullLoopGate`, `localProviderSandboxGate`, `threadRolloverGate`, `hookIntegrationMatrix`, `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, `ai_call_log`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

Docs-only task: product lint/typecheck/tests are not part of this mechanism update. Script or hook implementation will require a separate approved task.

## Stop Conditions

Stop immediately if:

- validation fails and cannot be fixed within docs-only scope;
- changed files leave the allowed docs/state/evidence/audit set;
- a script, hook implementation, product code, dependency, schema, env/secret, provider, staging/prod/cloud/deploy, payment, or external-service change becomes necessary;
- local provider sandbox wording would imply permission to read secrets or record provider payloads;
- Cost Calibration Gate execution is requested or implied.
