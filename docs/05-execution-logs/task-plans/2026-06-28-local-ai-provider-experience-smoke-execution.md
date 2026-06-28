# Local AI Provider Experience Smoke Execution Task Plan

## Task

- Task id: `local-ai-provider-experience-smoke-execution-2026-06-28`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Branch: `codex/local-ai-provider-smoke-20260628`
- Task kind: `provider_smoke_execution`
- Approval: current user approved executing the next task after the local full-loop gap reseed, including local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch cleanup after validation.

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
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- Related AI generation, RAG, authorization, organization training, student experience, and traceability documents referenced by the local full-loop gap reseed.

## Requirement Decision Map

- AI SDK packages are installed but gated; real Provider use requires explicit task approval and redacted evidence.
- Local AI generation for `content_admin` and `org_advanced_admin` must preserve formal `question`/`paper` write boundaries.
- `org_standard_admin` must remain denied or unavailable for organization AI generation.
- Student AI explanation may be smoke-tested only without raw prompt, raw answer, raw AI output, full question content, or Provider payload evidence.
- Cost Calibration, pricing, quota defaults, release readiness, final Pass, staging/prod/deploy, payment, OCR/export, and external services remain blocked.

## Scope

Allowed actions:

- Run existing localhost/127.0.0.1 local smoke commands and existing route/service paths.
- Run one tiny redacted Provider smoke through the existing `scripts/ai/run-personal-ai-provider-smoke.mjs` gate if current-process Provider credential is available.
- Run existing focused local e2e coverage for content AI generation, organization AI generation, student answer/AI explanation, organization training, analytics, and negative standard-admin boundaries.
- Update only this task's state, queue, traceability, evidence, audit, and acceptance files.

Blocked actions:

- Read, print, or edit `.env*`.
- Change Provider configuration, fallback chains, package/lockfile, source, tests, scripts, schema, migrations, seed data, or dependencies.
- Execute Cost Calibration, cost measurement, pricing, quota default decisions, release readiness, final Pass, staging/prod/deploy, payment, OCR/export, external services, PR, or force push.
- Record credentials, tokens, cookies, localStorage, Authorization headers, connection strings, raw DB rows, internal ids, user emails/phones, plaintext `redeem_code`, raw DOM, screenshots, traces, Provider payloads, prompts, raw AI output, raw student or employee answers, or full question/paper/resource/chunk content.

## Execution Approach

1. Record fresh approval in queue/state before execution.
2. Run the existing Provider smoke runner in dry-run mode to verify the redaction and request-count gate.
3. Run the existing Provider smoke runner in approved execute mode with the current process only; if the current process has no credential, record the safe blocked result without reading `.env*`.
4. Run existing focused e2e smoke on localhost/127.0.0.1 for the content/admin organization/student/analytics surfaces.
5. Record only redacted command status, route category, role coverage, request count class, result status, failure category, and redaction status.
6. Run scoped formatting, diff, project status, and Module Run v2 gates before commit/merge/push cleanup.

## Validation Commands

- `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`
- `powershell.exe -NoProfile -Command "$env:TIKU_PROVIDER_SMOKE_APPROVED='1'; <redacted Provider smoke execute wrapper>"`
- `npm.cmd run test:e2e -- e2e/local-full-loop-ai-generation-paper-provider-smoke.spec.ts e2e/local-full-loop-student-answer-ai-explanation-smoke.spec.ts e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts --reporter=line`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-local-ai-provider-experience-smoke-execution.md docs/05-execution-logs/task-plans/2026-06-28-local-ai-provider-experience-smoke-execution.md docs/05-execution-logs/evidence/2026-06-28-local-ai-provider-experience-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-28-local-ai-provider-experience-smoke-execution.md docs/05-execution-logs/acceptance/2026-06-28-local-ai-provider-experience-smoke-execution.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-local-ai-provider-experience-smoke-execution.md docs/05-execution-logs/task-plans/2026-06-28-local-ai-provider-experience-smoke-execution.md docs/05-execution-logs/evidence/2026-06-28-local-ai-provider-experience-smoke-execution.md docs/05-execution-logs/audits-reviews/2026-06-28-local-ai-provider-experience-smoke-execution.md docs/05-execution-logs/acceptance/2026-06-28-local-ai-provider-experience-smoke-execution.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-ai-provider-experience-smoke-execution-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-ai-provider-experience-smoke-execution-2026-06-28 -SkipRemoteAheadCheck`

## Stop Conditions

Stop and request fresh approval if any step requires package/lockfile change, `.env*` access or modification, Provider configuration change, more than the existing tiny local Provider smoke, raw prompt/output/payload evidence, schema/migration/seed change, destructive or shared DB action, staging/prod/deploy, payment/OCR/export/external service, Cost Calibration, pricing/quota defaults, release readiness, final Pass, PR, or force push.
