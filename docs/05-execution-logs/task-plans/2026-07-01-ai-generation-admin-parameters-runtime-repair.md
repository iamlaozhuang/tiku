# AI Generation Admin Parameters Runtime Repair Task Plan

## Task

- Task id: `ai-generation-admin-parameters-runtime-repair-2026-07-01`
- Branch: `codex/ai-generation-admin-parameters-runtime-repair`
- Scope: repair the shared admin AI generation page parameter-state runtime crash that blocks content admin and organization admin AI 出题 / AI组卷 pages.
- Non-goals: no Provider call, no DB mutation, no `.env*` read or write, no dependency/package/lockfile change, no schema/migration/seed change, no e2e, no staging/prod/cloud/deploy, no Cost Calibration, no release readiness or final Pass claim.

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

## Known Finding

Post-repair localhost rerun found that admin AI generation pages stayed at the permission-checking surface because the browser console reported:

- `TypeError: Cannot read properties of undefined (reading 'profession')`
- Source location: `getAiGenerationDetailControls`

The failure blocks content admin and organization admin AI 出题 / AI组卷 walkthrough before any valid grounded generation path can be exercised.

## Root-Cause Investigation Plan

1. Read `AdminAiGenerationEntryPage.tsx` around parameter defaults, current generation kind selection, state updates, and `getAiGenerationDetailControls`.
2. Compare the broken admin path against existing focused tests for both `generationKind="question"` and `generationKind="paper"`.
3. Confirm whether a valid route/render path can pass an undefined parameter object into the detail-control helper.
4. Write a focused failing test that reproduces the crash or missing fallback behavior before changing production code.
5. Implement the smallest fallback or state-shape fix at the source of the undefined parameter object.

## TDD Plan

- RED: add a focused test covering admin AI generation render with missing or partial parameter state and verify it does not crash while preserving business controls.
- GREEN: centralize safe resolution of generation parameters for question/paper pages and use it before rendering controls or constructing submission payloads.
- REFACTOR: keep helper names explicit and avoid unrelated UI or service behavior changes.

## Cross-Role Carry-Forward

The user explicitly reminded that two concerns span multiple roles and UI surfaces:

- Generated content must be constrained by imported resource / knowledge base / chunk / citation evidence, not generic model knowledge.
- Ordinary users and operators must not see internal governance wording such as local contract summaries or redaction labels.

This source task only removes the admin runtime blocker. The follow-up owner-preview/browser rerun must scan every AI 出题 / AI组卷 role entrance for those concerns before marking them closed.

## Validation Commands

```powershell
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-admin-parameters-runtime-repair.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-admin-parameters-runtime-repair.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-admin-parameters-runtime-repair.md src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts
npm.cmd run test:unit -- src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-admin-parameters-runtime-repair-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-admin-parameters-runtime-repair-2026-07-01 -SkipRemoteAheadCheck
```

## Evidence Boundary

Evidence records command names, pass/fail status, error categories, and sanitized conclusions only. It must not contain credentials, cookies, tokens, session values, localStorage, Authorization headers, `.env*` content, raw DOM, screenshots, traces, raw DB rows, internal ids, PII, raw prompt, Provider payload, raw AI output, or full question/paper/material/resource/chunk content.
