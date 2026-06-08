# Automation Readiness Scorecard And Mode Transition Governance SOP

## Status

Active for Module Run v2 local automation readiness governance.

This SOP defines how Tiku evaluates automation readiness and proposes mode transitions. It does not approve changing `project-state.yaml` `automation.mode`, code-stage queue seeding, product code implementation, dependency changes, schema or migration work, env/secret work, provider work, staging/prod/cloud/deploy work, payment work, external-service work, thread creation, worktree creation, parallel worker execution, or Cost Calibration Gate execution. Cost Calibration Gate remains blocked.

## Purpose

Make automation readiness measurable before changing execution behavior.

The scorecard must prevent:

- treating completed SOP documents as automatic execution approval;
- upgrading automation mode without evidence;
- hiding blocked gates behind readiness language;
- using local-only validation to claim staging, prod, provider, payment, or external-service readiness;
- changing automation mode as a side effect of another docs-only task.

## Mode Labels

Use these labels when discussing automation state:

| Label                    | Meaning                                                         | Allowed action                                     |
| ------------------------ | --------------------------------------------------------------- | -------------------------------------------------- |
| `semi_auto`              | agent advances only after explicit user-directed rounds         | legacy baseline                                    |
| `docs_auto_candidate`    | docs-only governance tasks may be proposed for automatic run    | proposal only, not mode change                     |
| `local_auto_candidate`   | local-completable Module Run v2 work may be proposed            | current project state; requires queued approval    |
| `guarded_auto_candidate` | limited automatic task claiming may be proposed                 | requires scorecard pass and explicit mode approval |
| `blocked`                | automation must stop because a required gate or state is unsafe | no automatic advancement                           |

Do not write a candidate label into `project-state.yaml` as `automation.mode` unless a later mode transition task explicitly approves it.

## Scorecard Dimensions

Score readiness across these dimensions:

| Dimension            | Pass evidence                                                                                   | Blocking examples                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| governance stack     | required SOPs exist and have evidence/audit review                                              | missing lifecycle, retry, handoff, or gate SOP                                   |
| task queue health    | tasks have dependencies, `taskKind`, allowed and blocked files, risk types, validation commands | ambiguous task, missing dependency, shared file conflict                         |
| project state health | `project-state.yaml` recovery SHA agrees with Git or accepted post-closeout rule                | unknown drift, unpushed work, stale handoff                                      |
| Git closeout health  | clean workspace, aligned `master` / `origin/master`, no unmerged short branch residue           | dirty tree, remote divergence, unknown worktree                                  |
| validation health    | task gates and broader quality gates are available and recently passing                         | unavailable lint/typecheck/test/format when needed                               |
| evidence hygiene     | evidence records commands, redaction, blocked gates, residual risks                             | secrets, raw prompts, raw answers, cleartext `redeem_code`, full `paper` content |
| tool readiness       | required skills/plugins are session-ready or fallback is documented                             | missing required tool with no fallback                                           |
| recovery readiness   | latest task plan, evidence, audit review, and handoff are recoverable                           | chat summary is the only recovery source                                         |
| risk gate isolation  | blocked gates are named and excluded                                                            | provider, env/secret, staging/prod/cloud/deploy, payment, external-service need  |
| approval clarity     | human approval scope is explicit for the proposed mode                                          | implied approval or old approval reused for new risk                             |
| unattended control   | local stop-decision and thread-decision scripts pass                                            | no machine-readable continue/stop decision                                       |

A single blocking example makes the overall result `blocked` until resolved or accepted by explicit human decision.

## Readiness Verdicts

Use these verdicts:

| Verdict                         | Meaning                                             | Next action                            |
| ------------------------------- | --------------------------------------------------- | -------------------------------------- |
| `ready_for_docs_auto_proposal`  | docs-only automatic claiming can be proposed        | create a mode transition proposal task |
| `ready_for_local_auto_proposal` | local-first implementation planning can be proposed | create a scoped approval task          |
| `ready_with_warnings`           | safe for current mode, not enough for upgrade       | keep current mode and record warnings  |
| `not_ready`                     | missing evidence or unresolved warning              | run readiness/audit tasks first        |
| `blocked`                       | blocked gate or unsafe state exists                 | stop until human decision              |

Do not use `ready` without a suffix. The suffix must state what kind of automation is being proposed.

