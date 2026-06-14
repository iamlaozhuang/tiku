# Unified Standard Advanced Audit Campaign Plan

## Purpose

This campaign plan turns the unified standard and advanced audit planning contract into a serial, reviewable task
sequence.

It is a docs-only orchestration artifact. It does not approve product code, tests, scripts, schema, migration,
dependency, package, lockfile, env/secret, provider, staging/prod/cloud/deploy, payment, external-service, e2e, PR,
force-push, or Cost Calibration Gate work.

## Baseline Posture

- Current planning artifact: `docs/01-requirements/traceability/unified-standard-advanced-use-case-audit-plan.md`.
- Current planning branch: `codex/unified-standard-advanced-use-case-audit-planning`.
- Current seeding branch: `codex/unified-standard-advanced-audit-campaign-seeding`.
- `master` and `origin/master` do not yet include the planning artifact.
- The campaign is intentionally staged on top of the planning commit so the seeded sequence can reference the planning
  contract.
- The first follow-up task must decide the closeout baseline before any source-freeze or catalog work starts.

## Campaign Invariants

1. Standard edition MVP remains the foundation.
2. Advanced edition behavior can extend, govern, or block execution, but it must not rewrite standard edition semantics.
3. Every capability, use case, matrix row, and finding must trace to a frozen source.
4. Every future task must create its own task plan, evidence, audit review, branch, and local commit.
5. Findings must be use-case-owned and capability-owned before queue seeding.
6. Code implementation, code fixes, provider work, schema/migration, deploy, payment, e2e, env/secret, dependency, and
   Cost Calibration work remain blocked unless a later task explicitly approves them.
7. Evidence must not include raw secrets, raw provider payloads, raw prompts, raw model responses, database URLs, row
   data, cleartext `redeem_code`, employee subjective answer text, or customer/customer-like private content.

## Serial Task Composition

| Order | Task id                                                        | Required input                                             | Primary output                                                                                          | Stop condition                                                                                                  |
| ----- | -------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1     | `unified-standard-advanced-planning-closeout-baseline`         | Planning and campaign seeding commits                      | A clean `master` baseline that contains the planning and campaign artifacts, if fresh closeout approval | Stop if merge, push, branch cleanup, or remote write is not explicitly approved.                                |
| 2     | `unified-standard-advanced-input-freeze-and-source-index`      | Planning contract and closed baseline                      | Frozen source index with authoritative, supporting, historical, excluded, and conflict-pending sources  | Stop if source indexing needs secret/env/provider/cloud/schema/package/source/test reads outside approved docs. |
| 3     | `unified-standard-advanced-capability-catalog`                 | Frozen source index                                        | `CAP-*` catalog with edition status and governance gates                                                | Stop if a capability cannot be traced to source or requires implementation judgment.                            |
| 4     | `unified-standard-advanced-use-case-catalog-and-edition-delta` | Capability catalog and source index                        | User-goal use case catalog plus standard/advanced delta model                                           | Stop if standard and advanced semantics conflict and no canonical rule can be derived from frozen sources.      |
| 5     | `unified-standard-advanced-technical-landing-matrix`           | Use case catalog, capability catalog, source index         | Use-case-to-technical-surface matrix with status and test/evidence expectations                         | Stop if technical mapping requires modifying or executing product code, schema, e2e, provider, env, or deploy.  |
| 6     | `unified-standard-advanced-consistency-and-risk-audit`         | Source index, capability catalog, use case catalog, matrix | Findings, test gaps, governance blockers, conflict list, and queue seeding recommendations              | Stop before any implementation queue is created unless the audit itself explicitly approves docs-only seeding.  |

## Task 1 Contract: Planning Closeout Baseline

Goal: create a clean baseline for the audit campaign before further serial tasks start.

Allowed work:

