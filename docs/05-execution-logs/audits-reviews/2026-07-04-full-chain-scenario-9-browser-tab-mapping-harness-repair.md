# 2026-07-04 Full-Chain Scenario 9 Browser Tab Mapping Harness Repair Audit

Status: closed

## Scope

- Task id: `full-chain-scenario-9-browser-tab-mapping-harness-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-9-browser-tab-mapping-harness-repair-2026-07-04`
- Scope reviewed: local browser acceptance harness control path after stale in-app browser tab mapping.

## Adversarial Checks

| Check                                             | Result | Evidence                                                                    |
| ------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| Product source unchanged                          | pass   | Final blocked path diff has no `src/**`, `tests/**`, or `e2e/**` output.    |
| Auth, authorization, and redeem runtime unchanged | pass   | No product source path changed.                                             |
| Dependency and lockfile unchanged                 | pass   | No package or lockfile path changed.                                        |
| Schema, seed, and fixture unchanged               | pass   | No schema, migration, seed, script, or fixture path changed.                |
| No Provider/staging/prod/Cost work                | pass   | Harness probe only; no Provider, staging/prod, or Cost action.              |
| Redaction preserved                               | pass   | Probe output included only route label, pass/fail label, and artifact flag. |
| Harness proof avoids raw DOM/screenshot/trace     | pass   | Minimal browser harness probe did not capture or output artifacts.          |
| Commit hook task scope alignment                  | pass   | `currentPhase`/`currentTask` now point at this repair task for closeout.    |

## Current Decision

Use the existing local Playwright test runtime as a redacted programmatic harness probe for local acceptance control
when the in-app browser tab handle mapping is stale. This is a harness repair/provisioning decision only and does not
change product login, shared input, authentication, authorization, redeem runtime, or DB behavior.

## Decision

Approve this repair as a local acceptance harness provisioning result: when the in-app browser tab mapping is stale, the
Scenario 9 affected-node rerun may use the existing redacted programmatic Playwright control path. The rerun must still
start from the browser login node, preserve hydrated/interactable readiness, and keep API session, browser form-state,
upgrade redemption, permission/surface boundary, and aggregate DB lanes separate.
