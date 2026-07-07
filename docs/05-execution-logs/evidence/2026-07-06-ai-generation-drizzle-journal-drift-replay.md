# 2026-07-06 AI Generation Drizzle Journal Drift Replay Evidence

## Scope

- Task id: `ai-generation-drizzle-journal-drift-replay-2026-07-06`
- Branch: `codex/ai-generation-drizzle-journal-drift-replay-2026-07-06`
- Approval boundary: user approved a separate short branch to repair/align Drizzle migration journal drift, decide org admin enterprise-source fixture/materialization need, and rerun DB-backed replay from a clean migration baseline.
- Runtime scope: local-only repository migration metadata and local clean baseline database.
- Provider, Cost Calibration, staging/prod/deploy, package/lockfile changes: not executed.

## Redaction

This evidence records command status, file paths, migration tags, table/column/enum names, role labels, aggregate counts, and safe pass/blocked categories only.

It does not record DB URLs, database credentials, sessions, cookies, tokens, headers, env values, raw DB rows, internal ids, account values, Provider payloads, raw prompts, raw AI output, full question/answer/paper/material/resource/chunk content, screenshots, DOM dumps, traces, private fixture values, employee raw answers, or plaintext `redeem_code`.

## Read Gate Result

- `AGENTS.md`: read.
- `docs/04-agent-system/state/project-state.yaml`: read.
- `docs/04-agent-system/state/task-queue.yaml`: read.
- `docs/03-standards/code-taste-ten-commandments.md`: read.
- `docs/02-architecture/adr/*.md`: read, with migration/environment boundaries rechecked from ADR-004/005/006/007.
- Advanced edition, authorization, ADR-007, and AI generation traceability overlays through `2026-07-06-ai-generation-recontract-requirements-materialization.md`: read.
- Previous local DB schema/materialization alignment evidence and audit: read.

## Branch And Workspace

| Check            | Result                                                                     |
| ---------------- | -------------------------------------------------------------------------- |
| Starting branch  | `codex/ai-generation-local-db-schema-materialization-alignment-2026-07-06` |
| New branch       | `codex/ai-generation-drizzle-journal-drift-replay-2026-07-06`              |
| Parent commit    | `988a8de19`                                                                |
| Package/lockfile | unchanged                                                                  |
| Source runtime   | unchanged                                                                  |
| Temporary tests  | created, executed, then deleted before closeout                            |

## Drift Reproduction

| Check                                                                                          | Result  |
| ---------------------------------------------------------------------------------------------- | ------- |
| Existing SQL file `drizzle/20260706052000_add_organization_ai_training_closed_loop.sql`        | present |
| `_journal.json` entry for `20260706052000_add_organization_ai_training_closed_loop` before fix | absent  |
| `drizzle/meta/20260706052000_snapshot.json` before fix                                         | absent  |
| Latest pre-fix snapshot contains `organization_training_answer.answer_item_snapshot`           | false   |
| Latest pre-fix snapshot contains `organization_training_answer.question_result_snapshot`       | false   |
| Latest pre-fix snapshot contains enum value `organization_ai_result`                           | false   |

Root cause: the organization closed-loop SQL was present, but the repo-owned Drizzle metadata stream did not include the corresponding journal entry or snapshot. A clean `drizzle-kit migrate` stream would skip that SQL.

## Fix

| File                                        | Change                                                                                              |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `drizzle/meta/_journal.json`                | Added idx `20` entry for `20260706052000_add_organization_ai_training_closed_loop`.                 |
| `drizzle/meta/20260706052000_snapshot.json` | Added Drizzle snapshot generated from the current schema diff after `20260706031000_snapshot.json`. |

The existing idempotent SQL was kept. It was not replaced with the temporary generated non-idempotent SQL.

## Migration Metadata Verification

| Command                                                                                                                                  | Result                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Temporary `drizzle-kit generate` against copied pre-fix metadata                                                                         | reproduced missing metadata; generated equivalent organization closed-loop diff |
| `npm.cmd exec -- drizzle-kit generate --dialect postgresql --schema ./src/db/schema/index.ts --out ./drizzle --name journal_drift_check` | pass; `No schema changes, nothing to migrate`                                   |

## Clean Migration Baseline

Created a new local clean baseline database and ran the full fixed migration stream with `drizzle-kit migrate`.

