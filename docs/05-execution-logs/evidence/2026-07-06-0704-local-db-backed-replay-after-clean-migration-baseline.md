# 2026-07-06 0704 Local DB-backed Replay After Clean Migration Baseline Evidence

## Scope

- Task id: `0704-local-db-backed-replay-after-clean-migration-baseline-2026-07-06`
- Branch: `codex/0704-local-db-backed-replay-after-clean-migration-baseline-2026-07-06`
- Approval boundary: user approved first closing out existing short branches, then running a separate 0704 local DB-backed replay.
- Runtime scope: configured local 0704 acceptance DB through existing local runtime configuration.
- Provider, Cost Calibration, staging/prod/deploy, package/lockfile changes: not executed.

## Redaction

This evidence records document paths, command status, table/column/enum names, role labels, workflow stages, aggregate counts, and safe pass/blocked categories only.

It does not record DB URLs, database credentials, sessions, cookies, tokens, headers, env values, raw DB rows, internal ids, account values, Provider payloads, raw prompts, raw AI output, full question/answer/paper/material/resource/chunk content, screenshots, DOM dumps, traces, private fixture values, employee raw answers, or plaintext `redeem_code`.

## Read Gate Result

- `AGENTS.md`: read.
- `docs/04-agent-system/state/project-state.yaml`: read.
- `docs/04-agent-system/state/task-queue.yaml`: read.
- `docs/03-standards/code-taste-ten-commandments.md`: read.
- `docs/02-architecture/adr/*.md`: read.
- Advanced edition, authorization, ADR-007, and AI generation traceability overlays through `2026-07-06-ai-generation-recontract-requirements-materialization.md`: read.
- Latest DB-backed replay, local DB schema/materialization alignment, and Drizzle journal drift replay evidence/audit: read.

## Prerequisite Branch Closeout

Before this replay branch was created, the previously stacked short branches were merged into `master`, `master` was pushed to `origin/master`, and the local short branches were deleted after the closeout gate passed.

| Check                                                         | Result                          |
| ------------------------------------------------------------- | ------------------------------- |
| `master` fast-forward merge                                   | pass                            |
| `master` push to `origin/master`                              | pass                            |
| master closeout lint                                          | pass                            |
| master closeout typecheck                                     | pass                            |
| master closeout `drizzle-kit generate` no-schema-change check | pass                            |
| master closeout focused Vitest                                | pass; 7 files / 91 tests        |
| master closeout Module Run v2 pre-push readiness              | pass                            |
| Local short branch cleanup                                    | pass; 4 merged branches deleted |

## 0704 Local DB Schema / Journal Check

The replay used the configured local 0704 DB. It did not use the temporary clean migration baseline DB from the prior Drizzle journal audit.

| Check                                                              | Result                             |
| ------------------------------------------------------------------ | ---------------------------------- |
| `npm.cmd exec -- drizzle-kit migrate` on configured 0704 DB        | pass                               |
| Migration notices                                                  | benign already-exists notices only |
| Applied migration count observed by replay harness                 | `21`                               |
| `personal_ai_learning_session` table                               | present                            |
| `organization_training_version.question_snapshot`                  | present                            |
| `organization_training_answer` snapshot columns                    | present                            |
| `organization_training_source_context_type.organization_ai_result` | present                            |

## DB-backed Replay Result

The replay used a temporary local harness, executed against the configured local 0704 DB, and then removed the harness before closeout. The harness used redacted one-question paper plans and did not call Provider.

### Fixture Inventory

| Fixture area                                                   | Result                                               |
| -------------------------------------------------------------- | ---------------------------------------------------- |
| Platform formal source scope                                   | present                                              |
| Same-organization published enterprise snapshot source fixture | missing                                              |
| Employee fixture for enterprise scope                          | missing because enterprise scope fixture was missing |
| Personal AI paper source result                                | present                                              |
| Organization AI paper source result                            | missing because enterprise scope fixture was missing |

