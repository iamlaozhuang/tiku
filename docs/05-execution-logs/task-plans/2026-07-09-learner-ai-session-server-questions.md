# 2026-07-09 Learner AI Session Server Questions Plan

## Task

- Task id: `learner-ai-session-server-questions-2026-07-09`
- Branch: `codex/learner-ai-session-server-questions`
- Goal contribution: learner AI出题 and AI组卷 answer panels must render from server-created `session.questions`.
- Scope type: learner frontend session-state wiring and focused unit tests only.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-09-learner-ai-paper-session-container-evidence.md`

## Boundaries

- No Provider execution.
- No browser automation, screenshots, raw DOM, traces, private credential files, env files, DB URLs, raw DB rows, or direct DB mutation.
- No package, lockfile, dependency, schema, migration, seed, staging, prod, deploy, Cost Calibration, PR, or force push.
- Do not change learning-session service/repository, paper assembly, result persistence, history recovery, organization admin training, content admin AI, or formal practice/answer-record/mistake-book writes.
- Evidence must use only file names, command statuses, field-level behavior, and redacted boundary summaries.

## Implementation Plan

1. Add local state for server-created `PersonalAiGenerationLearningSessionQuestionDto[]`.
2. Clear server session question state when a new AI generation request starts or retry begins.
3. Keep eligibility checks using preview-derived question count for AI出题 and assembled container for AI组卷, but render and submit only from server-returned session questions after creation.
4. On successful learning-session creation, set the server-returned questions, reset answers/feedback, and start the panel.
5. On blocked or failed session creation, keep the panel closed and clear server questions.
6. Update focused UI tests so AI出题 and AI组卷 practice renders server-returned question text rather than visible preview question text.

## Validation

- `corepack pnpm@10.26.1 exec vitest run tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`
- `corepack pnpm@10.26.1 run typecheck`
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-session-server-questions-2026-07-09`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-ai-session-server-questions-2026-07-09 -SkipRemoteAheadCheck`

## Adversarial Review Focus

- AI组卷 final answer questions must not come from old generated `paper_draft` preview bodies.
- AI出题 must still create isolated learner sessions and not write formal practice records.
- Empty server-created sessions must not open an answer panel.
- Personal and organization owner scopes must remain explicit.
- No sensitive values or full real question/paper/material content are recorded in evidence.
