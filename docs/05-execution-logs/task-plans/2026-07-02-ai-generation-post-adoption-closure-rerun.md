# AI generation post adoption closure rerun

## Task

- Task id: `ai-generation-post-adoption-closure-rerun-2026-07-02`
- Branch: `codex/ai-generation-post-adoption-closure-rerun`
- Scope: localhost owner-preview rerun after grounded structured result and adoption-payload repair.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Rerun Plan

1. Confirm local server availability and restart only local service if needed.
2. Use localhost browser surfaces only; do not capture raw DOM, screenshot, trace, cookies, token, localStorage, Authorization header, or credentials.
3. Verify content admin AI 出题 / AI组卷 after the source repair:
   - insufficient grounding or unparsable output must not create a successful generated result.
   - grounded structured output may create a generated result.
   - content-admin adoption must not submit fabricated reviewed draft content.
4. Spot-check organization advanced admin AI 出题 / AI组卷 for the same result-state and UI wording boundaries.
5. Record remaining closure gaps for personal advanced and organization employee application paths without raw generated content.
6. Summarize whether the next task should be browser/provider rerun continuation, source repair, or formal draft adoption closure.

## Boundaries

- Localhost and local dev service only.
- Bounded real Provider calls only when grounding is sufficient and the page action explicitly uses the local owner-preview AI route.
- Credential use is limited to local browser login; credentials must not be output, stored, or recorded.
- No `.env*` content read/write, DB direct connection/reset/seed/migration/schema change, dependency/package/lockfile change, e2e, staging/prod/cloud/deploy, Cost Calibration, release readiness, or final Pass.
- Evidence may record role labels, page/route labels, action status, count buckets, and failure categories only.

## Validation Commands

- `npm.cmd exec -- prettier --check --ignore-unknown <changed-docs>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-post-adoption-closure-rerun-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-post-adoption-closure-rerun-2026-07-02 -SkipRemoteAheadCheck`
