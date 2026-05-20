# AI Call Log And Redaction Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for implementation and superpowers:verification-before-completion before any completion, commit, merge, push, or cleanup claim. This project plan lives in `docs/05-execution-logs/task-plans/` per AGENTS.md and task queue policy.

**Goal:** Add the Phase 5 `ai_call_log` schema, DTO, mapper, and redaction-safe logging helpers without integrating any real model provider.

**Architecture:** Keep the AI call log baseline inside the existing AI/RAG boundaries. Drizzle schema owns storage names, `src/server/models` owns row and redaction-safe domain helpers, `src/server/contracts` owns camelCase DTOs, and `src/server/mappers` converts internal rows to API-safe shapes. The task will not add routes, migrations, dependencies, real secrets, or provider calls.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM schema definitions, Vitest unit tests, existing local agent quality gates.

---

## Read Standards And Recovery Sources

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
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-model-config-and-prompt-template-baseline.md`

## Confirmed Queue Scope

- Task id: `phase-5-ai-call-log-and-redaction-baseline`
- Status at claim: `pending`
- Dependency confirmed: `phase-5-model-config-and-prompt-template-baseline` is `done`
- Branch/worktree: `codex/phase-5-ai-call-log-and-redaction-baseline` at `F:\tiku\.worktrees\phase-5-ai-call-log-and-redaction-baseline`
- Allowed files:
  - `docs/05-execution-logs/task-plans/2026-05-20-phase-5-ai-call-log-and-redaction-baseline.md`
  - `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-call-log-and-redaction-baseline.md`
  - `docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-ai-call-log-and-redaction-baseline-security-review.md`
  - `src/ai/**`
  - `src/server/contracts/**`
  - `src/server/mappers/**`
  - `src/server/models/**`
  - `src/server/repositories/**`
  - `src/server/services/**`
  - `src/db/schema/**`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
- Blocked files:
  - `package.json`
  - `pnpm-lock.yaml`
  - `package-lock.json`
  - `drizzle/**`
  - `.env.example`

## File Plan

- Modify `src/db/schema/ai-rag.ts`: add `aiCallStatusValues`, `aiCallStatusEnum`, and `aiCallLog` table with only metadata, snapshots, redacted payload columns, and operational timing/token fields.
- Modify `src/db/schema/ai-rag.test.ts`: RED test for table name, enum values, required columns, and index names.
- Modify `src/server/models/ai-rag.ts`: export `AiCallStatus`, `AiCallLogRow`, `NewAiCallLogRow`, redacted snapshot types, deterministic hash helpers, recursive payload redaction, and AI call log snapshot builder.
- Modify `src/server/models/ai-rag.test.ts`: RED tests proving raw prompt, user answer, provider error payload, model output, citations, and secrets are not retained.
- Modify `src/server/contracts/ai-rag-contract.ts`: add AI call log DTO types with camelCase keys and no numeric `id`.
- Add `src/server/mappers/ai-rag-mapper.ts`: map `AiCallLogRow` to API DTO with ISO timestamps.
- Add `src/server/mappers/ai-rag-mapper.test.ts`: RED test for mapping shape and public identifier safety.
- Add `docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-ai-call-log-and-redaction-baseline-security-review.md`: required security review with verdict.
- Add `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-call-log-and-redaction-baseline.md`: command evidence, scope guard, security summary, and closeout notes.
- Modify `docs/04-agent-system/state/project-state.yaml`: record current task during work and final idle handoff after validation.
- Modify `docs/04-agent-system/state/task-queue.yaml`: move task through validated/done and set handoff to the next eligible pending task.

## Redaction Scope

- Never store raw provider secrets, env values, authorization headers, cookies, tokens, passwords, or secret refs in log payloads.
- Never store raw prompt text, user answer text, model output text, or citation text in AI call log snapshots.
- Store deterministic SHA-256 hash, length, and redaction reason for sensitive content so calls remain audit-correlatable without retaining content.
- Store provider request/response/error payloads only after recursive key-based redaction and text-field snapshotting.
- Store `modelConfigSnapshot` and `promptTemplateKey`/`promptTemplateVersion` for repeatability, using the redaction-safe snapshot from the previous baseline.

## TDD Steps

- [ ] Write failing schema/model/mapper tests for `ai_call_log` and redaction behavior.
- [ ] Run targeted tests and confirm expected RED failures.
- [ ] Implement the smallest schema/model/contract/mapper changes to pass.
- [ ] Run targeted tests and confirm GREEN.
- [ ] Refactor only if needed while keeping targeted tests green.
- [ ] Run full required validation gates and write evidence.

## Risk Defenses

- No dependency changes; dependency install uses the existing lockfile only.
- No database migrations; schema baseline only.
- No real provider integration or SDK calls.
- No real secrets or placeholder credentials.
- No API route exposure in this task.
- Security review must cover secret/env handling, provider payload redaction, prompt/user answer/model output/citation redaction, `ai_call_log` field boundaries, model config snapshot and prompt template version recording, and public identifier safety.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-5-ai-call-log-and-redaction-baseline`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run build`
- `git diff --name-only`
- `git diff --name-only -- package.json pnpm-lock.yaml package-lock.yaml drizzle/** .env.example`
