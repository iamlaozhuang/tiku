# P1 F-0143 spec approval transition hotfix evidence

## Root-Cause Reproduction

Result: pass

At exact base `0fe8edae7a7efc00154f5c54227623be55796983`, the P1 manual guard remained pass/standard while Module pre-commit rejected the sole untracked hotfix plan as `HARD_BLOCK_OUT_OF_SCOPE`. The three production guards contained no F-0143 exact transition contract.

## TDD Evidence

Result: pass

The three Smoke scripts were modified before production guards. All three RED runs exited `1` specifically because the F-0143 production symbols and behavior were absent: P1 `677 ms`, Module pre-commit `633 ms`, Module pre-push `744 ms`. The smoke matrices cover the exact positive path plus wrong branch/base/task/gate, altered/duplicate authorization scalars, duplicate/reordered Exact Files, missing authorization, extra/product file, partial stage, standard mode, replay/multi-commit and unrelated `in_progress` drift.

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true
Cost Calibration Gate remains blocked.

The task brief, task-plan lines 25-79, `AGENTS.md`, code-taste commandments, ADR-001 through ADR-007 and the complete F-0117 exact transition precedent were reviewed. No generic fallback or `.husky/pre-push` change was introduced.

## Validation Results

Result: pass

### RED

- `Test-P1RemediationSerialProgram.Smoke.ps1`: exit `1`, `677 ms`; missing F-0143 production markers.
- `Test-ModuleRunV2PreCommitHardening.Smoke.ps1`: exit `1`, `633 ms`; missing F-0143 production markers.
- `Test-ModuleRunV2PrePushReadiness.Smoke.ps1`: exit `1`, `744 ms`; missing F-0143 production markers.

Each RED was recorded after smoke/fixture changes and before production-guard changes. No RED was caused by parser or fixture setup failure.

### Initial GREEN Before Independent Review

- `Test-P1RemediationSerialProgram.Smoke.ps1`: exit `0`, `1250383 ms`; `P1 remediation serial program guard smoke passed: 15 positive, 81 negative`.
- `Test-ModuleRunV2PreCommitHardening.Smoke.ps1`: exit `0`, `628880 ms`; `Module Run v2 pre-commit hardening smoke passed` and both F-0117 compatibility suites passed.
- `Test-ModuleRunV2PrePushReadiness.Smoke.ps1`: exit `0`, `593125 ms`; `Module Run v2 pre-push readiness smoke passed` and both F-0117 compatibility suites passed.
- PowerShell parser: all six changed scripts passed.
- `npm.cmd run format:check`: exit `0`, `124477 ms`; all matched files use Prettier code style.
- P1 manual guard: exit `0`, `6447 ms`; `p1ProgramGuardResult: pass`, `p1TransitionScopeMode: standard`.
- P0 baseline: exit `0`, `1495 ms`; `p0GlobalBaselineResult: pass`.
- `git diff --check`: exit `0` with no diagnostics.

The Module pre-commit full smoke executes the production guard against exact staged disposable fixtures, including the exact F-0143 12-file candidate and all negative mutations. The Module pre-push full smoke executes a committed disposable exact-one-parent transition topology plus standard-mode, replay/multi-commit and unrelated-drift negatives. The live hotfix worktree was deliberately not staged or committed because the implementation handoff explicitly prohibits staging, commit, merge and push; the independent main thread must run the real staged pre-commit gate during closeout.

### Debugging Record

The first full Module pre-commit GREEN attempt exposed two test-harness issues without loosening a generic guard path. First, the inherited F-0117 disposable fixture had reconstructed historical state/queue by mutating current files, so the new F-0143 projection made that historical fixture non-deterministic. The fixture now reads F-0117 state/queue from exact snapshot `3e3c400fe3cc7d41b476d9a5d37b1cc9c52f3e5a`. Second, after the exact F-0143 scope passed, the parent product task's generic `scripts/**` block still rejected the six authorized guard files. That block is bypassed only after the complete exact 12-file F-0143 scope predicate passes; extra, product and partial-stage candidates still use the parent block and remain hard-blocked. Full positive/negative matrices then passed.

### Independent Round 2 Important Remediation

