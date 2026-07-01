# 2026-07-01 AI 出题 / AI 组卷核心能力修复总控方案

## Purpose

This roadmap makes the AI 出题 / AI 组卷 repair path durable in repository state. It converts the owner-preview findings and the core walkthrough contract into ordered, reviewable project tasks so future work can resume from files instead of chat memory.

This document is planning and governance only. It does not approve runtime source repair, database access, schema or migration work, seed/import execution, Provider execution, Cost Calibration, staging/prod, deployment, release readiness, final Pass, PR creation, or force push.

## Current State

- The AI generation walkthrough contract is complete in `docs/01-requirements/traceability/2026-07-01-ai-generation-core-walkthrough-contract.md`.
- Static preflight and known issue mapping are complete.
- Full eight-role browser walkthrough is not complete.
- Existing OP-01 through OP-09 findings are mapped and must not be reinterpreted as pass until rerun evidence exists.

## Target State

The target is local owner-preview readiness for AI 出题 and AI 组卷 across all scoped roles:

- personal standard student
- personal advanced student
- organization standard employee
- organization advanced employee
- organization standard admin
- organization advanced admin
- content admin
- ops admin

Every role/function/data-mode matrix row must have one explicit outcome:

- `pass`
- `fail`
- `blocked`
- `not_applicable`

No result may use ambiguous wording such as "looks usable".

## Ordered Repair Batches

| Order | Task id                                            | Scope                                                                   | Issues                     | Status target                     | Exit criteria                                                                                                                                                                              |
| ----- | -------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | `ai-generation-p0-entry-unblock-2026-07-01`        | Authorization and workspace entry blockers                              | OP-03, OP-04               | source/test repair                | Active valid learner/employee authorization no longer shows false expired; organization advanced admin reaches advanced workspace; focused tests pass.                                     |
| 2     | `ai-generation-p1-core-semantics-2026-07-01`       | AI task semantics, parameter contract, structured result contract       | OP-01, OP-05, OP-06        | source/test repair                | AI 出题 and AI 组卷 task kinds are not confused; `level` is 1-5; quantity 10 yields 10 structured drafts or explicit parse failure; fake Provider tests pass.                              |
| 3     | `ai-generation-p2-history-ux-2026-07-01`           | Empty states, result placement, history isolation, pagination/filtering | OP-02, OP-07, OP-08, OP-09 | source/test repair                | Empty/missing-source states are explicit; current result is visible near action area or focused; histories are isolated by generation kind; lists are descending and paginated/filterable. |
| 4     | `ai-generation-data-backed-walkthrough-2026-07-01` | Approved local data-backed walkthrough                                  | Data completeness          | fresh approval required           | At least one脱敏 profession/level/subject/knowledge_node/question/paper resource set is available through an approved process; evidence records status/count summaries only.               |
| 5     | `ai-generation-eight-role-matrix-rerun-2026-07-01` | Full role/function matrix rerun                                         | All OP rows                | browser/runtime approval required | Every role/function row has pass/fail/blocked/not_applicable evidence summary; no blocker is skipped or hidden.                                                                            |
| 6     | `ai-generation-real-provider-sample-2026-07-01`    | Small local Qwen owner-preview sample                                   | Provider confidence        | fresh Provider approval required  | Each already-unblocked eligible role runs at most one AI 出题 and one AI 组卷 sample; evidence records status, duration bucket, token counts, and failure category only.                   |

## Non-Negotiable Quality Gates

Each source repair batch must:

- start from `master` on a short `codex/` branch;
- materialize exact allowed files, blocked files, boundaries, validation commands, evidence rules, and closeout policy in project state and task queue;
- read `AGENTS.md`, the ten commandments, all ADRs, project state, and task queue;
- write a task plan before source edits;
- create focused tests that fail for the old behavior or assert the target contract;
- reuse existing contracts/services/components before adding new abstractions;
- run focused tests, `npm.cmd run lint`, `npm.cmd run typecheck`, `git diff --check`, and Module Run v2 gates;
- write redacted evidence and audit review before closeout;
- commit as one reviewable task, fast-forward merge to `master`, push only when approved by task closeout policy, and clean the merged short branch.

## Root-Cause Discipline

Every issue must be assigned to one or more root-cause boundaries before code repair:

- UI/interaction state
- route handler or Server Action adapter
- API contract
- service business logic
- repository/persistence
- authorization/session capability
- Provider adapter
- structured parser
- history/query isolation
- data availability

Each repair task must record the root-cause boundary and the test that protects it from regression.

## Reuse Discipline

Before adding code, repair tasks must inspect existing:

- AI generation contracts;
- Provider execution services;
- parser/result draft models;
- history query and pagination helpers;
- admin AI generation entry surfaces;
- student AI generation surfaces;
- authorization/capability services;
- glossary-backed enum definitions.

Do not duplicate AI 出题 / AI 组卷 implementations per role unless the task plan records a concrete product reason and preserves shared domain semantics.

## Evidence Boundary

Allowed evidence:

- task ids;
- file paths;
- role labels;
- route and workflow labels;
- status labels;
- counts and pagination metadata;
- validation commands and results;
- redacted expected/observed summaries;
- root-cause boundary names.

Forbidden evidence:

- passwords, account secrets, cookies, tokens, sessions, localStorage, Authorization headers;
- `.env*` contents, connection strings, Provider credentials;
- raw database rows, internal numeric ids, PII, phone/email originals, plaintext `redeem_code`;
- Provider payloads, prompts, raw AI input/output;
- full question, paper, material, resource, or chunk content;
- screenshots, traces, raw DOM, HTML dumps.

## Completion Definition

The roadmap is complete only when:

- all P0/P1/P2 repair batches have closed with passing validation;
- data-backed walkthrough has either approved pass evidence or an explicit blocked-by-approval state;
- eight-role matrix rerun has explicit outcomes for all rows;
- real Provider sample has either approved redacted evidence or an explicit blocked-by-approval state;
- no task claims release readiness, final Pass, production readiness, or Cost Calibration completion.
