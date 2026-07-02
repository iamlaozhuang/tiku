# AI Generation Ordinary UI Internal Wording Repair Task Plan

## Task

- Task id: `ai-generation-ordinary-ui-internal-wording-repair-2026-07-01`
- Branch: `codex/ai-generation-ordinary-ui-internal-wording-repair`
- Scope: remove local-preview, owner-preview, local-contract, redaction, raw governance, and implementation wording from ordinary AI 出题 / AI组卷 UI and visible generation instructions across shared admin and student surfaces.
- Non-goals: no database access or mutation, no Provider runtime call, no `.env*` read/write, no dependency/package/lockfile change, no schema/migration/seed change, no e2e, no staging/prod/cloud/deploy, no Cost Calibration, no release readiness or final Pass claim.

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
- `superpowers:test-driven-development`

## Static Findings

- Shared admin AI generation page still contains ordinary visible wording tied to local owner preview and local preview generation.
- Shared admin AI generation tests already cover some local-contract/redaction wording, but do not yet fail on local-preview/owner-preview wording.
- Student AI page already maps many contract fields to business labels; this task keeps that regression guard in scope.
- Admin and personal Provider visible-instruction services still contain local owner-preview wording that can bias generated visible content and must be converted to product/business language without recording prompt or Provider payload evidence.

## Implementation Plan

1. RED: add focused tests proving ordinary admin AI pages and visible generation instruction text must not contain local-preview, owner-preview, local-contract, redaction, raw status enum, or implementation identifier wording.
2. GREEN: replace visible admin copy and visible instruction fallback text with operator/user-facing product language while preserving the existing safety boundary.
3. Refactor only if needed: reuse existing shared admin page and business label helpers; do not introduce role-specific duplicate UI paths.
4. Run source scans for blocked wording across scoped AI generation source/test surfaces.
5. Run focused tests and full local gates; write sanitized evidence.

## Validation Commands

```powershell
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-ordinary-ui-internal-wording-repair.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-ordinary-ui-internal-wording-repair.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-ordinary-ui-internal-wording-repair.md src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts src/server/services/route-integrated-provider-execution-service.test.ts
npm.cmd run test:unit -- src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts src/server/services/route-integrated-provider-execution-service.test.ts
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-ordinary-ui-internal-wording-repair-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-ordinary-ui-internal-wording-repair-2026-07-01 -SkipRemoteAheadCheck
```

## Evidence Boundary

Evidence records command names, pass/fail summaries, safe file paths, and count summaries only. It must not include credentials, cookies, tokens, sessions, localStorage values, Authorization headers, `.env*`, raw DOM, screenshots, traces, raw DB rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, complete generated content, or full question/paper/material/resource/chunk content.
