# AP-01 Qwen Local Experience Merge Push Cleanup Task Plan

## Task

- Task id: `ap-01-qwen-local-experience-merge-push-cleanup`
- Branch: `codex/ap-01-qwen-local-experience-merge-push-cleanup`
- Objective: fast-forward merge the AP-01 local experience stack into `master`, validate on `master`, push
  `origin/master`, and clean up only AP-01 local short branches that are merged into `master`.
- Pre-task base commit: `a80d1f1b`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-local-experience-closeout-audit.md`

## Approval Boundary

Approved by the user in the current turn:

- Create merge/push/cleanup task evidence.
- Fetch and confirm `origin/master` is aligned.
- Fast-forward `master` to the AP-01 top commit.
- Run necessary local gates on `master`.
- Push `origin/master`.
- Delete only local AP-01 short branches already merged into `master`.

Blocked:

- Provider/model calls, provider retry, provider streaming, and additional provider execution.
- `.env.local` read, `.env*` writes, env secret output, and full DB URL output.
- DB reads/writes, destructive DB operations, and raw SQL.
- Source/test/e2e/script/schema/migration/dependency/package/lockfile changes.
- Browser/Playwright runtime, dev server, staging/prod/cloud/deploy, payment/external service, formal adoption, PR,
  force push, and Cost Calibration Gate.

## Execution Steps

1. Confirm clean AP-01 top branch.
2. Run `git fetch --prune origin`.
3. Confirm `master` and `origin/master` are aligned and both are ancestors of AP-01 top.
4. Create this task branch and local task evidence commit.
5. Fast-forward `master` to `codex/ap-01-qwen-local-experience-merge-push-cleanup`.
6. On `master`, run:
   - `npm.cmd run lint`
   - `npm.cmd run typecheck`
   - `git diff --check`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ap-01-qwen-local-experience-merge-push-cleanup`
7. Push `master` to `origin/master`.
8. Delete only local AP-01 `codex/ap-01-qwen*` branches confirmed merged into `master`.
9. Report push target, pushed commit, deleted branches, blocked gates, and selectable next work directions.

## Evidence Redaction

Evidence and final delivery may record branch names, commit hashes, command names, pass/fail status, and deleted local
branch names. They must not record secrets, `.env.local` contents, full database URLs, raw DB rows, raw prompts, raw
responses, raw model output, provider payloads, raw error text, keys, tokens, Authorization headers, screenshots, traces,
or HTML reports.

## Validation Commands

- `git fetch --prune origin`
- `git status --short --branch`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-local-experience-merge-push-cleanup`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-local-experience-merge-push-cleanup`

## Closeout

- Create local task evidence commit.
- Fast-forward `master`, validate, push, and clean merged AP-01 local branches.
- Do not create PR, force push, deploy, call providers, read env secrets, read/write DB, or open Cost Calibration Gate.
