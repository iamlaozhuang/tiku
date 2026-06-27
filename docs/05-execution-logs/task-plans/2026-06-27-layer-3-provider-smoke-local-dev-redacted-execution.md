# Layer 3 Provider Smoke Local Dev Redacted Execution Plan

Task id: `layer-3-provider-smoke-local-dev-redacted-execution-2026-06-27`

Branch: `codex/layer-3-provider-smoke-execution-20260627`

Task kind: `high_risk_provider_smoke_execution`

moduleRunVersion: 2

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`

## Requirement Decision Map

- Advanced AI generation requires Provider work to remain isolated from formal `question` and `paper` writes.
- ADR-006 records `ai`, `@ai-sdk/alibaba`, and `@ai-sdk/openai-compatible` as installed dependency availability only;
  live Provider use still needs task-specific approval.
- ADR-004/ADR-005 keep `dev`, `staging`, and `prod` isolated; this task is local dev only and must not touch staging or
  prod.
- The 2026-06-21 content admin decision names `@ai-sdk/alibaba`/Qwen as the preferred Provider candidate for future
  approval packages, while keeping prompt/payload/secret evidence blocked.
- The user fresh approval on 2026-06-27 approves exactly one local dev redacted Provider smoke attempt for
  `alibaba` / `qwen-plus`, credential alias `ALIBABA_API_KEY`, with one call cap, zero retry, token cap, timeout cap, and
  spend stop limit.

## Requirement Mapping

This task maps only to the Layer 3 Provider smoke gate for AI generation readiness evidence. It does not implement AI
generation, does not persist model output, does not change Provider configuration, does not calibrate cost, and does not
change source, test, schema, migration, package, lockfile, DB, browser, staging, prod, payment, OCR, or export surfaces.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution-approval-package.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`
- current `project-state.yaml` and `task-queue.yaml`

Execution logs are used as evidence and history only, not requirement SSOT.

## Conflict Check

No SSOT conflict found. The requirements and ADRs keep Provider execution blocked by default; the current user fresh
approval is the narrow task-level exception for one local dev redacted Provider smoke. Cost Calibration remains blocked
for this task. The current process environment check found `ALIBABA_API_KEY` absent; if the approved command reports
`missing_env`, the task must record a blocked result and stop without opening `.env*`.

## Approved Scope

- Register/update task queue boundaries before execution.
- Use existing `scripts/ai/run-personal-ai-provider-smoke.mjs` without modification.
- Execute at most one command in `--execute` mode with `TIKU_PROVIDER_SMOKE_APPROVED=1`.
- Provider path: `alibaba` / `qwen-plus`.
- Credential alias: `ALIBABA_API_KEY`.
- Max Provider call count: `1`.
- Retry count: `0`.
- Max output tokens: approved cap `64`; existing script uses stricter internal cap `8`.
- Timeout: `30000ms`.
- Spend stop limit: `USD 0.05`; not a cost calibration or pricing decision.
- Evidence: redacted envelope fields only.

## Blocked Scope

- `.env*` opening, copying, output, recording, or commit.
- Secret/token/DB URL/credential value output or recording.
- Raw prompt, raw response, Provider payload, raw generated AI content, full `paper` or `material` content.
- DB connection/read/write, raw SQL, broad scan, raw row dump, seed, migration, destructive DB, rollback.
- Browser, dev-server, e2e, screenshot, trace, cookie, or localStorage.
- Provider configuration change, fallback chain change, second Provider call, retry loop, second target.
- Cost Calibration execution.
- Formal publish, student-visible runtime, staging/prod/deploy/payment/external service/OCR/export.
- PR, force push, release readiness, final Pass.

## Execution Command

```powershell
$env:TIKU_PROVIDER_SMOKE_APPROVED = '1'
node scripts/ai/run-personal-ai-provider-smoke.mjs --provider alibaba --model qwen-plus --env-key ALIBABA_API_KEY --max-requests 1 --timeout-ms 30000 --execute
```

The command must not be retried. If it exits non-zero with a redacted `blocked` envelope, record that envelope category
and stop the serial package.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-local-dev-redacted-execution.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-provider-smoke-local-dev-redacted-execution-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

- Approved command reports `blocked`, `fail`, missing env, redaction violation, invalid arguments, timeout, or Provider
  error.
- A second Provider call, retry, fallback, Provider configuration change, `.env*` read, raw payload inspection, or
  sensitive evidence would be required.
- Any changed file falls outside task `allowedFiles`.
- Any validation or mechanism gate fails.
- Any next serial task would be needed after this task is blocked.
