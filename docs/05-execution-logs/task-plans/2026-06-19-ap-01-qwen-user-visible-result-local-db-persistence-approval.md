# AP-01 Qwen User-Visible Result Local DB Persistence Approval

## Task

- Task id: `ap-01-qwen-user-visible-result-local-db-persistence-approval`
- Branch: `codex/ap-01-qwen-user-visible-result-local-db-persistence-approval`
- Date: 2026-06-19
- Scope: docs-only approval for persisting an already redacted result through the real local `personal_ai_generation_result` path without any additional provider call.

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-user-visible-result-one-request-materialization-execution.md`
- `src/server/services/personal-ai-generation-result-persistence-service.ts`
- `src/server/repositories/personal-ai-generation-result-repository.ts`
- `src/server/services/personal-ai-generation-route-integrated-result-materialization-service.ts`
- `src/server/repositories/runtime-database.ts`
- `src/db/schema/ai-rag.ts`

## This Task Boundary

- This task is docs/state approval only.
- This task does not read `.env.local`.
- This task does not read or output `DATABASE_URL`.
- This task does not execute provider/model calls.
- This task does not write to local DB.
- This task does not modify source, tests, scripts, e2e specs, schema, migrations, package files, lockfiles, provider configuration, staging/prod/cloud/deploy resources, or `.env*`.

## Approved Next Execution

- Next task: `ap-01-qwen-user-visible-result-local-db-persistence-execution`
- Provider/model calls: blocked; request count must remain `0`.
- Env read: `.env.local` may be loaded only in process for `DATABASE_URL`.
- DB target: local/dev only, classified as localhost, `127.0.0.1`, or the local Docker `tiku-postgres` target.
- DB operation: create or reuse one redacted draft result through the existing `personal_ai_generation_result` service/repository path.
- Prerequisite task row: if the target `ai_generation_task` row is missing, the next task may create the minimum local fixture required for the foreign key through existing ORM/service-layer paths only.
- Evidence may record only pass/fail, counts, status categories, local target classification, and blocked gates.

## Persistence Boundary

- Allowed persistent columns:
  - `content_redacted_snapshot`
  - `content_digest`
  - `content_preview_masked`
  - `citation_redacted_snapshot`
  - `evidence_status`
  - `citation_count`
  - `ai_call_log_public_id`
  - `is_formal_adoption_blocked`
- Raw prompt, raw response, raw model output, provider payload, provider error text, key, token, Authorization header, full `DATABASE_URL`, `.env*` contents, raw DB rows, screenshots, traces, and HTML reports must not enter evidence or persistence.
- Formal adoption remains blocked.

## Stop Conditions

- Missing `DATABASE_URL`.
- `DATABASE_URL` is not a local/dev target.
- Local DB unavailable.
- Required table missing.
- Existing persistence path cannot complete without source changes.
- Redaction violation before persistence.
- Provider call would be required.
- Schema, migration, dependency, provider configuration, `.env*`, staging/prod/deploy, or external-service change would be required.

## AP-01 Remaining Step Estimate

- For local-only AP-01 experience closure: this approval plus roughly two execution steps remain after this task: local DB persistence execution, then local readback/user-visible verification and closeout audit.
- For release-grade AP-01 closure: add at least Cost Calibration Gate and staging/prod provider/deploy approval after the local-only steps.

## Validation Plan

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-user-visible-result-local-db-persistence-approval`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-user-visible-result-local-db-persistence-approval`