- Re-read governance documents and the latest planning/campaign evidence.
- If and only if fresh user approval allows it, fast-forward `master` to include the planning and campaign artifacts.
- Run closeout and pre-push readiness on `master` after merge if merge is approved.
- Push `origin/master` only if fresh approval or task-level closeout policy allows it.

Blocked work:

- No PR creation, force-push, deploy, provider, env/secret, schema/migration, dependency, e2e, payment, or external-service
  work.

## Task 2 Contract: Input Freeze And Source Index

Goal: freeze the exact input set before extracting capabilities or use cases.

Required source buckets:

- Standard edition requirements under `docs/01-requirements/`.
- Standard/MVP audit sources from Phase 12, Phase 18, and Phase 19.
- Advanced edition specs and plans under `docs/superpowers/specs/` and `docs/superpowers/plans/`.
- Advanced edition requirement docs under `docs/01-requirements/advanced-edition/`.
- Batch 178 and Batch 180 staging/provider/deploy boundary evidence.
- Current-state checkpoint and implementation audit.
- Unified planning contract and campaign plan.

Output fields:

- `sourceId`
- `path`
- `sourceKind`
- `editionScope`
- `authorityLevel`
- `usedFor`
- `knownConflicts`
- `blockedGates`
- `redactionNotes`

## Task 3 Contract: Capability Catalog

Goal: create one canonical capability catalog before user use case mapping.

Output path:

- `docs/01-requirements/traceability/capability-catalog.md`

Required classification:

- `standard_required`
- `advanced_extension`
- `shared_foundation`
- `blocked_by_governance`
- `future_non_goal`
- `duplicate_or_inherited`

Each capability must include a source reference from the frozen index and must state whether it can write formal
`question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` records.

## Task 4 Contract: Use Case Catalog And Edition Delta

Goal: organize behavior by user goals and edition deltas instead of by isolated feature lists.

Output paths:

- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`

Required actor groups:

- `student`
- `admin`
- `organization`
- `employee`
- platform operations

Required loops:

- user and `authorization`
- content production
- student learning
- AI learning
- RAG knowledge
- organization training and analytics
- operations governance

## Task 5 Contract: Technical Landing Matrix

Goal: map each use case to implementation surfaces without changing implementation.

Output path:

- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`

Allowed read scope for this task may include non-secret `src/**`, `tests/**`, `docs/**`, and `scripts/**` only if the
task explicitly records read-only audit permission.

Blocked work remains unchanged: no product code edits, no tests/e2e edits, no schema/migration, no provider/env/deploy,
no package/lockfile, and no code fixes.

## Task 6 Contract: Consistency And Risk Audit

Goal: produce findings before any implementation queue seeding.

Required checks:

- capability without use case;
- use case without capability;
- use case without technical row;
- finding without use case or capability;
- standard/advanced semantic conflict;
- advanced extension writing formal content without review/adoption gate;
- governance-blocked item marked as implementable;
- missing test expectation for implemented or partial behavior;
- evidence expectation missing for audited behavior;
- high-risk boundary exposure around env/secret/provider/schema/deploy/payment/external-service.

Required output:

- findings ordered by severity;
- implemented, partial, missing, and blocked-by-governance classification;
- test coverage gaps;
- residual risks;
- docs-only queue seeding recommendation, if justified.

## Validation Strategy

Each docs-only task should run:

- `git diff --check`
- scoped Prettier check for changed docs/state files
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- task-scoped Module Run v2 precommit and closeout readiness

`npm.cmd run test:unit` is optional for pure docs-only source indexing and catalog tasks unless the task changes runtime
or mechanism scripts. `e2e`, build, provider calls, staging/prod/cloud/deploy, schema/migration, package/lockfile, and
Cost Calibration commands remain blocked unless a later task explicitly approves them.

## Handoff

The next task is `unified-standard-advanced-planning-closeout-baseline`. It must not be executed unless the user
explicitly approves closeout actions, because the current planning task did not approve fast-forward merge, push, or
branch cleanup.
