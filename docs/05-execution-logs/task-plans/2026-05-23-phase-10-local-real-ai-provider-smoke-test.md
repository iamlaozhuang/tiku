# Phase 10 Local Real AI Provider Smoke Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:verification-before-completion before claiming completion. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute the local real `model_provider` smoke test only if safe local prerequisites exist; otherwise record a blocked, redacted, bounded-sample readiness result without expanding task scope.

**Architecture:** This task is documentation and state only unless an existing local smoke-test entrypoint and local uncommitted provider configuration are already present. It follows the Phase 10 local `dev` boundary, preserves `.env.local` as an uncommitted secret store, and does not introduce dependencies or runtime code.

**Tech Stack:** Markdown documentation, YAML task state, existing PowerShell agent gates, existing npm scripts, no dependency changes.

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
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-ai-provider-safety-plan.md`

## Scope Boundary

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-real-ai-provider-smoke-test.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-ai-provider-smoke-test.md`
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

The real provider call may run only if all checks are true:

- `human approval` is recorded before any external provider call.
- `.env.local` or another local uncommitted secret store exists.
- Required provider variable names are present with non-empty values, but values are never printed or copied into evidence.
- `APP_ENV` or equivalent local environment proof confirms `dev`.
- Provider feature gating confirms local-only real-provider smoke testing is enabled.
- For DeepSeek local preparation, variable names may be prepared in `.env.local` as `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, and `DEEPSEEK_MODEL`, but values must never be pasted into chat or committed.
- An existing repository smoke-test entrypoint exists; no new dependency or runtime code is added in this task.
- The sample is a `bounded sample` with an explicit request cap and no retry storm.
- Output and evidence are `redacted`; they include no raw prompt, raw answer, raw model response, provider payload, Authorization header, API key, secret, password, session token, signed URL, or database URL.

If any precondition is missing, the task records a blocked result and stops before any provider call.

## Task Steps

### Task 1: Validate Local Provider Preconditions

**Files:**

- Create: `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-real-ai-provider-smoke-test.md`
- Create: `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-ai-provider-smoke-test.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [x] **Step 1: Confirm task claim readiness**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-real-ai-provider-smoke-test
```

Expected: task is claimable, dependency `phase-10-local-real-ai-provider-safety-plan` is closed, and allowed/blocked file lists match this plan.

- [x] **Step 2: Check secret store presence without printing values**

Run a redacted local check for `.env.local` and report only variable presence or local/non-local classification. Expected safe output contains no API key, no secret, no Authorization header, no raw provider payload, and no database URL.

- [x] **Step 3: Check for an existing real provider smoke entrypoint**

Search existing code and scripts for provider SDK usage or a smoke-test command. Expected: if no existing entrypoint exists, do not add dependencies or modify `src/**`; record the task as blocked.

- [x] **Step 4: Record blocked or executed smoke result**

Current result: blocked before provider call because local prerequisites are incomplete. Evidence records `no API key`, `no secret`, `redacted`, and `bounded sample`.

- [x] **Step 5: Run required validation commands**

Run:

```powershell
Select-String -Path 'docs\05-execution-logs\evidence\2026-05-23-phase-10-local-real-ai-provider-smoke-test.md' -Pattern 'no API key|no secret|redacted|bounded sample'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Expected: validation exits `0`; changed files remain limited to the four allowed files.

## Risk Defense

- Secret handling: `.env.local` is not modified, committed, copied, or printed.
- Provider safety: no provider call is made unless all local-only and redaction preconditions pass first.
- Dependency isolation: no package, lockfile, SDK, CLI, or provider dependency is added.
- Source isolation: no `src/**`, `drizzle/**`, `.env.example`, or runtime behavior is changed.
- Environment isolation: staging, prod, deployment, public storage, production provider quota, and production databases are not touched.
- Evidence integrity: evidence records only bounded, redacted readiness facts and never raw prompts, answers, model responses, provider payloads, or secrets.
