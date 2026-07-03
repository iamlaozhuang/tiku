# 2026-07-03 Organization Workspace Role Boundary Source Landing Evidence

## Task

`organization-workspace-role-boundary-source-landing-2026-07-03`

## Scope Evidence

result: pass

- Branch: `codex/organization-workspace-role-boundary-source-landing-2026-07-03`
- Base commit: `64bd783d590522b4e41fe57c8dbb11c4896f2ac7`
- Commit: `64bd783d590522b4e41fe57c8dbb11c4896f2ac7` is the pre-package-8 `master` and `origin/master` baseline; the implementation commit is pending local git commit after validation closeout.
- Evidence mode: redacted file paths, command results, role names, route names, and requirement/source alignment summaries only.
- Forbidden evidence: credentials, sessions, cookies, auth headers, env values, raw DB rows, PII, plaintext `redeem_code`, Provider payloads, raw Prompt/full Prompt text, raw AI IO, raw employee answers, full question/paper/material/resource/chunk content, screenshots, exports, traces, raw DOM, or private fixture material.

Cost Calibration Gate remains blocked.
threadRolloverGate: continue the approved sixteen-package source landing goal package by package; stop only on validation failure or explicit user redirection.
automationHandoffPolicy: no automation handoff; continue manually from committed source, docs, state, queue, and package-specific evidence.
nextModuleRunCandidate: `organization-tree-ops-workbench-source-landing-2026-07-03` after package 8 closeout.
Batch range: source landing package 8 of 16, organization workspace role boundary.
RED: accepted requirements require `org_standard_admin` to remain read-only/status-only and require advanced organization surfaces to be guarded by role plus organization `org_auth` capability; existing UI helper trusted the advanced capability flag without rechecking role.
GREEN: package-8 source implementation makes advanced organization capability role-aware, clarifies standard organization workspace read-only/status copy, fixes organization AI direct-route permission-denial mapping, and covers the guard/layout/portal behavior with focused tests.
localFullLoopGate: remains blocked for browser/dev-server/e2e, direct DB, Provider, schema/migration, dependency, staging/prod, deploy, release-readiness, final Pass, and production-usability work.
blocked remainder: real browser acceptance, direct database-backed organization authorization checks, schema/migration work, deployment, Cost Calibration, release readiness, final Pass, and production usability remain blocked.

## Requirement Alignment

- `org_standard_admin` may view organization-scoped employee roster/status and authorization/status only.
- `org_advanced_admin` may access enterprise training, analytics, and organization AI surfaces when advanced organization `org_auth` capability is service-computed.
- Hiding menus is not enough; direct route access must still deny or show standard-unavailable states.
- Organization backend must not expose global operations, global content authoring, Provider, prompt, raw employee answer, raw AI output, or export surfaces.

## Implementation Evidence

- `canUseOrganizationAdvancedWorkspaceCapability` now requires an advanced organization-capable role plus service-computed advanced `org_auth` capability, organization context, and advanced edition.
- `createOrganizationTrainingCapabilityContext` now rejects malformed standard-role capability summaries even if their advanced capability flag is true.
- Organization AI entry pages now map organization workspace role mismatch to a permission-denied state instead of a login-required state when an admin session exists.
- Organization portal copy now uses "员工名单与状态" and states that employee add/import/transfer/unbind and authorization changes remain platform operations work.
- Organization layout standard-version copy now states that standard organization admins can view employee roster/status and authorization status only.
- Focused tests cover malformed standard-role advanced flags, direct advanced-route denial, layout menu hiding, portal copy, and permission-denied organization AI direct-route behavior.

## Validation Results

PASS. `npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts`
reported 4 files and 29 tests passed after the organization AI permission-denial mapping fix.

PASS. `npm.cmd run typecheck` completed with `tsc --noEmit`.

PASS. `npm.cmd run lint` completed with no reported problems.

PASS. `npm.cmd run format:check` reported all matched files use Prettier style.

PASS. `git diff --check` completed with no whitespace errors.

## Module Run v2 Validation Commands

PASS. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-role-boundary-source-landing-2026-07-03`
completed with `pre-commit hardening passed`.

PASS_AFTER_EXPECTED_FIRST_BLOCK. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-workspace-role-boundary-source-landing-2026-07-03`
first hard-blocked on missing Module Run v2 command anchors, then passed after the evidence anchor update.

PASS. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-workspace-role-boundary-source-landing-2026-07-03 -SkipRemoteAheadCheck`
completed with `pre-push readiness passed`.

## Review Notes

- Pass 1 review: no schema, migration, dependency, Provider, env secret, direct DB, browser/dev-server/e2e, staging/prod, deploy, PR, force push, Cost Calibration, release-readiness, final Pass, or production-readiness work was introduced.
- Pass 1 review: found that organization AI direct-route denial rendered as login-required for an existing ops admin session; fixed by mapping organization workspace denial to permission-denied in the organization AI entry page.
- Pass 1 review: found helper-level trust in `canUseOrganizationAdvancedWorkspace` without role recheck; fixed by requiring `org_advanced_admin` or `super_admin` in the access helper.
- Pass 2 review: file scope matches the package materialization after adding the organization AI entry page to allowed files.
- Pass 2 review: sensitive scan hits are limited to forbidden-evidence policy text, redacted route/source terms, and existing unit fixture token labels; this evidence does not record credentials, sessions, env values, raw DB rows, plaintext `redeem_code`, Provider payloads, raw Prompt, raw AI IO, screenshots, traces, or raw DOM.

## Git Closeout

pending_commit_merge_push_cleanup

## Non-Claims

- No schema/migration/dependency/Provider/database/browser/deploy work is claimed.
- No release readiness, final Pass, or production usability is claimed.
