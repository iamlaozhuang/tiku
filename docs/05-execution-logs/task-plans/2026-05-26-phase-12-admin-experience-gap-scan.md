# Phase 12 Admin Experience Gap Scan

**Task id:** `phase-12-admin-experience-gap-scan`

**Branch:** `codex/phase-12-admin-experience-gap-scan`

**Goal:** Execute the admin content and system-ops slice from the Phase 12 role-scenario scripts with localhost browser validation plus code cross-checks. Record gaps only; do not change runtime, UI, tests, dependencies, schema, migrations, package manifests, lockfiles, or environment files.

## Read Standards

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

## allowedFiles

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

## blockedFiles

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Role And Scenario Scope

Primary roles:

- `content_admin` / `super_admin` content management view.
- `ops_admin` / `super_admin` system operations view.

Covered scripts from the prior plan:

- S4 Admin Content Management Flow.
- S5 Admin Operations, Organization, Employee, And Authorization Flow, limited to visible admin surfaces and existing e2e coverage.
- S6 only for navigation to `/ops/ai-audit-logs`; AI redaction deep scan remains deferred to `phase-12-ai-redaction-runtime-gap-scan`.

Deferred:

- cross-role permission denial and no-session API tampering: `phase-12-auth-organization-boundary-gap-scan`
- AI/model_config/prompt_template redaction deep scan: `phase-12-ai-redaction-runtime-gap-scan`

## Experience Script Design

### Content Operations

Preconditions:

- Use local seeded or test-created admin credentials without recording credential values.
- Local dev server runs on `http://127.0.0.1:3000`.

Steps:

1. Login through `/login`.
2. Visit `/content/questions`.
3. Confirm question/material management heading, filters, new question entry, runtime-ready marker, editable row, locked edit explanation where present.
4. Visit `/content/materials`.
5. Confirm new material entry and runtime-ready marker.
6. Visit `/content/papers`.
7. Confirm new draft entry, top-level guarded actions, and paper action unavailable explanation.
8. Cross-check `/content/knowledge-nodes` implementation and route ownership.

Expected results:

- Content routes require admin session.
- Public identifiers only, no internal auto-increment ids.
- Write actions are either actionable or visibly guarded with a reason and next step.
- Loading/empty/error states are explicit.

### System Operations

Preconditions:

- Admin session is available.
- Local system ops data exists from seeded or previous local acceptance flow.

Steps:

1. Visit `/ops/users`.
2. Confirm user list/filter/action surface and reset-password entry points.
3. Visit `/ops/organizations`.
4. Confirm organization, org_auth, employee summaries, create/cancel action panels, and required-role entry.
5. Visit `/ops/redeem-codes`.
6. Confirm redeem_code filters, generation confirmation boundary, masked/plaintext notice, and purchase guidance.
7. Visit `/ops/resources`.
8. Confirm resource upload/filter/status surface is present.
9. Visit `/ops/ai-audit-logs` only for admin navigation availability; AI redaction details are deferred.

Expected results:

- Ops routes require admin session.
- User/org/redeem/resource surfaces render without framework overlay.
- Sensitive data remains masked in visible UI.
- Generated redeem_code plaintext is not recorded.

## Browser Verification Plan

- First attempt Codex Browser against localhost.
- If Browser cannot type into login or set session state, record the Browser-path blocker and use repository Playwright e2e as real-browser fallback.
- Run `npm.cmd run test:e2e` to exercise existing admin browser flows.
- Evidence records route names, UI labels, booleans, and public identifiers only; no credentials, tokens, generated codes, raw prompts, raw answers, raw model responses, or provider payloads.

## Code Cross-Check Paths

- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`
- `src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx`
- `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `src/features/admin/content-admin-runtime.tsx`
- `src/app/(admin)/content/**`
- `src/app/(admin)/ops/**`
- `src/app/api/v1/questions/**`
- `src/app/api/v1/materials/**`
- `src/app/api/v1/papers/**`
- `src/app/api/v1/knowledge-nodes/**`
- `src/app/api/v1/users/**`
- `src/app/api/v1/organizations/**`
- `src/app/api/v1/org-auths/**`
- `src/app/api/v1/redeem-codes/**`
- `src/app/api/v1/resources/**`
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

## Risk Defense

- Documentation/evidence-only change.
- No dependency, package, lockfile, schema, migration, script, or business-code edit.
- No environment file read or edit.
- No staging, production, cloud, real provider, or deployment access.
- No generated redeem_code plaintext or generated password recorded.
- Any business-code gap is recorded as a follow-up candidate instead of being fixed in this task.

## Verification Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run format:check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

Do not record secrets, tokens, Authorization headers, database URLs, real customer data, raw provider payloads, raw prompts, raw answers, raw model responses, full教材, full paper/OCR text, plaintext redeem codes, generated passwords, or `.env.local` / `.env.example` contents.
