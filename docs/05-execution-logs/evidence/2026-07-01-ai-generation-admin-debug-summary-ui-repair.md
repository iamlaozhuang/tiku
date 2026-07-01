# Evidence: AI generation admin debug summary UI repair

## Scope

- Task id: `ai-generation-admin-debug-summary-ui-repair-2026-07-01`
- Branch: `codex/ai-generation-admin-debug-summary-ui-repair`
- Execution type: source/test repair with focused validation only.

## Redaction Boundary

Evidence must not include credentials, tokens, sessions, cookies, Authorization headers, `.env*`, database URLs, raw DB rows, internal numeric ids, PII, plaintext card codes, Provider payloads, prompts, raw AI input/output, complete generated content, screenshots, traces, raw DOM, HTML dumps, or full question/paper/material/resource/chunk content.

## RED

- `npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts`
  - Result: failed as expected.
  - Failure categories:
    - Admin AI history rendered a diagnostic local-contract summary instead of business copy.
    - Admin local-contract route persisted a diagnostic summary as generated-result preview text.

## GREEN

- `npm.cmd run test:unit -- src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts`
  - Result: passed.
  - Coverage summary:
    - Admin generated-result persistence writes business preview copy instead of diagnostic local-contract text.
    - Content admin history converts diagnostic generated-result summaries before rendering.
    - Organization advanced admin history converts diagnostic generated-result summaries before rendering.
    - Visible generated draft content converts diagnostic text before rendering.
- Static scan:
  - AI generation ordinary-page source scan found diagnostic wording only in the admin UI sanitizer patterns, not as rendered copy.
  - Route-integrated Provider services retain grounding sufficiency checks and insufficient-grounding blocking paths for admin and personal AI generation flows.

## Validation

- `npm.cmd exec -- prettier --check --ignore-unknown <changed task/source/test files>`: passed after formatting the two changed source/test files.
- `npm.cmd run test:unit -- src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts`
  - Result: passed.
  - Summary: 5 files passed, 71 tests passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `git diff --check`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-admin-debug-summary-ui-repair-2026-07-01`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-admin-debug-summary-ui-repair-2026-07-01 -SkipRemoteAheadCheck`: passed.
- Localhost browser spot check, no Provider call and no generated-content submission:
  - Content admin AI question/paper pages: accessible, no diagnostic wording hit.
  - Organization advanced admin AI question/paper pages: accessible, no diagnostic wording hit.
  - Evidence records only route-level status/counts, not screenshots, raw DOM, credentials, sessions, localStorage, Provider payloads, prompts, or generated content.

## Closeout

- Pending git commit, fast-forward merge, push, and short-branch cleanup after this validation snapshot.
