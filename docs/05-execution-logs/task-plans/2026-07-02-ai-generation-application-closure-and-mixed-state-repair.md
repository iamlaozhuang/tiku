# AI generation application closure and mixed-state repair

## Task

- Task id: `ai-generation-application-closure-and-mixed-state-repair-2026-07-02`
- Branch: `codex/ai-generation-application-closure-repair`
- Scope: source/test repair for the post-rerun findings on organization generated-result application visibility and learner mixed insufficient/success state.

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

## Root Cause Hypothesis

- Organization admin history renders generated-result metadata but does not surface the organization-owned draft/training-source boundary as an actionable or explicitly blocked next step.
- Learner AI page derives practice entry availability from existing local state while also rendering the latest insufficient-grounding state, so users can see "资料不足" and "开始练习" together without knowing whether the practice came from a previous usable result.

## Implementation Plan

1. Add red UI tests for organization AI generation history requiring business next-step state on organization-owned results without technical wording.
2. Add red student UI tests proving an insufficient latest result cannot look like a newly usable generated practice result.
3. Reuse existing generated-result and boundary fields; do not introduce duplicate server-side parsers or role-specific result models.
4. Update admin UI to show organization-owned result next-step status in business language.
5. Update student UI state rules so retry/insufficient status and practice entry are clearly separated.
6. Run focused tests, lint/typecheck, formatting, Module Run v2 gates, and write redacted evidence.

## Boundaries

- No `.env*`, credential, cookie, token, localStorage, Authorization header, Provider payload, prompt, raw AI output, DB raw row, internal numeric id, PII, full generated question/paper/material/resource/chunk content.
- No direct DB connection, reset, seed, migration, schema, dependency/package/lockfile, e2e, staging/prod/cloud/deploy, Cost Calibration, release readiness, or final Pass.
- No formal question/paper DB adoption implementation in this task; if source inspection shows backend adoption is required, record a follow-up instead of widening scope.

## Validation Commands

- `npm.cmd run test:unit -- src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown <changed-files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-application-closure-and-mixed-state-repair-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-application-closure-and-mixed-state-repair-2026-07-02 -SkipRemoteAheadCheck`
