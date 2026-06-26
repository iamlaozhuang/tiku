# Batch Execution Package Governance SOP

## Status

Active for mechanism tuning, serial approval packages, local implementation chains, and capped local smoke chains after
this SOP is referenced by the active task queue entry.

This SOP does not approve product implementation by itself. It defines how a human-approved task package may front-load
scope, validation, evidence, and closeout boundaries for several serial tasks.

## Purpose

Reduce repeated stop-start approval and validation overhead without weakening blocked gates.

The package pattern is:

```text
one package boundary -> 3 to 5 serial tasks -> each task still has its own branch, plan, evidence, audit, validation,
commit, and closeout decision
```

The package must make the high-risk boundary explicit before any child task begins. Later child tasks may consume only
the capabilities recorded in the package and their own task entry.

## Package Size And Shape

A batch execution package may include 3 to 5 serial tasks when all tasks serve one verifiable closure. Examples:

- approval package -> contract and adapter TDD -> local route smoke -> provider/cost approval package;
- readonly preflight -> focused source TDD -> capped local route smoke;
- docs/state boundary package -> mechanism script hardening -> smoke runner self-check.

Do not use this package for unrelated work streams. A package that mixes independent modules must be split.

Each child task still needs:

- task id;
- short branch;
- task plan;
- allowed files and blocked files;
- approval and capability boundary;
- validation command list;
- evidence;
- audit review when governance, state, scope, redaction, scripts, or blocked gates change;
- one focused commit unless the task explicitly records a different closeout shape.

## Boundary Table

Every package must declare a table or YAML block that answers these questions before child execution:

- Which child tasks may change docs/state only?
- Which child tasks may change product source or tests?
- Which child tasks may run focused unit tests?
- Which child tasks may connect to local DB, and whether the access is readonly or draft-only mutation?
- Which child tasks may run route smoke, with maximum request count and maximum data writes?
- Which child tasks may read a credential alias, call a Provider, or spend budget?
- Which child tasks may run browser/e2e/dev-server validation?
- Which child tasks may execute schema/migration or dependency changes?
- Which child tasks may publish student-visible content?
- Which actions remain blocked for the whole package?

If a later task needs a capability not present in the boundary table, stop and create a new approval package.

## Preflight First

Any task that intends to run local DB, route, Provider, browser/e2e, or publish validation should have a readonly or
low-cost preflight step before the expensive or mutating action.

Preflight may check:

- route handlers are importable;
- actor context exists without recording private identifiers;
- local server or route test target is reachable;
- migration journal or schema metadata is coherent;
- required local fixture label exists;
- command and evidence paths exist;
- credential alias presence when fresh approval allows alias read.

Preflight must not mutate DB, call Provider, read secret values, start browser/e2e, or publish content unless the task
explicitly approves that action.

## Task Granularity

Choose a task size that closes one testable loop.

Good task granularity:

- contract plus adapter TDD in one task;
- repository plus service TDD in one task when they form one behavior closure;
- route integration plus capped local route smoke in one task when source changes are already approved;
- docs approval package plus state/queue materialization in one task.

Overly small task granularity should be avoided when it creates repeated docs/state/queue/commit/merge/push work without
improving review safety.

Keep separate tasks for:

- schema/migration execution;
- dependency or lockfile changes;
- Provider/cost execution;
- formal publish or student-visible content;
- staging/prod/deploy/payment/external-service work;
- PR or force push.

## Validation Layering

Use the narrowest validation layer that proves the changed surface.

Docs/state only:

- scoped Prettier write/check for changed docs/state/evidence/audit/task-plan files;
- `git diff --check`;
- Module Run v2 hardening or readiness scripts relevant to the task.

Mechanism PowerShell script:

- focused script smoke for the changed script;
- scoped Prettier for docs/state files;
- `git diff --check`;
- Module Run v2 hardening.

Source code:

- focused unit tests first;
- add route/repository/local DB tests only when the task approves that layer;
- run `lint` and `typecheck` after focused behavior passes;
- do not repeat unrelated route smoke or full suites unless the source change affects shared runtime behavior.

Route smoke:

- run readonly preflight first when available;
- cap request count and data writes;
- record redacted command/status/count evidence only;
- do not rerun unrelated broad tests unless the task changed shared source.

Provider or cost:

- execute only after fresh task approval;
- cap provider/model, credential alias, call count, retry count, token count, and budget;
- do not treat token usage evidence as Cost Calibration unless the Cost Calibration Gate is explicitly approved.

## Redacted Smoke Runner

Use `scripts/agent-system/Invoke-ModuleRunV2RedactedSmokeRunner.ps1` for future governed smoke commands when practical.

The runner:

- defaults to dry-run and requires `-Execute` to run a command;
- caps attempts to one per invocation;
- records summary-only JSON;
- records command fingerprints instead of raw arguments;
- records stdout/stderr counts and hashes, not raw output;
- deletes transient raw output files before exit;
- does not approve DB, Provider, env/secret, browser/e2e, staging/prod, deploy, payment, external-service, publish, or
  Cost Calibration work.

The caller's task approval remains authoritative. Passing the runner does not prove the underlying capability was
approved.

## Minimal State And Queue Template

New task packets should prefer the minimal template under
`docs/04-agent-system/templates/module-run-v2-execution-package-template.yaml`.

Required fields are:

- task id and title;
- phase or package id;
- task kind;
- execution profile;
- validation policy;
- status;
- required outcome;
- capabilities;
- allowed files;
- blocked files;
- validation commands;
- plan, evidence, and audit paths;
- closeout policy;
- blocked gates;
- validation summary.

Do not duplicate non-authoritative narrative state across multiple files. Evidence records observed facts; queue owns
task status and scope; project-state owns current pointer and accepted checkpoint.

## Closeout

Batch execution packages may approve local commit, merge, push, and cleanup only when that approval is explicit and
materialized into each child task's `closeoutPolicy`.

If a package changes mechanism scripts, product source, tests, runtime validation, DB, Provider, or other non-docs
surfaces, docs-only fast-lane approval is not sufficient. Use task-specific closeout approval or stop after local commit.

## Forbidden Claims

Do not claim:

- staging/prod/release readiness from local validation;
- runtime behavior from docs-only tasks;
- Provider readiness from mock or dry-run evidence;
- Cost Calibration from token summaries;
- publish or student-visible content from draft-only adoption;
- final Pass from any execution package unless final acceptance was separately approved and proven.

Cost Calibration Gate remains blocked unless a later task explicitly approves it.
