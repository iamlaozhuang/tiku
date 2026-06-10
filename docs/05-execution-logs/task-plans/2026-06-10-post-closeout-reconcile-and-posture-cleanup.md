# Post-Closeout Reconcile And Posture Cleanup Plan

## Scope

Serial governance repair for three local automation blockers or warnings:

1. Repair the stale `currentTask.commitSha` checkpoint that blocks post-closeout reconcile.
2. Park `D:\tiku` from stale clean detached HEAD to clean detached `origin/master`.
3. Re-run stopped automation hygiene and record that `a4e6` is no longer a cleanup candidate.
4. Repair the approved closeout script so future closeouts write an accepted ancestor checkpoint instead of leaving a stale placeholder or discarded amend SHA.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/sop/automated-advancement-governance.md`

## Boundaries

- Allowed files: governance state, approved closeout scripts/smoke, and this task's execution logs.
- Local allowed action: park `D:\tiku` to clean detached `origin/master` after confirming it is clean.
- Hygiene action: use repository hygiene scripts only.
- Blocked: product code, dependencies, env/secrets, provider calls, DB operations, e2e, deploy, payment, PR, force push, and Cost Calibration Gate.

## Sequence

1. Create short branch `codex/post-closeout-reconcile-and-posture-cleanup`.
2. Record task plan/evidence/audit.
3. Update previous task checkpoint references from discarded amend SHA to pushed closeout SHA `270827981598d409cc48c68d58c23aae559c0d59`.
4. Park `D:\tiku` to detached `origin/master` if clean.
5. Run approved closeout smoke, post-closeout reconcile, stopped automation hygiene, branch hygiene, closeout readiness, pre-push readiness, `git diff --check`, lint, and typecheck.
6. Commit, fast-forward merge to `master`, push `origin/master`, cleanup branch, and park worktree through approved closeout script.
