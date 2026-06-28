# Organization Admin Standard Advanced Workspace Source Contract Evidence

Task id: `organization-admin-standard-advanced-workspace-source-contract-2026-06-27`

Branch: `codex/organization-admin-workspace-source-contract-20260628`

Task kind: `implementation_tdd`

result: pass

resultDetail: pass_organization_admin_standard_advanced_workspace_source_contract_focused_unit_static_gates_no_browser_no_final_pass

Batch range: single-task organization admin standard/advanced workspace source and permission contract integration.

Commit: `7256c845b` baseline before this organization admin source contract task; closeout commit SHA is reported in final handoff to avoid self-referential state churn.

localFullLoopGate: L2_focused_unit_plus_L1_static_no_browser

threadRolloverGate: no new thread required; resume from this evidence, the task plan, `project-state.yaml`, and `task-queue.yaml`.

nextModuleRunCandidate: `standard-advanced-backend-role-browser-validation-2026-06-27`

RED: Focused unit test failed before implementation because service capability summary was not exposed or consumed by organization admin source surfaces.

GREEN: Focused unit test passed after wiring organization admin source surfaces to the service capability summary and route guard helper.

moduleRunVersion: 2

localFullLoopGate: L2_focused_unit_plus_L1_static_no_browser

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Summary

This task wires organization admin workspace source surfaces to the prior backend workspace role guard contract:

- session DTO now exposes a server-side `adminWorkspaceCapability` summary for organization admins;
- organization portal, training, analytics, organization AI, and backend layout navigation consume `AdminWorkspaceCapabilitySummary`;
- standard or missing advanced capability shows standard-unavailable and does not load advanced history or render advanced submit/form actions;
- organization training request payloads use capability context derived from the service capability summary instead of a hardcoded UI edition literal.

This is source/contract evidence only. It is not browser runtime acceptance, staging readiness, release readiness, or final Pass.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/server/contracts/auth-contract.ts`
- `src/server/mappers/auth-mapper.ts`
- `src/features/admin/organization-workspace/admin-organization-workspace-access.ts`
- `src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- `tests/unit/organization-portal-admin-entry-surface.test.ts`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- `docs/05-execution-logs/task-plans/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md`
- `docs/05-execution-logs/acceptance/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md`

## Approval Boundary

Current user approved organization admin standard/advanced source plus permission contract task
`organization-admin-standard-advanced-workspace-source-contract-2026-06-27`.

Allowed changes are limited to task-queue-listed organization admin workspace page/state components, necessary route guard integration, capability contract adapter, focused unit tests, and task docs/evidence/audit/acceptance.

## Requirement Mapping Result

- `docs/01-requirements/modules/06-admin-ops.md`: organization admins stay in a first-class organization workspace; unrelated backend workspace access remains separated.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md` and ADR-007: UI consumes a service-side capability summary and no longer hardcodes advanced `effectiveEdition` as the authorization source.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`: standard organization admins cannot manage training; direct route access shows standard-unavailable.
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`: analytics remains organization-scoped and summary-only; export remains disabled.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`: organization AI entries remain discoverable only when the capability summary is advanced; Provider and formal adoption remain blocked.
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`: route/service guard decisions are reused for organization advanced pages and menu visibility is advisory only.

## RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts
```

Result: failed as expected.

Expected failure categories:

- `mapAuthContextToApi` did not expose `adminWorkspaceCapability`.
- Layout still showed advanced organization links from `org_advanced_admin` role even when service capability summary was standard.
- Organization training direct access rendered forms when service capability summary was standard.
- Organization AI attempted advanced history loading when service capability summary was standard.

Observed aggregate: 1 test file failed; 4 tests failed.

## GREEN

Command:

```powershell
npm.cmd run test:unit -- tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts
```

Result: pass; 1 file, 4 tests.

Command:

```powershell
npm.cmd run test:unit -- tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts
```

Result: pass; 6 files, 37 tests.

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                      | Result                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`                                                                                                                                                                                                                                                                                                 | pass; 1 file, 4 tests                                                                                                                                                                                                 |
| `npm.cmd run test:unit -- tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts` | pass; 6 files, 37 tests                                                                                                                                                                                               |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                                           | pass; ESLint completed without findings                                                                                                                                                                               |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                                      | pass; `tsc --noEmit` completed                                                                                                                                                                                        |
| `npx.cmd prettier --write --ignore-unknown <changed files>`                                                                                                                                                                                                                                                                                                                                                  | pass; scoped write completed                                                                                                                                                                                          |
| `npx.cmd prettier --check --ignore-unknown <changed files>`                                                                                                                                                                                                                                                                                                                                                  | pass; all matched files use Prettier style                                                                                                                                                                            |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                           | pass; no whitespace errors                                                                                                                                                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                                                                                                                                                                                                                                                                                                   | pass; `nextActionDecision: no_pending_task`, `activeQueueNonTerminalCount: 3`, `archiveCandidateCount: 7`, `highRiskRepairBlockedCount: 0`, `projectStatusRequiresHuman: true`; Cost Calibration Gate remains blocked |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-standard-advanced-workspace-source-contract-2026-06-27`                                                                                                                                                                                                    | pass after redacted test fixture repair; 20 task-scoped files scanned                                                                                                                                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-admin-standard-advanced-workspace-source-contract-2026-06-27`                                                                                                                                                                                               | pass after evidence anchor update                                                                                                                                                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-standard-advanced-workspace-source-contract-2026-06-27 -SkipRemoteAheadCheck`                                                                                                                                                                                | pass; accepted ancestor checkpoint semantics                                                                                                                                                                          |

