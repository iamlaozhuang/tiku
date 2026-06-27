# Content Admin Review Credentialed Browser Smoke Closeout Task Plan

Task id: `content-admin-review-credentialed-browser-smoke-closeout-2026-06-27`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-credentialed-browser-smoke-scope.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-credentialed-browser-smoke-rerun.md`

## Requirement Decision Map

- This is a closeout task for the current short branch only.
- It records Git integration and validation evidence for the already completed content-admin credentialed browser smoke scope and rerun.
- It does not create new product behavior, runtime validation, requirements, source code, schema, migration, dependency, Provider, DB, or publish work.

## Evidence-Only Sources

- Existing scope evidence: `2026-06-27-content-admin-review-credentialed-browser-smoke-scope.md`.
- Existing rerun evidence: `2026-06-27-content-admin-review-credentialed-browser-smoke-rerun.md`.
- Git commands and validation command output from this closeout task.

## Conflict Check

- `origin/master` and local `master` are aligned at `b70ce0995ac90fc5e8decb439b8b4cedc42dec63`.
- Current short branch head is `1267d1247ae860736271f002aa4c06639237ab23`.
- `master` is an ancestor of the short branch, so ff-only merge is eligible before the closeout task packet commit.
- PR, force push, release readiness, final Pass, browser/e2e/dev-server, Provider, DB, publish, staging/prod, payment, and external-service work remain blocked.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-credentialed-browser-smoke-closeout.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-credentialed-browser-smoke-closeout.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-credentialed-browser-smoke-closeout.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-credentialed-browser-smoke-closeout.md`

## Blocked Scope

- Product source, tests, e2e, scripts, schema, migration, dependency, package/lockfile, env/secret, credential, Provider, DB connection/read/write, browser/dev-server runtime, product mutation, formal publish, student-visible content, staging/prod, payment, external service, PR, force push, release readiness, Cost Calibration Gate, and final Pass.

## Execution Plan

1. Materialize this closeout task package and state/queue approval.
2. Run scoped formatting, `git diff --check`, lint, typecheck, and Module Run v2 pre-commit hardening on the short branch.
3. Commit the closeout task package locally.
4. Switch to `master` and run `git merge --ff-only codex/content-admin-credentialed-browser-scope-20260627`.
5. Run necessary gates on `master`, including lint, typecheck, Module Run v2 pre-push readiness, and closeout evidence formatting.
6. Push `master` to `origin/master`.
7. Delete the merged short branch with `git branch -d`.
8. Report final SHA alignment and cleanup result without claiming release readiness or final Pass.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-credentialed-browser-smoke-closeout.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-credentialed-browser-smoke-closeout.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-credentialed-browser-smoke-closeout.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-credentialed-browser-smoke-closeout.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-credentialed-browser-smoke-closeout.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-credentialed-browser-smoke-closeout.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-credentialed-browser-smoke-closeout.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-credentialed-browser-smoke-closeout.md`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-credentialed-browser-smoke-closeout-2026-06-27`
- `git checkout master`
- `git merge --ff-only codex/content-admin-credentialed-browser-scope-20260627`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-credentialed-browser-smoke-closeout-2026-06-27`
- `git push origin master`
- `git branch -d codex/content-admin-credentialed-browser-scope-20260627`

## Stop Conditions

- Any changed file falls outside the allowed file list.
- ff-only merge is no longer possible.
- `origin/master` diverges before push.
- Any validation gate fails.
- Evidence would need secrets, credentials, tokens, database URLs, Authorization headers, raw prompts, raw generated content, Provider payloads, DB rows, screenshots, or page text.
- The next step would require PR, force push, release readiness, final Pass, browser/e2e/dev-server, DB, Provider, publish, staging/prod, payment, or external service.
