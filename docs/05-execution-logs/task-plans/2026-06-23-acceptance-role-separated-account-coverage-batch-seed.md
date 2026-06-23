# Acceptance Role Separated Account Coverage Batch Seed Plan

## Task

- taskId: `acceptance-role-separated-account-coverage-batch-seed-2026-06-23`
- branch: `codex/role-separated-account-coverage-batch-20260623`
- taskKind: `docs_state_governance_seed`
- phase: `standard-advanced-mvp-role-separated-account-coverage-batch-2026-06-23`
- user request: after runtime blocker final review closeout, start the next batch to fill role-separated account coverage.

## References Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-runtime-blocker-final-review.md`
- `docs/05-execution-logs/evidence/2026-06-23-runtime-blocker-final-review-branch-merge-push-cleanup.md`

## Scope

Create a docs/state-only seed for the role-separated account coverage batch. This task may define the coverage matrix,
serial execution order, approval boundaries, evidence rules, and next executable scope-approval task.

This seed does not create accounts, edit fixtures, run seeds, start a dev server, use the browser, run Playwright, change
database data, read secrets, or claim final acceptance `Pass`.

## Why This Batch Comes Next

The latest final review remained `Blocked` because role-separated final coverage is still partial or unproven, while
Provider, Cost Calibration, and staging are external gates. Role-separated account coverage should be completed first
because it is the local identity and authorization baseline that later Provider, Cost, and staging evidence will rely on.

## Planned Files

- Create:
  - `docs/05-execution-logs/task-plans/2026-06-23-acceptance-role-separated-account-coverage-batch-seed.md`
  - `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-coverage-batch-plan.md`
  - `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-coverage-batch-seed.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-role-separated-account-coverage-batch-seed.md`
- Modify:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`

## Serial Approach

1. Seed the batch and register the coverage matrix.
2. Prepare a scope approval package that states whether existing seeded local accounts are enough and what evidence may be
   collected.
3. Inventory existing seeded local accounts and test-only fixtures without exposing passwords in evidence.
4. Decide whether missing roles need new test-only fixture accounts or seeded local accounts.
5. Run local role-separated walkthrough only after explicit approval.
6. Review whether the role-separated blocker can be closed or must remain `Blocked`.

## Coverage Targets

Mandatory role contexts:

- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`
- `org_standard_admin`
- `org_advanced_admin`
- `content_admin`
- `ops_admin`

Boundary contexts:

- `unauthenticated_visitor`
- `super_admin` as setup and governance comparison only
- `auditor` only if the application has a distinct read-only evidence/audit role

## Boundaries

Allowed:

- Docs/state batch registration.
- Natural-language role coverage plan.
- Redacted task plan, evidence, and audit review.
- Local formatting and governance validation.
- Local commit after validation.

Blocked unless separately approved in a later task:

- Account creation, account disablement, password reset, or fixture mutation.
- Database seed, migration, schema, direct SQL, or data mutation.
- Dev server startup, browser walkthrough, Playwright, or e2e runtime execution.
- `.env*`, secret, token, database URL, Auth header, cookie, localStorage, or credential access.
- Provider/model calls, Provider configuration, Cost Calibration, staging, production, cloud deploy, payment,
  external-service work, dependency changes, PR, force push, and final acceptance `Pass`.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/05-execution-logs/task-plans/2026-06-23-acceptance-role-separated-account-coverage-batch-seed.md docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-coverage-batch-plan.md docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-coverage-batch-seed.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-role-separated-account-coverage-batch-seed.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml
npx.cmd prettier --check --ignore-unknown docs/05-execution-logs/task-plans/2026-06-23-acceptance-role-separated-account-coverage-batch-seed.md docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-coverage-batch-plan.md docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-coverage-batch-seed.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-role-separated-account-coverage-batch-seed.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-coverage-batch-seed-2026-06-23
```

## Stop Conditions

- A task would need credentials, secrets, raw cookies, raw localStorage, provider payloads, database URLs, raw prompts, raw
  AI outputs, raw answer content, or staging/prod data in evidence.
- A missing role requires account creation, fixture changes, seed execution, or DB mutation without fresh approval.
- A runtime walkthrough is requested before account scope and redaction rules are approved.
- Evidence shows privilege escalation, cross-tenant data exposure, or inability to prove role separation.
