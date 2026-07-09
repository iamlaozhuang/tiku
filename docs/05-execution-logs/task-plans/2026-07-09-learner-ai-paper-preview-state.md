# 2026-07-09 Learner AI Paper Preview State Plan

## Task

- Task id: `learner-ai-paper-preview-state-2026-07-09`
- Branch: `codex/learner-ai-paper-preview-state`
- Goal contribution: learner AI组卷 results show a clear self-test preview, source composition, match quality, and blocked state before starting isolated practice.
- Scope type: student AI generation UI and focused unit tests only.

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
- `docs/05-execution-logs/evidence/2026-07-09-learner-ai-paper-container-history-evidence.md`

## Boundaries

- No Provider execution.
- No browser automation, screenshots, raw DOM, traces, private credential files, env files, DB URLs, raw DB rows, or direct DB mutation.
- No package, lockfile, dependency, schema, migration, seed, staging, prod, deploy, Cost Calibration, PR, or force push.
- Do not expose full question stems, options, answers, analysis, raw AI output, Provider payload, prompts, or materials in preview/evidence.
- Do not write formal `practice`, `answer_record`, `mistake_book`, `question`, or `paper`.
- Do not add learner AI results to organization admin or content admin operation surfaces.

## Implementation Plan

1. Add a student-facing redacted AI组卷 assembly summary component.
2. Show title, requested/selected count, section count, source composition, match quality, and insufficiency reason from `runtimeBridge.paperAssembly`.
3. Render section-level selected counts and degradation counts without question body or answer content.
4. Keep `开始作答` disabled when assembly is absent, insufficient, or selected count is zero, and show a clear blocked explanation.
5. Show persisted `paperAssembly` summary in learner result history/detail where available.
6. Extend focused unit tests for personal and organization employee paper previews, insufficient state, and sensitive-content non-exposure.

## Validation

- `corepack pnpm@10.26.1 exec vitest run tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`
- `corepack pnpm@10.26.1 run typecheck`
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-paper-preview-state-2026-07-09`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-ai-paper-preview-state-2026-07-09 -SkipRemoteAheadCheck`

## Adversarial Review Focus

- Personal advanced and organization advanced employee paper previews must not expose full question content before session creation.
- Organization employee source summary may mention enterprise training counts but must not expose organization admin internals or employee peer results.
- Standard edition access behavior must not be expanded.
- The client preview must remain informational; learning sessions still use server-created sessions and server-side formal source resolution.
