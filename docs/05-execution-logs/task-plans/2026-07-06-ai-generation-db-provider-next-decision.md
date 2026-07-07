# 2026-07-06 AI Generation DB/Provider Next Decision Task Plan

## Metadata

- Task id: `ai-generation-db-provider-next-decision-2026-07-06`
- Branch: `codex/ai-generation-db-provider-next-decision-2026-07-06`
- Task type: pre-execution decision package
- Scope: decide whether the next independent approved task should be `DB-backed local runtime replay` or `Provider-enabled bounded smoke`.

## Read Gate

Read before planning:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Latest 2026-07-06 AI generation final rollup, Provider-disabled replay, Provider-enabled root-cause, count-timeout observability, runtime residual, and role-matrix evidence.

## Execution Boundary

This task is documentation and decision materialization only.

Allowed:

- update task plan, evidence, audit, and agent state/queue;
- record redacted aggregate evidence references and next-task decision criteria;
- classify approval boundaries and non-claims.

Blocked:

- DB connection, DB mutation, migration, seed, or destructive DB operation;
- Provider call, Provider config execution, env/secret read/write, prompt execution, payload capture;
- browser replay, dev server execution, e2e runtime, screenshot, DOM dump, trace;
- staging/prod/deploy/release readiness/production usability/Cost Calibration;
- package/dependency/lockfile/schema/source/test changes.

## First-Principles Decision Method

The next acceptance step must answer the highest-confidence missing question with the least external uncertainty.

Current local source/unit evidence supports the new AI组卷 contract in code. The unproven runtime question is whether the new plan-and-select path persists and hands off correctly through localhost/local DB workflows. Provider-enabled smoke adds network, credential, model latency, and output variability before that deterministic product path is rechecked.

Therefore the decision test is:

1. If the local DB-backed product path is unproven after recontract, validate it first.
2. If that path passes or is explicitly waived, then run a bounded Provider-enabled smoke to validate Provider parsing and grounding behavior.
3. Neither task may include Cost Calibration or staging/prod claims.

## Option A: DB-backed Local Runtime Replay

Purpose:

- validate the post-recontract AI出题 / AI组卷 runtime path on localhost and local DB;
- prove persistence, role boundary, source selection, draft/container creation, preview/handoff, answer path, and statistics only at redacted aggregate level;
- avoid Provider variability while testing product mechanics.

Requires separate fresh approval before execution.

Allowed only after approval:

- localhost service and local DB runtime;
- non-destructive product actions;
- credential-backed role walkthrough using private fixtures without recording fixture values;
- aggregate status, role labels, route labels, workflow stages, count buckets, and safe error categories.

Recommended role/workflow coverage:

- `personal_advanced_student`: AI出题 result to learning flow; AI组卷 preview to learning session;
- `org_advanced_employee`: AI出题 result to employee learning flow; AI组卷 preview to employee learning session;
- `org_advanced_admin`: AI出题 to enterprise training draft; AI组卷 to enterprise training paper draft;
- `content_admin`: AI出题 to reviewable question draft; AI组卷 to reviewable paper draft;
- standard roles: denial/unavailable spot check if fresh approval includes it.

Stop conditions:

- missing approved local DB target;
- destructive operation would be needed;
- fixture cannot be used without exposing sensitive values;
- unexpected source defect that requires a separate fix branch.

## Option B: Provider-Enabled Bounded Smoke

Purpose:

- validate that the current Provider-enabled path can produce bounded, parseable, grounded results after recontract;
- validate AI组卷 Provider output remains plan-only and local question selection is used;
- record only structured status categories, not raw Provider artifacts.

Requires separate fresh approval before execution.

Allowed only after approval:

- local-only Provider-enabled smoke through the already configured local runtime;
- bounded attempts and fixed stop conditions;
- redacted aggregate outcomes: grounding status, structured-preview parse status, requested/recognized counts, safe error category, and duration bucket.

Recommended bounds:

- no staging/prod/deploy;
- no Cost Calibration, cost measurement, quota measurement, model benchmark, or latency claim;
- no raw prompt, payload, Provider response, generated question/paper/material content, DB rows, internal ids, credentials, sessions, cookies, tokens, or env values;
- stop immediately on missing credential, insufficient grounding, balance/network/provider failure, or unclear sensitive-output risk.

Recommended sequencing:

- run only after DB-backed local runtime replay passes or the owner explicitly waives it;
- keep Provider smoke small enough to validate behavior, not quality/cost/performance.

## Decision

Recommended next task: `DB-backed local runtime replay`.

Rationale:

- it addresses the strongest current evidence gap introduced by the 2026-07-06 recontract;
- it exercises the deterministic product path before introducing Provider variability;
- it can validate role/source/container/handoff boundaries without env/secret or Provider artifacts;
- it reduces false positives and false negatives before a Provider-enabled smoke.

Provider-enabled bounded smoke should be the following independent task after DB replay, with its own fresh approval.

## Validation Plan

This decision task will validate only documentation/state integrity:

- `git diff --check`
- scoped `prettier --check`
- `Test-ModuleRunV2PreCommitHardening.ps1`

No runtime, DB, Provider, browser, staging/prod, deploy, or Cost Calibration command is planned.
