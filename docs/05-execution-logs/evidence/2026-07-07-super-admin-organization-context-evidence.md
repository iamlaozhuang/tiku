# 2026-07-07 Super Admin Organization Context Evidence

Task id: `super-admin-organization-context-2026-07-07`

Branch: `codex/super-admin-organization-context-2026-07-07`

Evidence status: pass.

## Scope

This evidence records Branch 7 source remediation for `super_admin` organization context handling.

Implemented behavior:

- `super_admin` with no selected organization context no longer sees `组织后台` as an ordinary workspace-switch link.
- The switcher now renders an explicit missing-context state and links to operations organization handling.
- Existing organization direct-route missing-context guard remains intact and still blocks page content.
- Organization admin standard/advanced route behavior remains unchanged.

No DB, account, fixture, Provider, env, dependency, package/lockfile, schema/migration/seed, screenshot, trace, raw DOM,
staging/prod/deploy, release readiness, production usability, final Pass, or Cost Calibration work was executed.

## Requirement Mapping Result

| Requirement / Baseline                     | Evidence                                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Branch 7 control-matrix row                | Work is limited to `AdminDashboardLayout` presentation, layout tests, branch task plan/evidence/audit, and state/queue.              |
| Batch 1 P1 super admin organization entry  | Missing organization context is explicit before organization business pages; ordinary switch link is removed when no context exists. |
| Batch 0 missing-context state template     | Copy states that the admin session is valid and that organization context is required; no login-like wording is used.                |
| ADR-007 / edition-aware authorization      | UI remains discovery only; no `effectiveEdition`, `org_auth`, role, or service authorization semantics changed.                      |
| Role Auth Training Ops D04/D06/D09         | `super_admin` keeps operations/content authority while organization workspace access remains context-gated.                          |
| Design board `super_admin__organization-*` | Branch cites the redacted board path and applies the organization-context direction without embedding screenshot pixels.             |

## Validation Results

| Command                                                                                                                                                                                                                                              | Status | Redacted summary                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- src/components/AdminDashboardLayout/AdminDashboardLayout.test.tsx` before implementation                                                                                                                                   | fail   | Expected red: 1 file, 1 failed test                                       |
| `npm.cmd run test:unit -- src/components/AdminDashboardLayout/AdminDashboardLayout.test.tsx` after implementation                                                                                                                                    | pass   | 1 file, 5 tests                                                           |
| `npm.cmd run test:unit -- src/components/AdminDashboardLayout/AdminDashboardLayout.test.tsx tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/admin-shell-common-interaction.test.ts tests/unit/admin-common-ux-state-audit.test.ts` | pass   | 4 files, 19 tests                                                         |
| `npm.cmd run lint`                                                                                                                                                                                                                                   | pass   | ESLint completed                                                          |
| `npm.cmd run typecheck`                                                                                                                                                                                                                              | pass   | `tsc --noEmit` completed                                                  |
| `npm.cmd run test:unit`                                                                                                                                                                                                                              | pass   | 343 files, 1730 tests                                                     |
| `npx.cmd prettier --check ...`                                                                                                                                                                                                                       | pass   | All touched files formatted                                               |
| `git diff --check`                                                                                                                                                                                                                                   | pass   | No whitespace errors                                                      |
| `git diff --name-only` plus `git status --short`                                                                                                                                                                                                     | pass   | Only allowed branch files changed                                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`                                                                                                                              | pass   | Task-scoped scope, SSOT, sensitive evidence, and terminology gates passed |
| `git switch master` plus `git merge --ff-only codex/super-admin-organization-context-2026-07-07`                                                                                                                                                     | pass   | Feature branch fast-forwarded into `master`                               |
| `npm.cmd run lint` on `master` after merge                                                                                                                                                                                                           | pass   | ESLint completed                                                          |
| `npm.cmd run typecheck` on `master` after merge                                                                                                                                                                                                      | pass   | `tsc --noEmit` completed                                                  |
| `npm.cmd run test:unit` on `master` after merge                                                                                                                                                                                                      | pass   | 343 files, 1730 tests                                                     |
| First `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1` after merge                                                                                                              | fail   | Expected closeout checkpoint drift only; no code or test failure          |
| Repository checkpoint update in `project-state.yaml`                                                                                                                                                                                                 | pass   | `lastKnownMasterSha` and `lastKnownOriginMasterSha` refreshed             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1` after checkpoint update                                                                                                        | pass   | Pre-push readiness passed                                                 |

## Changed Files

- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.test.tsx`
- `docs/05-execution-logs/task-plans/2026-07-07-super-admin-organization-context.md`
- `docs/05-execution-logs/evidence/2026-07-07-super-admin-organization-context-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-07-super-admin-organization-context-adversarial-audit.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Redaction And Safety

- No credentials, sessions, cookies, tokens, env values, DB URLs, raw DB rows, internal ids, Provider payloads, raw prompts,
  raw AI output, plaintext `redeem_code`, private fixture values, full question/paper/material/resource content,
  screenshot pixels, traces, or raw DOM were recorded.
- No database read/write, schema/migration/seed, Provider execution/configuration, dependency, env, staging/prod/deploy,
  or Cost Calibration action was executed.
- This evidence does not claim release readiness, production usability, final Pass, runtime browser acceptance, or
  Provider readiness.

Cost Calibration Gate remains blocked.
