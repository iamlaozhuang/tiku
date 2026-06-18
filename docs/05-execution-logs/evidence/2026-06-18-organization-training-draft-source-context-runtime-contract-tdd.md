# Organization Training Draft Source Context Runtime Contract TDD Evidence

## Summary

- taskId: `organization-training-draft-source-context-runtime-contract-tdd`
- executionProfile: `local_unit_tdd`
- branch: `codex/organization-training-local-experience-chain`
- result: `pass`
- decision: runtime route/API contract closed for manual draft, source-context attachment, and copy-to-new-draft.
- `experience_closed`: not claimed.
- Cost Calibration Gate remains blocked.

## Module Run v2 Evidence

- Batch range: single local_unit_tdd implementation task for organization-training draft/source-context runtime route
  contracts.
- Commit: `614d723c7d572e1ba11ae9eadbf2c1dccb6d2f5a` is the pre-task baseline; the final task commit is produced after
  local validation and closeout readiness.
- localFullLoopGate: not_used_for_this_local_unit_tdd. This task did not start a dev server, run Browser, execute
  Playwright runtime, or run full e2e.
- threadRolloverGate: no rollover required for this single scoped task.
- nextModuleRunCandidate: `organization-training-admin-employee-entry-surface-local-ui`.
- blocked remainder: admin/employee entry surfaces, localhost-only local full-flow validation, closure readiness audit,
  database migration execution, and Cost Calibration Gate remain blocked/open.

## Scope

- Added metadata-only route validators for manual draft, source-context attachment, and copy-to-new-draft route input.
- Added mapper/repository runtime contract support for `organization_training_draft` and
  `organization_training_source_context`.
- Added App Router entrypoints:
  - `POST /api/v1/organization-trainings`
  - `POST /api/v1/organization-trainings/{publicId}/copy-to-new-draft`
  - `POST /api/v1/organization-trainings/{publicId}/source-contexts`
- Wired runtime route handlers to the existing organization training service and Postgres-backed repository seam.

## Non-Scope Preserved

- No `.env*`, package/lockfile/dependency, schema/drizzle/migration, provider/model, UI, e2e spec, dev server,
  Browser/Playwright runtime, staging/prod/cloud/deploy/payment/external-service, PR, force-push, database migration
  execution, or Cost Calibration Gate work.
- Source-context and draft runtime contracts remain metadata-only and do not persist raw question body, standard answer,
  analysis, raw prompt, raw answer, provider payload, formal paper, formal mock_exam, formal answer_record, exam_report,
  practice, or mistake_book targets.

## RED Evidence

RED:

- Command:
  `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/validators/organization-training.test.ts src/server/repositories/organization-training-repository.test.ts src/server/mappers/organization-training-mapper.test.ts`
- Result: expected fail.
- Failure anchors:
  - missing `src/app/api/v1/organization-trainings/route`;
  - missing mapper exports `mapOrganizationTrainingDraftRowToDto` and
    `mapOrganizationTrainingSourceContextRowToDto`;
  - missing repository methods `createManualDraft`, `copyVersionToNewDraft`, and `attachSourceContext`;
  - missing validator exports for manual draft, source-context, and copy route input.
- Existing unaffected tests in the same focused run: 25 passed.

## GREEN Evidence

GREEN:

- Command:
  `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/validators/organization-training.test.ts src/server/repositories/organization-training-repository.test.ts src/server/mappers/organization-training-mapper.test.ts`
- Result: pass; 4 test files, 67 tests.

## Interim Validation

- `npx.cmd prettier --write --ignore-unknown ...`
  - Result: pass; scoped allowed files only.
- `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/validators/organization-training.test.ts src/server/repositories/organization-training-repository.test.ts src/server/mappers/organization-training-mapper.test.ts`
  - Final fresh result: pass. 4 test files, 67 tests.
- `npm.cmd run test:e2e -- --list`
  - Result: pass. Listed 28 tests in 11 files. No Browser/Playwright runtime execution was run.
- `npx.cmd prettier --check --ignore-unknown ...`
  - Result: pass. All matched files use Prettier code style.
- `npm.cmd run lint`
  - Initial result: pass with 3 unused-import warnings.
  - Follow-up after cleanup: pass with no warnings shown.
- `npm.cmd run typecheck`
  - Result: pass.
- `git diff --check`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-draft-source-context-runtime-contract-tdd`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-draft-source-context-runtime-contract-tdd`
  - Initial result: failed on Module Run v2 evidence anchor normalization.
  - Fix: added `Batch range`, `Commit`, `localFullLoopGate`, `threadRolloverGate`, `nextModuleRunCandidate`, exact
    `RED:`/`GREEN:` anchors, and closeout command evidence.
  - Final result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-draft-source-context-runtime-contract-tdd`
  - Result: pass. This was a readiness gate only; no push was performed.

## Closeout Boundary

- This task closes only the runtime route/API contract for organization-training draft/source-context/copy.
- Admin/employee entry surfaces remain pending.
- Localhost full-flow validation remains pending.
- Closure readiness audit remains pending and must not mark `experience_closed` without fresh local full-flow evidence.

## 品味合规自检 Checklist

- [x] API route keeps the standard `{ code, message, data }` response envelope.
- [x] REST paths use `/api/v1/` and kebab-case plural resource paths.
- [x] API JSON fields remain camelCase through DTOs.
- [x] No auto-increment internal ID is exposed in API payloads.
- [x] Repository implementation stays inside the route/service/repository layering and uses existing Drizzle schema
      objects only.
- [x] No `.env*`, dependency, provider/model, schema/drizzle/migration, external-service, deploy, payment, PR,
      force-push, or Cost Calibration Gate work was introduced.
- [x] Tests were written and observed failing before implementation, then passed after minimal runtime wiring.
