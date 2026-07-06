# 2026-07-06 0704 Local No-Provider Route Grounding Replay Plan

## Scope

- Task id: `0704-local-no-provider-route-grounding-replay-2026-07-06`
- Branch: `codex/0704-no-provider-route-grounding-replay-2026-07-06`
- Trigger: user approved the next-step recommendation after local grounding materialization replay.
- Goal: verify whether the current localhost business route/bridge layer consumes the materialized local `.runtime/uploads` grounding catalog under a forced no-Provider boundary.

## Read Gate

Completed before route execution:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-generation-runtime-acceptance.md`
- `docs/05-execution-logs/evidence/2026-07-06-local-adversarial-acceptance-recheck.md`
- `docs/05-execution-logs/evidence/2026-07-06-0704-local-grounding-materialization-replay.md`

## Allowed Work

- Reuse the current local `.runtime/uploads/dev/resource/` materialization artifact.
- Start localhost against the local 0704 DB target.
- Force no-Provider behavior by running the local process without a Provider credential value.
- Use private/local credentials in memory only for route login.
- Execute minimal route probes for personal, organization, and content AI generation entrypoints.
- Record only redacted aggregate status, route labels, role labels, API codes, and bridge fields.

## Blocked Work

- No Provider call, Provider payload, prompt, raw AI output, Cost Calibration, staging/prod, deploy, env/secret change, dependency change, package/lockfile change, schema/migration/seed change, source change, or destructive DB operation.
- No screenshots, DOM dump, trace, cookie/session/token output, Authorization header output, DB URL output, raw DB rows, internal ids, full question, full paper, full material, full resource, or full chunk content.
- No browser role matrix and no DB-backed closed-loop workflow.

## Execution Approach

1. Confirm local materialized catalog is present and ignored by Git.
2. Start local Next.js service on `127.0.0.1:3000` with Provider credential blanked for the process.
3. Use API route calls only:
   - `personal_advanced_student` route POST to `/api/v1/personal-ai-generation-requests` with `responseMode=local_browser_experience`.
   - `content_admin` route POST to `/api/v1/content-ai-generation-requests`.
   - `org_advanced_admin` route POST to `/api/v1/organization-ai-generation-requests`.
4. Prefer AI出题 as the minimal route probe; only add AI组卷 if needed to disambiguate behavior.
5. Stop localhost after probes.

## Expected Observations

- Personal route should move beyond `insufficient_grounding_evidence` and expose `missing_provider_credential` with `providerCallExecuted=false`.
- Content and organization admin routes may still return `409015` because the current external route rejects missing generated structured output before returning the runtime bridge payload. This is a route observability limitation, not proof that grounding failed.

## Validation Plan

- Route replay script aggregate output.
- `npm.cmd exec -- prettier --check --ignore-unknown` on changed markdown/yaml files.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-local-no-provider-route-grounding-replay-2026-07-06`
- Commit hook lint/typecheck.