| Check                                                              | Result                               |
| ------------------------------------------------------------------ | ------------------------------------ |
| Clean baseline database creation                                   | pass; connection details not printed |
| `drizzle-kit migrate` on clean baseline                            | pass                                 |
| Applied migration count                                            | `21`                                 |
| `organization_training_version.question_snapshot`                  | present                              |
| `organization_training_answer.answer_item_snapshot`                | present                              |
| `organization_training_answer.question_result_snapshot`            | present                              |
| `organization_training_source_context_type.organization_ai_result` | present                              |

The clean baseline database was not dropped in this task to avoid destructive DB cleanup.

## Fixture / Materialization Decision

| Question                                                                                           | Decision                                                                                                 |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Does clean migration baseline need schema/materialization beyond Drizzle migrate?                  | No. The fixed migration stream creates the required schema directly.                                     |
| Does schema-only clean DB contain business fixtures for DB-backed replay?                          | No. A clean migrated DB has no formal platform questions, organization, employee, or training snapshots. |
| Is org admin enterprise-source fixture/materialization needed to prove enterprise-source coverage? | Yes. A published same-organization training version with non-empty `question_snapshot` is needed.        |
| Is that a source-code defect?                                                                      | No. It is fixture/materialization coverage for acceptance replay.                                        |

## Clean Baseline DB-backed Replay

The replay used a minimal local synthetic fixture in the clean baseline DB. It did not call Provider and did not record raw fixture values.

| Replay area                                 | Result                    |
| ------------------------------------------- | ------------------------- |
| Personal learning session save              | pass                      |
| Personal learning answer feedback save      | pass                      |
| Personal learning progress read             | pass                      |
| Organization admin lifecycle version query  | pass; aggregate count `1` |
| Organization employee visible version query | pass; aggregate count `1` |
| Organization employee snapshot source query | pass; aggregate count `1` |

### AI组卷 Plan-and-select Replay

| Role                        | Assembly result | Platform source count | Enterprise source count | Selected question count |
| --------------------------- | --------------- | --------------------- | ----------------------- | ----------------------- |
| `personal_advanced_student` | assembled       | `3`                   | `0`                     | `1`                     |
| `org_advanced_employee`     | assembled       | `3`                   | `1`                     | `1`                     |
| `org_advanced_admin`        | assembled       | `3`                   | `1`                     | `1`                     |
| `content_admin`             | assembled       | `3`                   | `0`                     | `1`                     |

## Current Classification

| Dimension                                | Classification                                |
| ---------------------------------------- | --------------------------------------------- |
| Drizzle journal/snapshot drift           | pass; fixed in repo metadata                  |
| clean migration baseline                 | pass                                          |
| DB-backed targeted replay                | pass with minimal synthetic fixture           |
| org admin enterprise-source fixture need | required for coverage, not a code defect      |
| Provider-enabled small sample            | not tested / requires separate fresh approval |
| release readiness                        | not claimed                                   |
| production usability                     | not claimed                                   |
| staging                                  | not executed / requires fresh approval        |
| Cost Calibration                         | not executed / requires fresh approval        |

## Non-claims

- No Provider-enabled behavior was tested.
- No Provider payload, raw prompt, or raw AI output was inspected or recorded.
- No staging/prod/deploy/cloud work was executed.
- No package or lockfile was changed.
- No release readiness or production usability is claimed.
- No broad production/full-data acceptance is claimed.

## Validation Commands

| Command                                                                                                                                  | Result                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Temporary pre-fix `drizzle-kit generate` in ignored out dir                                                                              | pass; reproduced missing migration metadata |
| `npm.cmd exec -- drizzle-kit generate --dialect postgresql --schema ./src/db/schema/index.ts --out ./drizzle --name journal_drift_check` | pass; no schema changes                     |
| Clean baseline `drizzle-kit migrate`                                                                                                     | pass                                        |
| Temporary clean baseline DB-backed replay                                                                                                | pass; 1 file / 2 tests                      |
| `npm.cmd run lint`                                                                                                                       | pass                                        |
| `npm.cmd run typecheck`                                                                                                                  | pass                                        |
| focused Vitest                                                                                                                           | pass; 7 files / 91 tests                    |
| `git diff --check`                                                                                                                       | pass                                        |
| scoped Prettier check                                                                                                                    | pass                                        |
| Module Run v2 pre-commit hardening                                                                                                       | pass                                        |
