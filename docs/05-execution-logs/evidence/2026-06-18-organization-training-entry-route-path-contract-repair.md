# Organization Training Entry Route Path Contract Repair Evidence

## Summary

- taskId: `organization-training-entry-route-path-contract-repair`
- executionProfile: `local_unit_tdd_plus_scoped_local_full_flow`
- branch: `codex/organization-training-local-experience-chain`
- result: `route_path_repaired_full_flow_blocked_by_manual_draft_runtime_500`
- `experience_closed`: not claimed
- Cost Calibration Gate remains blocked

The admin organization-training entry was moved from `/organization-training` to `/content/organization-training`.
The employee entry remains `/organization-training`. This resolves the Next App Router path collision that previously
prevented the local Playwright webServer from starting.

The rerun of `organization-training-admin-employee-local-full-flow-validation` now reaches the admin runtime page and
submits the manual draft API call. It is currently blocked by `POST /api/v1/organization-trainings` returning `500001`
after the route repair. This is a new downstream runtime persistence blocker; no `experience_closed` claim is supported.

## Changed Files

- `src/app/(admin)/content/organization-training/page.tsx`
- `src/app/(admin)/organization-training/page.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- `e2e/organization-training-local-full-flow.spec.ts`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-18-organization-training-entry-route-path-contract-repair.md`
- `docs/05-execution-logs/evidence/2026-06-18-organization-training-entry-route-path-contract-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-18-organization-training-entry-route-path-contract-repair.md`
- `docs/05-execution-logs/evidence/2026-06-18-organization-training-admin-employee-local-full-flow-validation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-18-organization-training-admin-employee-local-full-flow-validation.md`

## RED Evidence

RED: admin route-path unit import was changed to require
`@/app/(admin)/content/organization-training/page` before the page was moved.

Command:

```powershell
npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts
```

Result: failed as expected.

Relevant output:

```text
Failed to resolve import "@/app/(admin)/content/organization-training/page"
Does the file exist?
```

## GREEN Evidence

GREEN: after moving the admin route file and deleting the old conflicting route, focused unit tests passed.

Command:

```powershell
npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts
```

Result: passed.

```text
Test Files  2 passed (2)
Tests  6 passed (6)
```

Command:

```powershell
npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts --list
```

Result: passed.

```text
Total: 1 test in 1 file
```

Command:

```powershell
npx.cmd prettier --check --ignore-unknown 'src/app/(admin)/content/organization-training' tests/unit/organization-training-admin-entry-surface.test.ts e2e/organization-training-local-full-flow.spec.ts docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-18-organization-training-entry-route-path-contract-repair.md docs/05-execution-logs/evidence/2026-06-18-organization-training-entry-route-path-contract-repair.md docs/05-execution-logs/audits-reviews/2026-06-18-organization-training-entry-route-path-contract-repair.md docs/05-execution-logs/evidence/2026-06-18-organization-training-admin-employee-local-full-flow-validation.md docs/05-execution-logs/audits-reviews/2026-06-18-organization-training-admin-employee-local-full-flow-validation.md
```

Result: passed.

Command:

```powershell
npm.cmd run lint
```

Result: passed.

Command:

```powershell
npm.cmd run typecheck
```

Result: passed after fixing the e2e fixture order so the employee client is only referenced after employee login.

Command:

```powershell
git diff --check
```

Result: passed.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-entry-route-path-contract-repair
```

Result: passed.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-entry-route-path-contract-repair
```

Result: passed at the script level after the evidence and audit records were present. The task audit verdict itself
remains `BLOCKED` because the scoped local full-flow failed at manual draft runtime `500001`; no completion commit or
`experience_closed` claim is supported.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-entry-route-path-contract-repair
```

Result: passed. No push was performed.

## Local Full-Flow Rerun

Command:

```powershell
npm.cmd run test:e2e -- e2e/organization-training-local-full-flow.spec.ts
```

Result: failed after route repair.

Observed progression:

- Previous blocker resolved: the local Next webServer no longer fails with the parallel page collision.
- The e2e reached `/content/organization-training`.
- The test fixture was adjusted to authenticate admin and employee through the browser context so same-origin cookies
  match `ProtectedRouteGuard`.
- Existing overlapping org_auth local fixture conflicts are handled by reusing an active matching org_auth.
- Current blocker: admin manual draft creation calls `POST /api/v1/organization-trainings` and receives `500001`.

Relevant output:

```text
Expected: 0
Received: 500001
at createDraftFromAdminUi
```

Inference from local source/state:

- The route now reaches the manual draft persistence path.
- The draft/source-context persistence tables are tied to the draft source-context schema migration, and project state
  still records migration execution as blocked/not run.
- This task does not approve schema/drizzle/migration changes or database migration execution, so the full-flow cannot be
  declared GREEN here.

## Module Run v2 Evidence

- Batch range: single route path repair task plus rerun of the previously blocked organization-training local full-flow.
- Commit: `de549c3e` baseline before the route repair; no completion commit exists because local full-flow remains
  blocked.
- batchCommitEvidence: no task commit was created before final readiness because scoped local full-flow failed.
- localFullLoopGate: rerun attempted; Next route collision is resolved, but full-flow is blocked at manual draft runtime
  `500001`.
- Thread rollover gate: no rollover required.
- nextModuleRunCandidate: `organization-training-draft-source-context-local-migration-execution-approval`.
- Next Module Run: obtain explicit approval for local-only draft/source-context schema migration execution or another
  approved persistence-readiness path, then rerun the organization-training local full-flow.
- Blocked remainder: manual draft runtime persistence `500001`, schema migration execution approval, local full-flow
  GREEN evidence, closure readiness audit, and Cost Calibration Gate.

## Redaction

- No Authorization header, browser session value, password, database URL, provider payload, model response, raw prompt,
  or raw answer is recorded.
- Failure evidence records only public route paths, API paths, and standard response codes.

## 品味合规自检 Checklist

- API 标准响应：e2e 继续校验 `{ code, message, data, pagination? }`，当前 full-flow 阻塞于标准错误码 `500001`。
- 命名规范：新 admin 路径 `/content/organization-training` 使用 kebab-case，并符合现有后台 `/content/*` 路径习惯。
- 不暴露自增主键：route path 修复未引入自增主键 URL；e2e 仍包含 `id` key 泄漏检查。
- UI Token/布局：未改 UI 组件视觉实现，仅移动 App Router page 入口。
- 架构边界：未修改 API route、service、repository、schema、drizzle、migration、依赖、`.env*` 或 provider/model。
- 结论纪律：未声明 `experience_closed`；full-flow 仍因 manual draft runtime `500001` 阻塞。
