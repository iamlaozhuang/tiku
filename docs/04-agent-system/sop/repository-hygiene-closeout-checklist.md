# Repository Hygiene Closeout Checklist

## Status

Active for Phase 11 MVP gap tasks.

## Purpose

This checklist is the required closeout template before an agent claims the next task. It keeps task evidence, Git state, remote state, and local residue aligned.

## Checklist Template

Copy this section into each task evidence and complete every row.

| Check                | Required evidence                                                                                                                                                                          | Result  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| Branch isolation     | Current branch name and proof it is not `master` or `main` during implementation                                                                                                           | Pending |
| Allowed files        | Changed file list matches queue `allowedFiles` and avoids `blockedFiles`                                                                                                                   | Pending |
| AC-to-runtime matrix | Matrix labels `fixture-only`, `mock-only`, `read-only`, `entry-only`, partial runtime, deferred, or closed behavior                                                                        | Pending |
| Problem grading      | P0/P1/P2/P3 issues recorded with fixed status and residual risk                                                                                                                            | Pending |
| Validation record    | Task-specific commands, readiness, quality gate, naming when relevant, and Git completion inventory recorded                                                                               | Pending |
| Evidence hygiene     | No secret, token, Authorization header, raw provider payload, raw prompt, raw answer, raw model response, full paper/material/OCR text, generated plaintext `redeem_code`, or private data | Pending |
| Commit               | Focused task commit SHA recorded                                                                                                                                                           | Pending |
| Merge                | Merge target, merge commit SHA, and result recorded                                                                                                                                        | Pending |
| Push                 | Remote, branch, and push result recorded when approved                                                                                                                                     | Pending |
| Cleanup              | Merged short-lifecycle branch deleted, or retained with reason                                                                                                                             | Pending |
| Worktree residue     | No untracked files; no generated logs/caches outside ignored paths; no `.worktrees/` residue unless justified                                                                              | Pending |
| stagingDecision      | One explicit `stagingDecision` value recorded                                                                                                                                              | Pending |
| Next step            | Next task id or blocker recorded                                                                                                                                                           | Pending |

## Required Commands

Run these commands unless the task evidence records why a command is not applicable:

```powershell
git status --short --branch
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

For runtime tasks, also run task-specific unit/e2e/build commands from `task-queue.yaml`.

## Dirty Repository Rules

Do not claim the next task when any of these are true:

- tracked changes remain unstaged or uncommitted;
- staged changes remain after commit;
- untracked files are not intentionally ignored;
- the current branch is still an already-merged task branch;
- `master` is ahead of `origin/master` after a push-approved task;
- a branch deletion failed and no cleanup evidence records the result;
- package, lockfile, env, schema, migration, script, or cloud/deploy files changed without explicit approval evidence.

## Closeout Evidence Wording

Use precise wording:

- `runtime_closed` only when browser/API/service evidence proves the role-to-role business loop.
- `fixture-only` when the result depends on test fixtures or seeded props without runtime write/read propagation.
- `mock-only` when a mock provider, mock service, or fake response stands in for real integration.
- `read-only` when the surface lists, filters, or displays data but cannot perform the required mutation.
- `entry-only` when navigation reaches a page or form but the business workflow is not completed.
- `deferred_with_approval` only when product or human approval is recorded.

Never use route existence, a green unit test, or a clean UI render as shorthand for MVP completion.