Review status: pass

Independent Round 2 returned two Important findings on 2026-07-19:

1. F-0143 identity and authorization comparisons used PowerShell's default case-insensitive operators/regex, so case-only branch or authorization scalar mutations could pass.
2. P1 and Module pre-commit used name-only scope identity without an F-0143 A/M-only staged status contract; P1 pre-push also lacked a direct A/M-only check for the current unique commit.

Focused disposable RED against the old production guards reproduced the defects with real behavior:

- pre-commit branch-case and authorization-key-case probes: P1 and Module both reported `failed=False` and emitted their acceptance markers;
- pre-commit deleted exact guard: P1 reported `failed=False` and emitted `approved_one_time`;
- pre-push `Master` branch-case and authorization-key-case probes: P1 and Module both reported `failed=False` and emitted their acceptance markers;
- pre-push deleted exact guard: P1 reported `failed=False` and emitted `approved_one_time`, while Module pre-push's existing A/M topology already rejected it.

Minimal production corrections are F-0143-only: ordinal case-sensitive identity checks, case-sensitive scalar key/value uniqueness, direct pre-commit staged name-status and P1 current-commit pre-push name-status validation, and dedicated `FILE_SET_INVALID` findings. File-set helpers now use case-sensitive uniqueness plus raw-count and unique-count equality, preventing a case-duplicate thirteenth path from collapsing into the 12-file set. Smoke performs a function-level assertion for this invariant because a case-distinct duplicate path is not a stable Windows working-tree fixture.

Focused GREEN results:

- pre-commit positive, branch case, authorization key/value case, missing authorization, deleted exact guard, extra tracked deletion and renamed exact guard: `8/8` pass;
- pre-push positive, branch case, authorization key/value case, missing authorization, deleted exact guard, extra tracked deletion and renamed exact guard: `8/8` pass;
- six changed PowerShell scripts parse successfully.

Disposable fixtures use minimal synthetic `Round 1/2 pass` review artifacts solely to exercise guard behavior. At this focused-remediation stage the real audit remained pending; the final independent review later approved the corrections before live staged closeout.

### Independent Round 3 Important Remediation

Review status: pass

Independent re-review found one remaining outer-routing defect. `$isP1F0143TransitionContext` used case-sensitive equality, so changing both the CLI task identity and state `currentTask.id` only by case made the F-0143 context false. The generic transition ancestor path then compared the same identity case-insensitively and accepted the exact ancestor topology without running the strict F-0143 identity checks.

The new disposable Module pre-push behavior case was written before production modification. Against the old production line it reproduced RED with `RED_EXIT=0`, `RED_GENERIC_OK=True`, `RED_EXPECTED_BLOCK=False` and emitted `OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR master`.

The minimal production correction changes only the two outer routing comparisons to explicit `-ieq`. `Test-P1F0143SpecApprovalTransitionHotfixTransitionTopology` retains all ordinal `-cne` identity checks. Focused GREEN produced `GREEN_EXIT=1`, `GREEN_GENERIC_OK=False`, `GREEN_EXPECTED_BLOCK=True` and emitted `HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID`; therefore a case-only F-0143 identity remains in the dedicated branch and fails closed instead of falling back to generic ancestry. Final independent re-review approved this correction.

### Round 4 Fixture Source-Specific Marker Remediation

Remediation status: pass

The complete Module pre-commit smoke first failed before behavior fixtures with exit `1` in `515 ms`: the F-0143 static contract searched the P1-only `P1_PROGRAM_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID` marker only in Module guard text. The smoke now loads P1 text before the contract checks, keeps the common F-0143 patterns unchanged, and validates the P1 and Module `FILE_SET_INVALID` markers against their own sources. The next full run crossed that static contract and exposed the snapshot-read defect below, proving the source-specific assertion no longer blocked execution.

### Round 5 F-0143 Missing Snapshot File Remediation

Remediation status: pass

Real disposable RED reproduced native `git show` termination instead of finding aggregation:

