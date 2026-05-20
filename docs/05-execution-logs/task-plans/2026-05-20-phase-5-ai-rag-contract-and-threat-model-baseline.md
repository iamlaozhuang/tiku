# Phase 5 AI/RAG Contract And Threat Model Baseline Task Plan

## Metadata

- Task id: `phase-5-ai-rag-contract-and-threat-model-baseline`
- Branch: `codex/phase-5-ai-rag-contract-and-threat-model-baseline`
- Base: `master`
- Date: 2026-05-20
- Task type: documentation, contract, threat model, security review

## Read Standards

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
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-rag-entry-gate-and-task-queue-seeding.md`

## Goal

Create the Phase 5 AI/RAG contract and threat model baseline before any AI/RAG business implementation, schema work, provider configuration, prompt template work, or RAG retrieval logic starts.

## Scope

Allowed outputs:

- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/05-execution-logs/task-plans/2026-05-20-phase-5-ai-rag-contract-and-threat-model-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-rag-contract-and-threat-model-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-ai-rag-contract-and-threat-model-baseline-security-review.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked outputs:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/**`
- `drizzle/**`
- `.env.example`

## Implementation Plan

1. Confirm repository recovery from `project-state.yaml`, `task-queue.yaml`, latest evidence, and Git commands.
2. Create an isolated worktree at `F:\tiku\.worktrees\phase-5-ai-rag-contract-and-threat-model-baseline` on branch `codex/phase-5-ai-rag-contract-and-threat-model-baseline`.
3. Run task claim readiness for `phase-5-ai-rag-contract-and-threat-model-baseline`.
4. Write `docs/02-architecture/interfaces/ai-rag-contract.md` with the AI/RAG boundary, API contract, `publicId` rule, redaction rules, `evidence_status` behavior, and RAG authorization filtering rule.
5. Write a dedicated security review artifact with verdict `APPROVE` or non-blocking `COMMENT` only.
6. Update `task-queue.yaml` so this task is complete and the next dependent task remains the next pending task.
7. Update `project-state.yaml` so Phase 5 remains active, current task returns to idle, and handoff points to `phase-5-model-config-and-prompt-template-baseline`.
8. Run validation gates and record results in evidence.
9. Confirm changed files are limited to the allowed file list and blocked files are untouched.
10. If all gates pass, commit, fast-forward merge to `master`, run post-merge gates, push `origin master`, and clean the worktree/branch under the user's explicit approval.

## Risk Controls

- No business implementation is introduced.
- No dependency, lockfile, source, migration, or environment example file is modified.
- No real secrets or placeholder API keys are written.
- `model_provider` and `model_config` are documented as server-side configuration boundaries only.
- `prompt_template` versioning and `model_config` snapshotting are required before later AI calls can be repeatable.
- `ai_call_log` is restricted to redacted and structured metadata unless a later security review approves safe retention.
- RAG authorization filtering must happen before retrieval results enter any AI prompt.
- `evidence_status` must prevent fabricated citations and must drive downstream behavior.

## Validation Plan

Run and record:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-5-ai-rag-contract-and-threat-model-baseline`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run build`
- `git diff --name-only`
- `git diff --name-only -- package.json pnpm-lock.yaml package-lock.json src/** drizzle/** .env.example`
- `git status --short --branch`
