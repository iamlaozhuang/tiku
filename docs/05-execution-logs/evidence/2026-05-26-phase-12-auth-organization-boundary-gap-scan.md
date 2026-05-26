# Phase 12 Auth Organization Boundary Gap Scan Evidence

**Task id:** `phase-12-auth-organization-boundary-gap-scan`

**Branch:** `codex/phase-12-auth-organization-boundary-gap-scan`

**Date:** 2026-05-26

## Scope

This task executed the unauthenticated, insufficient-permission, organization, employee, and authorization boundary slice from the Phase 12 multi-role experience scripts. It records gaps only and does not change runtime/UI/test code.

## Files Checked

Standards, requirements, contracts, state, queue, and prior evidence:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/phase-11-role-based-full-flow-acceptance-contract.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-role-scenario-script-plan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-role-scenario-script-plan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-admin-experience-gap-scan.md`

Implementation and tests:

- `src/components/ProtectedRouteGuard/ProtectedRouteGuard.tsx`
- `src/components/StudentAppLayout/StudentAppLayout.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `src/features/admin/content-admin-runtime.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `src/server/services/session-service.ts`
- `src/server/services/session-service.test.ts`
- `src/server/services/student-paper-service.ts`
- `src/server/services/student-paper-service.test.ts`
- `src/server/services/practice-service.ts`
- `src/server/services/practice-service.test.ts`
- `src/server/services/organization-auth-service.ts`
- `src/server/services/organization-auth-service.test.ts`
- `src/server/services/redeem-code-authorization-service.ts`
- `src/server/services/redeem-code-authorization-service.test.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/services/admin-redeem-code-runtime.ts`
- `e2e/local-auth-route-guard.spec.ts`
- `e2e/staging-required-role-flows.spec.ts`
- `e2e/local-business-flow.spec.ts`
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `tests/unit/protected-route-guard-ui.test.ts`
- `tests/unit/phase-11-system-ops-organization-management-loop.test.ts`
- `tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts`
- `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts`

## Browser Operations

Browser verification path:

- Prior Browser plugin attempt in the admin task reached `http://127.0.0.1:3000/login` but could not reliably input login text because the virtual clipboard was unavailable, and could not set local session state from page evaluate.
- This task therefore used the repository Playwright e2e suite as the real-browser localhost fallback.

Playwright browser paths from `npm.cmd run test:e2e`:

| Role                 | Scenario                     | Route(s)                                                                                        | Expected                                                                                       | Actual                           |
| -------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------- |
| unauthenticated user | route guard                  | `/home`, `/ops/users`, `/content/questions`                                                     | Redirect to `/login`; no protected navigation or tablist visible.                              | Passed.                          |
| no-auth student      | no effective authorization   | `/login` -> `/home` -> `/redeem-code`                                                           | Home shows no effective authorization, no paper cards, and purchase/redeem guidance.           | Passed.                          |
| admin                | organization/redeem UI       | `/login` -> `/ops/users` -> `/ops/organizations`, `/ops/redeem-codes`                           | System-ops entry points and create/cancel/generate controls remain discoverable.               | Passed.                          |
| admin                | local business flow          | `/ops/organizations`, `/ops/redeem-codes`, related `/api/v1/organizations`, `/api/v1/employees` | Standard envelopes and public-id-only summaries for local system-ops reads.                    | Passed.                          |
| insufficient admin   | service-level role rejection | Unit-backed runtime checks for `content_admin` against system-ops mutations                     | Standard `Admin permission denied.` response and redaction-safe audit metadata where in scope. | Passed in unit/runtime coverage. |

No browser evidence records credentials, tokens, Authorization headers, raw prompts, raw answers, raw model responses, provider payloads, plaintext redeem codes, generated passwords, full papers, full教材, OCR text, or customer-like private data.

## Code Cross-Check Findings

