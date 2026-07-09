# Content AI 0704 Final Acceptance Closeout State Plan

## Task

- Task id: `content-ai-0704-final-acceptance-closeout-state-2026-07-09`
- Branch: `codex/content-ai-0704-final-acceptance-closeout-state`
- Goal: close the post-merge state gap for the two already merged 0704 content AI acceptance tasks.

## Read Before Editing

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-final-localhost-acceptance.md`
- `docs/05-execution-logs/audits-reviews/2026-07-09-content-ai-0704-final-localhost-acceptance-audit.md`

## Scope

- Mark the already merged and pushed 0704 account matrix recovery task as closed in state/queue.
- Mark the already merged and pushed final localhost acceptance task as closed in state/queue.
- Add this bounded state-closeout task record.
- Preserve the residual finding that full business publish replay is not yet proven by the current 0704 fixture/history.

## Boundaries

- No source, test, package, lockfile, schema, migration, seed, env, secret, Provider, staging/prod, deploy, browser screenshot, raw DOM, or database operation.
- No credential, session, cookie, token, localStorage, Auth header, DB URL, raw DB row, internal id, Provider payload, raw prompt, raw AI output, or full question/paper/material/resource/chunk content in evidence.
- Do not claim the full active goal is complete.

## Validation

- `corepack pnpm@10.26.1 exec prettier --write --ignore-unknown <scoped-doc-files>`
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped-doc-files>`
- `git diff --check`
- `corepack pnpm@10.26.1 lint`
- `corepack pnpm@10.26.1 typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-0704-final-acceptance-closeout-state-2026-07-09`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-0704-final-acceptance-closeout-state-2026-07-09 -SkipRemoteAheadCheck`

## Adversarial Review Focus

- Do not hide the residual current-fixture blockers behind a closed task status.
- Keep standard/advanced and personal/organization AI boundaries unchanged.
- Ensure the queue still points at a concrete next safe decision instead of implying Provider or DB work is approved.
