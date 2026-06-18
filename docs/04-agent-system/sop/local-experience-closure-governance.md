# Local Experience Closure Governance

## Purpose

This SOP defines how Tiku moves from code or seed completion to local user-role experience closure. It is a governance
document for Module Run v2 task selection and closeout. It does not approve product code changes, schema changes,
provider calls, browser execution, deployment, or external-service work by itself.

## Closure Vocabulary

Use these terms precisely in task plans, evidence, audits, project state, and queue entries:

| Term                | Meaning                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `seed complete`     | A module has enough source, contracts, or tests to stop automatic seed generation. It is not a user-flow closure. |
| `experience closed` | A named actor can complete the local role flow from an entry surface with fresh evidence and redaction checks.    |
| `release ready`     | Local experience closure plus all approved release, provider, staging, production, and deployment gates.          |

Do not use `complete`, `done`, or `closed` without specifying which layer is being claimed.

## Coverage Status Model

Every local experience coverage row must use exactly one status:

| Status                   | Required meaning                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| `missing`                | No meaningful local implementation surface is present for the use case.                             |
| `partial`                | Some code, contract, test, or evidence exists, but the role flow is not ready for local validation. |
| `local_experience_ready` | Entry, API or service, validation surface, and safe local data path exist for a targeted audit.     |
| `experience_closed`      | Fresh local evidence proves the named role flow, and redaction checks passed.                       |
| `release_blocked`        | Local closure may be adequate, but release depends on explicit high-risk gates.                     |

`experience_closed` requires a fresh evidence anchor in the coverage matrix. Historical source presence, unit tests, or
service-only implementation are not sufficient.

## Matrix Rules

The canonical local experience coverage state lives in
`docs/04-agent-system/state/local-experience-coverage-matrix.yaml`.

Each row must include:

- `useCaseId`
- `edition`
- `actor`
- `entrySurface`
- `apiSurface`
- `serviceSurface`
- `repositorySurface`
- `uiSurface`
- `unitEvidence`
- `e2eEvidence`
- `freshEvidence`
- `status`
- `blockedGate`
- `nextTask`

Rows may point to `not_found`, `not_required`, or `blocked_by_governance` where applicable, but they must not omit keys.

## Task Selection Rules

Queue recommendations should prefer this progression:

```text
missing -> partial -> local_experience_ready -> experience_closed -> release_blocked
```

For a task to change a coverage row status, the task must declare:

- the target `useCaseId`;
- the actor and entry surface;
- the current status and intended next status;
- the evidence required to justify that transition;
- the blocked gates that remain after the transition.

Tasks that only add service, contract, validator, or repository code should not claim `experience_closed` unless they also
produce local role-flow evidence from an approved entry surface.

## Local Experience Audit Profile

`local_experience_audit` is for readiness and coverage work. It may read requirements, source, tests, execution logs, and
run local read-only diagnostics. It must not start a dev server, run Browser or Playwright runtime validation, call a
provider, or touch staging/prod/cloud/deploy/payment/external-service resources.

Use `local_full_flow` only when a queued task explicitly approves `localFullFlowGate: approved_localhost_only`.

## Authorization Package Templates

Every queued local experience task should materialize an authorization package before execution. The package is part of
the task record, not a separate memory or chat assumption.

### `local_experience_audit`

Use this package for coverage refresh, readiness audit, and closure-readiness audit tasks.

Required task fields:

- `humanApproval`: states whether the current prompt approves execution and closeout, or states that fresh execution
  approval is still required.
- `useCaseId`: one concrete use case or `all-standard-and-advanced-use-cases` for matrix-wide audits.
- `targetStatusTransition`: current-to-target coverage transition, such as
  `unverified_matrix_seed_to_current_fact_classified`.
- `actor` and `entrySurface`: the user role or agent role and the audited entry surface.
- `freshEvidenceRequirement`: exact evidence anchors and redaction requirements.
- `closeoutPolicy`: local commit, fast-forward merge, push, and cleanup decisions.
- `validationCommandLifecycle`: `pre_edit`, `post_edit`, and `closeout` commands.

Default allowed actions:

- read requirements, traceability, source, tests, e2e spec names, evidence, audit, and state files;
- run `Get-TikuProjectStatus.ps1`;
- run `Get-TikuNextAction.ps1 -VerboseHistory`;
- run read-only diagnostics;
- run `npm.cmd run test:e2e -- --list`;
- update coverage matrix, project-state, task-queue, task plan, evidence, and audit when the task permits those files.

Default blocked actions:

- dev server, Browser, Playwright runtime validation, full e2e, provider/model call, env/secret access or output,
  schema/drizzle/migration, package/lockfile/dependency change, staging/prod/cloud/deploy/payment/external-service, PR,
  force-push, raw/private data exposure, public identifier inventory, and Cost Calibration Gate.

Closeout rule:

- Low-risk docs/state-only audit tasks may use task-scoped local commit, fast-forward merge to `master`, push
  `origin/master`, and short-branch cleanup only when the task record explicitly approves those actions and hard-block
  precommit, module-closeout, pre-push, redaction, and remote-alignment gates pass.

### `local_full_flow`

Use this package only for one approved localhost role flow.

Required task fields:

- `executionProfile: local_full_flow`;
- `localFullFlowGate: approved_localhost_only`;
- one `useCaseId`, actor, entry surface, and target spec or route-flow;
- allowed hosts limited to `localhost`, `127.0.0.1`, and `::1`;
- evidence boundary that excludes screenshots, traces, DOM dumps, row/private data, public identifier inventories, raw
  prompts, raw answers, provider payloads, secrets, tokens, cookies, Authorization headers, and DB URLs.

Default blocked actions:

- full e2e suite, headed/debug browser mode, new or edited e2e specs, provider/model call, env/secret, schema/drizzle,
  dependency/package/lockfile, staging/prod/cloud/deploy/payment/external-service, PR, force-push, and Cost Calibration
  Gate unless a later task explicitly approves them.

### `release_blocked`

Use this package to prepare high-risk future approval work. It must not execute the high-risk gate by itself.

Required package content:

- gate name and owner;
- target environment or resource class;
- allowed files and blocked files;
- data handling and redaction boundary;
- secret/env handling plan without reading or outputting values;
- provider/quota/cost boundary when relevant;
- schema/migration/dependency boundary when relevant;
- validation commands and rollback or stop decision;
- explicit statement that local experience closure does not imply release readiness.

Default blocked actions:

- provider/model execution, staging/prod/cloud/deploy/payment/external-service, env/secret access/output/edit,
  dependency/package/lockfile, schema/drizzle/migration, destructive data operation, PR, force-push, and Cost Calibration
  Gate until a separate fresh approval package names and approves the exact gate.

## Anti-Drift Checklist

Before closing a task that touches local experience governance, confirm:

- The task names at least one `useCaseId`.
- The task has a complete authorization package with `humanApproval`, `closeoutPolicy`, and
  `validationCommandLifecycle` when it is queued for execution.
- Any `experience_closed` claim has fresh evidence.
- A local mock or `local_contract_only` result is not described as release readiness.
- Provider, staging, prod, deploy, payment, external-service, env/secret, dependency, schema, and Cost Calibration gates
  remain blocked unless the task explicitly approved them.
- Evidence does not include secrets, tokens, Authorization headers, DB URLs, raw prompts, raw answers, provider payloads,
  public identifier inventories, row data, or private data.
- The task did not mix unrelated use cases or modules into one closeout claim.
