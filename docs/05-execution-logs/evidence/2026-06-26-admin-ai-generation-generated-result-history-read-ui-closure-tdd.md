# Evidence: Admin AI Generation Generated Result History Read UI Closure TDD

Task id: `admin-ai-generation-generated-result-history-read-ui-closure-tdd-2026-06-26`

Branch: `codex/admin-ai-generated-result-history-ui-20260626`

Status: `pass`

## Summary

This task adds a Provider-disabled generated-result history/read UI closure for backend admin AI generation. The intended
result is that content/org admin history can show persisted redacted generated-result summaries that were already stored
by the prior local route integration task.

Implemented:

- Added `generatedResult` as an optional redacted summary child on each admin AI generation history item.
- Updated admin history GET to read `AdminAiGenerationResultPersistenceRepository.listDraftResults` and join results by
  `taskPublicId`.
- Updated backend admin AI generation history cards to show redacted generated-result preview, visibility, evidence
  status, citation count, and formal-adoption blocked status.
- Added focused content/org route and UI tests for generated-result readback.

## Boundary

- Provider call/configuration/env/credential read: `false`.
- Raw prompt, raw output, raw provider payload, API key, token, cookie, Authorization header, or DB URL evidence:
  `false`.
- DB connection, DB write, migration execution, seed, or account mutation: `false`.
- Schema/migration/Drizzle metadata change: `false`.
- Formal `question`/`paper` write or adoption: `false`.
- Package or lockfile change: `false`.
- Browser/dev-server/e2e: `false`.
- Staging/prod/payment/external service/deployment/release readiness/final Pass: `false`.

## TDD Evidence

RED command:

```text
npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts
```

RED result:

- Failed as expected.
- 2 test files failed.
- 4 failed, 19 passed.
- Failure causes matched intended gap:
  - GET history did not call the generated result persistence repository.
  - UI history cards did not render the redacted generated-result summary.

GREEN command:

```text
npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts
```

GREEN result:

- Pass.
- 2 test files passed.
- 23 tests passed.

## Validation Log

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
  - pass: 2 files, 23 tests.
- `npm.cmd run typecheck`
  - first run failed because the task history query owner type was wider than the generated-result history query owner
    type.
  - fixed by explicitly narrowing generated-result history owner type to `platform | organization`.
  - rerun pass.
- `npm.cmd run lint`
  - pass.
- `npx.cmd prettier --write --ignore-unknown ...`
  - pass.
- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
  - pass after formatting: 2 files, 23 tests.
- `npm.cmd run typecheck`
  - pass after formatting.
- `npm.cmd run lint`
  - pass after formatting.
- `npx.cmd prettier --check --ignore-unknown ...`
  - pass.
- `git diff --check`
  - pass.
- `Test-ModuleRunV2PreCommitHardening.ps1 ...`
  - pass.
- `Test-ModuleRunV2PrePushReadiness.ps1 ... -SkipRemoteAheadCheck`
  - pass.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-generated-result-history-read-ui-closure-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-generated-result-history-read-ui-closure-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-generated-result-history-read-ui-closure-tdd.md`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/server/contracts/admin-ai-generation-local-contract.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`

## Browser Runtime

Not executed. This task blocks browser runtime, dev-server, and e2e execution. UI behavior was validated by focused
component/unit tests only.

## Closeout Decision

`READY_FOR_LOCAL_COMMIT_FF_MERGE_PUSH_AND_SHORT_BRANCH_CLEANUP`.

Cost Calibration Gate remains blocked.
