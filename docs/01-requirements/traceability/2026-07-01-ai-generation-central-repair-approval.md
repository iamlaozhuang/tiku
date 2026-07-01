# 2026-07-01 AI 出题 / AI 组卷中央修复授权包

## Purpose

This approval package records the user's centralized authorization for the bounded AI 出题 / AI 组卷 repair program. It allows serial progress through the already queued repair and walkthrough tasks without relying on chat memory.

The approval is not a guarantee that no bug can ever occur. It is a governance rule that every task must prevent regression through scoped changes, root-cause analysis, reuse checks, focused tests, validation gates, and redacted evidence. If a task fails validation or exceeds its materialized boundary, execution must stop and record the blocker.

## Approval Source

- Approval id: `ai-generation-central-repair-approval-2026-07-01`
- Approved at: `2026-07-01T08:24:18-07:00`
- Approved by: `laozhuang`
- Approval text summary: User centrally authorizes the remaining AI 出题 / AI 组卷 repair program, including previously high-risk local resource, local DB, browser walkthrough, real Qwen Provider, env, dependency, schema/migration/seed, staging/prod/cloud/deploy, release readiness, final Pass, and Cost Calibration categories, with the condition that tasks must not knowingly introduce regressions, must not exceed bounded scope, and must use task-level safeguards.

## Covered Goal

Bring the current AI 出题 / AI 组卷 owner-preview findings from OP-01 through OP-09 to validated local owner-preview readiness, then complete the scoped role/function matrix and real Provider sample where applicable.

Covered queued tasks:

- `ai-generation-p0-entry-unblock-2026-07-01`
- `ai-generation-p1-core-semantics-2026-07-01`
- `ai-generation-p2-history-ux-2026-07-01`
- `ai-generation-data-backed-walkthrough-2026-07-01`
- `ai-generation-eight-role-matrix-rerun-2026-07-01`
- `ai-generation-real-provider-sample-2026-07-01`

## Execution Rules

This central approval can be consumed only when each task first materializes:

- a short `codex/` branch;
- exact allowed files and blocked files;
- root-cause boundary and reuse checklist;
- task plan;
- validation commands;
- redacted evidence and audit review paths;
- local commit, fast-forward merge, push, and cleanup closeout policy.

Each task must remain serial. Do not batch P0, P1, P2, data-backed walkthrough, role matrix rerun, and Provider sample into one branch or one commit.

## Regression-Control Gates

Every source repair task must include:

- root-cause classification using `docs/01-requirements/traceability/2026-07-01-ai-generation-root-cause-and-reuse-protocol.md`;
- inspection of existing shared contracts, services, repositories, UI surfaces, authorization services, and enum sources before adding code;
- focused tests or contract/static tests that protect the repaired behavior;
- `npm.cmd run lint`;
- `npm.cmd run typecheck`;
- `git diff --check`;
- Module Run v2 pre-commit hardening;
- Module Run v2 pre-push readiness.

If a validation gate fails, the task must stop, record the failure, and avoid merge/push until the failure is repaired within scope.

## Capability Authorization

The following capabilities are centrally approved only for the covered goal and only after task-level materialization:

| Capability                                     | Central decision                                                     | Additional task-level requirements                                                                                                                                                            |
| ---------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime source/test repair                     | approved                                                             | Narrow allowed files and focused tests required.                                                                                                                                              |
| Local DB read/write/reset/seed/resource import | approved when needed                                                 | Local dev only; no raw rows, internal ids, PII, full content, or connection strings in evidence; destructive actions need dry-run/preview and explicit command confirmation in task evidence. |
| D drive local resource package read/import     | approved when needed                                                 | Record path/status/count summaries only; no full material/question/paper/resource/chunk content in repository or evidence.                                                                    |
| Browser multi-role walkthrough                 | approved when needed                                                 | Localhost only; user/manual credential entry may be used, but credentials/session/cookies/localStorage/Auth headers must never be recorded or inspected.                                      |
| Real Qwen Provider sample                      | approved when needed                                                 | Local owner-preview sample only; bounded request count and token limits; no prompt, payload, raw AI input/output, or full generated content in evidence.                                      |
| `.env*` read/write                             | approved only when task proves necessity                             | Do not print or commit values; prefer existence checks and documented manual user edits; no secret values in evidence.                                                                        |
| Package/lockfile/dependency changes            | approved only when task proves necessity                             | Must use dependency gate evidence and isolate dependency commit from business implementation.                                                                                                 |
| Schema/migration/seed changes                  | approved only when task proves necessity                             | Must create reviewed migration/seed plan; no `drizzle-kit push`; no raw DB evidence; rollback/restore decision recorded.                                                                      |
| Staging/prod/cloud/deploy                      | approved only if later task proves needed for this goal              | Must still use isolated environment plan and deployment evidence; no production data or secret exposure.                                                                                      |
| Release readiness/final Pass/Cost Calibration  | approved only after all prerequisite matrix and gate evidence exists | Do not claim early; record exact criteria and validation outputs before any readiness or final Pass statement.                                                                                |

## Still Forbidden In Evidence

The central approval does not permit recording:

- passwords, account secrets, cookies, tokens, sessions, localStorage, Authorization headers;
- `.env*` values, connection strings, Provider credentials;
- raw database rows, internal numeric ids, PII, phone/email originals, plaintext `redeem_code`;
- Provider payloads, prompts, raw AI input/output;
- full question, paper, material, resource, or chunk content;
- screenshots, traces, raw DOM, HTML dumps.

## Stop Conditions

Execution must stop and report when:

- a task cannot be narrowed to safe allowed files;
- a validation gate fails and cannot be repaired within the task boundary;
- data, Provider, browser, dependency, schema, staging, deploy, release, final Pass, or Cost Calibration work would exceed the covered AI generation goal;
- the same blocker repeats for three consecutive goal turns;
- there is a credible risk of exposing secrets, raw content, or private user/session material.