### AI组卷 Plan-and-select Assembly

| Role                        | Assembly result                     | Platform source count | Enterprise source count | Selected question count | Match quality   |
| --------------------------- | ----------------------------------- | --------------------: | ----------------------: | ----------------------: | --------------- |
| `personal_advanced_student` | assembled                           |                   `2` |                     `0` |                     `1` | `fully_matched` |
| `org_advanced_employee`     | blocked: `enterprise_scope_missing` |                   `0` |                     `0` |                     `0` | n/a             |
| `org_advanced_admin`        | blocked: `enterprise_scope_missing` |                   `0` |                     `0` |                     `0` | n/a             |
| `content_admin`             | assembled                           |                   `2` |                     `0` |                     `1` | `fully_matched` |

### Learning Session / Organization Answer Replay

| Replay area                                             | Result                                  |
| ------------------------------------------------------- | --------------------------------------- |
| Personal learning session creation from AI组卷 assembly | pass                                    |
| Personal answer feedback                                | pass; `scored`                          |
| Personal progress/statistics read                       | pass; `ready`, submitted count `1`      |
| Organization employee learning session                  | blocked: `paper_assembly_not_available` |
| Organization employee answer path                       | blocked: `enterprise_scope_missing`     |

## Root-cause Classification

| Question                                                                         | Finding                                                                                                                   |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Is the Drizzle journal/schema drift still blocking the configured 0704 DB?       | No. The configured 0704 DB reports the expected migration count and required schema objects.                              |
| Is personal advanced student DB-backed replay usable?                            | Yes for the bounded local flow: assemble, create session, answer, progress read.                                          |
| Is content admin platform-source AI组卷 assembly usable?                         | Yes for bounded local assembly from platform formal source.                                                               |
| Is org employee/admin enterprise-source replay proven on the configured 0704 DB? | No. The configured 0704 DB still lacks the same-organization published training snapshot fixture required by this replay. |
| Is the remaining organization-side blocker a source-code defect?                 | Not proven. Current evidence points to fixture/materialization coverage, not runtime code failure.                        |
| Was Provider behavior tested?                                                    | No. Provider remained blocked for this task.                                                                              |

## Current Classification

| Dimension                                                | Classification                                   |
| -------------------------------------------------------- | ------------------------------------------------ |
| local 0704 DB schema / migration journal                 | pass                                             |
| DB-backed personal runtime replay                        | pass, bounded                                    |
| DB-backed content admin assembly replay                  | pass, bounded                                    |
| DB-backed organization runtime replay                    | partial / blocked by enterprise fixture coverage |
| org admin enterprise-source fixture/materialization need | still required for acceptance coverage           |
| Provider-enabled small sample                            | not tested / requires separate fresh approval    |
| release readiness                                        | not claimed                                      |
| production usability                                     | not claimed                                      |
| staging                                                  | not executed / requires fresh approval           |
| Cost Calibration                                         | not executed / requires fresh approval           |

## Non-claims

- No Provider-enabled behavior was tested.
- No Provider payload, raw prompt, or raw AI output was inspected or recorded.
- No staging/prod/deploy/cloud work was executed.
- No Cost Calibration was executed or claimed.
- No package or lockfile was changed.
- No source runtime code was changed.
- No release readiness or production usability is claimed.
- No broad production/full-data acceptance is claimed.

## Validation Commands

| Command                                   | Result                              |
| ----------------------------------------- | ----------------------------------- |
| `npm.cmd exec -- drizzle-kit migrate`     | pass                                |
| Temporary 0704 DB-backed replay harness   | pass; 1 file / 1 test, then removed |
| `npm.cmd run lint`                        | pass                                |
| `npm.cmd run typecheck`                   | pass                                |
| focused Vitest for committed source tests | pass; 7 files / 91 tests            |
| `git diff --check`                        | pass                                |
| scoped Prettier check                     | pass after formatting evidence      |
| Module Run v2 pre-commit hardening        | pass                                |
