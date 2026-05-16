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

## Remote Repository Rules

- A remote repository has not been configured until `git remote -v` shows a target.
- Before first push, document the remote provider, branch protection, draft PR policy, and CI checks.
- Draft PRs are the default review vehicle once a remote exists.
- Do not force push protected branches.
