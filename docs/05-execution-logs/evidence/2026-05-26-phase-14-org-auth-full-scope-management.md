# Phase 14 Org Auth Full Scope Management Evidence

**Task id:** `phase-14-org-auth-full-scope-management`

**Branch:** `codex/phase-14-org-auth-full-scope-management`

**Date:** 2026-05-26

## Scope

Implement local `org_auth` management on `/ops/organizations`, covering enterprise authorization creation for organization hierarchy, scope type, selected organizations, profession, level, account quota, effective dates, overlap feedback, and cancellation visibility.

Forbidden scope remained unchanged: no staging/prod/cloud/real provider, no deploy, no dependency change, no schema/migration/script change, and no `.env.local` or `.env.example` read/write/output.

## Actual Checked Files

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Implementation Summary

- Replaced the hard-coded org auth creation shortcut with a state-driven form on `/ops/organizations`.
- Added controls for `name`, `purchaserOrganizationPublicId`, `authScopeType`, covered organization nodes, `profession`, `level`, `accountQuota`, `startsAt`, and `expiresAt`.
- Kept current-and-descendants semantics by submitting the purchaser organization as the root; the existing repository expands descendants server-side.
- Added specified-node selection through accessible organization checkboxes.
- Kept create/cancel confirmation dialogs and surfaced the existing overlap conflict as a Chinese UX message.
- Preserved public identifiers only; no numeric internal ids are exposed in the new UI payload path.

## TDD Log

- RED: `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts` initially failed because the enterprise authorization form did not expose the required `授权名称` field.
- RED: after first UI implementation, the focused test failed because the covered organization checkbox was not accessible by organization name.
- GREEN: `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts` passed with 9 tests after adding the full form and accessible organization checkbox.
- GREEN: `npm.cmd run test:e2e -- e2e/staging-required-role-flows.spec.ts` passed with the new form structure assertions.

## Requirement Cross-Check

| Requirement                                            | Result                                                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Province/city/district/baseline organization hierarchy | UI lists organizations and displays parent-depth context using tokenized Tailwind indentation classes.             |
| Purchase subject differs from usage scope              | Form separately captures purchaser organization and covered organization list.                                     |
| Scope: current organization and descendants            | UI option `current_and_descendants` submits the purchaser root; existing backend expands descendants.              |
| Scope: specified organization list                     | UI option `specified_nodes` enables explicit checkbox selection and submits selected public ids.                   |
| Profession and level                                   | UI captures `profession` and positive integer `level`; unit test verifies payload.                                 |
| Account quota                                          | UI captures positive integer `accountQuota`; existing validator/service enforce the same constraint.               |
| Effective dates                                        | UI captures start/end dates, converts them to ISO start-of-day values, and blocks end-before-start.                |
| Overlap of same profession/level/date/scope            | Existing service/repository overlap check remains intact; UI maps the overlap response to actionable Chinese copy. |
| Cancel keeps history and terminates flows              | Existing cancel action remains wired and covered by existing unit tests; no deletion behavior added.               |
| Public identifiers only                                | New payload tests assert `publicId`-style fields only; no numeric ids added.                                       |

## Browser Verification

All browser verification used only `http://127.0.0.1:3000` and a local test account. No token, Authorization header, secret, or request body was recorded.

- `Invoke-WebRequest http://127.0.0.1:3000/ops/organizations`: returned HTTP 200.
- Playwright browser login to local admin route, then `/ops/organizations`: form rendered with labels for authorization name, purchaser, scope type, profession, level, quota, start date, and expiry date.
- Playwright DOM verification: 3 select controls, 2 numeric inputs, 2 date inputs, and at least 1 accessible covered-organization checkbox were present.
- Playwright interaction verification: switched scope to `specified_nodes`, checked a covered organization, set profession to `logistics`, level to `5`, and quota to `30`; DOM state reflected `specified_nodes`, `logistics`, 1 checked coverage node, and numeric values `5`/`30`.
- No browser step connected to staging/prod/cloud or submitted a real-provider request.

## Command Results

- `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts`: pass, 9 tests.
- `npm.cmd run test:e2e -- e2e/staging-required-role-flows.spec.ts`: pass, 1 test.
- `npm.cmd run test:unit`: pass, 131 files / 525 tests after syncing with the repaired runtime baseline.
- `npm.cmd run test:e2e`: initial parallel gate run produced one transient `admin-audit-navigation` loading timeout while unit/lint/typecheck were also running.
- `npm.cmd run test:e2e -- e2e/admin-audit-navigation.spec.ts`: pass, 2 tests when isolated.
- `npm.cmd run test:e2e`: pass, 25 tests when rerun as the final full-suite e2e gate.
- `npm.cmd run build`: pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory after evidence update.
- `git diff --check`: pass.

## Blocker Resolution

The earlier full e2e baseline blocker was resolved by `phase-14-local-runtime-baseline`, merged and pushed to `master` before this task resumed. After syncing this branch with the repaired baseline, the enterprise authorization task passes focused checks and the full local e2e suite.

No human approval is required for forbidden scope; no staging/prod/cloud/real provider path was touched.

## Forbidden Scope Self-Check

- No dependency was added, removed, or upgraded.
- No package manifest or lockfile was modified.
- No `.env.local` or `.env.example` contents were read, changed, copied, or recorded.
- No staging, production, cloud, deploy, or real provider was contacted.
- No destructive migration, seed reset, or data rewrite was executed.
- No raw prompt, raw answer, raw model response, raw provider payload, Authorization header, database URL, token, secret, plaintext redeem code, generated password, full paper, full textbook, OCR full text, or private customer-like data is recorded here.

## 品味合规自检 Checklist

- 1. 视觉：未使用纯黑、廉价渐变或新字体；新增 UI 使用现有 token/Tailwind 类。
- 2. 状态：保留已有 loading/error/empty/toast/confirmation 状态，并为表单增加 invalid disabled/error 反馈。
- 3. 交互：提交按钮保留 `active:scale-[0.98]` 下压反馈。
- 4. Tailwind：已运行 Prettier 格式化新增 TSX/e2e/test/doc 文件。
- 5. N+1：未新增数据库查询。
- 6. Schema：未修改 schema、migration、SQL 或数据库结构。
- 7. API：沿用 `/api/v1/org-auths` 标准响应契约，不改变 envelope。
- 8. 注释：未新增无意义注释。
- 9. 命名：继续使用 `organization`, `org_auth`, `authScopeType`, `profession`, `level` 等术语表标识。
- 10. 不可变：React 状态更新使用对象展开、数组 `filter` 和新数组，不直接突变状态。
