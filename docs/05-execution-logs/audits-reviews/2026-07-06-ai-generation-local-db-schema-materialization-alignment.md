# 2026-07-06 AI Generation Local DB Schema / Materialization Alignment Audit Review

## Findings

| Finding                                                                    | Severity | Evidence                                                                                               | Required handling                                                                                                  |
| -------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Current local 0704 DB was behind the code-required schema/materialization. | High     | Pre-alignment metadata lacked personal learning tables, organization snapshot columns, and enum value. | Treat the prior DB replay blockers as superseded for this local DB only after the recorded non-destructive update. |
| Organization closed-loop SQL is not represented in the Drizzle journal.    | High     | Post-alignment metadata still reports the existing organization SQL file as unjournaled.               | Open a separate migration-governance fix task before claiming fresh-DB migration health.                           |
| Enterprise admin AI组卷 enterprise-source coverage is still not proven.    | Medium   | Admin role assembled from platform formal source; enterprise source count was `0`.                     | If acceptance requires admin enterprise-source coverage, run a separate fixture/source materialization task.       |
| Provider behavior remains outside this evidence.                           | Medium   | All replays were local DB-backed and used redacted synthetic visible plans.                            | Provider-enabled bounded smoke remains separate approval-gated work and must not be mixed with Cost Calibration.   |
| Temporary replay harnesses were removed before closeout.                   | Low      | Git status after deletion contains no temporary source test file.                                      | Keep the evidence as the durable record; do not commit temporary harness code.                                     |

## Root-cause Review

The previous DB-backed local runtime replay found relation/column blockers. This task confirms those blockers were caused by local DB schema/materialization lag:

- the personal AI learning-session tables were not applied before this task;
- the organization training closed-loop columns and enum value existed in an idempotent SQL file but were not applied by the official journaled migrate path;
- after applying the existing non-destructive local materialization paths, the same schema-layer calls no longer failed.

This is not a Provider failure and not a Cost Calibration signal.

## Contract Impact

| Contract area                               | Current local finding                                                                                      |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Learner AI learning session persistence     | Targeted local replay passed for save, answer feedback, and progress read.                                 |
| Organization employee training version read | Targeted local replay passed; AI组卷 assembly saw enterprise source aggregation.                           |
| Organization admin lifecycle version read   | Targeted local replay passed; AI组卷 assembled from platform source while enterprise source count was `0`. |
| Platform formal source                      | AI组卷 assembly replay found enough platform source for bounded one-question assembly.                     |
| Fresh DB migration health                   | Not proven because organization SQL remains outside the Drizzle journal.                                   |

## Non-claims

- No source code fix.
- No schema source or migration metadata fix.
- No fresh DB end-to-end migration proof.
- No Provider-enabled acceptance.
- No default-count, latency, model quality, quota, cost, staging/prod, deploy, release, or production claim.
- No sensitive evidence captured.

## Recommended Next Decision

Do not proceed directly to broad acceptance. The next safe implementation task should be a separate short branch for migration/materialization governance:

- reconcile the unjournaled organization closed-loop SQL with the Drizzle migration journal or equivalent repo-owned migration path;
- decide whether org admin enterprise-source coverage needs fixture/source materialization beyond platform fallback;
- then rerun DB-backed local replay from a clean migration baseline before any Provider-enabled bounded smoke.
