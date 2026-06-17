# Mechanism Tuning Authorization And Slimming Plan

## Status

Planning-only governance record.

This document collects the current consensus for reducing agent workflow friction while preserving Tiku safety, code
quality, and auditability. It does not directly authorize code implementation, task archival, dev server usage, Browser
usage, Playwright or e2e execution, schema changes, dependency changes, provider calls, push, PR, deployment, payment,
cloud, staging, production, or any external-service action.

## Goal

Tune the agent mechanism so local work can move farther under explicit, inspectable boundaries:

- keep hard safety gates intact;
- reduce repeated boilerplate in low-risk local tasks;
- preserve evidence and recovery quality while lowering token and time cost;
- allow local-only full-flow verification when the task profile explicitly permits it;
- keep project-state and task-queue files readable enough for cross-session recovery.

## First-Round Tuning Directions

1. **Standard execution profiles**: replace repeated per-task boilerplate with named profiles such as
   `docs_state_lite`, `local_unit_tdd`, `repository_runtime_tdd`, and `local_full_flow`.
2. **Evidence Lite**: allow low-risk docs/state or focused local-unit tasks to record compact evidence while retaining
   command outputs, redaction status, blocked remainder, and residual risk.
3. **Ready set selection**: move from strict exactly-one-pending behavior toward an explicit `ready_set` model where the
   agent can choose among dependency-satisfied low-risk tasks.
4. **Work packets**: allow a single approval package to cover a sequence of low-risk tasks within one module when their
   file scope, validation surface, and blocked gates are stable.
5. **Local full-flow gate**: permit localhost-only dev server, Browser, targeted Playwright, and local disposable data
   only under a dedicated profile and never as a staging, production, cloud, provider, or e2e substitute.
6. **State and queue slimming**: keep `task-queue.yaml` focused on active work and recovery windows, with historical
   terminal tasks moved to archive plus `task-history-index.yaml`.

## Second-Round Supplemental Directions

1. **Profile catalog and defaults**: define canonical profile names, defaults, and allowed capability envelopes; missing
   profile defaults to `legacy_explicit`.
2. **Risk-tier metadata**: attach a small risk tier to task profiles so scripts can distinguish docs/state, local unit,
   runtime unit, local full-flow, schema-isolated, dependency-isolated, and provider-local-smoke boundaries.
3. **Validation policy bundles**: centralize reusable validation surfaces as `docs_state`, `local_unit`, `runtime_unit`,
   `local_full_flow`, and `high_risk_isolated`.
4. **Queue selection compatibility**: support `ready_set` while preserving legacy exactly-one-pending behavior until the
   mechanism has enough smoke evidence.
5. **Dependency resolution through index**: allow active task dependencies to resolve through active queue or
   `task-history-index.yaml` after archival.
6. **Archive retention windows**: keep all non-terminal tasks plus a recent terminal recovery window in active queue;
   move only traceable terminal history.
7. **Conservative project-state cleanup**: annotate future split candidates but avoid splitting project-state before
   scripts and recovery order are updated.
8. **Closeout approval materialization**: keep standing approvals durable, but materialize them into task-level
   `closeoutPolicy` only when profile, risk tier, allowed files, and gates match.
9. **Local fixture contract**: distinguish disposable local fixtures from real database rows and private data; evidence
   must not expose row data or public identifier inventories.
10. **Evidence redaction anchors**: every evidence mode must explicitly state secret/env, private data, provider payload,
    raw prompt, raw answer, and public identifier inventory redaction status.
11. **Handoff compression**: prefer compact handoff summaries that point to source files instead of duplicating queue,
    evidence, or audit content.
12. **Stop taxonomy**: make blocker reasons machine-readable so repeated hard stops and true human-takeover cases are
    distinguishable.
13. **Script smoke matrix**: every mechanism script behavior change should have a focused smoke command or documented
    manual diagnostic.
14. **Mechanism metrics**: track friction signals such as repeated stops, evidence size, queue size, and validation time
    without adding cost calibration or provider measurement.
