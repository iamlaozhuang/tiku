# 2026-07-07 Full DB-backed Local Runtime Replay Evidence

## Scope

- Task id: `full-db-backed-local-runtime-replay-2026-07-07`
- Branch: `codex/full-db-backed-local-runtime-replay-2026-07-07`
- Runtime scope: local DB-backed service/repository replay only.
- DB boundary: explicit in-process local 20260704 acceptance DB override for the replay command; no `.env.local` edit.
- Not executed: Provider call, browser replay, localhost dev-server replay, staging/prod/deploy, schema migration, seed script, destructive DB operation, Cost Calibration, release readiness, production usability.

## Redaction Boundary

This evidence records only command names, exit status, role labels, workflow stages, aggregate counts, safe statuses, and safe failure categories. It does not record DB URLs, credentials, env values, tokens, cookies, sessions, headers, raw DB rows, internal ids, account values, private fixture values, phone/email/password values, plaintext `redeem_code`, Provider payload, raw prompt, raw AI output, full question/answer/paper/material/resource/chunk content, screenshots, traces, raw DOM, or employee raw answers.

## Read Gate

- `AGENTS.md`: read.
- `docs/03-standards/code-taste-ten-commandments.md`: read.
- `docs/02-architecture/adr/*.md`: read.
- `docs/04-agent-system/state/project-state.yaml`: read.
- `docs/04-agent-system/state/task-queue.yaml`: read.
- Requirements and traceability overlays through `2026-07-06-ai-generation-recontract-requirements-materialization.md`: read.
- Latest DB-backed replay, clean migration baseline, org enterprise fixture materialization, and post-recontract consolidation evidence/audit: read.

## Adversarial DB Boundary Check

| Check                               | Result                                                                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Default `.env.local` DB label check | failed safely: current default local DB label is not the 20260704 acceptance DB label                       |
| Conclusion from default local env   | not accepted as 0704 DB evidence                                                                            |
| Replay command override             | pass: command process rebuilt `DATABASE_URL` in memory to the documented local 20260704 acceptance DB label |
| `.env.local` file mutation          | not performed                                                                                               |
| DB URL / credential output          | not output                                                                                                  |

## DB-backed Replay Harness

Temporary harness:

```text
npm.cmd run test:unit -- tests/unit/full-db-backed-local-runtime-replay.test.ts
```

Execution result:

| Slice                                                                | Result                                             |
| -------------------------------------------------------------------- | -------------------------------------------------- |
| Explicit 20260704 DB boundary and source fixture inventory           | pass                                               |
| `personal_advanced_student` AI组卷 source assembly                   | pass; platform formal question source selected     |
| `org_advanced_employee` AI组卷 source assembly                       | pass; enterprise training snapshot source selected |
| `org_advanced_admin` AI组卷 source assembly                          | pass; enterprise training snapshot source selected |
| `content_admin` AI组卷 source assembly                               | pass; platform formal question source selected     |
| Personal learning session from AI组卷 assembly                       | pass                                               |
| Personal answer feedback and progress/statistics                     | pass; submitted count `1`                          |
| Org employee learning session from AI组卷 assembly                   | pass                                               |
| Org employee answer feedback and progress/statistics                 | pass; submitted count `1`                          |
| Org training draft -> publish -> employee submit -> readonly summary | pass                                               |
| Organization analytics aggregate source after employee submit        | pass; submitted employee signal present            |

Temporary harness status: 1 file / 4 tests passed, then deleted before commit.

## Source Gates

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Result                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | pass                     |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | pass                     |
| `npm.cmd run test:unit -- src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/repositories/organization-training-repository.test.ts` | pass; 7 files / 54 tests |

## Mechanism Diagnostics

| Diagnostic                               | Result                                                                                  |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `Get-TikuNextAction`                     | current task active; recommended action finish current task closeout                    |
| `Get-TikuProjectStatus`                  | current task active; Queue Slimming aggregate clean; Cost Calibration remains blocked   |
| `Get-ModuleRunV2QueueSlimmingSelfRepair` | clean; active queue terminal count `30`, non-terminal count `1`, threshold not exceeded |

## Classification

| Dimension                                                     | Classification                               |
| ------------------------------------------------------------- | -------------------------------------------- |
| DB-backed direct runtime replay on explicit 20260704 local DB | pass, bounded                                |
| Default `.env.local` / default localhost DB target            | partial: not currently proven as 20260704 DB |
| Browser role matrix / browser submission replay               | not tested in this task                      |
| Provider-disabled                                             | not tested in this task                      |
| Provider-enabled small sample                                 | not tested in this task                      |
| Release readiness                                             | not claimed                                  |
| Production usability                                          | not claimed                                  |
| Staging                                                       | not executed / requires fresh approval       |
| Cost Calibration                                              | not executed / requires fresh approval       |

## Follow-up Boundary

The next local acceptance closeout task should either:

- run browser submission replay with the same explicit 20260704 DB target, or
- first align the local dev-server DB target to the intended acceptance DB under a separate approved local-env decision.

No code defect was found in this DB-backed replay task.