## Minimum Scorecard For Docs-Only Automation

Docs-only automatic proposal needs all of the following:

- governance stack pass;
- task queue health pass for the docs-only batch;
- project state health pass or accepted post-closeout SHA rule;
- Git closeout health pass;
- docs validation health pass;
- evidence hygiene pass;
- recovery readiness pass;
- risk gate isolation pass;
- approval clarity pass.

Even when this passes, the next step is a proposal, not an automatic mode change.

## Minimum Scorecard For Local Implementation Planning

Local implementation planning proposal additionally needs:

- requirements source and module boundary are current;
- code-stage queue seeding is explicitly approved or remains excluded;
- task kinds separate implementation, dependency, schema, migration, authorization permission model, provider, env/secret, staging/prod/cloud/deploy, payment, and external-service work;
- local validation ladder level is named for each candidate task;
- security and evidence redaction requirements are attached to `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, and `ai_call_log` tasks;
- Cost Calibration Gate remains blocked unless a fresh approval task changes it.

This scorecard may propose local-completable planning work, but it does not approve product code.

## Mode Transition Gate

A mode transition task must:

1. Create a dedicated task plan.
2. Read all governance SOPs and latest evidence.
3. Run the scorecard and record every dimension.
4. State the proposed target mode label.
5. State allowed task kinds.
6. State forbidden task kinds.
7. State blocked gates.
8. Record human approval needed before changing `project-state.yaml`.
9. Run validation and audit review.
10. Commit the mode transition separately from implementation, dependency, schema, env/secret, provider, deploy, payment, or external-service work.

Changing `automation.mode` must be the primary purpose of the task, not a side effect.

`guarded_auto_candidate` may be proposed only after unattended control evidence shows:

- `Test-ModuleRunV2UnattendedReadiness.Smoke.ps1` passes;
- `Test-ModuleRunV2ThreadRolloverReadiness.Smoke.ps1` passes;
- the current task can produce `unattendedStopDecision: continue`;
- required-new-thread decisions stop with a non-zero exit;
- blocked gates remain excluded.

## Automatic Advancement Blockers

Automatic advancement remains blocked when any item is true:

- Cost Calibration Gate execution would be required;
- provider cost measurement, real provider call, provider quota, provider endpoint, or provider fallback configuration is needed;
- env/secret work, `.env.local`, `.env.example`, token, password, or database URL work is needed;
- staging, prod, cloud, deploy, public endpoint, callback URL, TLS, object storage, or production-like resource work is needed;
- payment, pricing, invoice, refund, reconciliation, or external-service work is needed;
- dependency, package, lockfile, CLI, SDK, schema, migration, destructive data operation, or `drizzle-kit push` is needed without approval;
- authorization permission model changes are needed without a dedicated approval path;
- Git state, branch ownership, worktree ownership, or remote alignment is ambiguous;
- required skill/plugin is unavailable and no approved fallback exists;
- evidence would expose protected content;
- current approval scope does not name the proposed automation mode.

## Evidence Shape

Scorecard evidence should include:

```text
current mode:
proposed verdict:
target mode label:
scorecard dimensions:
blocking items:
warnings:
allowed task kinds:
forbidden task kinds:
blocked gates:
approval needed:
validation commands:
audit review:
final recommendation:
```

Evidence must not include secrets, tokens, database URLs, Authorization headers, provider payloads, raw prompts, raw answers, cleartext `redeem_code`, private answer text, full `paper` content, or raw generated AI content.

## Stop Conditions

Stop mode transition work when:

- the scorecard has any unresolved blocker;
- the target mode label is ambiguous;
- the user approval does not explicitly allow a mode transition;
- the transition would require blocked gate execution;
- the transition would require product code, dependency, schema, migration, env/secret, provider, deploy, payment, or external-service work;
- evidence cannot be kept redacted;
- Git or project state recovery is uncertain.

## Forbidden Claims

Do not claim:

- `semi_auto` has been upgraded when only the scorecard SOP was written;
- docs-only readiness approves product code implementation;
- local readiness proves staging, prod, provider, payment, or external-service readiness;
- automatic task claiming is safe without queue and state evidence;
- `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, or `ai_call_log` runtime behavior is ready from scorecard-only evidence;
- Cost Calibration Gate readiness while it remains blocked.
