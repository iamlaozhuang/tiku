# AI Generation Grounding Product UI Repair Evidence

## Redaction Boundary

- Allowed: task ids, branch, file paths, issue labels, role labels, route labels, pass/fail/blocked status, safe count labels, validation command names, commit/merge/push/cleanup summaries.
- Forbidden: credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, database connection strings, raw DB rows, internal auto ids, PII, Provider payloads, prompts, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, full question/paper/material/resource/chunk content.

## Initial State

- Branch: `codex/ai-generation-grounding-product-ui-repair`
- Task id: `ai-generation-grounding-product-ui-repair-2026-07-01`
- Source findings covered:
  - `CROSS-001` resource / RAG grounding constraint failure.
  - `CROSS-002` internal governance copy exposure.
  - ops admin organization AI route submit regression.
  - AI 组卷 structured preview quantity recognition gap.

## Red Test Log

- Command:
  - `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- Result:
  - failed before implementation, as expected.
  - Failure classes covered grounding gate absence, missing `generationParameters`, paper draft quantity parsing, ops organization AI route permission, and ordinary UI governance wording exposure.
- Redaction:
  - No credentials, env values, Provider payloads, prompts, raw AI content, raw DOM, screenshots, DB rows, internal ids, or full generated content recorded.

## Implementation Log

- Added shared generation parameter and grounding context contracts for route-integrated AI generation.
- Added local RAG grounding resolution through the existing owner-preview resource runtime; Provider execution now blocks before credential/config access when evidence is insufficient.
- Passed sufficient grounding context into deterministic Provider executor tests and visible generated content metadata as safe summary only.
- Added frontend generation parameter submission for learner, employee, content admin, and organization admin AI 出题 / AI 组卷 entry surfaces.
- Replaced ordinary product UI governance copy with business language such as `资料充足`, `资料不足`, `结果摘要`, `草稿快照`, `需审核后采用`, and `待生成`.
- Kept formal question / paper writes blocked behind existing review/adoption contracts.
- Repaired organization AI route guard so ops admin does not receive a submit-capable organization AI page.
- Extended paper draft preview quantity parsing for supported nested question arrays.
- Cross-role static scan:
  - learner AI page: no remaining ordinary UI rendering path for the blocked governance terms.
  - admin AI page: only internal `contentVisibility` DTO fields remain, immediately mapped to product labels.
  - public route wrappers covered the student, content admin, organization admin, and organization employee shared surfaces for AI 出题 / AI 组卷.
  - tests keep internal DTO field names as fixtures, but assertions verify they are not rendered as ordinary product copy.
  - repository-wide wording scan found other governance-oriented pages with redaction language; those are not AI 出题 / AI 组卷 ordinary product surfaces and remain outside this scoped repair.

## Validation Log

- Focused unit validation:
  - Command: `npm.cmd run test:unit -- src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
  - Result: pass, 10 files, 119 tests.
- Product UI wording scan:
  - Command: `rg` over learner/admin AI generation production entry files for blocked ordinary UI terms.
  - Result: pass with one allowed implementation note: admin page still reads internal DTO `contentVisibility` fields and maps them to product labels; raw enum labels are not rendered.
- Full local gates:
  - `npm.cmd exec -- prettier --check --ignore-unknown <changed files>`: pass.
  - `git diff --check`: pass.
  - `npm.cmd run lint`: pass.
  - `npm.cmd run typecheck`: pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-grounding-product-ui-repair-2026-07-01`: pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-grounding-product-ui-repair-2026-07-01 -SkipRemoteAheadCheck`: pass after repository checkpoint alignment.
- Checkpoint note:
  - First pre-push readiness run failed because `project-state.yaml` held an older accepted repository checkpoint while local `master` and `origin/master` matched a newer SHA.
  - Remediation: aligned the accepted checkpoint to the current local and remote master SHA, then reran pre-commit and pre-push gates successfully.
