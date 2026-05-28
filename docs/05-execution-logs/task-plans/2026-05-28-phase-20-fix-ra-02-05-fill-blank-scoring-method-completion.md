# Phase 20 Fix RA-02-05 Fill Blank Scoring Method Completion Plan

## Task

- Task id: `phase-20-fix-ra-02-05-fill-blank-scoring-method-completion`
- Branch: `codex/phase-20-fix-ra-02-05-fill-blank-scoring-method-completion`
- Scope: implementation
- Human approval: 2026-05-28 user approved `database_migration` and local `ai_runtime` implementation for this task.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-02-question-paper-content.md`

## Approval Boundary

Allowed:

- Create and use the short-lived branch named above.
- Use TDD for fill_blank per-blank scoring model, validation, snapshots, publish/student scoring, and report display evidence.
- Modify `src/**`, `tests/**`, `e2e/**`, `docs/04-agent-system/state/**`, and task plan/evidence files.
- If necessary, modify `src/db/schema/**` and add one local migration file under `drizzle/**`.
- Use local deterministic/mock AI runtime only.

Blocked:

- `.env.local`, `.env.example`, package manifests, lockfiles, dependency changes.
- Staging/prod/cloud/deploy/real provider access.
- `drizzle-kit push`.
- Destructive data operations.
- Secret/env or external service configuration changes.

## Implementation Approach

1. Write RED tests for the fill_blank per-blank contract before production changes.
2. Add a structured `fillBlankAnswers` model using camelCase DTO/snapshot fields and snake_case database storage.
3. Persist source question per-blank answer/score details locally, using a single reviewed migration only if needed.
4. Copy per-blank details into immutable `question_snapshot` when a question is added to a draft paper.
5. Validate publish readiness by checking fill_blank per-blank score totals against `paper_question.score`.
6. Score practice auto-match fill_blank answers per blank rather than all-or-nothing when per-blank details exist.
7. Ensure report-facing snapshots/DTOs retain `scoringMethod` and per-blank details for display evidence.
8. Record security review and run task validation plus local CI gates before commit/merge/push.

## Risk Controls

- Keep all scoring deterministic and local; no real AI provider call.
- Do not log raw private answers or provider payloads in evidence.
- Keep public API fields camelCase and avoid numeric ids in DTOs.
- Use Drizzle schema definitions and migration SQL; do not hand-build runtime SQL strings for business logic.
- If implementation requires dependency, secret/env, real provider, cloud/deploy, or destructive data work, stop and request a new approval.
