# 2026-07-06 AI training content admin UI recontract evidence

## Scope

- Task: `ai-training-content-admin-ui-recontract-2026-07-06`
- Branch: `codex/ai-training-content-admin-ui-recontract-2026-07-06`
- Scope type: local source + focused unit tests + docs/state/evidence/audit
- Runtime scope: no DB runtime, no browser, no Provider call, no staging/prod/deploy, no Cost Calibration

## Redaction

Recorded only file paths, command names, exit status, test counts, role labels, source category labels, and product-level behavior summaries.

Not recorded: credentials, tokens, sessions, cookies, env values, DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full question/paper/material/resource/chunk content, screenshots, DOM dumps, traces, private fixture values, employee raw answers, or plaintext `redeem_code`.

## TDD RED

Command:

```text
npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx -t "content admin"
```

Result:

- Exit: `1`
- Expected failures observed: `6 failed`, `4 passed`, `32 skipped`
- Failure categories:
  - content page still showed old content AI draft/review label;
  - content AI出题 still submitted old default quantity;
  - content review action still used old adoption wording;
  - content AI组卷 visible result still rendered generated paper question draft content;
  - content paper formal draft payload still used companion question drafts instead of selected formal question references.

## Implementation Summary

- Recontracted content-admin page copy to `内容 AI 辅助`, `待审题目草稿`, and `待审试卷草稿`.
- Recontracted content-admin submit labels to `生成待审题目草稿` and `生成待审试卷草稿`.
- Set content-admin visible defaults to AI出题 `3` and AI组卷 `30`.
- Restricted content AI组卷 UI source wording to `平台正式题库`.
- Added paper assembly container rendering for admin paper results using source composition, selected/target counts, match explanation, and next actions.
- Updated content review actions to create reviewable pending drafts using Chinese product wording.
- Changed content paper formal draft payload to reference selected platform formal question public ids from `paperAssembly` and to avoid AI-generated companion question drafts.

## Verification

Focused GREEN:

```text
npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx -t "content admin"
```

- Exit: `0`
- Result: `10 passed`, `32 skipped`

Regression unit:

```text
npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx
```

- Exit: `0`
- Result: `2 passed files`, `42 passed`

Typecheck:

```text
npm.cmd run typecheck
```

- Exit: `0`

Lint:

```text
npm.cmd run lint
```

- Exit: `0`

Diff check:

```text
git diff --check
```

- Exit: `0`

Scoped prettier check:

```text
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-training-content-admin-ui-recontract.md src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx src/lib/admin-ai-generation-formal-draft-payload.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx tests/unit/admin-ai-generation-entry-surface.test.ts
```

- Exit: `0`

Module Run v2 pre-commit hardening:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-training-content-admin-ui-recontract-2026-07-06
```

- Exit: `0`
- Result: pre-commit hardening passed

## Boundary Check

- Dependency/package/lockfile changed: `false`
- Schema/migration/seed changed: `false`
- Direct DB runtime executed: `false`
- Provider call executed: `false`
- Browser/runtime executed: `false`
- Staging/prod/deploy executed: `false`
- Cost Calibration executed or claimed: `false`
- Release readiness/final Pass/production usability claimed: `false`

## Remaining Work

- Quantity/validation alignment for all remaining surfaces and insufficiency/degradation messages remains a later package.
- Local role matrix and acceptance recheck remain not executed in this package.
- Provider-enabled small sample remains not executed and still requires separate bounded approval.
