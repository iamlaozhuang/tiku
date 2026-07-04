# 2026-07-04 Full-chain Scenario 4 Org Admin Create Bind Flow Repair Evidence

## Scope

- Result: pass
- Task id: `full-chain-scenario-4-org-admin-create-bind-flow-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-4-org-admin-create-bind-flow-repair-2026-07-04`
- Approval boundary: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`
- Source blocked task: `full-chain-scenario-4-standard-org-package-rerun-after-employee-input-provisioning-2026-07-04`
- Scenario selector label: `fc_scenario_4_standard_org_package`
- Route label: `/api/v1/admin-accounts`
- UI surface label: `/ops/users`
- Target role labels: `org_standard_admin`, `org_advanced_admin`
- Binding table label: `admin_organization`
- Batch range: single repair task for Scenario 4 source/test blocker.
- localFullLoopGate: source/test repair only; localhost browser, dev server, e2e, and DB runtime rerun remain delegated
  to the next Scenario 4 runtime task.
- nextModuleRunCandidate:
  `full-chain-scenario-4-standard-org-package-rerun-after-org-admin-create-bind-flow-repair-2026-07-04`
- Thread Rollover: recover from project state, task queue, this evidence, this audit, and the task plan; do not rely on
  chat memory.
- Cost Calibration Gate remains blocked.

## Read Gate

- Read gate completed against the task plan SSOT list: governance, code taste, ADR-001 through ADR-007, project state,
  task queue, standard and advanced requirements, edition-aware authorization requirements, admin-ops requirements,
  2026-07-02 role/auth/UX reconciliation traceability, Scenario 4 blocked evidence/audit, schema, target source, and
  focused tests.
- No document conflict required user decision.

## Root Cause

- Existing admin-account route and UI supported only platform admin roles.
- Organization-admin roles were present in role labels and schema but not accepted by the creation validator.
- The route permission check rejected `ops_admin` before target-role-aware validation.
- Repository account creation did not verify a target active organization or create an `admin_organization` binding.

## Repair Summary

| Area       | Result |
| ---------- | ------ |
| Contract   | pass   |
| Validator  | pass   |
| Service    | pass   |
| Repository | pass   |
| UI         | pass   |
| Tests      | pass   |

The repair keeps platform admin creation under `super_admin`, permits `ops_admin` only for organization-admin creation,
requires an organization binding for organization-admin roles, rejects content-admin creation attempts, and returns a
redacted not-found response when the target organization is unavailable.

## Validation

| Command                                                                                                                                                                                            | Result |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| RED: `npm.cmd run test:unit -- tests/unit/full-chain-scenario-1-admin-account-creation-flow-repair.test.ts` before repair                                                                          | fail   |
| GREEN: `npm.cmd run test:unit -- tests/unit/full-chain-scenario-1-admin-account-creation-flow-repair.test.ts` after repair                                                                         | pass   |
| `npm.cmd run test:unit -- tests/unit/full-chain-scenario-1-admin-account-creation-flow-repair.test.ts` before repair                                                                               | fail   |
| `npm.cmd run test:unit -- tests/unit/full-chain-scenario-1-admin-account-creation-flow-repair.test.ts` after repair                                                                                | pass   |
| `npm.cmd run test:unit -- tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`                                                                                                              | pass   |
| `npm.cmd run typecheck`                                                                                                                                                                            | pass   |
| `npm.cmd exec -- prettier --write --ignore-unknown <scoped files>`                                                                                                                                 | pass   |
| `npm.cmd exec -- prettier --check --ignore-unknown <scoped files>`                                                                                                                                 | pass   |
| `git diff --check`                                                                                                                                                                                 | pass   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-4-org-admin-create-bind-flow-repair-2026-07-04` | pass   |

## Boundary Confirmation

- Browser/e2e/dev server: not executed.
- Direct DB connection/read/write: not executed.
- Schema/migration/seed/dependency/package/lockfile: not changed.
- Provider/staging/prod/Cost Calibration: not executed.
- Release readiness/final Pass/production usability: not claimed.
- Provider, staging, production, deployment, payment, external-service, release readiness, final Pass, production
  usability, and Cost Calibration remain blocked.
- Evidence redaction: pass.

## Evidence Redaction Confirmation

No credential, password, phone number, email address, connection string, token, session, cookie, `localStorage`,
Authorization header, raw DB row, internal id, screenshot, raw DOM, trace, Provider payload, raw Prompt, raw AI I/O,
full material/question/paper content, plaintext card value, or private fixture content is recorded here.
