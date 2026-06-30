# Owner Preview Local Walkthrough Preparation Package Plan

Task id: `owner-preview-local-walkthrough-preparation-package-2026-06-30`

## Authorization

- Approval source: `current_user_requested_owner_preview_local_walkthrough_preparation_package_2026_06_30`
- Branch: `codex/owner-preview-local-walkthrough-prep-20260630`
- Task kind: `docs_state_only_owner_preview_preparation`
- Closeout allowed after local governance validation: local commit, fast-forward merge to `master`, push to
  `origin/master`, and delete the merged short branch.

## Required Read Set

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-remaining-terminal-active-queue-archive-index-cleanup.md`
- `docs/05-execution-logs/evidence/2026-06-30-remaining-terminal-active-queue-archive-index-cleanup.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-remaining-terminal-active-queue-archive-index-cleanup.md`
- `docs/05-execution-logs/acceptance/2026-06-30-remaining-terminal-active-queue-archive-index-cleanup.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/task-plans/2026-06-28-owner-facing-local-experience-batch.md`
- `docs/05-execution-logs/evidence/2026-06-28-owner-facing-local-experience-batch.md`
- `docs/05-execution-logs/evidence/2026-06-01-phase-28-owner-acceptance-prep-plan.md`
- `docs/05-execution-logs/evidence/2026-06-01-phase-28-owner-role-scenario-scripts.md`
- `docs/05-execution-logs/acceptance/2026-06-23-l6-owner-preview-readiness-package.md`
- Related local startup/script index: `package.json`, `compose.yaml`, `scripts/db/Seed-DevDatabase.ps1`,
  `scripts/local/Invoke-FreshValidationRun.ps1`, and `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`

Private local account files under `D:\tiku-local-private\**` are deliberately not read by this task.

## Goal

Create a docs/state-only owner-preview package that lets the owner personally run a local browser walkthrough of Tiku
roles, workflows, and boundaries. Codex only prepares checklists, recording templates, boundary reminders, and startup
recommendations.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-owner-preview-local-walkthrough-preparation-package.md`
- `docs/05-execution-logs/handoffs/2026-06-30-owner-preview-local-walkthrough-preparation-package.md`
- `docs/05-execution-logs/evidence/2026-06-30-owner-preview-local-walkthrough-preparation-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-owner-preview-local-walkthrough-preparation-package.md`
- `docs/05-execution-logs/acceptance/2026-06-30-owner-preview-local-walkthrough-preparation-package.md`

## Blocked Files And Actions

- No source, test, UI, DB schema, migration, seed, script, package, lockfile, or dependency changes.
- No browser launch, browser login, Playwright/e2e, raw DOM, screenshots, traces, cookies, tokens, sessions,
  localStorage, or Authorization header access.
- No private account file read, credential capture, `.env*` read, secret, connection string, or plaintext
  `redeem_code` evidence.
- No database connection, raw rows, internal IDs, PII, email, phone, seed execution, or destructive operation.
- No Provider/AI call, Provider configuration, model config read/write, prompt, payload, raw AI input/output, or full
  generated content capture.
- No full `question`, `paper`, `material`, `resource`, or `chunk` content recording.
- No staging/prod/cloud/deploy, release readiness, final Pass, PR, force push, or Cost Calibration.

## Implementation Steps

1. Materialize this task in `project-state.yaml`, `task-queue.yaml`, and this plan before writing the package.
2. Create the owner-preview handoff package with startup checklist, role list, role workflow checklists, AI/Provider
   stop boundaries, problem recording template, sensitive information ban list, and owner safety notes.
3. Record redacted evidence, audit, and acceptance for the docs/state-only package.
4. Run scoped formatting, diff, blocked-path, and Module Run v2 governance validation.
5. If validation passes, commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short
   branch.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-owner-preview-local-walkthrough-preparation-package.md docs/05-execution-logs/handoffs/2026-06-30-owner-preview-local-walkthrough-preparation-package.md docs/05-execution-logs/evidence/2026-06-30-owner-preview-local-walkthrough-preparation-package.md docs/05-execution-logs/audits-reviews/2026-06-30-owner-preview-local-walkthrough-preparation-package.md docs/05-execution-logs/acceptance/2026-06-30-owner-preview-local-walkthrough-preparation-package.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-owner-preview-local-walkthrough-preparation-package.md docs/05-execution-logs/handoffs/2026-06-30-owner-preview-local-walkthrough-preparation-package.md docs/05-execution-logs/evidence/2026-06-30-owner-preview-local-walkthrough-preparation-package.md docs/05-execution-logs/audits-reviews/2026-06-30-owner-preview-local-walkthrough-preparation-package.md docs/05-execution-logs/acceptance/2026-06-30-owner-preview-local-walkthrough-preparation-package.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env docs/04-agent-system/state/archive docs/04-agent-system/state/task-history-index.yaml
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId owner-preview-local-walkthrough-preparation-package-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId owner-preview-local-walkthrough-preparation-package-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId owner-preview-local-walkthrough-preparation-package-2026-06-30 -SkipRemoteAheadCheck
```

## Risk Defense

- Keep the package procedural and redaction-first; it must not become acceptance evidence.
- Use role labels and flow labels only; avoid secret URLs, internal IDs, raw content, or screenshots.
- Treat AI, Provider, staging, prod, deployment, Cost Calibration, DB, seed, and dependency work as explicit stop
  boundaries.
- State clearly that the owner, not Codex, performs any browser login or local walkthrough.
