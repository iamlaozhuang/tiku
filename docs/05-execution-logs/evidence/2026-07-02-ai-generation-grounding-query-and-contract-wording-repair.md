# 2026-07-02 AI Generation Grounding Query And Contract Wording Repair Evidence

## Scope

- Task id: `ai-generation-grounding-query-and-contract-wording-repair-2026-07-02`
- Branch: `codex/ai-generation-grounding-query-wording-repair`
- Scope: local source/test repair only.
- Not executed: DB connection/mutation, Provider call, browser runtime, `.env*` access, dependency/package/lockfile change, schema/migration/seed, staging/prod/cloud/deploy, e2e, Cost Calibration, release readiness, final Pass.

## Root Cause Evidence

- RED focused test run before source repair:
  - Command: `npm.cmd run test:unit -- src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`
  - Result: failed as expected.
  - Summary: 3 failed / 25 passed.
  - Failure classes:
    - shared grounding query returned `weak` instead of `sufficient` for runtime-resource-style synthetic chunks.
    - cross-role static scan detected ordinary UI technical wording in shared admin AI generation surface.
- Static source scan confirmed the visible technical phrases were in the shared admin AI generation page, which is reused by content admin and organization admin AI 出题 / AI组卷 routes.

## Implementation Summary

- Updated shared owner-preview Qwen grounding query construction to use stable runtime resource tokens:
  - task token: `AI 出题` / `AI 组卷`
  - profession token
  - `level N` token
  - subject token
  - `knowledge_node` token
- Removed low-value generation form parameters from evidence retrieval scoring terms:
  - question type
  - difficulty
  - learning objective
- Replaced ordinary admin UI technical wording:
  - `合同已就绪` -> business process wording.
  - `本地验证证据` -> business handling-record wording.
  - browser-automation wording -> manual-review wording.
- Added cross-role static scan coverage for:
  - personal student AI generation route/page
  - content admin AI 出题 / AI组卷 routes
  - organization admin AI 出题 / AI组卷 routes
  - shared admin AI generation page

## Validation Evidence

- Focused unit/static tests after repair:
  - Command: `npm.cmd run test:unit -- src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts`
  - Result: pass.
  - Summary: 3 test files, 28 tests.
- Prettier:
  - Initial check found 2 test files requiring formatting.
  - Command: `npm.cmd exec -- prettier --write --ignore-unknown src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
  - Result: pass after formatting.
- Lint:
  - Command: `npm.cmd run lint`
  - Result: pass.
- Typecheck:
  - Initial run found test-only context typing issues.
  - Fix: test now constructs the full admin route-integrated Provider request context and checks resolver presence before invocation.
  - Command: `npm.cmd run typecheck`
  - Result: pass.
- Final formatting gate:
  - Command: `npm.cmd exec -- prettier --check --ignore-unknown <changed-files>`
  - Result: pass.
- Final lint gate:
  - Command: `npm.cmd run lint`
  - Result: pass.
- Final typecheck gate:
  - Command: `npm.cmd run typecheck`
  - Result: pass.
- Whitespace diff gate:
  - Command: `git diff --check`
  - Result: pass.
- Module Run v2 pre-commit hardening:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-grounding-query-and-contract-wording-repair-2026-07-02`
  - Result: pass.
- Module Run v2 pre-push readiness:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-grounding-query-and-contract-wording-repair-2026-07-02 -SkipRemoteAheadCheck`
  - Result: pass.

## Evidence Redaction

- No credentials, tokens, cookies, sessions, localStorage, Authorization headers, `.env` values, database rows, internal ids, PII, Provider payloads, prompts, raw AI input/output, generated content, full question/paper/material/resource/chunk content, screenshots, traces, raw DOM, or HTML dumps were recorded.
- Synthetic test chunks contain only safe fixture terms and do not contain real resource package content.
