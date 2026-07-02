# 2026-07-02 AI Generation Post Runtime Resource Provider Rerun Task Plan

## Scope

- Task id: `ai-generation-post-runtime-resource-provider-rerun-2026-07-02`
- Branch: `codex/ai-generation-post-runtime-resource-provider-rerun`
- Goal: rerun local owner-preview AI 出题 / AI组卷 after runtime RAG resource import and verify grounded Provider behavior on supported scopes.
- Trigger: runtime RAG coverage was imported for available owner-facing materials; previous Provider samples were blocked by insufficient grounding.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Boundary

- Allowed runtime actions:
  - restart or verify local `http://localhost:3000`;
  - use in-app browser only for localhost owner-preview flows;
  - use local role credentials only to log in, without recording or exposing them;
  - run bounded real Provider samples only after visible workflow is grounded;
  - write task plan, evidence, audit review, and project state/task queue updates.
- Forbidden:
  - source/test/runtime implementation changes;
  - `.env*` read/write or secret output;
  - direct database connection/mutation, raw DB row evidence, schema/migration/seed changes;
  - e2e automation, screenshots, raw DOM, traces, browser storage capture;
  - Provider payload, prompt, raw AI input/output, generated question/paper text, full material/resource/chunk content;
  - package/lockfile changes, staging/prod/cloud/deploy, PR, force push, Cost Calibration, release readiness, final Pass.

## Walkthrough Matrix

- Supported Provider sample scopes after runtime import:
  - `marketing` level 3 and all-level runtime resources;
  - `monopoly` all-level runtime resource;
  - `logistics` must remain blocked by missing local package coverage.
- Role/function coverage:
  - personal advanced student: AI 出题 / AI组卷 if exact credential flow is available;
  - organization advanced employee: AI 出题 / AI组卷 if exact credential flow is available;
  - organization advanced admin: AI 出题 / AI组卷;
  - content admin: AI 出题 / AI组卷;
  - standard roles: expected denial or not-applicable where product rules require;
  - ops admin: observation-only route guard.

## Evidence Rules

- Record only: role label, route/workflow label, status, blocking category, duration bucket, citation count bucket, token count if already surfaced as safe metadata, and pass/fail/blocked/not_applicable conclusion.
- Do not record credentials, session material, `.env`, raw UI dumps, screenshots, Prompt, Provider payload, generated text, or full content.

## Validation Commands

```powershell
npm.cmd run typecheck
git diff --check
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ai-generation-post-runtime-resource-provider-rerun.md docs/05-execution-logs/evidence/2026-07-02-ai-generation-post-runtime-resource-provider-rerun.md docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-post-runtime-resource-provider-rerun.md
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-post-runtime-resource-provider-rerun-2026-07-02
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-post-runtime-resource-provider-rerun-2026-07-02 -SkipRemoteAheadCheck
```

## Exit Criteria

- Localhost is reachable.
- Runtime RAG post-import aggregate remains available before browser samples.
- Every sampled role/function has `pass / fail / blocked / not_applicable` with a sanitized reason.
- Provider calls, if any, are bounded and recorded only by safe metadata.
- Logistics remains explicitly blocked pending local resource package coverage.
- Evidence and audit files pass redaction boundary checks.
