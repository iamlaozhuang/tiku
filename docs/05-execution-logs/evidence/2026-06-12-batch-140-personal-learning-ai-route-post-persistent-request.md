# Evidence: batch-140-personal-learning-ai-route-post-persistent-request

result: pass

## Batch 140

- Task: `batch-140-personal-learning-ai-route-post-persistent-request`
- Branch: `codex/batch-140-personal-learning-ai-route-post-persistent-request`
- Task kind: `implementation`
- Baseline: `c6facfbe3a3f18dff59583f26b8efea25ac99667`
- Commit: `c6facfbe3a3f18dff59583f26b8efea25ac99667` is the verified pre-edit repository baseline. The final immutable
  task commit SHA is reported in closeout because this evidence file participates in the task commit object.
- localFullLoopGate: L4 local API route.
- threadRolloverGate: not required; task stayed within current thread.
- nextModuleRunCandidate: `batch-141-personal-learning-ai-ui-server-backed-history-after-submit`.

## Approval Boundary

- Batch-139 dependency was closed and pushed before batch-140 was claimed.
- User directed serial continuation through pending personal-learning-ai tasks; batch-140 has no `freshApprovalRequired`
  field and was claimed under its local implementation and local existing-spec e2e capability after dependency close.
- No schema/migration, UI refetch, contract/model edit, package/lockfile, env/secret, provider call, deploy, payment,
  external-service, destructive DB, formal generated-content write path, PR, force-push, or Cost Calibration Gate action
  was approved or performed.
- Batch-140 `schemaMigration` capability is blocked; no LocalCapabilityGate schemaMigration run was applicable for this
  non-schema task.
- Cost Calibration Gate remains blocked.

## Scope Evidence

- Edited `src/server/services/personal-ai-generation-request-route.ts` and its focused unit test.
- The POST route now attempts redacted metadata persistence only for complete `local_browser_experience` requests.
- The route uses the resolved session user public id for actor, owner, and quota owner before persistence, ignoring stale
  client ownership ids.
- Idempotent repository reuse updates only public task/result metadata in the local browser response contract.
- Repository persistence errors fall back to the existing local browser response and do not leak stack traces or internal
  connection details.
- Edited governance files only within the task allowance: project state, task queue, task plan, evidence, and audit.
- No app route adapter, repository implementation, schema, drizzle migration, UI feature, contract, model, package,
  lockfile, env/secret, provider, deploy, payment, external-service, authorization model, or formal generated-content
  write path file was edited.
- No provider call was made. No prompt text, provider payload, raw answer, generated content, secret, credential, token,
  database row, or internal numeric id is recorded here.

## RED:

- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/repositories/personal-ai-generation-request-repository.test.ts`
  initially failed with 3 focused route failures because POST did not call `createOrReuseRequest`, did not reuse returned
  task metadata, and did not exercise the persistence-failure fallback.

## GREEN:

- `createPersonalAiGenerationRequestRouteHandlers` now accepts an optional clock dependency for deterministic
  `requestedAt` tests.
- The route builds a `CreatePersonalAiGenerationRequestInput` from normalized public metadata only when all persistence
  fields are present and valid.
- POST `local_browser_experience` calls `createOrReuseRequest` with session-normalized actor/owner/quota public ids.
- Reused repository rows update `existingTaskPublicId`, `existingTaskStatus`, result public id, evidence status, citation
  count, and AI call log public id before the local browser read model is built.
- Persistence failures return the original local browser response contract without exposing the internal error string.

## Validation Log

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`:
  passed before edits on `codex/batch-140-personal-learning-ai-route-post-persistent-request`; baseline `master` and
  `origin/master` were `c6facfbe3a3f18dff59583f26b8efea25ac99667`.
- Focused RED unit command above: failed as expected with 3 route failures.
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts src/server/repositories/personal-ai-generation-request-repository.test.ts`:
  passed after implementation with `2` test files and `19` tests passing.
- `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`: passed with `1` Chromium test passing.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- Parallel `npm.cmd run test:unit` with `npm.cmd run build`: build passed, but full unit had one existing
  `fresh-validation-runner` timeout under CPU contention; this was not accepted as final unit evidence.
- `npm.cmd run test:unit`: passed on standalone rerun with `Test Files 247 passed (247)`, `Tests 900 passed (900)`.
- `npm.cmd run build`: passed; Next.js compiled successfully and generated `55` static pages.
- `git diff --check`: passed.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-140-personal-learning-ai-route-post-persistent-request`:
  passed after evidence and audit were written.
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-140-personal-learning-ai-route-post-persistent-request`:
  initially failed because this evidence file used `RED` / `GREEN` headings without the strict colon anchors; after the
  headings were corrected to `RED:` / `GREEN:`, it passed.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-140-personal-learning-ai-route-post-persistent-request`:
  passed on the short branch with `master`, `origin/master`, and state SHAs all at
  `c6facfbe3a3f18dff59583f26b8efea25ac99667`.

## Blocked Remainder

- UI server-backed refetch remains batch-141.
- Security review and local role-flow validation remain batch-142 and batch-143.
- Generated-content domain blocked gate and provider/env/cost blocked gate remain batch-144 and batch-145 after
  dependencies close.
- Provider execution, generated-content persistence, schema/migration work, contract/model edits, dependency/package/
  lockfile changes, env/secret work, deploy/payment/external-service work, formal generated-content write paths, PR,
  force-push, and authorization model changes remain blocked.
- Cost Calibration Gate remains blocked.
