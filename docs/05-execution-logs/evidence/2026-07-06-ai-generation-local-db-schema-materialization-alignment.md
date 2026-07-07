# 2026-07-06 AI Generation Local DB Schema / Materialization Alignment Evidence

## Scope

- Task id: `ai-generation-local-db-schema-materialization-alignment-2026-07-06`
- Branch: `codex/ai-generation-local-db-schema-materialization-alignment-2026-07-06`
- Approval boundary: user approved a separate local DB schema/materialization alignment task, then a DB-backed replay.
- Runtime scope: configured local 0704 DB through existing local runtime configuration.
- Execution mode: local DB metadata diagnostics, existing non-destructive materialization paths, and bounded DB-backed replay only.

## Redaction

This evidence records document paths, command statuses, table/column names, aggregate counts, role labels, and safe status categories only.

It does not record DB URLs, credentials, sessions, cookies, tokens, headers, env values, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full question/answer/paper/material/resource/chunk content, screenshots, DOM dumps, traces, private fixture values, employee raw answers, or plaintext `redeem_code`.

## Read Gate Result

- `AGENTS.md`: read.
- `docs/04-agent-system/state/project-state.yaml`: read.
- `docs/04-agent-system/state/task-queue.yaml`: read.
- `docs/03-standards/code-taste-ten-commandments.md`: read.
- `docs/02-architecture/adr/*.md`: read.
- Advanced edition, authorization, ADR-007, and AI generation traceability overlays through `2026-07-06-ai-generation-recontract-requirements-materialization.md`: read.
- Previous DB-backed local runtime replay evidence and audit: read.

## Branch And Workspace

| Check             | Result                                                                     |
| ----------------- | -------------------------------------------------------------------------- |
| Starting branch   | `codex/ai-generation-local-db-schema-materialization-alignment-2026-07-06` |
| Parent commit     | `511bd0b27`                                                                |
| Prior replay base | `codex/ai-generation-db-backed-local-runtime-replay-2026-07-06`            |
| Source files      | unchanged after closeout                                                   |
| Temporary harness | created, executed, then removed before closeout                            |
| Package/lockfile  | unchanged                                                                  |
| Staging/prod      | not executed                                                               |
| Provider          | not executed                                                               |
| Cost Calibration  | not executed                                                               |

## Pre-alignment Metadata

The initial local DB metadata check found the previous replay blockers were real local schema/materialization gaps.

| Area                                                                            | Pre-alignment local DB finding             |
| ------------------------------------------------------------------------------- | ------------------------------------------ |
| `personal_ai_learning_session`                                                  | table absent; all expected columns missing |
| `personal_ai_learning_answer_feedback`                                          | table absent; all expected columns missing |
| `organization_training_version.question_snapshot`                               | missing                                    |
| `organization_training_answer.answer_item_snapshot`                             | missing                                    |
| `organization_training_answer.question_result_snapshot`                         | missing                                    |
| `organization_training_source_context_type` enum value `organization_ai_result` | missing                                    |
| Drizzle applied migration count                                                 | `19`                                       |
| Repository journal entry count                                                  | `20`                                       |
| Existing organization closed-loop SQL not in journal                            | true                                       |

## Non-destructive Alignment Actions

| Action                                                                             | Result | Notes                                                                       |
| ---------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| `npm.cmd exec -- drizzle-kit migrate`                                              | pass   | Applied the existing journaled personal AI learning-session migration.      |
| Existing SQL `drizzle/20260706052000_add_organization_ai_training_closed_loop.sql` | pass   | Applied locally as an idempotent materialization file; statement count `3`. |

No destructive DB operation was executed. No source schema file, migration file, package file, or lockfile was changed in this task.

## Post-alignment Metadata

| Area                                                                            | Post-alignment result            |
| ------------------------------------------------------------------------------- | -------------------------------- |
| `personal_ai_learning_session`                                                  | exists; expected columns present |
| `personal_ai_learning_answer_feedback`                                          | exists; expected columns present |
| `organization_training_version.question_snapshot`                               | present                          |
| `organization_training_answer.answer_item_snapshot`                             | present                          |
| `organization_training_answer.question_result_snapshot`                         | present                          |
| `organization_training_source_context_type` enum value `organization_ai_result` | present                          |
| Drizzle applied migration count                                                 | `20`                             |
| Repository journal entry count                                                  | `20`                             |
| Existing organization closed-loop SQL not in journal                            | true                             |

