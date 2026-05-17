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

## Merge Rules

- Prefer fast-forward merges for task branches.
- Run the task validation commands before merge.
- Run readiness and quality gates on `master` after merge.
- Do not auto-merge pull requests.
- Production, deployment, database migration, secret, or external service changes require explicit human approval.

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
