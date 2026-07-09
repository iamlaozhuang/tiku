# 2026-07-09 Content AI 0704 Fixture Readiness Task Plan

## Task

- Task id: `content-ai-0704-fixture-readiness-2026-07-09`
- Branch: `codex/content-ai-0704-fixture-readiness`
- Goal contribution: define the remaining work needed to turn the partial 0704 localhost acceptance into a full content AI出题 / AI组卷 business closed loop.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-localhost-write-acceptance.md`
- `docs/05-execution-logs/audits-reviews/2026-07-09-content-ai-0704-localhost-write-acceptance-audit.md`
- Relevant source entrypoints under `src/server/services/` for admin AI generation, formal draft adoption, paper draft publish, personal AI generation, and organization training.

## Boundary

- This branch is docs/readiness only.
- No source, test, package, lockfile, schema, migration, seed, env, private fixture, or runtime secret file changes.
- No Provider execution.
- No screenshot, raw DOM, storage, cookie, token, session, Authorization header, DB URL, raw DB row, internal id, raw prompt, raw AI output, or full question/paper/material/resource/chunk evidence.
- No destructive DB operation.
- No direct DB fixture write. Any 0704 fixture/history refresh remains a separate task requiring explicit scope and approval.

## Readiness Questions

1. Which remaining items block the active goal from being proven complete?
2. Which blockers are local 0704 fixture/history issues, and which would justify a code repair branch?
3. What approval and validation surface is needed before attempting local fixture/history refresh?
4. What short branches should follow after readiness is closed?

## Expected Output

- Redacted readiness evidence.
- Adversarial readiness audit.
- State/queue update marking the previous 0704 localhost acceptance branch closed and this readiness task ready for closeout.
- No product code change.

## Validation Plan

- `corepack pnpm@10.26.1 exec prettier --write --ignore-unknown <scoped-doc-files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-0704-fixture-readiness-2026-07-09`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-0704-fixture-readiness-2026-07-09 -SkipRemoteAheadCheck`
