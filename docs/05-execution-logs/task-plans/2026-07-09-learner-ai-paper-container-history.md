# 2026-07-09 Learner AI Paper Container History Plan

## Task

- Task id: `learner-ai-paper-container-history-2026-07-09`
- Branch: `codex/learner-ai-paper-container-history`
- Goal contribution: AI组卷 assembled containers are persisted in redacted result snapshots and returned from result history/detail for later self-practice recovery.
- Scope type: learner result persistence contract, mapper, materialization, and focused tests only.

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
- `docs/05-execution-logs/evidence/2026-07-09-learner-ai-session-server-questions-evidence.md`

## Boundaries

- No Provider execution.
- No browser automation, screenshots, raw DOM, traces, private credential files, env files, DB URLs, raw DB rows, or direct DB mutation.
- No package, lockfile, dependency, schema, migration, seed, staging, prod, deploy, Cost Calibration, PR, or force push.
- Do not implement frontend history recovery UI in this branch; only return the redacted container contract needed by that UI.
- Do not store or return full question stems, options, answers, analysis, Provider payload, prompt, raw AI output, or materials in the paper assembly snapshot.

## Implementation Plan

1. Extend personal AI result DTO with nullable `paperAssembly` redacted snapshot.
2. Extend materialization control so runtime bridge can pass the already-resolved learner `paperAssembly` into persisted content snapshots.
3. Persist only container metadata, source composition, section structure, selected formal question refs, insufficiency summary, and redaction status.
4. Map the persisted snapshot back to history/detail DTOs.
5. Add focused tests for persistence input and history/detail redacted output.

## Validation

- `corepack pnpm@10.26.1 exec vitest run src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-history-service.test.ts src/server/services/personal-ai-generation-result-persistence-service.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-route-integrated-result-materialization-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts --reporter=dot`
- `corepack pnpm@10.26.1 run typecheck`
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-paper-container-history-2026-07-09`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-ai-paper-container-history-2026-07-09 -SkipRemoteAheadCheck`

## Adversarial Review Focus

- Snapshot must not contain full question bodies, answers, explanations, Provider payload, raw prompt, raw AI output, or materials.
- Selected refs must be public ids only, not internal database ids.
- Personal and organization owner/actor scoping from prior branches must remain unchanged.
- Learning-session creation still resolves formal source questions server-side from selected refs.
- Content admin and organization admin AI flows must not be changed.
