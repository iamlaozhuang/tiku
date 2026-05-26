# Phase 12 Admin Experience Gap Scan Evidence

**Task id:** `phase-12-admin-experience-gap-scan`

**Branch:** `codex/phase-12-admin-experience-gap-scan`

**Date:** 2026-05-26

## Scope

This task executed the admin content and system-operations slice from the Phase 12 multi-role experience scripts with code inspection plus localhost browser validation. It records gaps only and does not change runtime/UI/test code.

## Files Checked

Standards, requirements, contracts, state, queue, and prior plans:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-auth-and-session-boundary.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-local-dev-runtime-and-data-safety.md`
- `docs/02-architecture/adr/adr-005-ai-provider-model-config-and-secret-boundary.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-11-role-based-full-flow-acceptance-contract.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-role-scenario-script-plan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-role-scenario-script-plan.md`

Admin implementation and tests:

- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`
- `src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx`
- `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `src/features/admin/content-admin-runtime.tsx`
- `src/app/(admin)/content/questions/page.tsx`
- `src/app/(admin)/content/materials/page.tsx`
- `src/app/(admin)/content/papers/page.tsx`
- `src/app/(admin)/content/knowledge-nodes/page.tsx`
- `src/app/(admin)/ops/users/page.tsx`
- `src/app/(admin)/ops/organizations/page.tsx`
- `src/app/(admin)/ops/redeem-codes/page.tsx`
- `src/app/(admin)/ops/resources/page.tsx`
- `src/app/(admin)/ops/ai-audit-logs/page.tsx`
- `e2e/content-action-closures.spec.ts`
- `e2e/staging-required-role-flows.spec.ts`
- `e2e/admin-audit-navigation.spec.ts`
- `e2e/local-business-flow.spec.ts`
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `tests/unit/phase-9-content-question-material-runtime.test.ts`
- `tests/unit/phase-9-paper-composition-lifecycle-runtime.test.ts`
- `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`
- `tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts`
- `tests/unit/phase-8-admin-redeem-code-runtime.test.ts`

## Browser Operations

Local dev server:

- Started `npm.cmd run dev -- --hostname 127.0.0.1`.
- Local URL observed: `http://127.0.0.1:3000`.
- Dev server output named `.env.local` as a loaded environment file but no environment values were read or recorded.

Browser plugin attempt:

- Browser opened `http://127.0.0.1:3000/login` and verified page identity/title/snapshot.
- Browser plugin was blocked for this authenticated admin flow because text input failed with the virtual clipboard unavailable, and page evaluate context did not allow writing the local session state.
- Fallback used the repository Playwright e2e browser suite, which exercises real Chromium against localhost.

Playwright browser paths from `npm.cmd run test:e2e`:

| Role                 | Scenario                | Route(s)                                                      | Expected                                                                          | Actual  |
| -------------------- | ----------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------- |
| admin                | audit navigation        | `/login` -> `/ops/users` -> `/ops/ai-audit-logs`              | Admin shell can navigate to AI/audit logs, not stale `/ops/audit-logs`.           | Passed. |
| content admin        | content action closures | `/content/questions`, `/content/materials`, `/content/papers` | Question/material/paper pages render, write entries are wired or visibly guarded. | Passed. |
| unauthenticated user | admin route guard       | `/ops/users`, `/content/questions`                            | Protected admin routes redirect to `/login`.                                      | Passed. |
| admin                | local business flow     | admin users/questions/papers/model/audit reads                | Admin runtime reads and redaction assertions pass.                                | Passed. |
| admin                | role-based acceptance   | system ops, content ops, oversight                            | Required admin readiness paths are discoverable and route-protected.              | Passed. |
| system ops           | required role flow      | `/ops/redeem-codes`, `/ops/organizations`                     | Redeem_code and org_auth required validation entry points remain discoverable.    | Passed. |

No browser evidence records credentials, tokens, raw prompts, raw answers, raw model responses, provider payloads, plaintext redeem codes, generated passwords, full papers, full教材, OCR text, or customer-like private data.

## Code Cross-Check Findings

- Content question/material runtime UI loads protected DTOs, shows filtering, list states, action messages, and guarded edit/copy/disable behaviors.
- Paper management has a real new-draft form and row-level lifecycle paths; top-level composition/publish/archive/copy/asset actions are disabled until row context exists.
- Knowledge-node and resource pages route to dedicated management components.
- Organization and redeem_code pages route to `AdminOrgAuthRedeemPage` split views.
- Redeem_code list exposes masked display and an explicit "plain text unavailable" notice for existing codes; generation confirmation warns that plaintext is one-response-only and must not be recorded.
- Existing e2e and unit suites cover protected admin routes, content action closures, org/redeem required paths, reset password, redacted audit/AI logs, and public-id-only DTO expectations.

## Gap List

