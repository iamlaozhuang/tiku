# 2026-07-06 0704 Local Acceptance Baseline Grounding Root-Cause Audit Review

## Findings

| Severity | Finding                                                                                                        | Review                                                                                                                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1       | Fresh Provider-enabled generation is not currently replayable from local checkout state.                       | Current `.runtime/uploads` and local resource catalog are absent, while fresh generation relies on that catalog for sufficient grounding. The earlier Provider-pass evidence cannot be reused as a fresh current conclusion. |
| P1       | The 0704 DB is not a complete grounding replay source.                                                         | DB aggregate evidence shows sufficient historical AI results, but `resource` rows are absent. The persisted result snapshots prove history/downstream loops, not fresh retrieval grounding.                                  |
| P2       | The current evidence chain lacked an explicit materialized-resource baseline inventory before Provider replay. | Earlier evidence recorded sufficient grounding/citations but did not leave a replayable local material manifest in committed evidence. This makes later local rechecks weaker after ephemeral `.runtime` state disappears.   |
| P2       | Current grounding block is expected safety behavior, not a confirmed code defect.                              | Provider credential read and call are gated behind sufficient citations. The current block prevents ungrounded generation and matches the requirement that RAG hit不足 cannot fabricate引用.                                 |

## Root Cause

Most likely root cause: local 0704 grounding materialization drift.

The runtime acceptance pass and adversarial recheck differ because the current local process no longer has the file-backed resource catalog/resources used by owner-preview route-integrated grounding. The 0704 DB still has successful AI history and sufficient result snapshots, but fresh generation does not derive grounding from those snapshots.

## Evidence Limits

- This audit did not rerun browser or Provider.
- This audit did not inspect raw private material, raw DB rows, prompts, Provider output, or generated content.
- DB evidence is aggregate-only and supports inventory/root-cause classification, not user-facing acceptance.
- Private fixture pack presence proves only that candidate inputs exist locally; it does not prove they are imported, published, rebuilt, or sufficient for current grounding.

## Recommended Next Step

Create a separate task for `0704 local grounding materialization replay`:

- explicitly approve any private fixture read and `.runtime/uploads` write boundary;
- materialize the smallest local RAG resource catalog for the target profession/level/subject;
- verify catalog aggregate counts and `rag_ready` counts before Provider;
- run a no-Provider grounding resolver check first;
- only then rerun a capped Provider small sample.

Do not change source unless that replay still fails with a populated catalog and sufficient resource scope.

## Boundary Review

- Source/test/schema/migration/dependency changed: false.
- Env/secret changed: false.
- Provider call executed: false.
- Destructive DB operation executed: false.
- Staging/prod/deploy executed: false.
- Cost Calibration executed or claimed: false.
- Release/final/prod readiness claimed: false.
