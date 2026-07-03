# Task Plan: employee-transfer-session-source-landing-2026-07-03

## Task

- Task id: `employee-transfer-session-source-landing-2026-07-03`
- Branch: `codex/employee-transfer-session-source-landing-2026-07-03`
- Package: source landing package 12 of 16
- Human approval: current user approved continuing the previously approved source landing goal serially with per-package validation, commit, fast-forward merge, push, and cleanup.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`

## Requirement Anchors

- `G04`: Employee transfer UI still displays `approval_required`; transfer should close as quota/session UX.
- `CT-REQ-013`: Platform reset password requires active-session revocation and one-time distribution wording.
- `CT-REQ-014`: Employee transfer blocks on insufficient target authorization quota, revokes sessions, preserves old-organization submitted training snapshot, and blocks in-progress old-organization training.
- `CT-REQ-043`: Employee lifecycle operations after import must explain authorization, training, session, and history effects before confirmation.
- `D05`: Employee import, password, scope, and transfer decisions.

## Source Inspection

- Existing operations UI has an employee transfer panel labelled `approval_required` and says transfer route/service/repository need approval.
- Existing employee unbind source already revokes sessions and refreshes authorization quota on unbind.
- Existing runtime user password reset path revokes sessions after a successful reset, while the local UI contract wording still says formal runtime must revoke sessions.

## Implementation Plan

1. Replace the `approval_required` transfer placeholder with an operations-facing transfer/session impact review panel.
2. Compute target-organization transfer review rows from already loaded organizations and organization authorizations without adding a mutation route.
3. Show quota-blocked target rows, session revocation, old-organization snapshot retention, and in-progress organization-training blocking copy.
4. Keep actual cross-organization employee mutation out of scope because atomic database transaction and organization-training continuation enforcement require a narrower backend packet.
5. Align the local user reset distribution copy with the current requirement: formal runtime revokes sessions, local contract only displays the one-time window.
6. Extend focused unit coverage for the transfer/session review and reset wording.

## Boundaries

- No schema, migration, dependency, Provider, env/secret, direct DB, dev server, browser, e2e, staging/prod, deploy, release-readiness, final Pass, or production-usability work.
- No employee transfer mutation route, no repository transfer implementation, no quota write-path change, and no organization-training answer mutation.
- Evidence remains redacted: no credentials, sessions, cookies, auth headers, env values, raw DB rows, PII, actual password values, plaintext `redeem_code`, Provider payloads, raw Prompt/full Prompt text, raw AI IO, raw employee answers, full content, screenshots, exports, traces, or raw DOM.

## Validation Plan

- `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId employee-transfer-session-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId employee-transfer-session-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId employee-transfer-session-source-landing-2026-07-03 -SkipRemoteAheadCheck`
