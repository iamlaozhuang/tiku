# 2026-07-09 Learner AI Paper Session Container Plan

## Task

- Task id: `learner-ai-paper-session-container-2026-07-09`
- Branch: `codex/learner-ai-paper-session-container`
- Goal contribution: AI组卷 assembled paper containers must be passed to learning-session creation so the server can resolve formal question sources.
- Scope type: learner frontend wiring and focused unit tests only.

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
- `docs/05-execution-logs/evidence/2026-07-09-learner-ai-paper-parameters-contract-evidence.md`

## Boundaries

- No Provider execution.
- No browser automation, screenshots, raw DOM, traces, private credential files, env files, DB URLs, raw DB rows, or direct DB mutation.
- No package, lockfile, dependency, schema, migration, seed, staging, prod, deploy, Cost Calibration, PR, or force push.
- Do not change learning-session service/repository behavior unless frontend wiring exposes a real contract mismatch.
- Do not implement history persistence or session-question rendering refactor in this branch.

## Implementation Plan

1. Add a frontend helper that returns `paperAssembly.container` only when `paperAssembly.status === "assembled"`.
2. Treat AI组卷 practice eligibility as assembled-container based instead of preview question-draft based.
3. Include `paperAssemblyContainer` in `/api/v1/personal-ai-generation-learning-sessions` payload for assembled AI组卷.
4. Keep AI出题 learning-session creation on `visibleGeneratedContent`.
5. Block start-practice for insufficient/rejected/no-container AI组卷 by leaving the existing insufficient state path.
6. Update learner UI tests to assert the assembled container is submitted and insufficient assembly does not create a session.

## Validation

- `corepack pnpm@10.26.1 exec vitest run tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`
- `corepack pnpm@10.26.1 typecheck`
- `corepack pnpm@10.26.1 lint`
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-paper-session-container-2026-07-09`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-ai-paper-session-container-2026-07-09 -SkipRemoteAheadCheck`

## Adversarial Review Focus

- AI组卷 uses formal-source selected refs via `paperAssemblyContainer`; it must not trust preview question bodies as final source.
- Insufficient or missing assembly must not start an empty or stale generated-question session.
- AI出题 start-practice path must not regress.
- Personal and organization owner scope must stay explicit.
- No full questions, answers, materials, Provider payloads, prompts, sessions, cookies, or tokens are recorded in evidence.