## DB-backed Replay After Alignment

### Learning Session / Organization Version Replay

| Replay area                                                | Result                             |
| ---------------------------------------------------------- | ---------------------------------- |
| Personal learning session save                             | pass                               |
| Personal learning answer feedback save                     | pass                               |
| Personal learning progress read                            | pass                               |
| Organization admin lifecycle version query                 | pass                               |
| Organization employee visible version query                | pass                               |
| Organization employee direct version snapshot source query | pass; aggregate snapshot count `0` |

### AI Paper Plan-and-select Replay

The AI组卷 replay used local DB formal question sources and a redacted one-question paper plan. It did not call Provider.

| Role                        | Assembly result | Platform source count | Enterprise source count | Selected question count |
| --------------------------- | --------------- | --------------------- | ----------------------- | ----------------------- |
| `personal_advanced_student` | assembled       | `10`                  | `0`                     | `1`                     |
| `org_advanced_employee`     | assembled       | `10`                  | `13`                    | `1`                     |
| `org_advanced_admin`        | assembled       | `10`                  | `0`                     | `1`                     |
| `content_admin`             | assembled       | `10`                  | `0`                     | `1`                     |

## Root-cause Classification

| Question                                                            | Finding                                                                                            |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Did the 0704 local DB need schema/materialization alignment?        | Yes. The previous relation/column failures were local schema/materialization gaps.                 |
| Was fixture refresh required to remove the schema blockers?         | No. Existing non-destructive schema/materialization paths removed the relation/column blockers.    |
| Is there still a source governance risk?                            | Yes. The organization closed-loop SQL exists but is absent from the Drizzle journal.               |
| Is enterprise admin AI组卷 enterprise-source coverage fully proven? | No. The admin role assembled from platform source; enterprise source count was `0` in this replay. |
| Did this prove Provider-enabled behavior?                           | No. Provider was not executed.                                                                     |

## Current Classification

| Dimension                     | Classification                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| local DB schema alignment     | pass for current local DB; source migration journal risk remains                      |
| DB-backed targeted replay     | pass for prior schema blockers and one-question AI组卷 assembly                       |
| fixture refresh need          | not required for schema blockers; still possible for enterprise admin source coverage |
| Provider-enabled small sample | not tested / requires separate fresh approval                                         |
| release readiness             | not claimed                                                                           |
| production usability          | not claimed                                                                           |
| staging                       | not executed / requires fresh approval                                                |
| Cost Calibration              | not executed / requires fresh approval                                                |

## Non-claims

- No staging/prod/deploy.
- No Provider-enabled pass.
- No Provider payload, raw prompt, or raw AI output review.
- No Cost Calibration.
- No release readiness or production usability claim.
- No source migration/journal fix.
- No guarantee that a fresh DB created only through the current Drizzle journal will receive the unjournaled organization SQL.

## Validation Commands

| Command                                                             | Result                                        |
| ------------------------------------------------------------------- | --------------------------------------------- |
| local DB metadata diagnostic before alignment                       | pass; found schema/materialization gaps       |
| `npm.cmd exec -- drizzle-kit migrate`                               | pass                                          |
| local execution of existing idempotent organization closed-loop SQL | pass                                          |
| local DB metadata diagnostic after alignment                        | pass; expected columns and enum value present |
| temporary replay: learning session and organization version reads   | pass; 1 file / 2 tests                        |
| temporary replay: AI paper source resolution and assembly           | pass; 1 file / 1 test                         |
| `npm.cmd run lint`                                                  | pass                                          |
| `npm.cmd run typecheck`                                             | pass                                          |
| focused Vitest for committed source tests                           | pass; 7 files / 91 tests                      |
| `git diff --check`                                                  | pass                                          |
| scoped Prettier check                                               | pass                                          |
| Module Run v2 pre-commit hardening                                  | pass                                          |
