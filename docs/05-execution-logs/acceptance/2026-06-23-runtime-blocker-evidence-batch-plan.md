# Runtime Blocker Evidence Batch Plan

## Status

- Date: `2026-06-23`
- Batch id: `standard-advanced-mvp-runtime-blocker-evidence-batch-2026-06-23`
- Status: `seeded_not_executed`
- Scope: evidence needed to unblock Standard and Advanced MVP acceptance after the 2026-06-22 final decision `Blocked`.
- Release claim: none.
- Production claim: none.

## Purpose

The previous acceptance serial batch ended with final decision `Blocked` because L5 role walkthrough, browser/runtime
evidence, L6 owner preview, Provider evidence, Cost Calibration, staging, and release gates were not all satisfied.

This batch turns those blockers into a safe serial execution plan. It prioritizes local L5 and browser evidence first,
then L6 owner preview readiness, then explicit decisions about Provider, Cost Calibration, and staging.

## Evidence Baseline

Use these prior evidence files as the baseline:

- `docs/05-execution-logs/evidence/2026-06-22-acceptance-baseline-and-owner-gate.md`
- `docs/05-execution-logs/evidence/2026-06-22-acceptance-l0-l2-static-gates.md`
- `docs/05-execution-logs/evidence/2026-06-22-acceptance-use-case-matrix-run.md`
- `docs/05-execution-logs/evidence/2026-06-22-acceptance-ap-gate-decision.md`
- `docs/05-execution-logs/evidence/2026-06-22-acceptance-ai-lifecycle-run.md`
- `docs/05-execution-logs/evidence/2026-06-22-acceptance-final-decision-review.md`

Current blocker summary:

| Blocker                       | Current state                        | This batch handling                                             |
| ----------------------------- | ------------------------------------ | --------------------------------------------------------------- |
| L5 role walkthrough           | not executed                         | Prepare approval package, then run Standard and Advanced flows. |
| Browser/runtime acceptance    | not executed                         | Local-only browser/dev-server scope must be approved first.     |
| L6 owner preview              | not executed                         | Prepare owner preview readiness before any staging action.      |
| Provider runtime              | blocked by approval gate             | Decide after L5/L6 evidence; do not execute in this seed.       |
| Cost Calibration Gate         | blocked                              | Decide after L5/L6 evidence; do not execute in this seed.       |
| Staging Provider/deploy       | blocked by approval gate             | Decide after L5/L6 evidence; no staging action in this seed.    |
| Preview/production readiness  | no evidence                          | Remains blocked until separate release evidence exists.         |
| Standard and Advanced verdict | final decision `Blocked`, not `Pass` | Re-review only after new evidence exists.                       |

## Serial Tasks

| Order | Task id                                                     | Purpose                                                                 | Initial status | Approval boundary                                                                                  |
| ----- | ----------------------------------------------------------- | ----------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------- |
| 0     | `acceptance-runtime-blocker-evidence-batch-seed-2026-06-23` | Register this batch and successor tasks.                                | closed         | Docs/state only; no runtime.                                                                       |
| 1     | `acceptance-l5-browser-runtime-scope-approval-2026-06-23`   | Create the exact L5/browser runtime approval package.                   | pending        | Docs-only; must ask before dev server, browser, or e2e execution.                                  |
| 2     | `acceptance-l5-standard-role-flow-run-2026-06-23`           | Execute Standard MVP local role walkthrough after approval.             | pending        | Requires fresh local runtime approval from Task 1. No Provider, env, staging, payment, or DB work. |
| 3     | `acceptance-l5-advanced-role-flow-run-2026-06-23`           | Execute Advanced MVP local role walkthrough after Standard evidence.    | pending        | Requires fresh local runtime approval. Provider stays disabled unless separately approved.         |
| 4     | `acceptance-l6-owner-preview-readiness-2026-06-23`          | Prepare or execute owner preview readiness depending on user approval.  | pending        | No staging unless fresh staging approval exists.                                                   |
| 5     | `acceptance-provider-cost-staging-decision-2026-06-23`      | Decide whether to approve Provider, Cost Calibration, and staging work. | pending        | Decision package only; no Provider, Cost Calibration, or staging execution.                        |
| 6     | `acceptance-runtime-blocker-final-review-2026-06-23`        | Recompute final acceptance decision from new evidence.                  | pending        | Pass remains forbidden unless all required evidence passes.                                        |

