# 2026-07-09 Learner AI Paper Parameters Contract Plan

## Task

- Task id: `learner-ai-paper-parameters-contract-2026-07-09`
- Branch: `codex/learner-ai-paper-parameters-contract`
- Goal contribution: learner AI组卷 visible parameters must enter `generationParameters` and survive request validation.
- Scope type: source and targeted unit tests only.

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
- `docs/05-execution-logs/evidence/2026-07-09-learner-ai-employee-privacy-boundary-evidence.md`

## Boundaries

- No Provider execution.
- No browser automation, screenshots, raw DOM, traces, private credential files, env files, DB URLs, raw DB rows, or direct DB mutation.
- No package, lockfile, dependency, schema, migration, seed, staging, prod, deploy, Cost Calibration, PR, or force push.
- Do not change AI组卷 paper assembly, learning session creation, organization admin training flow, content admin AI flow, or formal practice/answer-record persistence.
- Evidence must use only file names, branch/task ids, status categories, command results, and redacted boundary descriptions.

## Implementation Plan

1. Add learner AI组卷 controlled state for `questionTypeDistribution`, `paperStructure`, difficulty, and learning objective.
2. Map visible Chinese UI choices to the existing route-integrated enum values.
3. Include the mapped AI组卷 parameters when creating `generationParameters`; leave AI出题 parameter shape unchanged.
4. Update personal AI generation request validator to preserve and validate `questionTypeDistribution` and `paperStructure` through the existing contract normalizers.
5. Add focused tests for:
   - frontend personal and organization AI组卷 request body contains distribution, structure, difficulty, learning objective, and source preference;
   - validator preserves valid AI组卷 paper parameters;
   - validator rejects invalid distribution or structure instead of silently defaulting.

## Validation

- `corepack pnpm@10.26.1 exec vitest run src/server/validators/personal-ai-generation-request.test.ts tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`
- `corepack pnpm@10.26.1 typecheck`
- `corepack pnpm@10.26.1 lint`
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-paper-parameters-contract-2026-07-09`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-ai-paper-parameters-contract-2026-07-09 -SkipRemoteAheadCheck`

## Adversarial Review Focus

- AI出题 request body remains unchanged except shared identifiers already in place.
- Personal advanced AI组卷 does not receive enterprise source preference.
- Organization employee AI组卷 preserves source preference and submitted paper parameters.
- Invalid enum values fail validation rather than being silently converted to defaults.
- No sensitive data or full question/paper/material content is written to tests, logs, evidence, or audit.