- `ProtectedRouteGuard` reads `tiku.localSessionToken`, verifies `/api/v1/sessions`, and redirects missing or role-mismatched sessions to `/login`.
- `StudentAppLayout` wraps all student app pages with `requiredRole="student"`.
- `AdminDashboardLayout` wraps all admin app pages with `requiredRole="admin"`.
- `local-auth-route-guard.spec.ts` browser-verifies `/home`, `/ops/users`, and `/content/questions` only.
- Student no-auth acceptance verifies `/home` empty state, no paper cards, no token visible, and purchase guidance.
- Service/unit coverage verifies disabled-account login rejection, organization depth/cascade/overlap/cancel handling, redeem_code missing/used/expired handling, student paper unauthorized detail hiding, and practice authorization loss/expiry behavior.
- Admin role checks exist across system-ops, content, model_config, audit, and AI log services, with multiple unit tests asserting `Admin permission denied.` for wrong-role access.

## Gap List

| Gap id       | Type                        | Severity | Role                                               | Surface                                                                  | Evidence                                                                                                                                                                                                                                                                                                                                                                 | Repro Steps                                                                                                                             | Suggested Follow-up                                                                                                                                       |
| ------------ | --------------------------- | -------- | -------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-GAP-001 | 测试缺失                    | medium   | unauthenticated user                               | Browser route guard                                                      | `e2e/local-auth-route-guard.spec.ts` only exercises `/home`, `/ops/users`, and `/content/questions`, while protected route families also include `/practice`, `/mock-exam`, `/mistake-book`, `/exam-report`, `/ops/organizations`, `/ops/redeem-codes`, `/ops/resources`, `/ops/ai-audit-logs`, `/content/materials`, `/content/papers`, and `/content/knowledge-nodes`. | Run the e2e route-guard test and compare `protectedRoutes` with `StudentAppLayout` and `AdminDashboardLayout` route inventory.          | Add a focused browser route-guard matrix for every student/admin route family, preserving a small representative smoke set if total runtime is a concern. |
| AUTH-GAP-002 | 测试缺失 / 权限边界覆盖不足 | medium   | student without effective `authorization`          | `/practice`, `/mock-exam`, `/exam-report`, `/mistake-book`, student APIs | Role-based acceptance verifies the no-auth student `/home` empty state and redeem guidance, but does not direct-hit known practice/mock/report/mistake_book URLs or API denial paths with the no-auth student session. Service tests cover the denial behavior, so the missing layer is browser/API cross-check coverage.                                                | Use a no-auth student session, then directly visit or fetch student workflow routes/APIs with a known published paper public reference. | Add a no-auth student negative browser/API test that asserts standard envelopes, no metadata leakage, and no protected content render on direct hits.     |
| AUTH-GAP-003 | UI 缺失 / 文案不一致        | low      | ops_admin, super_admin, unauthenticated admin user | shared admin unauthorized state                                          | Shared `AdminUnauthorizedState` in `src/features/admin/content-admin-runtime.tsx` says "内容后台数据需要有效的管理员会话" and is imported by non-content admin surfaces. Ops surfaces have a separate local copy in `AdminOrgAuthRedeemPage`, so admin unauthorized copy is inconsistent by surface.                                                                     | Clear local session and inspect admin unauthorized states, or review imports of `AdminUnauthorizedState` outside pure content contexts. | Add a copy cleanup task to make unauthorized state text context-neutral or pass surface-specific labels through props.                                    |
| AUTH-GAP-004 | 测试缺失                    | medium   | insufficient-permission admin                      | Browser role denial for system/content/model surfaces                    | Unit/runtime tests cover wrong-role denials for `content_admin`, `ops_admin`, and `super_admin` combinations, but e2e browser coverage logs in with a full local admin and does not verify role-specific UI denial/guarding for a restricted admin profile.                                                                                                              | Run browser e2e with a restricted admin fixture, then visit system-ops, content, and model_config mutation surfaces.                    | Add role-specific browser fixtures and tests for content-only, ops-only, and super-admin-only surfaces.                                                   |