## L5 And Browser Evidence Scope

The local runtime approval package must define:

- exact local URL or route set;
- whether a dev server may be started;
- whether existing Playwright specs may run;
- whether manual browser walkthrough is allowed;
- role labels and account labels, with no committed credentials;
- sample data labels, with no private content;
- evidence locations and redaction rules;
- stop conditions and defect severity rules.

Minimum Standard MVP role coverage:

| Role label                | Surfaces to verify                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `unauthenticated_visitor` | Login and protected route denial.                                                  |
| `student`                 | `practice`, `mock_exam`, `exam_report`, `mistake_book`, and authorization summary. |
| `content_admin`           | `question`, `material`, `paper`, and `knowledge_node` management surfaces.         |
| `ops_admin`               | `user`, `organization`, `redeem_code`, `authorization`, and evidence surfaces.     |
| `super_admin`             | Highest-privilege governance and negative authorization checks.                    |

Minimum Advanced MVP role coverage:

| Role label         | Surfaces to verify                                                                   |
| ------------------ | ------------------------------------------------------------------------------------ |
| `advanced_student` | `effectiveEdition`, personal advanced learning, AI-disabled or fallback boundaries.  |
| `org_admin`        | `org_auth`, organization training, assignment, analytics, and privacy boundaries.    |
| `employee`         | Organization training participation, answer submission, and report visibility.       |
| `ops_admin`        | Advanced quota, `audit_log`, `ai_call_log`, Provider-disabled, and blocked AP gates. |
| `auditor`          | Evidence redaction and blocked-gate hygiene across Standard and Advanced evidence.   |

## L6 Owner Preview Scope

The existing ownership model remains:

- `laozhuang` is the single accountable owner.
- Codex is only execution and evidence-preparation assistant.

L6 owner preview may not become staging or release readiness unless a later task records:

- target environment;
- account inventory and disable plan;
- sample data source;
- evidence redaction owner;
- monitoring, incident, rollback, and stop authority;
- staging resource isolation;
- explicit statement that `prod` is untouched.

## Provider, Cost Calibration, And Staging Decisions

The Provider, Cost Calibration, and staging decision package must produce one of these outcomes for each gate:

| Gate               | Allowed decision values                                      |
| ------------------ | ------------------------------------------------------------ |
| Provider runtime   | `approve_limited_local_provider_run`, `defer`, or `reject`.  |
| Cost Calibration   | `approve_calibration_plan`, `defer`, or `reject`.            |
| Staging preview    | `approve_staging_package`, `defer`, or `reject`.             |
| Payment/external   | `approve_scope_package`, `defer`, `reject`, or `not_needed`. |
| Production release | `out_of_scope`, `defer`, or `prepare_separate_release_plan`. |

Decision approval is not execution approval. Any approved gate still needs a separate execution task with allowed files,
blocked files, validation commands, owner boundary, and redacted evidence.

## Stop Conditions

Stop the batch if:

- a task would need secrets, `.env*`, tokens, provider payloads, database URLs, or credentials in evidence;
- dev server, browser, e2e, Provider, Cost Calibration, staging, database, payment, deploy, or external service work is
  requested without the corresponding task-specific approval;
- L5 evidence finds a P0/P1 defect;
- L6 lacks owner authority or staging boundary;
- evidence cannot be redacted safely;
- someone tries to claim preview, staging, production, Provider, or Cost Calibration readiness from local-only evidence.

## Final Decision Rule

The final review may use only:

- `Pass`;
- `Fail`;
- `Blocked`.

`Pass` is forbidden unless Standard and Advanced required rows, L5 role flows, browser/runtime evidence, L6 owner gate,
Provider and Cost Calibration gates when in scope, staging/release gates when in scope, and redaction hygiene all have
passing evidence.
