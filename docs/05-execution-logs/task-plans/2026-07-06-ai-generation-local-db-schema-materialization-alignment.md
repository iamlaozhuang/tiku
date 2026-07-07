# 2026-07-06 AI Generation Local DB Schema / Materialization Alignment

## Task

Run a separate local DB schema/materialization alignment task for the 0704 local DB, then rerun DB-backed local runtime replay.

## Human Approval Boundary

Approved by the user on 2026-07-06 for this task only:

- inspect the current local 0704 DB through existing local runtime configuration without printing connection details;
- determine whether the DB needs a non-destructive schema/materialization update or fixture refresh;
- apply only a confirmed non-destructive local DB materialization update when it can be traced to current repository schema/migrations and does not require env/secret changes;
- rerun DB-backed local runtime replay after the alignment decision.

Not approved:

- staging/prod/deploy;
- env/secret readout or modification;
- Provider-enabled calls, Provider payload review, raw prompt, or raw AI output capture;
- Cost Calibration;
- destructive DB operation;
- package or lockfile change;
- schema source change or new migration file unless a separate source-level fix task is approved.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-generation-db-backed-local-runtime-replay.md`
- `docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-db-backed-local-runtime-replay.md`

## Root-Cause Hypotheses

1. The local DB is behind the current repository schema/materialization for `personal_ai_learning_session` and related learner AI session persistence tables.
2. The local DB is behind the current repository schema/materialization for organization training version query columns used by enterprise AI组卷 source resolution.
3. The replay may instead require fixture refresh if the schema is present but required role/source fixtures are absent.

## Execution Plan

1. Verify branch/worktree status and keep this task isolated from the prior DB replay branch.
2. Compare source schema/query expectations with local DB metadata using aggregate table/column existence checks only.
3. Locate existing migration/materialization capability before any DB mutation.
4. If a safe existing non-destructive local materialization path exists, apply it and record aggregate before/after metadata.
5. If no safe path exists, do not improvise schema changes; record blocked with the exact safe next decision.
6. Rerun the DB-backed local runtime replay after the alignment decision.
7. Write redacted evidence and adversarial audit review.
8. Run local validation gates and commit only docs/evidence/state updates plus no temporary harness.

## Evidence Redaction

Evidence may include:

- command names and pass/fail status;
- role labels;
- table and column names;
- aggregate table/column presence booleans;
- safe error categories;
- counts that do not expose raw rows or internal ids.

Evidence must not include:

- DB URL or connection details;
- credentials, cookies, tokens, sessions, headers, env values;
- raw DB rows or internal ids;
- provider payloads, raw prompts, raw AI output;
- full question, answer, paper, material, resource, chunk, employee answer, or private fixture values.

## Validation Gates

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- focused DB schema/materialization diagnostic harness
- focused DB-backed local runtime replay harness
- `git diff --check`
- Prettier check for changed docs/state files
- Module Run v2 precommit hardening for this task id
