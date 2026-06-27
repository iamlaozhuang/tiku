# Layer 3 Cost Calibration Redacted Approval Package Plan

Task id: `layer-3-cost-calibration-redacted-approval-package-2026-06-27`

Branch: `codex/cost-calibration-approval-package-20260627`

Task kind: `docs_state_approval_package`

## Approval Boundary

This task consumes the current Goal serial approval and the 2026-06-27 unattended supplemental approval for Cost
Calibration package authoring. It may update only:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md`

The supplemental approval permits readonly public official pricing lookup for this package. It does not approve this
task to execute Cost Calibration, read `.env*`, call a Provider, connect to DB, start browser/dev-server/e2e, modify
source/tests/scripts/package/lockfiles/schema/migration/seed, deploy, touch payment/external-service, execute OCR/export,
move archive/index entries, create PRs, force push, or claim release readiness/final Pass.

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
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-rollup-after-openai-compatible-dashscope-repair.md`
- Official public pricing source: `https://www.alibabacloud.com/help/en/model-studio/model-pricing`, retrieved
  2026-06-27.

## Requirement Decision Map

- Layer 1 remains complete by prior role/entry/permission evidence; this task does not change it.
- Layer 2 minimum local business loop remains the local PostgreSQL test-owned `rejected` review-command evidence; this
  task does not change it.
- Layer 3 Provider smoke is passed for `openai_compatible` / `alibaba-qwen` / `qwen3.7-max` / `dashscope.aliyuncs.com`.
- Layer 3 Cost Calibration remains unexecuted in this task, but this package materializes the approved boundary for the
  next execution task.
- Pre-release, staging/prod, deploy, payment/external-service, OCR/export, release readiness, and final Pass remain out
  of this task.

## Pricing Source Decision

The official public Model Studio model pricing page was read in readonly mode. The relevant public fields for the next
execution package are:

- model family: Qwen-Max
- model id: `qwen3.7-max`
- equivalence note: currently equivalent to `qwen3.7-max-2026-05-20`
- deployment scope for the approved base URL host: China (Beijing) / Chinese mainland
- input tokens per request band: `0<Token<=1M`
- input price: `$1.65` per 1 million tokens
- output price: `$4.951` per 1 million tokens

The next execution task must treat this as a local minimum calibration estimate, not a production quota or pricing
default. If the Provider response exposes only token counts, evidence may compute a redacted estimate using these public
prices and must label it `local_minimum_estimate_usd`. It must not record raw prompt, response, payload, generated AI
content, secret, token, credential, Authorization header, or `.env*` value.

## Successor Execution Boundary

The package seeds `layer-3-cost-calibration-redacted-execution-2026-06-27` as the next serial task with:

- provider: `openai_compatible`
- providerName: `alibaba-qwen`
- model: `qwen3.7-max`
- baseUrlHost: `dashscope.aliyuncs.com`
- credential alias: `ALIBABA_API_KEY`
- env loader: `.env.local` may be opened only by the execution command to extract `ALIBABA_API_KEY`
- sample workflows: 1
- Provider calls: max 1
- retries: 0
- timeout: 30000 ms
- max output tokens: existing script cap, not increased
- spend stop limit: USD 0.05

## Risk Defenses

- No Cost Calibration command is executed in this package.
- The official pricing lookup is public and readonly; no login, console, billing account, credential, or API call is used.
- The execution task is capped to one local dev Provider call and zero retries.
- Evidence is limited to counts, labels, cap status, redaction status, pass/fail/blocked, stop condition, and forbidden
  action checklist.
- Failure or cap expansion must stop and write blocked evidence only.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md docs/05-execution-logs/evidence/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md docs/05-execution-logs/evidence/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-cost-calibration-redacted-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-cost-calibration-redacted-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-cost-calibration-redacted-approval-package-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

- Any need to execute Cost Calibration in this package.
- Any need to read `.env*`, credential values, Provider payloads, raw prompts, raw responses, or raw generated AI content.
- Any need to modify source/tests/scripts/package/lockfiles/schema/migration/seed.
- Any need for browser/dev-server/e2e, DB, staging/prod/deploy/payment/external-service/OCR/export.
- Any mechanism gate failure that cannot be repaired inside the six allowed files.
- Any release readiness or final Pass claim.
