# AI Generation Cross-Surface Closure Plan

## Task

- Task id: `ai-generation-cross-surface-closure-2026-07-02`
- Branch: `codex/ai-generation-cross-surface-closure`
- Trigger: owner preview feedback that resource/RAG grounding and internal governance wording are cross-role, cross-UI risks that must not be missed.

## Read Requirements

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Scope

This task is a source/test/docs closure pass only.

- Confirm all AI 出题 / AI 组卷 product surfaces use business language, not internal governance or implementation terms.
- Confirm route-integrated Provider execution remains resource/RAG gated and cannot silently proceed with missing or weak evidence.
- Confirm admin and student UI reuse shared label/visibility helpers instead of role-specific copies.
- Add focused regression coverage for any missed surface found by static scan.

## Boundaries

- No `.env*` read or write.
- No Provider call.
- No browser/e2e execution.
- No database connection, mutation, reset, seed, schema, migration, or raw row evidence.
- No dependency, `package.json`, or lockfile change.
- No staging/prod/cloud/deploy, Cost Calibration, release readiness, final Pass, PR, or force push.
- Evidence must not include credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, connection strings, raw DB rows, internal auto ids, PII, Provider payloads, prompts, raw AI I/O, full generated content, screenshots, traces, raw DOM, HTML dumps, or full question/paper/material/resource/chunk content.

## Initial Root-Cause Notes

- Current runtime resource catalog has marketing level 3 coverage only by aggregate count; monopoly/logistics role scopes can be correctly blocked until matching resource coverage exists.
- Existing source has a shared grounding resolver path for owner-preview Qwen runtime, but every eligible role surface must be checked against the same gate.
- Existing student UI maps most technical field labels and enum values to business copy; remaining checks must include history and detail surfaces.
- Admin history result rendering still needs adversarial checks for raw status enum leakage and stale evidence wording.

## TDD Plan

1. Add focused RED tests for any ordinary product surface that can render internal field names, raw status enums, or misleading grounding labels.
2. Verify RED failures before production changes.
3. Apply minimal shared helper repairs.
4. Re-run focused unit tests, lint, typecheck, diff check, and Module Run v2 gates.

## Validation Commands

- `npm.cmd run test:unit -- src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ai-generation-cross-surface-closure.md docs/05-execution-logs/evidence/2026-07-02-ai-generation-cross-surface-closure.md docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-cross-surface-closure.md src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-cross-surface-closure-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-cross-surface-closure-2026-07-02 -SkipRemoteAheadCheck`

## Exit Criteria

- Cross-surface static scan covers student, employee, organization admin, content admin, and ops-audit exception boundaries.
- Ordinary product UI does not render `local contract`, `本地合约`, `已脱敏`, `redactionStatus`, `evidenceStatus`, `citationCount`, `formalAdoptionStatus`, or equivalent raw governance/status terms.
- Grounding-gated Provider services still block missing/weak evidence before credential access.
- Any remaining data coverage gap is recorded as a follow-up data task, not hidden as a product pass.