## Source Contract Result

- `AuthenticatedUserDto.adminWorkspaceCapability` is optional and emitted only for organization admin sessions by the current session mapper.
- `AdminOrganizationPortalPage` uses capability summary for advanced links; standard organization portal remains available.
- `AdminOrganizationTrainingPage`, `AdminOrganizationAnalyticsPage`, and organization `AdminAiGenerationEntryPage` call `resolveOrganizationWorkspacePageAccess`.
- `AdminDashboardLayout` filters advanced organization menu entries from `canUseOrganizationAdvancedWorkspaceCapability`.
- The UI does not calculate `effectiveEdition`; full persisted `org_auth` and `auth_upgrade` computation remains a future gated authorization task.

## Forbidden-Action Checklist

| Action                                                  | Result           |
| ------------------------------------------------------- | ---------------- |
| Schema/migration/seed touched                           | pass_not_touched |
| Package or lockfile changed                             | pass_not_touched |
| `.env*` read or changed                                 | pass_not_touched |
| Browser/dev-server/e2e run                              | pass_not_run     |
| DB connection or mutation                               | pass_not_run     |
| Provider call/configuration                             | pass_not_run     |
| Cost Calibration execution                              | pass_not_run     |
| Staging/prod/deploy/payment/OCR/export/external service | pass_not_run     |
| PR or force push                                        | pass_not_done    |
| Release readiness or final Pass claimed                 | pass_not_claimed |

## Repository Hygiene Checklist

| Check                | Required evidence                                                                                                                                                                          | Result        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| Branch isolation     | Current branch is `codex/organization-admin-workspace-source-contract-20260628`, not `master` or `main` during implementation                                                              | pass          |
| Allowed files        | Changed file list matches queue `allowedFiles` and avoids `blockedFiles`                                                                                                                   | pass          |
| AC-to-runtime matrix | Source/permission contract only; browser/runtime role acceptance remains deferred                                                                                                          | pass          |
| Problem grading      | P1 role-only advanced access and UI hardcoded edition issue fixed at source/contract level; full `org_auth` runtime computation remains future scope                                       | pass          |
| Validation record    | Focused unit, lint, typecheck, formatting, diff, project status, and Module Run v2 gates recorded                                                                                          | pass          |
| Evidence hygiene     | No secret, token, Authorization header, raw provider payload, raw prompt, raw answer, raw model response, full paper/material/OCR text, generated plaintext `redeem_code`, or private data | pass          |
| Commit               | Focused task commit SHA recorded in final handoff to avoid self-referential state churn                                                                                                    | final_handoff |
| Merge                | Merge target and result recorded in final handoff after approved closeout                                                                                                                  | final_handoff |
| Push                 | Remote, branch, and push result recorded in final handoff after approved closeout                                                                                                          | final_handoff |
| Cleanup              | Merged short-lifecycle branch deletion recorded in final handoff after approved closeout                                                                                                   | final_handoff |
| Worktree residue     | Final status checked before handoff                                                                                                                                                        | final_handoff |
| stagingDecision      | `blocked_not_in_scope_no_target`                                                                                                                                                           | pass          |
| Next step            | `standard-advanced-backend-role-browser-validation-2026-06-27` remains approval-required because browser/dev-server/e2e are blocked here                                                   | pass          |

## Blocked Remainder

- Browser validation remains blocked by current task scope.
- Real DB-backed `org_auth`, `auth_upgrade`, expiry, revocation, atomic scope, and quota computation remains a future approved task.
- Provider, Provider configuration, Cost Calibration, staging/prod/deploy, payment, OCR/export, external-service work, PR, force push, release readiness, and final Pass remain blocked.

## Redaction Statement

Evidence records only public task ids, file paths, command names, pass/fail status, aggregate test counts, and redacted result summaries. It contains no secret, token, Authorization header, database URL, Provider payload, prompt, raw AI output, employee subjective answer text, full `paper` content, DB rows, or plaintext `redeem_code`.
