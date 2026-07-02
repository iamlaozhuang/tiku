# AI Generation Resource Grounding Enforcement Repair Task Plan

## Task

- Task id: `ai-generation-resource-grounding-enforcement-repair-2026-07-01`
- Branch: `codex/ai-generation-resource-grounding-enforcement-repair`
- Scope: ensure AI 出题 / AI组卷 Provider execution is blocked unless shared resource/RAG grounding evidence is present and sufficient.
- Non-goals: no database mutation, no real Provider runtime call, no `.env*` read/write, no dependency/package/lockfile change, no schema/migration/seed change, no e2e, no staging/prod/cloud/deploy, no Cost Calibration, no release readiness or final Pass claim.

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

- Shared admin and personal route-integrated Provider execution paths already block when a grounding resolver returns insufficient evidence.
- Current gap: if `resolveGroundingContext` is omitted, both paths resolve `groundingContext` to `null` but skip the insufficiency gate and may continue to credential read and Provider execution.
- Owner preview runtime controls do provide a resolver, but the execution primitive itself should enforce the invariant so future callers cannot bypass resource grounding by omission.
- Cross-role scan requirement: every AI 出题 / AI组卷 surface for advanced personal, advanced organization employee, advanced organization admin, and content admin must be checked for both resource/RAG grounding and ordinary UI wording leakage. Technical governance terms such as local contract, redaction status, owner preview, local generation, or local preview must not appear on ordinary user/operator screens.

## Implementation Plan

1. RED: add admin and personal tests proving missing grounding resolver blocks before credential access and Provider execution.
2. GREEN: make missing resolver equivalent to insufficient grounding in both shared execution paths.
3. Update existing provider-success tests to pass an explicit sufficient grounding context where they intentionally exercise Provider execution.
4. Run focused service tests plus existing admin/student UI tests.
5. Run production source scan for the grounding gate condition, cross-role AI 出题 / AI组卷 entry coverage, and ordinary UI technical wording leakage; write sanitized evidence.

## Validation Commands

```powershell
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-resource-grounding-enforcement-repair.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-resource-grounding-enforcement-repair.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-resource-grounding-enforcement-repair.md src/server/services/route-integrated-provider-execution-service.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts src/server/services/admin-ai-generation-runtime-bridge-service.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/personal-ai-generation-request-flow-service.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx
npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-resource-grounding-enforcement-repair-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-resource-grounding-enforcement-repair-2026-07-01 -SkipRemoteAheadCheck
```

## Evidence Boundary

Evidence records command names, pass/fail summaries, safe file paths, and safe count summaries only. It must not include credentials, cookies, tokens, sessions, localStorage values, Authorization headers, `.env*`, raw DOM, screenshots, traces, raw DB rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, complete generated content, or full question/paper/material/resource/chunk content.
