# P1 F-0115 Phase-11 Scope Correction Hotfix Audit

Date: 2026-07-17

## Round 1

Result: pass

The initial topology review rejected static-only smoke assertions. After correction, the P1 and Module pre-push fixtures execute the exact `582c156... -> one governance commit` path and reject moved origin, non-ancestor state, merge topology, replay, multi-commit transition, and ordinary drift. The final independent review returned `APPROVE` with zero Critical, Important, or Minor findings and confirmed the production path still requires the dedicated branch/task/authorization, exact twelve-file set, exact queue replacement, fresh approval absent from the parent, and P1 `transition_only` before Module ancestor acceptance.

## Round 2

Result: pass

The initial scope review independently rejected the same static-only evidence and stale unchecked plan. The corrected smokes use real disposable repositories for all three guards; focused and full runs pass, including independent Module pre-commit approval replay. The final independent review returned `APPROVE` with zero findings. The queue changes by one allowlist line only, all six guard/smoke scripts parse, and behavior fixtures reject index/worktree split, replay, wrong base/branch/status, invalid approval, non-exact queue content, 11/13 paths, product paths, multi-parent/multi-commit topology, and invalid ancestor contexts.

## Adversarial Invariants

- The bridge accepts exactly twelve paths; a thirteenth, missing, renamed, deleted, or type-changed path exits the bridge.
- The queue must equal the parent blob plus one exact phase-11 allowlist insertion.
- Authorization must be fresh, exact, fixed-base, and absent from the parent commit.
- Pre-commit validates index blobs and refuses any unstaged tracked or untracked split.
- Pre-push requires the exact one-parent governance commit and rejects replay after materialization.
- Ancestor checkpoint use requires P1 `transition_only` plus Module's independent topology proof; every other `in_progress` drift remains hard-blocked.
- Product, dependency, schema/database, Provider, runtime, P2, PR, force-push, deployment, and hook-bypass boundaries remain intact.

## Decision

Decision: APPROVE

Both initial rejections are closed: behavior-level fixtures replace static-only confidence, Module pre-commit has an independent replay rejection, and evidence no longer claims pending staged/hook work. The governance hotfix is approved for exact staging and the real hook sequence only; product changes and broader remote authority remain outside this decision.
