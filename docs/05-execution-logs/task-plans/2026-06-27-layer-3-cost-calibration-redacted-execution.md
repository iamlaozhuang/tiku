# Layer 3 Cost Calibration Redacted Execution Task Plan

Task id: `layer-3-cost-calibration-redacted-execution-2026-06-27`

Branch: `codex/cost-calibration-execution-20260627`

Task kind: `high_risk_local_provider_cost_execution`

## Approval Boundary

This task consumes the current user's 2026-06-27 unattended serial high-risk package approval plus the supplemental Cost
Calibration authorization for:

- one local dev redacted Cost Calibration execution;
- one `.env.local` single-alias loader for `ALIBABA_API_KEY` into the current command process only;
- provider path `openai_compatible` / `alibaba-qwen` / `qwen3.7-max`;
- base URL host `dashscope.aliyuncs.com`;
- maximum 1 sample workflow, maximum 1 Provider call, 0 retry, timeout 30000 ms, existing output-token cap only, spend
  stop USD 0.05;
- local commit, ff-only merge to `master`, push `origin/master`, and merged short-branch cleanup if gates pass or if a
  redacted blocked closeout is required.

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
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-cost-calibration-redacted-approval-package.md`
- `package.json` as read-only dependency baseline.

## Requirement Decision Map

- ADR-006 confirms `ai` and `@ai-sdk/openai-compatible` are installed but gated; this task has explicit Provider/Cost
  approval and does not change dependencies.
- ADR-004 and ADR-005 keep this run local `dev` only; staging/prod/deploy remain blocked.
- The Cost Calibration approval package defines the official public pricing source and caps used here.
- The Provider smoke repair evidence proves the same OpenAI-compatible DashScope path passed once before this task.

## Evidence-Only Sources

The Provider smoke and Cost Calibration approval package evidence are consumed as prior evidence, not as permission to
expand scope beyond the task queue entry.

## Conflict Check

No conflict found between the task queue entry, current supplemental approval, ADR-006 installed dependency baseline, and
Cost Calibration approval package. The older SOP wording says Cost Calibration remains blocked without fresh approval;
the current task supplies that task-scoped fresh approval and caps.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-layer-3-cost-calibration-redacted-execution.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-cost-calibration-redacted-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-cost-calibration-redacted-execution.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-cost-calibration-redacted-execution.md`

## Blocked Scope

Blocked: source/test/script/package/lockfile changes, Provider configuration changes, second Provider call, retry loop,
DB connection or read/write, browser/dev-server/e2e, staging/prod/deploy/payment/external-service, OCR/export,
archive/index movement, PR, force push, release readiness, and final Pass.

## Execution Approach

1. Keep branch isolated on `codex/cost-calibration-execution-20260627`.
2. Run one inline Node command that opens `.env.local` only to extract `ALIBABA_API_KEY` into the current process
   environment.
3. Execute exactly one redacted `generateText` call through `@ai-sdk/openai-compatible` using:
   - provider label `openai_compatible`
   - provider name `alibaba-qwen`
   - model label `qwen3.7-max`
   - base URL `https://dashscope.aliyuncs.com/compatible-mode/v1`
   - max output tokens `8`
   - timeout `30000` ms
4. Do not print or store raw prompt, raw response, raw generated AI content, Provider payload, Authorization header,
   `.env.local` content, credential value, DB URL, cookie/localStorage, screenshot, trace, or SQL output.
5. Record only provider/model labels, host, pass/fail/blocked, request count, call-executed boolean, retry count,
   token-count summary, local minimum cost estimate, cap status, redaction status, failure category, stop condition, and
   forbidden-action checklist.

## Cost Formula

Use the pricing source already recorded by the approval package:

```text
localMinimumEstimateUsd = ((inputTokens * 1.65) + (outputTokens * 4.951)) / 1_000_000
```

If the SDK does not expose token usage, record `usage_unavailable` and do not infer a false cost.

## Risk Defenses

- One command only contains the single-alias loader and the single Provider call.
- Retry count is fixed at `0`; any failure becomes fail/blocked evidence, not a second call.
- Evidence is manually reduced to a redacted envelope before commit.
- `.env.local` remains blocked for output, copy, modification, and commit.
- No source, tests, scripts, packages, lockfiles, schema, migration, seed, browser artifacts, DB rows, or raw AI content
  are touched.

## Validation Commands

- `node --input-type=module -e <single-alias ALIBABA_API_KEY env-local loader plus one redacted openai_compatible DashScope Cost Calibration call>`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-cost-calibration-redacted-execution.md docs/05-execution-logs/evidence/2026-06-27-layer-3-cost-calibration-redacted-execution.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-cost-calibration-redacted-execution.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-cost-calibration-redacted-execution.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-cost-calibration-redacted-execution.md docs/05-execution-logs/evidence/2026-06-27-layer-3-cost-calibration-redacted-execution.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-cost-calibration-redacted-execution.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-cost-calibration-redacted-execution.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-cost-calibration-redacted-execution-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-cost-calibration-redacted-execution-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-cost-calibration-redacted-execution-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

Stop immediately and write only redacted fail/blocked closeout evidence if any of these occur:

- `ALIBABA_API_KEY` alias missing;
- one Provider call fails and another call or retry would be needed;
- output would require raw prompt, raw response, raw generated AI content, raw Provider payload, raw provider error body,
  secret, token, DB URL, or credential value;
- caps are exceeded;
- source/test/script/package/lockfile/schema/migration/seed change becomes necessary;
- DB/browser/e2e/staging/prod/deploy/payment/OCR/export/archive/index work becomes necessary;
- any mechanism gate fails outside task scope;
- release readiness or final Pass would be required.

## Handoff

If the task passes, the next serial candidate is
`layer-3-cost-calibration-redacted-rollup-2026-06-27`. If this task fails or blocks, close out the redacted blocked
evidence under the approved failed/blocked closeout boundary and stop further serial advancement.
