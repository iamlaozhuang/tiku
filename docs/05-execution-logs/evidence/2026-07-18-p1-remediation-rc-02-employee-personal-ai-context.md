# F-0143 employee personal AI context evidence

## Scope

- Task: `p1-remediation-rc-02-employee-personal-ai-context-2026-07-18`
- Finding: `F-0143`
- Branch: `codex/p1-rc02-employee-personal-ai-context`
- Base: `4f63c3c17731cbc686bb234b89a64c31f36ab03b`
- Current stage: design transition; product source and tests are unchanged.

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

## Requirement Mapping Result

Result: pass

- Advanced-edition requirements explicitly allow personal and organization authorization to coexist, select personal by default, require explicit context selection, preserve personal history after organization membership, and require server-side revalidation.
- The current AI-generation baselines do not supersede or close F-0143.
- F-0142 authorization termination policy remains a separate finding and is not imported into this task.

## Recovery and requirement evidence

- Restored from repository state, task queue, latest evidence/audit, and the merged F-0117 baseline without redoing completed work.
- Read the advanced-edition requirement index, edition-aware authorization requirements, ADR-007, the personal AI generation requirement chain, current AI-generation baseline evidence, and UI role/design baselines.

## JIT Revalidation Result

Result: pass

F-0143 remains reproducible at the current base. UI intent carries the selected authorization, while server request/history paths still derive organization scope from employee identity before honoring a valid personal authorization.

## Root-Cause Reproduction

Result: pass

Independent read-only revalidation and main-thread source review reached the same result:

1. The UI exposes explicit personal and organization authorization contexts and sends the selected authorization public id.
2. The request route currently forces an employee into organization authorization and ownership; a valid employee personal advanced context can fail with `403057`.
3. Request and result history currently derive owner from employee identity, so personal records can be hidden after organization membership.
4. The learning-session route can already locate a personal result before organization scope; this behavior needs regression protection, not a new policy implementation.

The pre-change focused baseline covered seven relevant test files and passed 144 tests. That result proves existing coverage does not encode the missing employee-personal selected-context invariant; it does not invalidate the finding.

## Approval evidence

The user approved `F-0143 方案 A` on 2026-07-18. The approved boundary is recorded in `docs/05-execution-logs/acceptance/2026-07-18-p1-f0143-employee-personal-ai-context-authorization.md`.

## Scope Freeze

Result: pass

- F-0117 is recorded closed only after its commit, ff-only merge, `origin/master` push, worktree cleanup, and short-branch cleanup had already passed.
- Repository recovery checkpoints match the transition base, local `master`, and `origin/master` at `4f63c3c17731cbc686bb234b89a64c31f36ab03b`.
- F-0143 is the sole in-progress P1 task.
- The transition allowlist contains only state, approval, plan, evidence, audit, and written-spec files.
- The separate written-spec review gate remains `waiting_for_spec_review`.
- No schema, migration, dependency, database, Provider, browser/runtime, P2, PR, force-push, or deployment action is authorized or performed.

## Independent Transition Review Evidence

Result: pass

The independent review initially blocked three issues: stale repository checkpoints, a shared history/generation resolver that would have imported F-0142 lifecycle semantics, and an incomplete result-history propagation allowlist. Main-thread verification confirmed all three against the repository.

The corrected transition aligns all checkpoints to `4f63c3c17731cbc686bb234b89a64c31f36ab03b`, separates raw ownership validation from current generation eligibility, and adds the request API plus result-history model/validator/service/service-test chain to the product allowlist. Independent re-review returned `APPROVE`; current transition changes remain exactly seven governance/spec files.

## Validation log

- `git diff --check`: pass.
- Prettier scoped check across the seven transition files: pass.
- Initial P1 `manual` invocation without an explicit changed-file set: expected hard block because a task transition cannot prove its control-file scope from an empty candidate list. No guard or scope was changed in response.
- P1 `pre_commit` with the exact staged transition, including the review corrections: pass; transition mode `standard`, materialized task count 12, P1/P2 counts 125/18, runtime validation count 21.
- P0 global baseline: pass; 35 P0 findings, 143 P1/P2 impacts, 21 runtime-pending items, and zero dependency cycles.
- Module pre-commit hardening: pass; all seven staged files matched the task allowlist, with sensitive-evidence and terminology scans preserved.

No secret, personal data, token, or runtime credential is included in this evidence.