| Gap id      | Type                                  | Severity | Role                     | Surface                                                         | Evidence                                                                                                                                                                                                                                                                                                                                       | Repro Steps                                                                                                                                                 | Suggested Follow-up                                                                                                                               |
| ----------- | ------------------------------------- | -------- | ------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| ADM-GAP-001 | UI 缺失 / 文档滞后                    | medium   | content_admin, ops_admin | `/content/questions`, `/ops/organizations`, `/ops/redeem-codes` | Visible production/local admin pages still render "内容运营 staging 必验" and "系统运营 staging 必验" copy. Code references: `src/features/admin/content-admin-runtime.tsx:248`, `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx:381`.                                                                                          | Login as admin and visit `/content/questions`, `/ops/organizations`, or `/ops/redeem-codes`; observe staging-only validation language in primary UI.        | Add a UI copy cleanup task to replace staging-only wording with production-facing readiness/status copy while preserving test ids where useful.   |
| ADM-GAP-002 | UI 缺失 / workflow ambiguity          | low      | ops_admin                | `/ops/organizations`, `/ops/redeem-codes`                       | Required-role entry links for `新增企业授权` and `生成卡密` both point to `/ops/users`, while the same pages also contain inline action panels. Code references: `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx:1180`, `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx:1347`.                                   | Login as admin, visit `/ops/organizations` or `/ops/redeem-codes`, compare the prominent entry link target with the inline create/generate controls.        | Add a system-ops UX follow-up to make the primary CTA target the actual inline form/section or remove the cross-page detour.                      |
| ADM-GAP-003 | UI 缺失 / content workflow incomplete | medium   | content_admin            | `/content/questions`, `/content/materials`                      | Image insertion controls append `local-image-placeholder` rather than binding a managed `paper_asset` or resource upload. Code references: `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx:1431`, `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx:1727`. | Login as content admin, open question/material form, use "插入图片占位"; saved rich text gets a placeholder rather than a managed uploaded asset reference. | Add a content media attachment task to connect image insertion to the existing asset/resource boundary, with redaction-safe object path handling. |
| ADM-GAP-004 | UI 缺失 / workflow ambiguity          | low      | content_admin            | `/content/papers`                                               | Top-level paper actions `组卷` / `发布` / `下架` / `复制` / `绑定原始文件` are disabled with text telling users to use row-level operations, while the controls remain visually prominent. Code reference: `src/features/admin/paper-management/AdminPaperManagementClient.tsx:922`.                                                           | Login as admin and visit `/content/papers`; inspect top action bar before selecting or interacting with rows.                                               | Consider replacing disabled top-level actions with contextual row actions only, or add a clear selected-paper state to activate the toolbar.      |

## Non-Gap Passed Checks

- Admin login and redirect to `/ops/users` passed through existing Playwright e2e.
- Protected `/ops/users` and `/content/questions` redirect to `/login` when no local session exists.
- `/content/questions`, `/content/materials`, and `/content/papers` render and expose guarded action states.
- `/ops/organizations` and `/ops/redeem-codes` expose required validation entry points.
- `/ops/ai-audit-logs` is reachable from admin shell.
- Existing tests assert visible UI does not expose session tokens and runtime DTOs avoid internal numeric ids.

## Command Results

- `npm.cmd run test:e2e`
  - Result: pass.
  - Summary: 15 Playwright tests passed, including admin audit navigation, content action closures, local auth route guards, local business flow, role-based acceptance system/content/oversight flows, and staging-required role flows.
- `npm.cmd run test:unit`
  - Result: pass.
  - Summary: 130 test files passed, 519 tests passed.
- `npm.cmd run build`
  - Result: pass.
  - Summary: Next.js production build compiled successfully, TypeScript completed, and 50 static pages were generated. Build output named `.env.local` as an environment file but no environment value was read or recorded.
- `npm.cmd run lint`
  - Result: pass.
- `npm.cmd run typecheck`
  - Result: pass.
- `npm.cmd run format:check`
  - First result: failed because this new evidence file needed Prettier formatting.
  - Targeted Prettier write was run only on this task's docs/state files.
  - Rerun result: pass; all matched files use Prettier code style.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - Result: pass.
  - Summary: banned business terms absent, risky generic terms absent, API route folders kebab-case/public-id safe, DTO fields camelCase.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Result: pass inventory.
  - Summary: script reported the current docs/state/evidence files as unstaged/untracked before commit.
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

## Forbidden Scope Self-Check

- No dependency was added, removed, or upgraded.
- No package manifest or lockfile was modified.
- No `.env.local` or `.env.example` contents were read, changed, or copied.
- No staging, production, cloud, or real provider was contacted.
- No deployment or PR was created.
- No destructive data operation was executed.
- No raw prompt, raw answer, raw model response, raw provider payload, Authorization header, database URL, token, secret, plaintext redeem code, generated password, full paper, full教材, OCR full text, or private customer-like data is recorded in this evidence.

## 品味合规自检 Checklist

- [x] Scope stayed documentation/evidence-only; no business code was changed without a queue item.
- [x] Naming followed glossary terms: `admin`, `organization`, `employee`, `org_auth`, `redeem_code`, `paper`, `question`, `material`, `knowledge_node`, `audit_log`, `ai_call_log`.
- [x] API references use `/api/v1/` and public identifiers only.
- [x] No API JSON `snake_case` payload was introduced.
- [x] No empty string was introduced as a replacement for `null`.
- [x] No auto-increment database `id` was exposed in evidence or URLs.
- [x] No hardcoded UI color/spacing/runtime code was added.
- [x] No secret, token, raw prompt, raw answer, raw model output, provider payload, full paper, full教材, generated password, plaintext redeem_code, or environment value was recorded.
- [x] Gaps were recorded for follow-up instead of being fixed outside the claimed task.
