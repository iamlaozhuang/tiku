# Phase 6 Admin Ops Contract And Threat Model Baseline Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:verification-before-completion before claiming validation, commit, merge, push, or cleanup success. This task is documentation-only and must stay inside the queue allowed files.

**Goal:** Define the Phase 6 admin operations contract and threat model before implementation tasks add admin UI, API routes, services, or tests.

**Architecture:** The contract follows ADR-002 layering: route handlers or Server Actions stay thin, services own business rules, repositories own persistence, contracts and mappers own API shapes. This task creates no runtime behavior, dependency, schema, migration, deployment, or secret.

**Tech Stack:** Documentation only for the existing TypeScript, Next.js App Router, Drizzle, Better Auth, Vercel AI SDK, shadcn/ui, and PostgreSQL architecture.

---

## Required Sources Read

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/ui-code.md`
- `docs/03-standards/glossary.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-6-admin-ops-queue-seeding.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- Existing interface baselines: `global-db-api-skeleton.md`, `question-paper-contract.md`, `student-experience-contract.md`, and `ai-rag-contract.md`.

## Queue Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-20-phase-6-admin-ops-contract-and-threat-model-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-6-admin-ops-contract-and-threat-model-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-20-phase-6-admin-ops-contract-and-threat-model-baseline-security-review.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/**`
- `drizzle/**`
- `.env.example`

## Implementation Steps

- [x] Create isolated worktree `F:\tiku\.worktrees\phase-6-admin-ops-contract-and-threat-model-baseline` on branch `codex/phase-6-admin-ops-contract-and-threat-model-baseline`.
- [x] Run `Test-TaskClaimReadiness.ps1 -TaskId phase-6-admin-ops-contract-and-threat-model-baseline` and confirm status is `pending`, dependency is done, `taskPlanPolicy` is `required`, and security review is required.
- [x] Create this task plan before editing the contract.
- [x] Create `docs/02-architecture/interfaces/admin-ops-contract.md` with:
  - sources and non-goals;
  - common admin API contract;
  - public identifier and DTO rules;
  - `organization`, `authorization`, `redeem_code`, `model_config`, `audit_log`, and `ai_call_log` boundaries;
  - threat model assets, trust boundaries, abuse cases, and required mitigations;
  - follow-up implementation sequencing.
- [x] Create dedicated security review artifact with required risk coverage: `authorization`, `api_contract`, `admin`, `audit_log`, `ai_call_log`, and `threat_model`.
- [x] Create evidence file and record startup, claim, scope, and validation plan.
- [x] Update project state and task queue only inside allowed files.
- [x] Run all task validation commands and record results in evidence.
- [x] Verify changed files are limited to allowed files and blocked dependency paths are unchanged.
- [x] Commit, fast-forward merge to `master`, rerun master gates, update closeout evidence, push `origin master`, and clean the merged worktree/branch only after gates pass and evidence is updated.

## Risk Defense

- No real secrets, API keys, provider URLs, database credentials, or deployment configuration will be written.
- No dependency, lockfile, source, schema, migration, or `.env.example` file will be changed.
- The contract requires public identifiers externally and keeps numeric `id` values internal.
- The contract treats `publicId` as a lookup handle, not an authorization mechanism.
- The threat model requires admin session, role, organization scope, and resource ownership checks before read or write operations.
- The log contract keeps `audit_log` append-only and blocks raw secret/session/password exposure.
- The `ai_call_log` contract inherits Phase 5 redaction boundaries and blocks raw prompts, provider payloads, secrets, user answers, and model outputs unless a later reviewed retention policy allows it.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-6-admin-ops-contract-and-threat-model-baseline`
- `Test-Path 'docs\02-architecture\interfaces\admin-ops-contract.md'`
- `Select-String -Path 'docs\02-architecture\interfaces\admin-ops-contract.md' -Pattern 'audit_log|ai_call_log|model_config|organization|authorization|redeem_code'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --name-only`
- `git diff --name-only -- package.json pnpm-lock.yaml package-lock.yaml drizzle/** .env.example`
- `git status --short --branch`
