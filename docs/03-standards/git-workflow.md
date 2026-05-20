# Git 工作流规范 (Git Workflow)

## Status

Active.

## Branch Rules

- `master` and `main` are protected working branches.
- Do not implement changes directly on `master` or `main`.
- Use short-lived branches:
  - `codex/<task-name>` for agent work.
  - `feat/<feature-name>` for feature work.
  - `fix/<bug-name>` for bug fixes.
- Branch names use kebab-case after the prefix.

## Worktree Rules

- Prefer one worktree per active task.
- Worktrees live under `.worktrees/`, which is ignored by Git.
- Before editing, confirm the active branch is not `master` or `main`.
- After a branch is merged, remove the worktree and delete the merged branch.
- If `git worktree remove` unregisters the worktree but leaves a directory because of local `node_modules`, delete the residue only after confirming the path is under `.worktrees/`.

## Commit Rules

- Commit format: `{type}({scope}): {description}`.
- Examples:
  - `docs(agent): harden automation workflow`
  - `feat(paper): add publish validation`
  - `fix(auth): validate redeem code expiry`
- Do not commit unrelated local artifacts, temporary files, generated caches, `.env` files, or worktree contents.
- One completed queue task should normally produce one focused commit after validation and evidence are written.
- When closeout evidence would otherwise require repeated amend cycles, use two explicit commit slots:
  - implementation commit: scoped code, task plan, and validation evidence.
  - closeout evidence commit: merge, push, cleanup, and final SHA evidence after target-branch validation.
- A closeout evidence file does not need to record the SHA of the closeout evidence commit that contains it. Record that SHA in the final handoff or project state when useful, and avoid repeated commits that only update their own commit identity.
- Before starting the next task, run a completion inventory:

```powershell
git status --short --branch
git diff --name-only
git diff --cached --name-only
git ls-files --others --exclude-standard
```

- If any tracked, staged, or untracked file remains after a task is declared complete, record whether it is intentionally uncommitted evidence, generated local residue, or a blocker.
- Do not bundle dependency changes, lockfile changes, formatting-only cleanup, and feature implementation in one commit unless a task explicitly allows that combined scope.
- If a task is completed but not committed, the handoff must state the reason and the exact files left in the worktree.

## Dependency Commit Rules

- Approved dependency add, remove, or upgrade work must be isolated from business implementation.
- A dependency commit must include the dependency gate record and `human approval` evidence in the task plan or evidence file.
- Do not carry package or lockfile changes into later feature commits unless the later task explicitly allows those files.

## Merge Rules

- Prefer fast-forward merges for task branches.
- Run the task validation commands before merge.
- Run readiness and quality gates on `master` after merge.
- Local merge completion requires fresh evidence on `master` before cleanup.
- Do not auto-merge pull requests.
- Production, deployment, database migration, secret, or external service changes require explicit human approval.

## Push Decision Rules

- A local commit or local merge does not imply remote push approval.
- Push to `master`, PR creation/update, `--force-with-lease`, deployment, and production environment changes require explicit human approval.
- Before pushing a task branch, verify the compare against its base contains only task-scoped files:

```powershell
git diff --name-only origin/master..HEAD
```

- Before pushing `master`, verify it is ahead of `origin/master` by the expected commits and not behind:

```powershell
git fetch origin
git rev-list --left-right --count origin/master...master
```

- Evidence or the final handoff must record the pushed branch, remote target, and resulting commit range.

## Closeout Evidence Rules

- Every task closeout evidence must include the task id, branch or worktree, validation commands, commit SHA when committed, PR URL when created, merge result when merged, and push result when pushed.
- Evidence should name `implementationCommit` and `closeoutEvidenceCommit` separately when both exist.
- `closeoutEvidenceCommit` may be recorded outside the evidence file when recording it inside the file would require another evidence-only commit.
- After a merge into `master`, run:

```powershell
.\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

- Only remove the worktree and delete the merged branch after the closeout evidence confirms the target branch gates and Git state.

## Stacked PR Rules

- A stacked PR must name its temporary base branch in the PR body.
- After the prerequisite branch is merged into `master`, retarget the dependent PR to `master`.
- Rebuild or rebase the dependent branch on the latest `origin/master` before final review.
- Verify `git diff --name-only origin/master..HEAD` or the GitHub compare view before handoff.
- A dependent PR is healthy only when the diff contains the task-scoped files and no stale baseline, formatting, or prerequisite-branch noise.

## Force Push Rules

- Do not force push protected branches.
- Use `--force-with-lease` only on short-lived task branches when rebuilding a branch is required to remove stale base commits or formatting noise.
- Before `--force-with-lease`, confirm the remote head has not advanced unexpectedly.
- After `--force-with-lease`, verify the GitHub compare result against the target base.

## Fresh Checkout Verification

- Formatting and quality-gate fixes must be validated in a fresh worktree based on the target branch.
- The repository-level LF policy in `.gitattributes` is required for stable Windows checkouts.
- If `format:check` passes only in an old worktree, do not treat the format baseline as healthy.
- When a new worktree exposes line-ending drift, fix the repository policy instead of relying on local Git configuration.

## Remote Repository Rules

- A remote repository has not been configured until `git remote -v` shows a target.
- Before first push, document the remote provider, branch protection, draft PR policy, and CI checks.
- Draft PRs are the default review vehicle once a remote exists.
- Do not force push protected branches.
