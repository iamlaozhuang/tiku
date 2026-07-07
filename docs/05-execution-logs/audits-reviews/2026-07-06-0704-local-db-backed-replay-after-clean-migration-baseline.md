# 2026-07-06 0704 Local DB-backed Replay After Clean Migration Baseline Audit Review

## Findings

| Finding                                                                                     | Severity | Evidence                                                                                                                                                   | Required handling                                                                                                       |
| ------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| The configured 0704 DB schema/journal blocker is cleared.                                   | High     | `drizzle-kit migrate` succeeded and the replay observed applied migration count `21` plus required tables, columns, and enum value.                        | Treat prior relation/column blockers as superseded for this local DB after this evidence.                               |
| Organization enterprise-source replay remains unproven on the configured 0704 DB.           | High     | The replay could not find a same-organization published training snapshot fixture and blocked org employee/admin assembly with `enterprise_scope_missing`. | Do not claim organization DB-backed acceptance until fixture/materialization is added and replayed.                     |
| Personal advanced student closed-loop replay is usable in the bounded local flow.           | Medium   | Personal assembly passed, learning session was created, answer feedback was scored, and progress read returned ready.                                      | Keep this as bounded evidence only; do not extrapolate to browser, Provider, or default quantity behavior.              |
| Content admin platform-source assembly is usable in the bounded local flow.                 | Medium   | Content admin assembly selected one platform formal question with `fully_matched` quality.                                                                 | Keep content admin formal publish/adopt/reject behavior outside this replay unless separately tested.                   |
| The remaining org-side issue is fixture/materialization coverage, not a proven code defect. | Medium   | No runtime source error was reproduced after schema alignment; the replay stopped at missing enterprise fixture categories.                                | Next task should materialize or refresh a redacted local 0704 org enterprise-source fixture, then rerun the org replay. |

## Root-cause Review

The prior clean migration baseline proved the repository migration stream after the Drizzle journal fix. This task checks the existing configured 0704 local acceptance DB, not the clean baseline database.

Current root-cause split:

- schema/journal drift: closed for the configured 0704 DB by applying the fixed migration stream;
- personal DB-backed runtime: bounded pass;
- content admin platform-source assembly: bounded pass;
- organization employee/admin enterprise-source path: blocked by absent same-organization published training snapshot fixture in the configured 0704 DB;
- Provider, staging/prod, Cost Calibration: outside scope.

## Contract Impact

| Contract area                                        | Current finding                                                                   |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| Personal advanced student AI组卷 to learning session | Bounded DB-backed local pass.                                                     |
| Content admin platform-source AI组卷 assembly        | Bounded DB-backed local pass.                                                     |
| Org advanced employee AI组卷 / learning session      | Not proven; enterprise fixture missing.                                           |
| Org advanced admin AI组卷 enterprise source          | Not proven; enterprise fixture missing.                                           |
| Organization employee answer persistence             | Not proven in this configured 0704 replay because enterprise fixture was missing. |
| Fresh migration baseline                             | Already proven in prior task; not rerun here except local 0704 migrate.           |

## Non-claims

- No source-code fix was made in this task.
- No Provider-enabled acceptance.
- No Cost Calibration.
- No staging/prod/deploy.
- No browser role matrix replay.
- No default 30/80 AI组卷 quantity validation.
- No release readiness or production usability.
- No sensitive evidence captured.

## Recommended Next Decision

Open a separate short branch for `0704-local-org-enterprise-fixture-materialization-replay`: use only non-destructive local 0704 fixture/materialization to create or refresh a same-organization published training snapshot source, then rerun org employee/admin AI组卷, learning-session/answer, and organization statistics paths. Provider-enabled bounded smoke should wait until that organization DB-backed replay is stable and must remain separate from Cost Calibration.