15. **High-risk isolated lanes**: schema, dependency, provider, deploy, payment, and external-service work remain
    separate lanes with fresh approval and isolated commits.

## Standard Profiles Under Consideration

| Profile                  | Intended scope                                                   | Default evidence | Key blocked gates                                          |
| ------------------------ | ---------------------------------------------------------------- | ---------------- | ---------------------------------------------------------- |
| `docs_state_lite`        | docs/state/script metadata maintenance                           | `lite`           | product runtime, schema, dependency, provider, env, deploy |
| `local_unit_tdd`         | focused local unit implementation                                | `full`           | real DB, provider, env, schema, dependency, e2e            |
| `repository_runtime_tdd` | repository/service runtime unit with mocks or local-only harness | `full`           | real/private rows, provider, schema, dependency            |
| `local_full_flow`        | localhost-only flow demonstration with local fixtures            | `full`           | staging/prod/cloud/external, provider, real/private data   |
| `schema_isolated`        | schema/migration lane after explicit approval                    | `full`           | bundled product work, provider, deploy                     |
| `dependency_isolated`    | package/lockfile lane after dependency gate                      | `full`           | bundled product work, provider, deploy                     |
| `provider_local_smoke`   | provider-local smoke after explicit provider/env gate            | `full`           | production data, raw payload exposure, cost calibration    |

## Hard Boundaries To Preserve

- No `.env*` access, output, summary, or edit.
- No secret, token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, public
  identifier inventory, row data, or private data exposure.
- No staging, production, cloud, deploy, payment, or external-service action without separate fresh approval.
- No provider or model call, provider configuration, quota measurement, cost work, or Cost Calibration Gate execution
  without separate fresh approval.
- No schema, migration, drizzle, package, lockfile, dependency addition, dependency removal, or dependency upgrade unless
  the task and approval explicitly allow it.
- No PR or force push through standing local closeout approval.
- No dev server, Browser, Playwright, or e2e unless a current task profile and validation policy explicitly permit the
  local-only surface.
- No direct development on `master` or `main` except read-only checks.

## Additional Risk Controls

- Profiles are additive shortcuts, not blanket authorization.
- Every profile must declare allowed files, blocked files, validation policy, evidence mode, and blocked gates.
- `legacy_explicit` remains the default for old tasks and cannot infer new privileges.
- `ready_set` can only select dependency-satisfied tasks; it must not skip blocked gates or task-level approval.
- Work packets must stay within one module and one risk envelope; high-risk lanes cannot be batched with low-risk work.
- Local full-flow validation is localhost-only and may use only local fixture or disposable local data.
- Evidence Lite must still record validation commands, failures, redaction checks, blocked remainder, and residual risk.
- Queue archival must preserve original task blocks and update `task-history-index.yaml` in the same change.
- `project-state.yaml` cleanup should be conservative until scripts support any future split.
- Script behavior changes must remain backward-compatible and include smoke coverage.

## Recommended Implementation Priority

1. Document this consensus and index it as planning-only source material.
2. Audit `project-state.yaml`, `task-queue.yaml`, archive coverage, and dependency resolution before moving history.
3. Run a conservative task queue archival pass with exact moved-id validation.
4. Add a small `mechanismTuning` status section to `project-state.yaml` without splitting or deleting standing approvals.
5. Teach readiness, seed, evidence, next-action, local capability, runner, and autopilot scripts to recognize new fields
   while preserving legacy behavior.
6. Only after smoke validation, allow future tasks to adopt profiles incrementally.

## Forbidden Claims

- This document does not approve queue archival by itself.
- This document does not approve product implementation.
- This document does not approve dev server, Browser, Playwright, or e2e execution.
- This document does not approve schema, drizzle, dependency, package, lockfile, provider, model, cost, env, secret,
  staging, production, cloud, deploy, payment, external-service, PR, force-push, or public endpoint actions.
- This document does not prove any product module is complete or production-ready.
