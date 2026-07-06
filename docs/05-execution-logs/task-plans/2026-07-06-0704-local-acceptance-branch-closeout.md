# 2026-07-06 0704 Local Acceptance Branch Closeout Plan

## Scope

- Task: `0704-local-acceptance-branch-closeout-2026-07-06`
- Approval: current user approved merging, pushing, and cleaning the existing 0704 local acceptance short branches.
- Target branch: `master`
- Remote target: `origin/master`

## Branches

- `codex/local-adversarial-acceptance-recheck-2026-07-06`
- `codex/0704-baseline-grounding-audit-2026-07-06`
- `codex/0704-grounding-materialization-replay-2026-07-06`
- `codex/0704-no-provider-route-grounding-replay-2026-07-06`

## Plan

1. Confirm clean worktree and linear branch stack.
2. Fast-forward `master` to the top branch.
3. Run master closeout validation gates.
4. Write redacted closeout evidence/audit and update state/queue.
5. Commit closeout evidence on `master`.
6. Push `master` to `origin/master`.
7. Delete the merged local short branches.

## Boundaries

- No source implementation change.
- No package or lockfile change.
- No DB operation.
- No Provider call.
- No staging/prod/deploy beyond `git push origin master`.
- No Cost Calibration.
- No credentials, sessions, cookies, tokens, env values, DB URLs, raw rows, internal ids, Provider payloads, raw prompts, raw AI output, full questions, full papers, full materials, resources, chunks, screenshots, or DOM dumps in evidence.
