# 2026-07-06 Content Admin History Adoption Loop Evidence

## Scope

- Task: `content-admin-history-adoption-loop-2026-07-06`
- Branch: `codex/content-admin-history-adoption-loop-2026-07-06`
- Boundary: local source/test/docs only.
- Provider calls: not executed.
- Runtime DB connection or mutation: not executed.
- Schema/migration/seed/dependency changes: not changed.
- Browser/dev server/e2e/staging/prod: not executed.

## Red First

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts
```

Result: failed as expected.

- Failing cases: 2.
- UI failure: historical content-admin adoption stayed disabled even when history supplied a reviewed draft snapshot.
- Repository failure: result history DTO did not expose a persisted reviewed draft snapshot.
- Protected evidence strings remained absent from the test assertions: `rawPrompt`, `rawOutput`, `providerPayload`.

## Green / Focused Validation

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts
```

Result: pass.

- Test files: 2 passed.
- Tests: 40 passed.

Command:

```powershell
npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts
```

Result: pass.

- Test files: 1 passed.
- Tests: 26 passed.

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts
```

Result: pass.

- Test files: 4 passed.
- Tests: 73 passed.

## Static Gates

Command:

```powershell
npm.cmd run typecheck
```

Result: pass.

Command:

```powershell
npm.cmd run lint
```

Result: pass.

Command:

```powershell
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-content-admin-history-adoption-loop.md src/lib/admin-ai-generation-formal-draft-payload.ts src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx src/features/admin/ai-generation/admin-ai-generation-formal-draft-payload.ts src/server/contracts/admin-ai-generation-formal-draft-adapter-contract.ts src/server/contracts/admin-ai-generation-local-contract.ts src/server/contracts/admin-ai-generation-result-persistence-contract.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts
```

Result: pass.

Command:

```powershell
git diff --check
```

Result: pass.

## Full Unit

Command:

```powershell
npm.cmd run test:unit
```

Result: pass.

- Test files: 333 passed.
- Tests: 1661 passed.

## Module Run V2

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-history-adoption-loop-2026-07-06
```

Result: pass.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-history-adoption-loop-2026-07-06 -SkipRemoteAheadCheck
```

Result: pass.

## Implementation Evidence

- Content-admin current result adoption still uses the current runtime structured preview.
- Content-admin historical result adoption now uses a persisted `reviewedDraft` snapshot when present.
- History-only results without a reviewed draft snapshot still keep adopt disabled and cannot fabricate a payload.
- Organization workspace generated results keep `reviewedDraft: null` and continue through organization training draft copy/publish flow.
- Formal publishing remains blocked at AI adoption time; adoption only creates/updates formal draft metadata through the existing governed adapter.
