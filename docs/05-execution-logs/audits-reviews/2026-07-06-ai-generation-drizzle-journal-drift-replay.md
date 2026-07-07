# 2026-07-06 AI Generation Drizzle Journal Drift Replay Audit Review

## Findings

| Finding                                                                                | Severity | Evidence                                                                                                                 | Required handling                                                                                                     |
| -------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Drizzle migration stream was incomplete before this task.                              | High     | Existing organization closed-loop SQL had no matching journal entry or snapshot.                                         | Treat fresh migration health as unproven before this commit and proven only after the recorded clean baseline replay. |
| The correct source-level fix is migration metadata alignment, not a new schema change. | High     | `drizzle-kit generate` after the metadata fix reported no schema changes.                                                | Keep the existing idempotent SQL and commit only journal/snapshot metadata plus evidence/state updates.               |
| Org admin enterprise-source coverage requires acceptance fixture data.                 | Medium   | Clean schema-only DB has no business data; minimal published training snapshot fixture made enterprise source count `1`. | Do not classify missing enterprise-source coverage on an empty DB as a product code defect.                           |
| Clean baseline replay remains bounded.                                                 | Medium   | Replay used one-question synthetic fixture and local DB only.                                                            | Do not extrapolate to default 30/80 quantity, Provider behavior, or release readiness.                                |
| Temporary clean baseline DB was left in place.                                         | Low      | Task avoided destructive DB cleanup.                                                                                     | Clean up later only with explicit approval for local temporary DB cleanup.                                            |

## Root-cause Review

The prior local DB materialization task identified a source governance risk: organization closed-loop SQL was present but absent from Drizzle journal metadata. This task confirms and fixes the root cause:

- `_journal.json` lacked the `20260706052000_add_organization_ai_training_closed_loop` entry.
- `drizzle/meta/20260706052000_snapshot.json` was missing.
- The latest pre-fix snapshot lacked the organization answer snapshots, version question snapshot, and enum addition.
- After adding the journal entry and snapshot, `drizzle-kit generate` reports no schema diff, and a clean migrate applies `21` migrations with the expected schema present.

## Contract Impact

| Contract area                           | Current finding                                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Fresh local migration stream            | Pass for the organization closed-loop schema targeted by this task.                                                        |
| Learner AI learning session persistence | Clean baseline replay passed after minimal fixture materialization.                                                        |
| Organization employee enterprise source | Clean baseline replay passed with aggregate enterprise source count `1`.                                                   |
| Organization admin enterprise source    | Clean baseline replay passed with aggregate enterprise source count `1` after minimal published training snapshot fixture. |
| Platform source fallback                | Clean baseline replay passed with platform source available.                                                               |

## Non-claims

- No Provider-enabled acceptance.
- No Cost Calibration.
- No staging/prod/deploy.
- No release readiness or production usability.
- No default 30/80 AI组卷 quantity validation.
- No browser role matrix replay.
- No sensitive evidence captured.

## Recommended Next Decision

Next safe step: run a broader DB-backed local runtime replay on the existing 0704 local DB after this migration metadata fix is merged/applied, or decide whether to materialize an org admin same-organization published training snapshot fixture in that local DB for enterprise-source coverage. Provider-enabled bounded smoke should still wait until DB-backed replay is stable and must remain separate from Cost Calibration.
