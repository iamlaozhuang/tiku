# Security Provider Metadata Redaction Allowlist Repair Plan

- Task id: `security-provider-metadata-redaction-allowlist-repair-2026-06-30`
- Branch: `codex/security-provider-metadata-redaction-20260630`
- Mode: local focused source/test security repair.
- Result target: provider metadata DTO mapping exposes only explicitly safe metadata keys and drops arbitrary legacy or abnormal scalar metadata.
- Cost Calibration Gate remains blocked.

## Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest local security static inventory task plan, evidence, audit review, and acceptance.
- `codex-security:fix-finding` guidance for reproduce-first, minimal fix, and verification discipline.

## Goal

Recheck the provider metadata redaction candidate identified by the local static inventory. If the current mapper can
preserve arbitrary scalar metadata from legacy or abnormal stored metadata, encode that behavior with a focused unit
regression and then apply a minimal allowlist repair.

## Allowed Files

- `src/server/repositories/admin-ai-audit-log-runtime-repository.ts`
- `tests/unit/admin-ai-audit-log-ops-baseline.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md`
- `docs/05-execution-logs/evidence/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md`

## Boundaries

- DB: no database connection, no raw rows, no mutation, no schema/migration/seed, no `drizzle-kit push`.
- AI/Provider: no Provider/AI call, no Provider configuration, no model config read/write, no prompt payload, no raw AI I/O.
- Browser: no browser runtime, no dev server, no e2e, no raw DOM, no screenshot, no trace.
- Credentials: no env, secrets, connection strings, registry tokens, account credentials, cookies, tokens, sessions,
  localStorage, or Authorization headers.
- Dependencies: no `package.json`, lockfile, package manager, install, update, remove, registry lookup, audit fix, or
  lifecycle script change.
- Release: no staging/prod/cloud/deploy, no release readiness, no final Pass, no Cost Calibration, no PR, no force-push.
- Evidence: record task ids, file paths, synthetic key names, status counts, validation commands, and closeout summaries
  only. Do not record raw Provider payload, prompt, raw AI I/O, raw DB rows, internal ids, PII, credentials, or full
  business content.

## Implementation Plan

1. Inspect only the allowed repository mapper and focused unit test file.
2. Add or adjust a focused regression using synthetic provider metadata that includes safe keys and synthetic forbidden
   scalar keys.
3. Run the focused unit test before the source fix and record a redacted RED result.
4. Implement a minimal allowlist in the provider metadata mapper, preserving only approved safe metadata keys.
5. Re-run the focused unit test, lint, typecheck, scoped formatting, diff checks, and Module Run v2 closeout gates.
6. Write redacted evidence, audit review, and acceptance.

## Validation Commands

```powershell
rg -n "security-provider-metadata-redaction-allowlist-repair-2026-06-30|securityFollowupCentralApproval20260630|releaseReadinessClaimed: false|finalPassClaimed: false|costCalibrationExecuted: false" docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/evidence/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md docs/05-execution-logs/acceptance/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md
npx.cmd vitest run tests/unit/admin-ai-audit-log-ops-baseline.test.ts
npm.cmd run lint -- src/server/repositories/admin-ai-audit-log-runtime-repository.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts
npm.cmd run typecheck
npx.cmd prettier --write --ignore-unknown src/server/repositories/admin-ai-audit-log-runtime-repository.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md docs/05-execution-logs/evidence/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md docs/05-execution-logs/audits-reviews/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md docs/05-execution-logs/acceptance/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md
npx.cmd prettier --check --ignore-unknown src/server/repositories/admin-ai-audit-log-runtime-repository.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md docs/05-execution-logs/evidence/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md docs/05-execution-logs/audits-reviews/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md docs/05-execution-logs/acceptance/2026-06-30-security-provider-metadata-redaction-allowlist-repair.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src/db drizzle migrations seed e2e playwright-report test-results .next .env
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-provider-metadata-redaction-allowlist-repair-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-provider-metadata-redaction-allowlist-repair-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-provider-metadata-redaction-allowlist-repair-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout Policy

If declared validation passes, local commit, fast-forward merge to `master`, push to `origin/master`, and deletion of the
merged `codex/` short branch are approved by `securityFollowupCentralApproval20260630` and the current user priority
instruction for this task.

PR creation and force-push remain forbidden. This is not release readiness, not a final Pass, and not Cost Calibration.
