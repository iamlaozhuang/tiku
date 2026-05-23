# Phase 10 Local DeepSeek Provider Smoke Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:verification-before-completion before claiming completion. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add and execute a local-only DeepSeek `model_provider` smoke runtime that proves one bounded real provider call can run from `.env.local` without exposing secrets, raw prompts, raw answers, raw model responses, or provider payloads.

**Architecture:** The previously blocked `phase-10-local-real-ai-provider-smoke-test` remains blocked because its `allowedFiles` did not permit runtime changes. This task adds a dedicated local smoke script under `scripts/local/` with no dependency changes, verifies script safety with a unit test, runs exactly one native `fetch`-equivalent provider call from local `.env.local`, and records only redacted evidence.

**Tech Stack:** PowerShell local smoke script, Node/Next project quality gates, Vitest source-safety test, native .NET `HttpClient` from PowerShell, no package or lockfile changes.

---

## Context Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-10-local-release-candidate-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-ai-provider-smoke-test.md`

## Human Approval

Record this exact approval in queue/evidence before provider execution:

> 用户已明确批准在 local dev 中把真实 DeepSeek API 纳入 Tiku 本地 smoke test。

This approval is limited to local `dev`. It does not authorize staging, production, deployment, package changes, lockfile changes, schema changes, migration changes, public storage, raw provider payload logging, or secret disclosure.

## Scope Boundary

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-deepseek-provider-smoke-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-deepseek-provider-smoke-runtime.md`
- `scripts/local/Invoke-DeepSeekProviderSmoke.ps1`
- `tests/unit/phase-10-local-deepseek-provider-smoke-runtime.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`

## Safety Preconditions

- Read `.env.local` only from disk; never print or commit it.
- Require `APP_ENV=dev`.
- Require `AI_PROVIDER_ENABLED=true`.
- Require `DEEPSEEK_API_KEY` to be present and non-empty; output only `present_redacted`.
- Require `DEEPSEEK_BASE_URL` host to contain `deepseek.com`.
- Require `DEEPSEEK_MODEL` to be present.
- Send exactly one bounded sample request with `max_tokens` at or below `4`, no retry loop, and a finite timeout.
- On HTTP 200, record only `choicesPresent`, `usagePresent`, `requestCount`, coarse latency bucket, HTTP status, and redacted status.
- On failure, record only sanitized failure class, HTTP status when available, coarse latency bucket, request count, and redacted status. Do not print response body.

## Task Steps

### Task 1: Queue Unlock And Claim

**Files:**

- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Create: `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-deepseek-provider-smoke-runtime.md`

- [x] **Step 1: Add the new task to the queue**

Add `phase-10-local-deepseek-provider-smoke-runtime` after the blocked provider smoke task. Keep the old blocked task unchanged and make the future RAG real-content smoke depend on the new DeepSeek runtime task.

- [x] **Step 2: Claim readiness**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-deepseek-provider-smoke-runtime
```

Expected: task is claimable on `codex/phase-10-local-deepseek-provider-smoke-runtime`, dependency `phase-10-local-real-ai-provider-safety-plan` is closed, and allowed/blocked file lists match this plan.

### Task 2: Implement Local Smoke Runtime

**Files:**

- Create: `scripts/local/Invoke-DeepSeekProviderSmoke.ps1`
- Create: `tests/unit/phase-10-local-deepseek-provider-smoke-runtime.test.ts`

- [x] **Step 1: Add a local-only script**

Create a PowerShell script that:

- Parses `.env.local` without printing values.
- Validates `APP_ENV`, `AI_PROVIDER_ENABLED`, `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, and `DEEPSEEK_MODEL`.
- Builds the DeepSeek OpenAI-compatible `/chat/completions` URL from `DEEPSEEK_BASE_URL`.
- Sends one request with `max_tokens = 4`, `temperature = 0`, one short internal prompt, and no retry loop.
- Uses a finite timeout.
- Outputs a compact sanitized JSON summary only.

- [x] **Step 2: Add a safety unit test**

Add a Vitest test that reads `scripts/local/Invoke-DeepSeekProviderSmoke.ps1` and checks:

- No raw `.env.local` dump or secret output pattern is present.
- Output uses `present_redacted`.
- `max_tokens` is bounded to `4`.
- `requestCount` is fixed to `1`.
- `retryCount` is fixed to `0`.
- Evidence phrases `no API key`, `no secret`, `redacted`, and `bounded sample` are present in script output metadata.

### Task 3: Execute Real Local Smoke

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-deepseek-provider-smoke-runtime.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [x] **Step 1: Run the smoke script**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\local\Invoke-DeepSeekProviderSmoke.ps1
```

Expected on success: HTTP `200`, `choicesPresent: true`, `usagePresent: true`, `requestCount: 1`, `retryCount: 0`, coarse latency bucket, `redacted`, `no API key`, `no secret`, and `bounded sample`.

Expected on failure: no response body, no raw provider payload, sanitized failure class, HTTP status if available, `requestCount <= 1`, and `redacted`.

- [x] **Step 2: Write evidence**

Record command summaries, security review, validation results, and accepted residual risks. Do not record raw prompt, raw answer, raw model response, provider payload, Authorization header, API key, secret, token, database URL, or response body.

- [x] **Step 3: Update state**

Mark this new task `closed` only after validation evidence is written. Update `project-state.yaml` to point at the new task and evidence. Update the RAG follow-up dependency to the new task.

### Task 4: Required Validation

**Files:**

- Modify: `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-deepseek-provider-smoke-runtime.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [x] **Step 1: Run task validation commands**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-deepseek-provider-smoke-runtime
Select-String -Path 'docs\05-execution-logs\evidence\2026-05-23-phase-10-local-deepseek-provider-smoke-runtime.md' -Pattern 'no API key|no secret|redacted|bounded sample'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Expected: all commands exit `0`; changed files remain limited to task `allowedFiles`.

## Risk Defense

- Secret handling: `.env.local` is read only, never modified, never printed, never committed.
- Provider safety: one bounded request, small `max_tokens`, no retry storm, finite timeout.
- Logging safety: no raw prompt, raw answer, raw model response, provider payload, Authorization header, API key, secret, token, database URL, response body, or environment dump in output/evidence.
- Environment isolation: requires `APP_ENV=dev`; refuses staging/prod; no deployment or cloud resource operation.
- Dependency isolation: no package or lockfile changes.
- Source isolation: local smoke script only; no production runtime, route handler, schema, or migration changes.