- full Module pre-commit after the marker repair reached missing authorization and exited `1` after `876337 ms`; P1 returned only `fatal: path ... does not exist (neither on disk nor in the index)`;
- after the P1 fix, a diagnostic full Module pre-commit reached the same case in Module guard and exited `1` after `760167 ms` with the corresponding raw index fatal;
- focused P1 pre-push missing authorization returned a raw `NativeCommandError` for a path absent from `HEAD`;
- focused P1 pre-push missing evidence against the unsafe reader returned `EVIDENCE_RED_EXIT=1` and `EVIDENCE_RED_RAW_FATAL=True`.

F-0143-only readers now inspect exact path existence before content access: P1 uses `git ls-files --cached` for INDEX and `git ls-tree -r --name-only HEAD` for HEAD; Module pre-commit uses `git ls-files --cached`. Missing or non-exact paths return an empty string without invoking `git show`. Authorization, current state/queue projection, evidence and audit all use these F-0143-only readers; generic helpers and F-0117 remain unchanged.

Focused missing-evidence GREEN returned `EVIDENCE_CORRECTED_GREEN_EXIT=1`, `FILE_SET=True`, `REVIEW=True`, `RAW_FATAL=False`. During adversarial review, one broad projection edit was found in the F-0116 function before final validation; it was reverted to the generic helper, and only the true F-0143 projection was switched to the safe reader. `rg`/context inspection confirms the F-0143 authorization, two state/queue loop paths, evidence and audit are the five protected snapshot categories.

Fresh complete GREEN after code freeze:

- P1 full smoke: exit `0`, `1648135 ms`; `P1 remediation serial program guard smoke passed: 15 positive, 81 negative`.
- Module pre-commit full smoke: exit `0`, `885097 ms`; `F-0117 P1 and Module pre-commit behavior smoke passed`, `F-0117 smoke scope-correction P1 and Module pre-commit behavior smoke passed`, `Module Run v2 pre-commit hardening smoke passed`.
- Module pre-push full smoke: exit `0`, `917550 ms`; both F-0117 compatibility suites and `Module Run v2 pre-push readiness smoke passed`.

### Independent Final Re-review

Review status: pass

An independent reviewer rechecked the complete Round 2-5 delta after code freeze. Critical, Important and Minor findings were all empty, and the reviewer returned `Ready to merge: Yes`. The review confirmed source-specific smoke markers, F-0143-only safe snapshot readers, restored F-0116 and unchanged F-0117/generic semantics, A/M-only and case-sensitive identity enforcement, exact transition-only one-parent topology, and continued hard-blocking of ordinary `in_progress` SHA drift.

### Sensitive And Placeholder Scan

Scan status: pass

No credential-shaped secret or unresolved task marker was introduced in the exact 12-file change. Governance terms such as `authorization`, existing smoke fixture names and the task plan's explicit statement that contract values contain no placeholder are not credentials.

## Scope Inventory

The working tree contains exactly the authorization document's ordered 12-file inventory and the index is empty. `HEAD`, branch and base are exactly `0fe8edae7a7efc00154f5c54227623be55796983`, `codex/p1-f0143-spec-approval-transition-hotfix` and the authorized base. The product worktree remains unchanged except for its pre-existing sole approved implementation plan:

`?? docs/superpowers/plans/2026-07-18-employee-personal-ai-selected-context.md`

No `.husky/pre-push`, product source/test, dependency/lockfile, schema/migration, environment, provider, runtime, P2, PR, force-push or deploy file is in the candidate.

## Taste Compliance Checklist

- [x] Exact values and anchors replace wildcard or generic fallback behavior.
- [x] Functions remain small enough to expose candidate, authorization, projection and topology invariants separately.
- [x] No product API, database, naming, UI token, theme or dependency contract changed.
- [x] No hidden fallback, silent success, duplicate authorization scalar or sorted authorization-file comparison was introduced.
- [x] Positive and adversarial negative fixtures verify behavior, not only marker presence.
- [x] Standard mode, ordinary SHA drift, replay, extra/product files and partial staging fail closed.
- [x] State and queue change only the authorized projection and exact repository checkpoint.
- [x] F-0117 production semantics remain unchanged; historical fixtures are snapshot-bound.
- [x] Local validation evidence precedes any staging or commit decision.
- [x] Independent whole-diff review passed; live staged closeout remains an explicit pending gate.
