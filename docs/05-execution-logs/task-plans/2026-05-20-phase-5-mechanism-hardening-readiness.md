# Phase 5 Mechanism Hardening Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden Tiku's semi-automation workflow before Phase 5 AI/RAG work starts.

**Architecture:** Keep the mechanism lightweight and repository-local. Add script checks around task claiming and evidence recording, then update SOP/state files so agents can recover and close tasks with less hand-written judgment.

**Tech Stack:** PowerShell scripts, Git, existing npm quality gates, Markdown SOP/evidence files, YAML state and queue files.

---

## Required Reading

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/03-standards/git-workflow.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-student-experience-readiness.md`

## Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-20-phase-5-mechanism-hardening-readiness.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-mechanism-hardening-readiness.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Test-TaskClaimReadiness.ps1`
- `scripts/agent-system/Add-TaskEvidenceResult.ps1`
- `scripts/agent-system/Test-AgentSystemReadiness.ps1`
- `scripts/agent-system/Update-TaskStatus.ps1`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/**`
- `drizzle/**`
- `.env.example`

Risk gates:

- No dependency change.
- No database migration.
- No auth or permission model change.
- No secret or environment change.
- No destructive data operation.
- No deployment.

## Task 1: Register The Mechanism Hardening Task

**Files:**

- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Create: `docs/05-execution-logs/evidence/2026-05-20-phase-5-mechanism-hardening-readiness.md`

- [ ] **Step 1: Add queue entry**

Append `phase-5-mechanism-hardening-readiness` after the Phase 4 readiness task. Use:

```yaml
- id: phase-5-mechanism-hardening-readiness
  title: Phase 5 Mechanism Hardening Readiness
  phase: phase-5-ai-rag
  sourceStory: user-approved-mechanism-hardening-2026-05-20
  dependencies:
    - phase-4-student-experience-readiness-evidence
  taskPlanPolicy: required
  allowedFiles:
    - docs/05-execution-logs/task-plans/2026-05-20-phase-5-mechanism-hardening-readiness.md
    - docs/05-execution-logs/evidence/2026-05-20-phase-5-mechanism-hardening-readiness.md
    - docs/03-standards/git-workflow.md
    - docs/03-standards/local-ci.md
    - docs/04-agent-system/sop/automation-loop.md
    - docs/04-agent-system/sop/security-review-gate.md
    - docs/04-agent-system/sop/dependency-introduction-gate.md
    - docs/04-agent-system/state/project-state.yaml
    - docs/04-agent-system/state/task-queue.yaml
    - scripts/agent-system/Test-TaskClaimReadiness.ps1
    - scripts/agent-system/Add-TaskEvidenceResult.ps1
    - scripts/agent-system/Test-AgentSystemReadiness.ps1
    - scripts/agent-system/Update-TaskStatus.ps1
  blockedFiles:
    - package.json
    - pnpm-lock.yaml
    - package-lock.json
    - src/**
    - drizzle/**
    - .env.example
  riskTypes:
    - automation_policy
    - local_tooling
    - evidence_integrity
    - state_transition
  validationCommands:
    - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
    - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-5-mechanism-hardening-readiness
    - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Add-TaskEvidenceResult.ps1 -EvidencePath docs\05-execution-logs\evidence\2026-05-20-phase-5-mechanism-hardening-readiness.md -Command 'dry-run' -Result pass -Summary 'append helper smoke test' -DryRun
    - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
    - npm.cmd run build
    - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
  evidencePath: docs/05-execution-logs/evidence/2026-05-20-phase-5-mechanism-hardening-readiness.md
  status: claimed
  retryCount: 0
```

- [ ] **Step 2: Update project state**

Set:

```yaml
project:
  currentPhase: phase-5-ai-rag
currentTask:
  id: phase-5-mechanism-hardening-readiness
  status: claimed
  planPath: docs/05-execution-logs/task-plans/2026-05-20-phase-5-mechanism-hardening-readiness.md
  evidencePath: docs/05-execution-logs/evidence/2026-05-20-phase-5-mechanism-hardening-readiness.md
  branch: codex/phase-5-mechanism-hardening-readiness
handoff:
  nextRecommendedAction: phase-5-mechanism-hardening-readiness
```

- [ ] **Step 3: Create evidence skeleton**

Create evidence with metadata, scope, intended scripts, validation placeholders, and accepted gaps.

## Task 2: Add Claim Readiness Script With RED/GREEN Verification

**Files:**

- Create: `scripts/agent-system/Test-TaskClaimReadiness.ps1`
- Modify: `docs/05-execution-logs/evidence/2026-05-20-phase-5-mechanism-hardening-readiness.md`

- [ ] **Step 1: RED command**

Run before creating the script:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-5-mechanism-hardening-readiness
```

Expected: fail because the script file does not exist.

- [ ] **Step 2: Implement script**

The script must:

- Accept `-TaskId`, optional `-QueuePath`, optional `-ProjectStatePath`.
- Fail on protected `master` or `main`.
- Find the task block by `id`.
- Confirm status is one of `pending`, `claimed`, `implemented`, or `validated`.
- Confirm all dependency ids have a `done`, `closed`, `pushed`, or `merged` status.
- Print allowed files, blocked files, risk types, task plan policy, validation commands, and security/dependency gate hints.
- Warn when `taskPlanPolicy` is missing.
- Exit non-zero when the task is missing, blocked, on protected branch, or has incomplete dependencies.

- [ ] **Step 3: GREEN command**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-5-mechanism-hardening-readiness
```

Expected: pass on the task branch and print `task claim readiness passed`.

## Task 3: Add Evidence Result Append Script With RED/GREEN Verification

**Files:**

- Create: `scripts/agent-system/Add-TaskEvidenceResult.ps1`
- Modify: `docs/05-execution-logs/evidence/2026-05-20-phase-5-mechanism-hardening-readiness.md`

- [ ] **Step 1: RED command**

Run before creating the script:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Add-TaskEvidenceResult.ps1 -EvidencePath docs\05-execution-logs\evidence\2026-05-20-phase-5-mechanism-hardening-readiness.md -Command 'dry-run' -Result pass -Summary 'append helper smoke test' -DryRun
```

Expected: fail because the script file does not exist.

- [ ] **Step 2: Implement script**

The script must:

- Accept `-EvidencePath`, `-Command`, `-Result`, optional `-Summary`, optional `-ExitCode`, optional `-OutputPath`, optional `-DryRun`.
- Validate `-Result` as `pass`, `fail`, or `skipped`.
- Refuse to append to a missing evidence file unless `-DryRun` is used.
- Render a deterministic Markdown section with timestamp, command, result, exit code, and summary.
- In `-DryRun`, write the rendered section to output without modifying the evidence file.

- [ ] **Step 3: GREEN command**

Run the same dry-run command.

Expected: pass and print a section containing `Result: pass` and `append helper smoke test`.

## Task 4: Update SOPs And Existing Script Readiness

**Files:**

- Modify: `docs/04-agent-system/sop/automation-loop.md`
- Modify: `docs/03-standards/git-workflow.md`
- Modify: `docs/03-standards/local-ci.md`
- Modify: `docs/04-agent-system/sop/security-review-gate.md`
- Modify: `docs/04-agent-system/sop/dependency-introduction-gate.md`
- Modify: `scripts/agent-system/Test-AgentSystemReadiness.ps1`
- Modify: `scripts/agent-system/Update-TaskStatus.ps1`

- [ ] **Step 1: Update SOPs**

Add concise rules for:

- Expanded task statuses.
- `taskPlanPolicy`.
- Claim preflight.
- Evidence append helper.
- Closeout evidence not needing to record its own final SHA.
- Phase 5 AI/RAG gate before dependency or secret work.

- [ ] **Step 2: Update readiness script**

Add required script checks for:

- `scripts\agent-system\Test-TaskClaimReadiness.ps1`
- `scripts\agent-system\Add-TaskEvidenceResult.ps1`

- [ ] **Step 3: Update status script**

Expand `Update-TaskStatus.ps1` allowed statuses to include:

```text
pending, claimed, implemented, validated, committed, merged, pushed, closed, blocked, done
```

Keep `done` for backward compatibility with existing queue entries.

## Task 5: Validate, Record Evidence, And Handoff

**Files:**

- Modify: `docs/05-execution-logs/evidence/2026-05-20-phase-5-mechanism-hardening-readiness.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [ ] **Step 1: Run script parser checks**

Run:

```powershell
Get-ChildItem -Path 'scripts\agent-system' -Filter '*.ps1' | ForEach-Object { $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $_.FullName -Raw), [ref]$null); Write-Output "Parsed $($_.Name)" }
```

Expected: every script parses.

- [ ] **Step 2: Run declared validation commands**

Run all validation commands from the queue entry.

- [ ] **Step 3: Update state**

Set task status to `validated` or `closed` depending on whether the task is committed/merged in the same session. Set `currentTask` back to idle/null only after closeout.

- [ ] **Step 4: Record evidence**

Record command outputs, failures and fixes, blocked file compliance, and git inventory.

## Self-Review

- This plan avoids package and lockfile changes.
- This plan does not alter business code.
- This plan adds two small scripts instead of a broad automation framework.
- This plan keeps current `done` statuses compatible while introducing more precise statuses for new tasks.
- This plan includes RED/GREEN checks for both new scripts.
