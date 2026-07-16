# P1 Transition Pre-Push Hotfix Design

Date: 2026-07-16

Design approval source: the user's explicit 2026-07-16 authorization to allow ancestor checkpoints only for governance transitions that already passed the P1 transition-only guard.

## Problem

The current hook executes Module Run pre-push before the P1 guard. A valid successor transition has `currentTask.status: in_progress`, records the synchronized parent checkpoint in `lastKnownMasterSha`, and advances local `master` by one governance-only commit. The P1 guard accepts this transition, but Module Run rejects the unavoidable local-master ancestor relation. Pushing the transition together with implementation is independently and correctly rejected by the P1 guard.

## Considered Designs

### Selected: same-hook transition proof handoff

The hook captures the real push update once, runs the P1 guard first, and uses a machine-readable `transition_only` mode only after that guard has fully validated the remote, ref, fast-forward ancestry, predecessor closeout, WIP, state/queue transition, governance allowlist, and absence of implementation files. Module Run receives that mode in the same hook process and accepts only the local-master ancestor relation when both recorded SHAs equal the actual `origin/master` checkpoint and local `master` is a strict descendant.

### Rejected: allow ancestor checkpoints for every `in_progress` task

This removes the deadlock but also allows steady implementation tasks with stale repository checkpoints. It weakens the existing safety boundary beyond the user's approval.

### Rejected: bypass the hook for transition commits

Manual guard execution followed by `--no-verify` preserves no enforceable coupling between the proof and the push. It also creates a recurring exception for every successor task.

## Components And Data Flow

1. `.husky/pre-push` consumes stdin at the beginning and preserves the exact four-field update line.
2. Historical Content Admin and P0 guards run unchanged.
3. The P1 guard validates the real update and emits `p1TransitionScopeMode: transition_only` only for a fully valid governance-only task transition; all other successful paths emit `standard`.
4. The hook forwards `transition_only` to Module Run only when it observes that exact P1 output from the successful invocation.
5. Module Run accepts the local `master` ancestor checkpoint only when all transition context invariants are true. It never relaxes the `origin/master` checkpoint equality.

## One-Time Bootstrap Bridge

The repository is currently pinned to a completed bootstrap task whose task allowlist predates this independently approved repair. Expanding that YAML allowlist in the same commit would be self-authorization. Instead, Module Run pre-commit recognizes exactly one base-pinned hotfix file set: the hook, P1/Module guards and smoke tests, this approval/plan/evidence/audit set, and fresh bootstrap evidence/audit addenda. It additionally requires branch `codex/p1-prepush-transition-hotfix`, parent HEAD `4806ba0aed4c9e5f85fd65e1a663bda3e73ebce3`, bootstrap status `ready_for_closeout`, an approval file absent from the parent commit, and exact approval markers. Any added or omitted path falls back to the ordinary task allowlist and hard-blocks. Once committed, both the HEAD pin and parent-absence check make the bridge unusable.

This bridge does not alter the new `in_progress` ancestry rule. For `in_progress`, only a successful P1 `transition_only` proof can activate Module Run's local-master ancestor acceptance.

## Failure Semantics

- P1 failure stops the hook before Module Run and no transition proof exists.
- Missing or malformed mode preserves existing Module Run behavior.
- A supplied transition mode with wrong task status, branch, SHA equality, or ancestry adds a dedicated hard-block finding.
- Other `in_progress` drift continues to produce `HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT`.

## Verification Design

- P1 smoke proves positive transition-only emission and non-emission for ordinary/closeout paths.
- Module Run smoke proves RED without the mode, GREEN with the mode for the exact transition topology, and hard blocks for invalid state/origin and non-transition contexts.
- Hook structure assertions prove P1 runs before Module Run and the mode is conditionally forwarded.
- Module pre-commit smoke proves the one-time exact hotfix bridge, rejects invalid approval, and rejects any extra product path.
- Existing P1, Module Run, P0, startup, recovery, formatting, and diff gates remain green.

## Scope

No product source, product test, dependency, lockfile, schema, migration, database, Provider, runtime acceptance, browser, P2 implementation, PR, force push, deployment, or read-only audit repository change is included.
