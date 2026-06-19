# AP-01 Qwen User-Visible Result Local DB Persistence Execution Plan

## Task

- Task id: `ap-01-qwen-user-visible-result-local-db-persistence-execution`
- Branch: `codex/ap-01-qwen-user-visible-result-local-db-persistence-execution`
- Objective: write one already redacted, user-visible AP-01 result through the real local `personal_ai_generation_result`
  persistence path without any additional provider call.

## Governance Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-user-visible-result-local-db-persistence-approval.md`

## Scope

- Allowed edits: task queue, project state, coverage matrix, this plan, evidence, and audit review.
- Runtime action: local DB persistence only.
- Provider/model call: blocked, `maxRequests=0`.
- Env access: `.env.local` may be read in process only for `DATABASE_URL`.
- DB target: local/dev loopback or local Docker `tiku-postgres` only.
- Result path: existing `materializeRouteIntegratedRedactedResult` plus
  `createPersonalAiGenerationResultPersistenceService` and
  `createPostgresPersonalAiGenerationResultRepository`.
- Parent fixture: create or reuse a minimal local `ai_generation_task` fixture only if needed for the FK.

## Redaction Boundary

Evidence may record only command names, pass/fail, target classification, table presence, row-count deltas, persistence
status, redaction status, and blocked gates. Evidence must not record `.env*` contents, full `DATABASE_URL`, provider
keys, raw prompt, raw response, raw model output, provider payload, raw error text, request body, raw DB rows, row data,
public id inventories, screenshots, traces, or HTML reports.

## Execution Steps

1. Confirm branch and task context.
2. Create task/state/evidence/audit records.
3. Run a controlled inline local DB persistence runner:
   - read `.env.local` for `DATABASE_URL` in process only;
   - validate DB target class is local/dev;
   - verify required tables exist;
   - create/reuse minimal `ai_generation_task` fixture if required;
   - persist one redacted draft result through the existing result service/repository path;
   - record only sanitized counts/status.
4. Run docs/state formatting and quality gates.
5. Commit locally. Do not push, PR, merge, deploy, or run Cost Calibration Gate.

## Stop Conditions

- Missing `DATABASE_URL`.
- DB target is not local/dev.
- Local DB unavailable.
- Required tables are missing.
- Existing persistence path cannot complete without source/schema/script/dependency changes.
- Raw output would enter evidence or persistence.
- A provider call would be required.