## Non-Gap Passed Checks

- Missing local session redirects protected representative routes to `/login`.
- Admin and student layouts use shared route guard by role.
- Disabled accounts are rejected before session creation.
- No-auth student home does not show authorized paper cards.
- Student paper detail hides missing and unauthorized access behind not-found style responses.
- Practice service terminates or denies access after authorization loss/expiry.
- Organization service covers disabled/cascade metadata, circular parent update rejection, overlapping org_auth rejection, and cancel transitions.
- Redeem_code service distinguishes missing, used, expired, and inconsistent rows.
- System-ops service tests verify content_admin denial on organization/org_auth/redeem workflows.

## Command Results

- `npm.cmd run test:e2e`
  - Result: pass.
  - Summary: 15 Playwright tests passed, including local auth route guards, role-based acceptance, system/content/oversight flows, and staging-required role flows.
- `npm.cmd run test:unit`
  - Result: pass.
  - Summary: 130 test files passed, 519 tests passed.
- `npm.cmd run build`
  - Result: pass.
  - Summary: Next.js production build compiled successfully. Build output named `.env.local` as an environment file but no environment value was read or recorded.
- `npm.cmd run lint`
  - Result: pass.
- `npm.cmd run typecheck`
  - Result: pass.
- `npm.cmd run format:check`
  - Result: pass.
  - Summary: all matched files use Prettier code style.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Result: pass inventory before commit.
  - Summary: script reported only this task's docs/state/evidence files as unstaged/untracked before commit.
- `git diff --check`
  - Result: pass.

## Runtime/UI/Test/Docs Touch Summary

- Runtime source touched: no.
- UI source touched: no.
- Tests touched: no.
- Docs/state/queue touched: yes.
- Dependency manifests or lockfiles touched: no.
- Database schema/migration touched: no.
- `.env.local` / `.env.example` read or touched: no.
- Staging/prod/cloud/provider/deploy touched: no.

## Post-Merge Master Verification

- Merge commit before amend: `0561c2e merge: add phase 12 auth organization boundary gap scan`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch origin/master`
  - Result: pass inventory.
  - Summary: master was ahead of origin/master by the feature commit and merge commit; changed files were limited to this task's docs/state/evidence/plan files.
- `git diff --check`
  - Result: pass.
- `npm.cmd run format:check`
  - Result: pass.

## Forbidden Scope Self-Check

- No dependency was added, removed, or upgraded.
- No package manifest or lockfile was modified.
- No `.env.local` or `.env.example` contents were read, changed, or copied.
- No staging, production, cloud, or real provider was contacted.
- No deployment or PR was created.
- No destructive data operation was executed.
- No raw prompt, raw answer, raw model response, raw provider payload, Authorization header, database URL, token, secret, plaintext redeem code, generated password, full paper, full教材, OCR full text, or private customer-like data is recorded in this evidence.

## 品味合规自检 Checklist

- [x] Scope stayed documentation/evidence-only; no auth or permission code was changed without a queue item.
- [x] Naming followed glossary terms: `student`, `admin`, `organization`, `employee`, `authorization`, `org_auth`, `redeem_code`, `practice`, `mock_exam`, `exam_report`, `mistake_book`.
- [x] API references use `/api/v1/` and public identifiers only.
- [x] No API JSON `snake_case` payload was introduced.
- [x] No empty string was introduced as a replacement for `null`.
- [x] No auto-increment database `id` was exposed in evidence or URLs.
- [x] No hardcoded UI color/spacing/runtime code was added.
- [x] No secret, token, raw prompt, raw answer, raw model output, provider payload, full paper, full教材, generated password, plaintext redeem_code, or environment value was recorded.
- [x] Gaps were recorded for follow-up instead of being fixed outside the claimed task.
