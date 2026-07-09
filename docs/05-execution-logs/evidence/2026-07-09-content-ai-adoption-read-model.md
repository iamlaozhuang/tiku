# 2026-07-09 content AI adoption read model evidence

## Scope

- Branch: `codex/content-ai-adoption-read-model`
- Task: content-admin AI generation adoption read model, local contract DTO propagation, and content-admin history UI persisted-state handling.
- Boundary: localhost/code-only verification. No Provider execution, no DB connection, no env/secret read, no package or lockfile changes, no deploy/staging/prod action.
- Fresh closeout approval: user approved merge, push, cleanup, and serial goal continuation on 2026-07-09.

## Requirement Mapping Result

- Content-admin AI generation adoption state is now durable in the history read model instead of being inferred from transient UI action state.
- Formal adoption remains a review-to-draft operation; this step does not publish formal question/paper content.
- Content-admin history can distinguish pending, approved, draft-created, and rejected adoption states after refresh.
- Organization training and employee visibility semantics are not changed by this step.

## Red-Green Checks

- Red: `corepack pnpm@10.26.1 exec vitest run src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts --reporter=dot`
  - Result: failed as expected because persisted adoption status was still read as `blocked`.
- Red: `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts --reporter=dot`
  - Result: failed as expected because formal adoption target fields were absent from history response.
- Red: `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts --reporter=dot`
  - Result: failed as expected because persisted adopted history was still rendered as actionable.

## Verification

- `corepack pnpm@10.26.1 exec vitest run src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/repositories/admin-ai-generation-result-persistence-db-adapter.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/services/organization-training-route.test.ts --reporter=dot`
  - Result: 7 files passed, 154 tests passed.
- `corepack pnpm@10.26.1 typecheck`
  - Result: passed.
- `corepack pnpm@10.26.1 lint`
  - Result: passed.
- `git diff --check`
  - Result: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-adoption-read-model-2026-07-09`
  - Result: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-adoption-read-model-2026-07-09 -SkipRemoteAheadCheck`
  - Result: passed.

## Sensitive Data Review

- Evidence contains no credentials, session/cookie/token/localStorage values, DB URL, DB raw rows, internal numeric ids, Provider payload, raw prompt, raw AI output, or complete question/paper/material content.
- Tests use synthetic redacted fixtures only.
