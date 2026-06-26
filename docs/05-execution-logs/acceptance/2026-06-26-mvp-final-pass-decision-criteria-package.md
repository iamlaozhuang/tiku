# MVP Final Pass Decision Criteria Package

Package id: `MVP_FINAL_PASS_DECISION_CRITERIA_PACKAGE_2026_06_26`

Prepared by Codex as a docs-only criteria package. This package does not enter the MVP final Pass decision process and
does not claim Standard/Advanced MVP final Pass.

## Purpose

Define the criteria for deciding whether the owner may start a later MVP final Pass decision process, and separate those
criteria from external or release gates that still require fresh task-specific approval.

## Decision Scope Types

| Scope type                               | Meaning                                                                                                                                                                                    | Current entry decision                                                                              |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Local product acceptance decision        | A human-owned review of local redacted evidence for Standard/Advanced MVP role-separated behavior, explicitly excluding Provider/Cost/`staging`/`prod`/payment/external-service readiness. | May enter only if all Local Entry Criteria below remain true and the owner records the exclusion.   |
| Release or production readiness decision | A decision that includes `staging`, `prod`, deployment, cloud resources, production data/secrets, migration/rollback, payment, Provider, Cost, or external-service readiness.              | Must not enter until the relevant External/Release Gate Criteria have separately approved evidence. |
| Real AI Provider readiness decision      | A decision that includes live model behavior, Provider credentials/configuration, prompts, fallback chains, quota, or cost assumptions.                                                    | Must not enter until Provider and Cost gates are separately approved and evidenced.                 |

## Local Entry Criteria

All criteria in this table must be true before the owner can enter a local-product MVP final Pass decision process.

| Criterion                           | Required state                                                                                                                                                                            | Current status                                                                                                              |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Full eight-row local browser matrix | Latest role-separated local browser evidence records all eight mandatory rows as pass.                                                                                                    | Met by `8 pass / 0 fail / 0 blocked`.                                                                                       |
| Evidence redaction                  | Runtime evidence and audit contain only redacted role/route/status/count summaries.                                                                                                       | Met by latest full eight-row evidence and audit.                                                                            |
| No final Pass already claimed       | Evidence and audit explicitly avoid Standard/Advanced MVP final Pass.                                                                                                                     | Met.                                                                                                                        |
| Owner decision package exists       | A package separates completed local browser evidence from unapproved external/release gates.                                                                                              | Met by `OWNER_ACCEPTANCE_DECISION_AFTER_FULL_8_ROW_LOCAL_BROWSER_PASS_2026_06_26`.                                          |
| Criteria package exists             | This package defines entry criteria and blocked external/release gates.                                                                                                                   | Met once this task is committed and pushed.                                                                                 |
| No stale product changes            | No product source, tests, schema, migration, seed, DB/account mutation, package/lockfile, env, Provider, or release change has landed after the latest full eight-row local browser pass. | Currently met for docs-only closeout since the latest browser pass; future product/runtime changes make the evidence stale. |
| Explicit owner scope statement      | Owner must state whether the later final Pass decision process is local-product only or includes external/release gates.                                                                  | Pending owner action.                                                                                                       |
| Explicit exclusion acknowledgement  | If the later process is local-product only, owner must acknowledge that Provider/Cost/`staging`/`prod`/payment/external-service readiness remains excluded.                               | Pending owner action.                                                                                                       |

## Stale Evidence Rules

The owner must not enter a final Pass decision process on stale local evidence. A new focused or full rerun is required
before entry if any of these changes occur after the latest full eight-row browser pass:

- product source, route guard, authorization, navigation, login/logout, UI copy affecting acceptance, or service behavior
  changes;
- tests, fixtures, seed, DB/account assignment, schema, migration, package/lockfile, or runtime configuration changes
  that can affect the eight-row matrix;
- env/secret, Provider configuration, feature flag, deployment target, or external-service changes that are included in
  the intended decision scope;
- owner expands the decision scope from local-product acceptance to release/production readiness.

Docs-only governance packages that do not change runtime behavior do not by themselves stale the local browser pass.

## External/Release Gate Criteria

These gates are not approved by local browser evidence. They require separate approval, execution, evidence, and audit
before they can be included in any final Pass decision.

| Gate                                      | Required approval before inclusion                  | Minimum evidence before inclusion                                                                                                                                    |
| ----------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Provider/model calls                      | Fresh Provider approval.                            | Redacted Provider smoke or explicit disabled-provider acceptance, model/fallback scope, prompt redaction, no raw payloads.                                           |
| Provider configuration                    | Fresh env/Provider configuration approval.          | Configuration inventory with secrets redacted, allowed models, fallback behavior, disabled-by-default controls where applicable.                                     |
| Cost Calibration Gate                     | Fresh Cost Calibration approval.                    | Quota/pricing/default decision, measured or explicitly deferred cost assumptions, owner acceptance of residual risk.                                                 |
| `staging` resources and deployment        | Fresh `staging` implementation/deployment approval. | Isolated `staging` resources, separated secrets, deployment result, migration/rollback rehearsal when applicable, owner acceptance flow, `prod` untouched statement. |
| `prod` release/readiness                  | Fresh production readiness and release approval.    | Production-only resources/secrets, backup/restore, migration/rollback plan, incident owner, data protection, release decision record.                                |
| Payment/external services                 | Fresh payment/external-service approval.            | Payment/external integration scope, callback/data boundary, redaction, failure handling, no unapproved production transaction.                                       |
| Env/secret work                           | Fresh env/secret approval.                          | Secret names and destinations only, no values in evidence, separation by `dev`/`staging`/`prod`.                                                                     |
| DB/seed/schema/migration/account mutation | Fresh DB/schema/account approval.                   | Redacted plan, exact target, backup/rollback or recovery statement, migration policy, no raw rows in evidence.                                                       |
| Dependency/package/lockfile changes       | Fresh dependency gate approval.                     | Dependency-introduction rationale, lockfile diff, validation evidence, Provider/env/schema/deploy gates if relevant.                                                 |
| PR, force push, deployment                | Fresh remote action approval.                       | Target, branch/environment, result, and rollback or recovery notes.                                                                                                  |

## Entry Decision Outcomes

| Owner choice                                    | Allowed next task                                                                | Meaning                                                                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Enter local-product final Pass decision process | `mvp-final-pass-decision-review-2026-06-26`                                      | The decision review may evaluate the local eight-row role-separated pass while excluding unapproved external/release gates. |
| Require external/release gate evidence first    | One selected approval package, for example Provider/Cost or `staging` readiness. | Final Pass decision remains blocked until the selected gate package closes.                                                 |
| Keep final Pass blocked                         | A docs-only next-decision or gate-prioritization package.                        | No final Pass review begins.                                                                                                |

## Required Owner Wording To Enter Local-Product Review

```text
I approve entering a local-product MVP final Pass decision review based on the committed full eight-row local browser
pass and the criteria package. Provider/Cost/staging/prod/payment/external-service readiness remains excluded unless I
approve separate gate tasks.
```

## Required Owner Wording To Include External/Release Gates

```text
I approve preparing a separate <gate-name> gate task before any final Pass decision includes that gate.
```

## Non-Decision Statement

This package defines criteria only. It is not a Standard/Advanced MVP final Pass decision, not a release readiness
decision, not a Provider/Cost approval, not a `staging` approval, not a `prod` approval, and not a payment or
external-service approval.
