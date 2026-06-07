# Phase 10 Local Real AI Provider Safety Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:verification-before-completion before claiming completion. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define the safety boundary for a later local `model_provider` smoke test without exposing credentials, provider payloads, prompts, answers, or raw model responses.

**Architecture:** This task is documentation and state only. It converts the Phase 10 Real Provider Rules into a local `dev` operating plan, records human approval requirements, and keeps all provider secrets outside Git in `.env.local`.

**Tech Stack:** Markdown documentation, project YAML state files, existing PowerShell agent gates, no dependency changes.

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
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-content-import-dry-run.md`

## Scope Boundary

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-real-ai-provider-safety-plan.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-ai-provider-safety-plan.md`
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

## Safety Contract For Later Smoke Test

The later `phase-10-local-real-ai-provider-smoke-test` may run only if all constraints below are satisfied:

- `human approval` is recorded in that task evidence before any external provider call.
- API credentials are entered by the user directly into local uncommitted `.env.local` or another local uncommitted secret store.
- The agent must not ask the user to paste credentials into chat.
- Evidence must state `no API key` and `no secret` were recorded.
- Evidence must use `redacted` summaries for provider errors, request metadata, and response outcomes.
- The sample must be a `bounded sample`, with an explicit request cap and no retry storm.
- The run must stay in local `dev`; no staging or prod database, object storage, deployment, or provider environment may be touched.
- The run must not modify `.env.example`, dependencies, lockfiles, runtime source, migrations, or production resources.

## Redaction Rules

Allowed in evidence:

- Provider display name and model display name if non-secret.
- Feature flag state, local environment label, request count, coarse latency range, and sanitized error class.
- Pass/fail status for AI scoring, AI explanation, AI hint, `kn_recommendation`, `ai_call_log` redaction, `citation`, and `evidence_status`.

Forbidden in evidence and chat:

- API key, secret, password, session token, bearer token, Authorization header, signed URL, database URL, raw prompt, raw answer, raw model response, provider payload, raw OCR output, or any raw real-content excerpt.

## Task Steps

### Task 1: Record Provider Safety Plan

**Files:**

- Create: `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-real-ai-provider-safety-plan.md`
- Create: `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-real-ai-provider-safety-plan.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [x] **Step 1: Confirm task claim readiness**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-real-ai-provider-safety-plan
```

Expected: task is `pending`, dependency `phase-10-local-real-content-import-dry-run` is complete, and allowed/blocked file lists match this plan.

- [x] **Step 2: Write this safety plan**

Record the local-only, no-secret, redacted evidence, and bounded sample constraints before any later real `model_provider` smoke test.

- [x] **Step 3: Create evidence**

Create evidence that records the plan, risk review, no provider connection, no dependency change, no `.env.local` edit, no `.env.example` edit, and the validation command results.

- [x] **Step 4: Update automation state**

Set the current task to `phase-10-local-real-ai-provider-safety-plan`, mark it closed after validation evidence is written, and leave the next recommended action as claiming `phase-10-local-real-ai-provider-smoke-test`.

- [x] **Step 5: Run validation**

Run:

```powershell
Select-String -Path 'docs\05-execution-logs\task-plans\2026-05-23-phase-10-local-real-ai-provider-safety-plan.md' -Pattern 'human approval|.env.local|no API key|no secret'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Expected: all commands exit `0`; changed files stay within the allowed file list.

## Risk Defense

- Secret handling: credentials stay in `.env.local`; this task does not read, print, create, edit, or commit any secret file.
- Provider boundary: this task does not connect to any real provider and does not create any external service configuration.
- Environment isolation: later smoke test must prove local `dev` only before calling a provider.
- Evidence integrity: no raw prompt, raw answer, raw model response, provider payload, or Authorization header may be captured.
- Cost control: later smoke test must use an explicit bounded sample and retry cap.
- Git hygiene: only allowed docs/state files are modified and committed.
