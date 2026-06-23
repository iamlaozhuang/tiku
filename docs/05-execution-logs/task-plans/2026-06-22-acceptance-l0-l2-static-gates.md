# Acceptance L0-L2 Static Gates Task Plan

taskId: acceptance-l0-l2-static-gates-2026-06-22
branch: codex/acceptance-l0-l2-static-gates-20260622
createdAt: "2026-06-22T14:05:00-07:00"
status: validated

## Read Inputs

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-22-standard-advanced-mvp-acceptance-execution-plan.md`
- `package.json`

## Scope

This task executes only the L0-L2 local static gate command set declared in the task queue:

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`

Allowed outputs are project state, task queue, this task plan, redacted evidence, and audit review records.

## Boundaries

This task does not modify source code, tests, scripts, dependencies, package files, lockfiles, schema, migrations,
database data, env files, secrets, Provider configuration, staging/prod/cloud resources, payment/external services, or
account data. It does not start a dev server, run browser/e2e validation, call Provider/model APIs, execute Cost
Calibration, or claim previewReleaseReady, productionReady, L6 readiness, L8 release readiness, or final product
acceptance.

## Execution Approach

1. Mark the task claimed in queue and project state.
2. Run the declared commands exactly, preserving pass/fail evidence.
3. Record concise command results without raw secret, env, Provider payload, database URL, prompt, raw generated
   content, employee answer, full paper content, or plaintext redeem code exposure.
4. If every command passes, close this static gate and set the next serial candidate to the use case matrix task.
5. If any command fails, stop and record the smallest repair boundary.

## Validation Plan

In addition to the declared L0-L2 command set, run the Module Run v2 pre-commit hardening and closeout readiness checks
for this task before committing.
