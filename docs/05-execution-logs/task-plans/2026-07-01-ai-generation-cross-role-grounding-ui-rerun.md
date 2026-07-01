# AI generation cross-role grounding and UI wording rerun plan

## Task

- Task id: `ai-generation-cross-role-grounding-ui-rerun-2026-07-01`
- Branch: `codex/ai-generation-cross-role-grounding-ui-rerun`
- Scope: source, focused tests, docs/state, and static scans only.
- No DB connection or mutation, Provider call, env access, browser runtime, dependency change, schema/migration/seed change, staging/prod/cloud/deploy, Cost Calibration, release readiness, or final Pass.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- All ADR files under `docs/02-architecture/adr/`

## Root Cause Targets

- Ordinary AI UI wording was previously scanned too narrowly; student history/detail and admin review panels can still render internal field names or raw status enums.
- Resource-grounding behavior must remain visible to users only through business language such as `资料充足` / `资料不足`, not implementation terms.
- AI generation entry surfaces are shared across content admin, organization advanced admin, personal advanced student, and organization advanced employee; fixes must prefer shared helpers over role-specific duplication.

## Implementation Plan

1. Add or update focused tests so student and admin ordinary UI fail when rendering technical labels or raw enum wording.
2. Repair the existing shared label/value mappings and admin visible panels.
3. Run a production-source static scan across `src/features` and `src/app` for blocked ordinary AI UI terms.
4. Run focused unit tests, lint, typecheck, `git diff --check`, and Module Run v2 gates.
5. Write redacted evidence and audit review, then close the queued task.

## Redaction Boundary

Evidence may include task ids, file paths, command names, pass/fail summaries, role labels, and safe count summaries. Evidence must not include credentials, cookies, tokens, sessions, localStorage values, Authorization headers, `.env*`, database URLs, DB raw rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, or full question/paper/material/resource/chunk content.

## Validation Commands

- `npm.cmd exec -- prettier --check --ignore-unknown <changed files>`
- `npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-cross-role-grounding-ui-rerun-2026-07-01`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-cross-role-grounding-ui-rerun-2026-07-01 -SkipRemoteAheadCheck`
