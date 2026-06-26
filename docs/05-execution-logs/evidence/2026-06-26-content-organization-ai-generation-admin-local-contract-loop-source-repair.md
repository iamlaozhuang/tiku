# Content Organization AI Generation Admin Local Contract Loop Source Repair Evidence

Task id: `content-organization-ai-generation-admin-local-contract-loop-source-repair-2026-06-26`

Branch: `codex/content-org-ai-local-loop-20260626`

Task kind: `implementation`

## Summary

Implemented a local contract request loop for content admin and organization admin AI question/paper generation.

What changed:

- Added server-owned local contract APIs:
  - `POST /api/v1/content-ai-generation-requests`
  - `POST /api/v1/organization-ai-generation-requests`
- Added a redacted admin AI generation local contract DTO and route handler.
- Extended the shared AI task request policy to accept content admin `admin_role` platform-owned requests while keeping
  personal AI generation narrowed to `personal_auth | org_auth`.
- Added UI submit controls and redacted task/result summaries to `AdminAiGenerationEntryPage`.
- Added focused unit tests for policy, route, and UI behavior.

No Provider call, credential/env read, DB connection/write, schema/migration, browser/e2e, formal `question`/`paper`
write, package/lockfile change, staging/prod/payment/external-service work, PR, force push, or MVP final Pass was
executed.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-content-organization-ai-generation-admin-local-contract-loop-source-repair.md`
- `docs/05-execution-logs/evidence/2026-06-26-content-organization-ai-generation-admin-local-contract-loop-source-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-content-organization-ai-generation-admin-local-contract-loop-source-repair.md`
- `src/app/api/v1/content-ai-generation-requests/route.ts`
- `src/app/api/v1/organization-ai-generation-requests/route.ts`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/features/admin/content-admin-runtime.tsx`
- `src/server/contracts/admin-ai-generation-local-contract.ts`
- `src/server/models/ai-generation-task-request.ts`
- `src/server/validators/ai-generation-task-request.ts`
- `src/server/validators/personal-ai-generation-request.ts`
- `src/server/services/ai-generation-task-request-service.test.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`

## Approval Boundary

Approved by owner request on 2026-06-26 to execute the next minimal source task:

`content-organization-ai-generation-admin-local-contract-loop-source-repair-2026-06-26`

This approval covers local low-risk source repair, focused unit tests, local commit, fast-forward merge to `master`, push
to `origin/master`, and short-branch cleanup under the recorded task `closeoutPolicy`.

## Requirement Mapping Result

Mapped to:

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

Mapping conclusion:

- Content admin and organization advanced admin AI generation now have a local request contract loop instead of
  entry-only surfaces.
- Organization standard admin remains denied or unavailable.
- Edition-aware authorization remains server-derived; this task does not change learner entitlement or client-trusted
  authorization behavior.
- Generated output remains summary-only and separated from formal `question` and `paper`.
- Provider, Cost, DB/schema, browser/e2e, staging/prod, payment, and final Pass remain blocked.

## TDD Evidence

RED command:

`npm.cmd run test:unit -- src/server/services/ai-generation-task-request-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`

Expected RED result:

- failed because `admin-ai-generation-local-contract-route` did not exist;
- failed because shared AI task request policy rejected `authorizationSource: admin_role` with `400012`;
- failed because `AdminAiGenerationEntryPage` had no `admin-ai-generation-submit` UI.

GREEN command after implementation:

`npm.cmd run test:unit -- src/server/services/ai-generation-task-request-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`

Result:

- pass;
- 3 test files;
- 14 tests.

Post-format focused rerun:

- pass;
- 3 test files;
- 14 tests.

## Validation Results

- `npm.cmd run test:unit -- src/server/services/ai-generation-task-request-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`: pass, 3 files / 14 tests.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npx.cmd prettier --write --ignore-unknown ...`: pass, scoped files formatted.
- `npx.cmd prettier --check --ignore-unknown ...`: pass.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-organization-ai-generation-admin-local-contract-loop-source-repair-2026-06-26`: pass.
- First pre-push readiness run failed only on repository SHA checkpoint drift: current `master`/`origin/master` were
  `a853a2416dce7d4ea9fd56178bc692b8044f63c8` while global state still recorded
  `83df383825e3c22fdb4fe205caa4d9aa5f4dd53b`; corrected `repository.lastKnownMasterSha` and
  `repository.lastKnownOriginMasterSha` to the current accepted ancestor checkpoint.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-organization-ai-generation-admin-local-contract-loop-source-repair-2026-06-26 -SkipRemoteAheadCheck`: pass after checkpoint handoff repair.

## Redaction Result

- API success responses include only local contract state, task public id, owner/quota public references, summary-only
  result references, redaction status, blocked Provider bridge status, and formal content write blocks.
- API denial responses return standard error envelope with `data: null`.
- Client-supplied `rawPrompt`, `providerPayload`, `secret`, and raw generated content fixtures are not echoed by route
  tests.
- UI tests assert session token, raw prompt, and Provider payload strings are not rendered.

## Blocked Work Statement

Blocked in this task:

- `.env*`, credential, token, password, Authorization header, Provider payload, raw prompt, raw generated output, raw DB
  row, or database URL evidence;
- Provider/model calls and Provider configuration;
- Cost Calibration;
- DB connection, seed, account mutation, schema, migration, and `drizzle` changes;
- browser/e2e/dev-server runtime;
- formal `question` or `paper` writes;
- package/lockfile/dependency changes;
- staging/prod/cloud/deploy/payment/external-service/PR/force-push work;
- MVP final Pass.

## Residual Gaps

- This is still local contract only; durable persistence and draft/review queues remain future work.
- Real Provider runtime integration remains blocked without a follow-up Provider gate task.
- Cost Calibration remains blocked.
- Browser/runtime evidence for the new UI loop was not executed in this task.
- Formal adoption into `question` or `paper` remains separately gated.

## Next Step

Recommended next task after closeout:

`content-organization-ai-generation-admin-local-contract-loop-focused-browser-rerun-2026-06-26`

That task should require explicit browser/runtime approval and remain local-only with redacted evidence. No MVP final Pass
is claimed.
