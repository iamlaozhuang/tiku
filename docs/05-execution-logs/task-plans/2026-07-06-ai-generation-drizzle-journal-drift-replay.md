# 2026-07-06 AI Generation Drizzle Journal Drift Replay

## Task

Fix or align the repository-owned Drizzle migration journal drift for the organization AI training closed-loop SQL, then decide whether org admin enterprise-source fixture/materialization is needed, and rerun a clean migration baseline DB-backed replay.

## Human Approval Boundary

Approved by the user on 2026-07-06 for this task only:

- create a separate short-lived branch;
- repair/align Drizzle migration metadata for the existing organization AI training closed-loop migration;
- use local-only clean migration baseline diagnostics and DB-backed replay;
- create local temporary clean baseline databases if needed, without printing connection strings or raw rows.

Not approved:

- Provider-enabled calls;
- Cost Calibration;
- staging/prod/deploy/cloud work;
- env/secret readout or modification;
- package or lockfile changes;
- destructive operations on existing local acceptance DB;
- recording credentials, connection details, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, or full question/paper/material content.

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
- `docs/05-execution-logs/evidence/2026-07-06-ai-generation-local-db-schema-materialization-alignment.md`
- `docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-local-db-schema-materialization-alignment.md`

## Root-cause Hypothesis

The organization closed-loop migration SQL was committed without corresponding Drizzle metadata:

- `_journal.json` has no `20260706052000_add_organization_ai_training_closed_loop` entry.
- `drizzle/meta/20260706052000_snapshot.json` is absent.
- The latest snapshot before the SQL does not contain the organization closed-loop enum/columns.

If this is true, a fresh `drizzle-kit migrate` baseline will skip the organization SQL and produce a DB missing fields required by AI组卷 organization source queries.

## Execution Plan

1. Verify current branch/worktree and create an isolated short branch.
2. Reproduce migration metadata drift from repository files.
3. Generate or derive correct Drizzle migration metadata for the existing SQL.
4. Make the smallest source-owned migration metadata fix; do not change schema behavior unless evidence shows the SQL itself is wrong.
5. Build a local clean migration baseline using the fixed migration stream and check aggregate schema presence.
6. Decide whether org admin enterprise-source fixture/materialization is required based on aggregate source counts only.
7. Rerun DB-backed local replay against the clean baseline, with redacted aggregate output only.
8. Write evidence/audit, update state/queue, run gates, and commit.

## Evidence Redaction

Evidence may include:

- command names and pass/fail status;
- migration file names and metadata file names;
- table/column/enum names;
- aggregate counts;
- role labels and safe stage status.

Evidence must not include:

- DB URLs or connection strings;
- credentials, cookies, tokens, headers, env values, or sessions;
- raw DB rows, internal ids, PII, fixture account values, or plaintext `redeem_code`;
- Provider payloads, raw prompts, raw AI output;
- full question, answer, paper, material, resource, or chunk content.

## Validation Gates

- Clean migration baseline metadata diagnostic.
- DB-backed replay on clean migration baseline.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- focused Vitest for affected schema/repository/service tests.
- `git diff --check`
- scoped Prettier check.
- Module Run v2 precommit hardening.
