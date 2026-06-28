# Local AI Provider Env Local Readonly Smoke Retry Task Plan

## Task

- Task id: `local-ai-provider-env-local-readonly-smoke-retry-2026-06-28`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Branch: `codex/local-provider-env-smoke-20260628`
- Task kind: `provider_smoke_execution`
- Approval: current user approved readonly access to `D:\tiku\.env.local` for `ALIBABA_API_KEY` only, injection into the current command process only, at most one real Provider smoke request, existing localhost e2e rerun, local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch cleanup.

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
- Prior evidence: `docs/05-execution-logs/evidence/2026-06-28-local-ai-provider-experience-smoke-execution.md`

## Scope

Allowed actions:

- Read only `D:\tiku\.env.local` for `ALIBABA_API_KEY`.
- Do not print, persist, transform into evidence, or copy the key.
- Inject the key into the current command process only.
- Execute the existing Provider smoke runner with `--max-requests 1`.
- Record only redacted status metadata.
- Rerun existing localhost e2e specs:
  - `e2e/local-full-loop-ai-generation-paper-provider-smoke.spec.ts`
  - `e2e/local-full-loop-student-answer-ai-explanation-smoke.spec.ts`
  - `e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts`

Blocked actions:

- Modify `.env*`.
- Read any `.env*` key except `ALIBABA_API_KEY`.
- Output or record the Provider key.
- Change Provider configuration, source, tests, scripts, schema, migrations, seed data, package files, or lockfiles.
- Record prompt, Provider payload, raw AI output, raw student or employee answers, or full question/paper/resource/chunk content.
- Execute Cost Calibration, cost measurement, pricing, quota defaults, release readiness, final Pass, staging/prod/deploy, payment/OCR/export, external services, PR, or force push.

## Execution Approach

1. Create task packet and update queue/state before any Provider execution.
2. Run dry-run Provider smoke with zero requests.
3. In a single PowerShell command, parse only `ALIBABA_API_KEY` from `.env.local`, set it in the process environment, run the Provider smoke runner once, and filter output to redacted status fields.
4. Rerun focused localhost e2e.
5. Delete transient Playwright artifacts if generated.
6. Update evidence/audit/acceptance/state/queue.
7. Run scoped formatting, diff, project status, and Module Run v2 gates before closeout.

## Validation Commands

- `node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --dry-run`
- `powershell.exe -NoProfile -Command "read ALIBABA_API_KEY from .env.local without output; set TIKU_PROVIDER_SMOKE_APPROVED=1; run one Provider smoke; output redacted status only"`
- `npm.cmd run test:e2e -- e2e/local-full-loop-ai-generation-paper-provider-smoke.spec.ts e2e/local-full-loop-student-answer-ai-explanation-smoke.spec.ts e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts --reporter=line`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-local-ai-provider-env-local-readonly-smoke-retry.md docs/05-execution-logs/task-plans/2026-06-28-local-ai-provider-env-local-readonly-smoke-retry.md docs/05-execution-logs/evidence/2026-06-28-local-ai-provider-env-local-readonly-smoke-retry.md docs/05-execution-logs/audits-reviews/2026-06-28-local-ai-provider-env-local-readonly-smoke-retry.md docs/05-execution-logs/acceptance/2026-06-28-local-ai-provider-env-local-readonly-smoke-retry.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-local-ai-provider-env-local-readonly-smoke-retry.md docs/05-execution-logs/task-plans/2026-06-28-local-ai-provider-env-local-readonly-smoke-retry.md docs/05-execution-logs/evidence/2026-06-28-local-ai-provider-env-local-readonly-smoke-retry.md docs/05-execution-logs/audits-reviews/2026-06-28-local-ai-provider-env-local-readonly-smoke-retry.md docs/05-execution-logs/acceptance/2026-06-28-local-ai-provider-env-local-readonly-smoke-retry.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId local-ai-provider-env-local-readonly-smoke-retry-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId local-ai-provider-env-local-readonly-smoke-retry-2026-06-28 -SkipRemoteAheadCheck`

## Stop Conditions

Stop if the task requires reading additional secrets, modifying `.env*`, more than one Provider request, Provider configuration changes, source/test/script/package/lockfile/schema/migration/seed changes, raw prompt/output/payload evidence, Cost Calibration, pricing/quota defaults, release/final Pass, staging/prod/deploy, payment/OCR/export/external service, PR, or force push.
