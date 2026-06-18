# Organization Training Admin Employee Local Full Flow Validation Evidence

## Summary

- taskId: `organization-training-admin-employee-local-full-flow-validation`
- executionProfile: `local_full_flow`
- branch: `codex/organization-training-local-experience-chain`
- result: `blocked_by_admin_visible_scope_409080_after_local_migration`
- `experience_closed`: not claimed
- Cost Calibration Gate remains blocked

The scoped local Playwright flow was added for the admin draft/source/copy and employee visible-list/draft-save/submit/
readonly-summary path.

Observed progression:

- Original blocker: Next App Router path collision between admin and employee `/organization-training` entries.
- After `organization-training-entry-route-path-contract-repair`: admin moved to `/content/organization-training`, and
  route compilation succeeds.
- After `organization-training-draft-source-context-local-migration-execution-approval`: the local draft/source-context
  migration was applied, and manual draft no longer fails with `500001`.
- Current blocker: `POST /api/v1/organization-trainings` returns `409080` because the seed admin has no visible
  `admin_organization` root in the current local database.

No `experience_closed` claim is supported.

## Changed Files

- `e2e/organization-training-local-full-flow.spec.ts`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-18-organization-training-admin-employee-local-full-flow-validation.md`
- `docs/05-execution-logs/evidence/2026-06-18-organization-training-admin-employee-local-full-flow-validation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-18-organization-training-admin-employee-local-full-flow-validation.md`

## RED / Runtime Failure Evidence

RED: the original scoped local full-flow e2e could not start because the local Next webServer rejected the route graph.

GREEN: not available for the local full-flow path. After the route path repair and local migration execution, the browser
runtime starts and reaches admin manual draft creation, but the flow still fails at admin visible-scope authorization with
`409080`.

## Rerun After Route Path Repair

`organization-training-entry-route-path-contract-repair` moved the admin entry to `/content/organization-training` and
removed the old admin `/organization-training` page. A rerun no longer fails at Next route compilation. It reached admin
manual draft creation and failed at `POST /api/v1/organization-trainings` with response code `500001`.

Command:

```powershell
npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts
```

Route-repair rerun result: failed after reaching the admin manual draft runtime call.

```text
Expected: 0
Received: 500001
at createDraftFromAdminUi
```

Impact:

- The previous route collision blocker was resolved.
- Admin draft/source/copy UI began runtime execution and reached the manual draft API call.
- Employee visible-list/draft-save/submit/readonly-summary browser assertions were still not reached.

## Rerun After Local Migration Execution

`organization-training-draft-source-context-local-migration-execution-approval` applied the reviewed draft/source-context
migration to the current local/dev loopback database. A fresh rerun no longer returns `500001`.

Command:

```powershell
npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts
```

Result: failed after reaching the admin manual draft service guard.

```text
Expected: 0
Received: 409080
at createDraftFromAdminUi
```

Diagnostic evidence:

```text
OK_SCOPE_DIAGNOSTIC
seedAdminExists: true
visibleRootExists: false
visibleCount: 0
firstOrganizationVisible: false
publicIds: <redacted>
```

Latest decision: local full-flow remains blocked; the active blocker moved from manual draft persistence `500001` to
admin visible organization scope `409080`.

## Supporting Checks

Command:

```powershell
npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts --list
```

Result: passed. Playwright listed the scoped spec without launching the browser runtime.

Earlier supporting checks before the local migration task:

- `npx.cmd prettier --check --ignore-unknown ...`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed after removing ignored `.next/dev` generated artifacts from the route-collision run.
- `git diff --check`: passed.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-admin-employee-local-full-flow-validation`:
  passed.
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-admin-employee-local-full-flow-validation`:
  failed as expected while the task was intentionally marked `BLOCKED`.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-admin-employee-local-full-flow-validation`: passed.

Fresh supporting checks for the local migration execution task are recorded in
`docs/05-execution-logs/evidence/2026-06-18-organization-training-draft-source-context-local-migration-execution-approval.md`.

## Tool Availability Note

`Get-TikuProjectStatus` and `Get-TikuNextAction -VerboseHistory` were attempted earlier in this PowerShell session and
were not available as recognized commands. The task therefore used the local queue, project-state, coverage matrix, and
git status as the authoritative local state.

## Latest Rerun After Source-Context UI Response-Key Repair

`organization-training-admin-source-context-ui-response-key-contract-repair` aligned the admin UI with the source-context
route's successful `data.context` response key. The scoped local full-flow was rerun after that repair.

Command:

```powershell
npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts
```

Result:

- Passed.
- Test files: 1 passed.
- Tests: 1 passed.
- Flow covered admin draft creation, source-context binding, copy-to-new-draft, employee visible-list, draft-save,
  submit, and readonly-summary.

Decision update:

- The previous admin visible-scope `409080` blocker and source-context UI response-key blocker are no longer active in
  the latest local run.
- The local experience matrix may advance the organization-training content lifecycle and employee answer use cases to
  `local_experience_ready`.
- `experience_closed` is still not claimed; a closure readiness audit remains required.

## Module Run v2 Evidence

- Batch range: single local full-flow validation task for the organization-training admin-to-employee path, with reruns
  after route repair and local migration execution.
- Baseline local commit before this task: `de549c3e feat(organization-training): add admin employee entry surfaces`.
- Commit: `de549c3e` baseline before this blocked validation task; no task completion commit exists.
- batchCommitEvidence: no task commit was created because validation remains blocked.
- localFullLoopGate: latest rerun after source-context UI response-key repair passed the scoped local full-flow.
- Thread rollover gate: no rollover required.
- nextModuleRunCandidate: `organization-training-experience-closure-readiness-audit`.
- Next Module Run: run the docs/state closure readiness audit against the fresh passing local full-flow evidence.
- Blocked remainder: closure readiness audit and Cost Calibration Gate.

## Redaction

- No Authorization header, browser session value, password, database URL, provider payload, model response, raw prompt,
  raw answer, row data, public identifier inventory, screenshot, trace, or DOM dump is recorded in this evidence.
- The failure output contains public route/API paths, aggregate booleans, and standard response codes only.

## Taste Compliance Checklist

- API response contract: the e2e asserts `{ code, message, data, pagination? }`; the latest runtime failure is standard
  response code `409080`.
- Naming: task IDs, API paths, and JSON field references remain in the established naming conventions.
- No public auto-increment ids: the e2e still checks for internal `id` key leakage.
- UI tokens/layout: no product UI source was changed by this validation update.
- Architecture boundary: the latest rerun did not change schema, migration SQL, dependencies, `.env*`, provider/model, or
  external-service files.
- Conclusion discipline: no `experience_closed` claim; the latest full-flow passed but closure audit is still pending.
