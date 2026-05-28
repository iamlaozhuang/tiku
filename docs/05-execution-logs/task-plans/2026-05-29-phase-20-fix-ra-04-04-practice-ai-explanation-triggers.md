# Phase 20 Fix RA-04-04 Practice AI Explanation Triggers Plan

**Task id:** `phase-20-fix-ra-04-04-practice-ai-explanation-triggers`

**Branch:** `codex/phase-20-fix-ra-04-04-practice-ai-explanation-triggers`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-04-ai-scoring-explanation-hint-model.md`

## Finding

`F-RA-04-04-001`: practice-based wrong-answer automatic `ai_explanation` and correct-answer manual `ai_explanation` trigger evidence was missing in the Phase 18 audit.

## Verification Plan

1. Inspect `practice-service` and its tests for existing wrong-answer automatic explanation and correct-answer manual trigger behavior.
2. Run focused unit tests that cover practice answer feedback.
3. Run local CI gates required for an evidence-only closure.
4. Close the task only if evidence shows the current runtime behavior satisfies the finding without schema, dependency, env, real provider, or cloud changes.

## Risk Controls

- Real provider remains blocked; only existing local/mock explanation behavior may be verified.
- No source code should change unless verification exposes a real gap.
- Do not touch schema, migrations, package manifests, lockfiles, env files, cloud/deploy configuration, or auth permission model.
