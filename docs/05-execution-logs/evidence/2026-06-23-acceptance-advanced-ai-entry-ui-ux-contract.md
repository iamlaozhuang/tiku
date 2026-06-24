# Evidence: Advanced AI Entry UI/UX Contract

## Metadata

- Task id: `acceptance-advanced-ai-entry-ui-ux-contract-2026-06-23`
- Branch: `codex/advanced-ai-entry-ui-ux-contract-20260623`
- Baseline commit: `6897ee2d4be167298e50dfab761041a04d368d49`
- Evidence mode: docs/static evidence only.

## Scope Boundary

This task did not change source code, tests, fixtures, e2e specs, schema, migrations, package files, lockfiles, env files, secrets, Provider settings, database state, staging/prod/cloud resources, payment/external services, PRs, or force-push state.

No browser runtime, Playwright runtime, dev server start, database seed/write, Provider/model call, Cost Calibration, or final acceptance Pass was executed.

This task does not close Standard MVP or Advanced MVP acceptance. It prepares one acceptance contract for review; the
overall acceptance remains open.

## Closeout Evidence

- 2026-06-24: Owner asked Codex to handle remaining unprocessed branches and keep the repository clean.
- Closeout scope: docs-only contract artifact commit, merge to `master`, push to `origin/master`, and local branch/worktree cleanup.
- This closeout does not mark advanced AI entries as runtime Pass and does not mark Standard MVP or Advanced MVP as final Pass.

## Product Design Context

Product Design context discovery was performed because the user explicitly requested UI/UX skill usage for this workstream.

- Used `product-design:index`.
- Used `product-design:get-context`.
- Read Product Design critical overrides.
- Ran Product Design user-context preflight.
- Result: no saved Product Design user context exists, so the contract is grounded in project docs and current codebase navigation patterns.

## Sources Read

| Source                                                                                       | Purpose                                                                                      |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `docs/03-standards/code-taste-ten-commandments.md`                                           | Required code taste standard.                                                                |
| `docs/02-architecture/adr/**`                                                                | Required architecture decision context.                                                      |
| `docs/03-standards/ui-code.md`                                                               | UI code standards: learner Mobile-first, backend Desktop-first, token-driven UI.             |
| `docs/02-architecture/system-design/frontend/01-style-tone.md`                               | Existing design tone and visual direction.                                                   |
| `docs/02-architecture/system-design/frontend/03-component-inventory.md`                      | Existing layout and component inventory.                                                     |
| `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md` | Confirmed advanced AI scope and pending UI/UX entry decision.                                |
| `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md` | Content admin AI generation draft/review boundary.                                           |
| `docs/01-requirements/traceability/capability-catalog.md`                                    | Capability rows for personal, employee, organization admin, and content admin AI generation. |
| `docs/01-requirements/use-cases/use-case-catalog.md`                                         | Use-case rows for advanced AI generation and standard non-goal.                              |
| `src/components/StudentAppLayout/StudentAppLayout.tsx`                                       | Learner bottom navigation.                                                                   |
| `src/features/student/home/StudentHomePage.tsx`                                              | Learner home entry scan.                                                                     |
| `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`                     | Existing personal AI page scan.                                                              |
| `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`             | Organization employee training route scan.                                                   |
| `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`                               | Backend sidebar and top bar scan.                                                            |
| `src/server/contracts/user-auth/session-boundary.ts`                                         | Post-login redirect contract.                                                                |
| Relevant unit tests under `tests/unit/**`                                                    | Existing test coverage boundary.                                                             |

## Static Findings

| Finding                                                      | Evidence                                                                                       | Result                                                                         |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Learner AI page exists.                                      | `src/app/(student)/ai-generation/page.tsx` imports `StudentPersonalAiGenerationPage`.          | Route exists; entry is still not accepted without visible navigation.          |
| Learner home lacks obvious AI entry.                         | Static scan of `StudentHomePage` and tests found learner home actions, but not `AI训练`.       | Personal/employee advanced AI entry remains a UX gap.                          |
| Learner bottom nav lacks AI tab.                             | `StudentAppLayout` tab list contains home, mistake book, and profile.                          | Persistent AI entry is absent.                                                 |
| Existing AI page is not product-clear AI出题/AI组卷.         | `StudentPersonalAiGenerationPage` uses local request wording and personal generation contract. | Needs product-facing `AI出题` and `AI组卷` actions in future implementation.   |
| Organization training route exists.                          | `StudentOrganizationTrainingPage` and tests cover direct route behavior.                       | Direct route does not prove discoverable learner entry.                        |
| Organization admin portal exists but is not primary landing. | `AdminOrganizationPortalPage` links to organization training and analytics.                    | Useful shell exists, but role landing and sidebar discoverability remain gaps. |
| Content sidebar lacks AI generation.                         | `AdminDashboardLayout` content menu contains paper, question, material, and knowledge nodes.   | Content admin AI generation entry remains missing.                             |
| Ops sidebar has AI audit logs only.                          | `AdminDashboardLayout` ops menu includes `/ops/ai-audit-logs`.                                 | Audit/log visibility is not AI generation capability.                          |
| Admin login redirects all admin-like accounts to ops.        | `createPostLoginSessionBoundary` returns `/ops/users` for any admin user.                      | Content admin and organization admin landing is wrong for acceptance.          |
| Backend shell has no logout.                                 | `AdminDashboardLayout` top bar only shows portal name.                                         | Backend logout remains missing.                                                |
| Learner logout exists in profile.                            | `StudentProfileRedeemPage` contains `退出登录`.                                                | Does not cover backend logout.                                                 |

## Commands And Results

- `git rev-parse HEAD`: confirmed baseline commit `6897ee2d4be167298e50dfab761041a04d368d49`.
- `git status --short --branch`: confirmed the branch was clean before this task's edits.
- `rg` for `AI训练`, `AI出题`, and `AI组卷`: confirmed the prior requirement clarification and scope records contain the advanced AI entry decision anchors.
- `rg` for AI generation, organization training, admin layout, logout, and related route terms: confirmed existing routes and missing/partial navigation surfaces.
- `Get-Content src/server/contracts/user-auth/session-boundary.ts`: confirmed admin-like users are redirected to `/ops/users`.
- `Get-Content src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`: confirmed content/ops menus and lack of backend logout.

## Validation

Post-closeout validation is rerun before commit, merge, and push. The closeout validation remains docs/static only.

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Result                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `npx.cmd --no-install prettier --check --ignore-unknown docs/05-execution-logs/acceptance/2026-06-23-advanced-ai-entry-ui-ux-contract.md docs/05-execution-logs/task-plans/2026-06-23-acceptance-advanced-ai-entry-ui-ux-contract.md docs/05-execution-logs/evidence/2026-06-23-acceptance-advanced-ai-entry-ui-ux-contract.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-advanced-ai-entry-ui-ux-contract.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml` | Pass after formatting the Markdown evidence files. |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Pass.                                              |
| `rg -n "AI训练\|AI出题\|AI组卷\|企业训练\|/ops/users\|退出登录" docs/05-execution-logs/acceptance/2026-06-23-advanced-ai-entry-ui-ux-contract.md docs/05-execution-logs/evidence/2026-06-23-acceptance-advanced-ai-entry-ui-ux-contract.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-advanced-ai-entry-ui-ux-contract.md`                                                                                                                                                                              | Pass; key contract anchors are present.            |
