# P1 Approved Same-Task Transition

> **Superseded/read-only (2026-07-20):** retained for historical audit. New tasks must not use this transition contract,
> freshness key, transition-only routing or per-task adapter. Use `minimal-safety-kernel.md`.

This procedure governs future `approved_same_task_transition` contract instances. It does not replace historical F-0115/F-0116/F-0117/F-0143 paths or authorize the current bootstrap.

## Base authorization anchor

The contract instance is candidate content, not authority. `authorizationId`, `authorizationSource`, and `standingAuthorizationSource` must resolve from the base SHA task approval and closeout policy. Candidate-only approval text, an added `Status: approved`, or a candidate-added closeout policy always fails closed.

## Wide recognition

The reserved transition type, contract path, candidate state/queue projection, case variant, or incomplete marker enters the strict route. Recognition never implies validity and cannot fall back to generic, legacy, or standard mode.

## Strict decision

The shared parser validates the unique UTF-8-without-BOM, LF-only fenced block before normalization. Keys and file paths are ordinal case-sensitive. Unknown, missing, duplicate, case-conflicting, malformed, or incorrectly typed fields are rejected.

The shared validator independently checks identity/context, base authorization, full state and queue projection hashes, A/M-only ordered files, one-parent/one-commit topology, ancestor and remote baseline, ordinary drift, standard mode, and replay. Security booleans must be present as real booleans, and parent/commit counts must be integral values; missing or string-coerced facts fail closed. Any finding produces `recognized=true`, `valid=false`, and `mode=invalid`.

## A/M-only files

Raw count, ordinal unique count, declared count, ordered paths, and statuses must match exactly. `fileCount` is a positive decimal capped at 999; actual, expected, contract, and per-file hash inputs share the same bound, which is checked before canonical sorting or hashing. The contract and actual name-status records must both equal the independently loaded, base-anchored `ExpectedNameStatusRecords`; candidate content cannot enlarge that allowlist. The exact set must contain three distinct roles: `statePath`, `queuePath`, and the contract source path. The canonicalizer emits ordinal path order while the validator separately rejects non-canonical raw order. Only `A` and `M` are valid; product paths and `D`, `R`, `C`, or unknown statuses are rejected.

Candidate tree identity covers the ordered name-status records and an exact per-path SHA-256 map. The state and queue path hashes must respectively equal their validated `stateToSha256` and `queueToSha256`; the contract source hash must equal the parser's UTF-8/LF SHA-256 of `Contract.RawText`. Runtime context such as branch does not alter tree identity. Freshness separately covers the fixed base, schema, shared validator, adapters, fixture, state/queue projections, profile, and exact command inputs.

## Stage boundary

C3 provides the stage-free contract parser and normalized shared decision. C4 wires the same decision into P1, Module pre-commit, and Module pre-push while retaining every stage-specific hard block. A future contract instance changes the contract and exact state/queue projection; it does not require editing the six guards and guard smokes.

## Machine evidence

The unique `tiku-transition-evidence-v1` block uses the same raw-first UTF-8-without-BOM, LF-only, ordinal case-sensitive discipline. Duplicate blocks or keys, case-conflicting keys, unknown or missing fields, malformed encoding, non-contiguous command/file indices, count mismatch, and negative numeric values fail closed. Production parsing consumes the machine block plus independently loaded trusted facts; Markdown headings, natural-language reviewer wording, and machine-block self-assertions are not external authority.

`command.NNN.name|exitCode|durationMs` and `file.NNN.path|status` start at `001`, remain contiguous, and equal their declared counts. Commands record non-negative exit codes and durations; the accepted exact command must occur once. Files remain ordinal-sorted, unique, and A/M-only, and must equal trusted `NameStatusRecords` in count, raw order, ordinal path, and status. Missing, scalar, malformed, extra, missing, reordered, case-variant, or status-divergent trusted file facts fail closed.

The machine `schemaVersion`, task, transition, authorization id/source, base, candidate identity type, branch, state/queue from/to projections, validation profile, validator/adapters, and fixture hashes bind ordinally to exact external string facts. Missing, non-string, or mismatched context fails closed. Candidate content cannot supply or repair those facts.

For `normalized_tree_hash`, candidate identity hashes the exact name-status records and each candidate file's LF-normalized UTF-8 content after clearing only the machine block's `candidateIdentity` and `freshnessKey` values. Any other content change changes the identity. Freshness then hashes, in fixed order, candidate identity, base SHA, schema version, validator and adapter hashes, fixture hash, state/queue projections, profile, and exact command. The same inputs produce the same key; any affected input makes prior evidence stale. `commit_sha` evidence binds the immutable candidate commit instead.

Fixtures may use `reviewDecision=APPROVE` only with explicit external `ReviewDecision=APPROVE` and `ReviewInputKind=synthetic` facts. Production uses `ReviewInputKind=production`, loaded independently from the owning review gate. The machine decision must exactly match the external decision; a missing/invalid kind, a machine-string attempt to invent the kind, a mismatch, or external `PENDING` fails closed. Fixtures must not change the repository audit to claim a real approval. A real evidence record remains invalid until both its machine decision and independently loaded production review fact are `APPROVE`.

## Validation profiles

- `focused`: behavior development loop for parser, shared validator, bootstrap, and adapter matrices; target `<=180s`.
- `full`: code-frozen parser/schema/guard/fixture behavior change; C6 runs the heavy gates serially, once per successful freshness key.
- `contract-instance-only`: exact future contract plus state/queue projection; run strict contract lint and the real staged/committed gates without the three complete mechanism smokes.
- `docs-only`: prose/evidence/index changes while machine schema/parser/guard/fixture remain unchanged; run strict machine parse, scoped formatting, diff, and short affected gates.

Profile selection fails closed for an empty or unclassified file set. Behavior changes select `focused` until frozen and `full` after freeze; an exact contract projection selects `contract-instance-only`; remaining governance documentation selects `docs-only`.

## P1 Mechanism Efficiency Observation

Each of the next three P1 product tasks adds this unfilled-at-entry template to its evidence. This mechanism task defines the template and three-task observation entry only; it must not invent future results.

```text
productTaskId=
productValueTimeMs=
mechanismOverheadMs=
totalTaskTimeMs=
mechanismOverheadRatio=
implementerSubagentCount=
finalReviewerSubagentCount=
mechanismScriptChangedLines=
focusedRunCount=
focusedP95Ms=
fullSmokeRunCount=
sameFreshnessKeyFullRunMax=
staleCount=
retryCount=
sixGuardSmokeModificationCount=
classificationNotes=
```

- `productValueTimeMs = product analysis + product code + product tests`.
- `mechanismOverheadMs = mechanism work + mechanism-only validation wait + mechanism-only review/closeout`; paused-product diagnostics, retries, waits, and agent coordination are included.
- `totalTaskTimeMs = productValueTimeMs + mechanismOverheadMs` and `mechanismOverheadRatio = mechanismOverheadMs / totalTaskTimeMs` when the denominator is positive.
- The C7 resume-transition evidence points the next three product tasks to this section. Each task records observed values in its own evidence; no value is copied forward as a default.
- After three observations, review six-guard/smoke modification count, contract-only full-smoke count, focused P95, same-key full maximum, agent counts, and the overhead ratio. Two consecutive tasks with mechanism overhead above product value, or any renewed six-script edit, stops expansion for root-cause review.
