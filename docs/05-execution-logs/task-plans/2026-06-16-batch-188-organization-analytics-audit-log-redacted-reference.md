# Task Plan: batch-188 Organization Analytics Audit Log Redacted Reference

## Scope

- Task id: `batch-188-organization-analytics-audit-log-redacted-reference`
- Branch: `codex/organization-analytics-batch-188-audit-log-reference`
- Baseline: `master == origin/master == 12b3749b587aa2dcfaa997950871f79959401732`
- Task kind: local implementation.
- Allowed source surfaces:
  - `src/server/contracts/**`
  - `src/server/models/**`
  - `src/server/services/**`
  - `src/server/validators/**` if needed
- Governance surfaces:
  - project state
  - task queue
  - task plan
  - evidence
  - audit review

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- Existing organization analytics contracts, model, service, and tests.

## Implementation Plan

1. Record task claim in state and normalize the focused validation command to:
   `npm.cmd run test:unit -- src/server/models/organization-analytics.test.ts src/server/services/organization-analytics-service.test.ts`
2. RED: add focused model and service tests proving the audit log reference boundary is redacted and access-gated.
3. GREEN: add the minimal contract, model helper, and service helper required by the failing tests.
4. Verify focused unit, lint, typecheck, diff-check, ModuleCloseout, PreCommit, and PrePush readiness.
5. Write evidence and audit review before closeout.
6. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch only if all gates pass.

## Boundary Decisions

- This task does not write to the real `audit_log` table.
- The redacted reference is a local DTO/service contract only.
- The output must not expose row ids, raw source rows, guarded fixture markers, provider payloads, prompts, answers, or private data.
- Scope public ids are reduced to a count for this audit reference surface.
- Persistence is explicit as `not_written` so callers cannot mistake this for a database write.

## Blocked Gates

- No env or secret file access.
- No DB execution or row/private data access.
- No provider/model call.
- No quota/cost or Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No schema/drizzle/package/lockfile/dependency change.
- No PR or force push.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-73-advanced-organization-analytics-implementation-planning -CandidateTaskId batch-188-organization-analytics-audit-log-redacted-reference -EvidencePath docs\05-execution-logs\evidence\2026-06-16-module-run-v2-auto-seed-organization-analytics.md`
- `npm.cmd run test:unit -- src/server/models/organization-analytics.test.ts src/server/services/organization-analytics-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-188-organization-analytics-audit-log-redacted-reference`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-188-organization-analytics-audit-log-redacted-reference`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-188-organization-analytics-audit-log-redacted-reference`
