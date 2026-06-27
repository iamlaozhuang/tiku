# Content-admin review local browser smoke task packet normalization

## Task

- Task ID: `content-admin-review-local-browser-smoke-task-packet-normalization-approval-2026-06-27`
- Branch: `codex/content-admin-browser-smoke-packet-normalization-20260627`
- Task kind: `mechanism_hardening`
- Approval source: current user fresh approval to serially advance the recommended tasks 1 and 2 on 2026-06-27.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`

## Requirement Decision Map

- Content-admin review is part of the admin content workspace.
- Local browser smoke may validate the existing content-admin AI generation and review entry surface only at localhost L5.
- Runtime validation must not claim staging, production, Provider, DB, mutation, publish, or final acceptance readiness.
- Authorization and edition-aware requirements remain read-only context for role/entry visibility; this task does not implement or validate authorization behavior.
- Evidence must stay redacted and summary-only.

## Requirement Mapping

- `docs/01-requirements/modules/06-admin-ops.md` section 5.5 requires content-admin AI draft/review entry points without direct formal `question` or `paper` writes.
- `docs/01-requirements/stories/epic-06-admin-ops.md` US-06-15 requires visible content-admin AI question/paper entry points and review boundaries.
- This task does not validate the runtime UI. It only normalizes the queue packet so the approved follow-up can do that local-only browser smoke.

## Evidence-Only Sources

- Previous task evidence under `docs/05-execution-logs/` is used only to recover the completed source/UI chain and blocked browser follow-up status.

## Conflict Check

- No conflict found between requirements and the queue normalization scope.
- The existing browser smoke task was blocked because the packet lacked complete execution metadata and local browser/dev-server approval. This task repairs only that mechanism packet.

## Scope

Allowed:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-local-browser-smoke-task-packet-normalization.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-local-browser-smoke-task-packet-normalization.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-local-browser-smoke-task-packet-normalization.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-local-browser-smoke-task-packet-normalization.md`

Blocked:

- Source files, tests, e2e specs, `.env*`, package/lockfile, schema, drizzle, migration, seed.
- Browser runtime, dev server, e2e runtime, DB connection, Provider, credential read, mutation, publish, deploy, PR, force push.

## Plan

1. Add a closed normalization task packet for this mechanism repair.
2. Expand `content-admin-review-local-browser-smoke-validation-approval-2026-06-27` from a blocked shell into a pending local browser smoke task with concrete allowed files, blocked files, validation commands, evidence paths, and closeout policy.
3. Record approval and residual blocked gates.
4. Run scoped Prettier write/check, `git diff --check`, and Module Run v2 gates.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-local-browser-smoke-task-packet-normalization.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-local-browser-smoke-task-packet-normalization.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-local-browser-smoke-task-packet-normalization.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-local-browser-smoke-task-packet-normalization.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-local-browser-smoke-task-packet-normalization.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-local-browser-smoke-task-packet-normalization.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-local-browser-smoke-task-packet-normalization.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-local-browser-smoke-task-packet-normalization.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-local-browser-smoke-task-packet-normalization-approval-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-local-browser-smoke-task-packet-normalization-approval-2026-06-27 -SkipRemoteAheadCheck`
