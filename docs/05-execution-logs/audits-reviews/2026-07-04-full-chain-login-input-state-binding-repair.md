# 2026-07-04 Full-chain Login Input State Binding Repair Audit

## Scope

- Task id: `full-chain-login-input-state-binding-repair-2026-07-04`
- Branch: `codex/full-chain-login-input-state-binding-repair-2026-07-04`
- Scope reviewed: login browser readiness timing, shared UI input contract, and the Scenario 5 affected-node rerun entry.

## Findings

- BLOCKER REPRODUCED: Scenario 5 API login and employee import passed, but a browser probe that filled credentials at
  `domcontentloaded` left submit disabled.
- ROOT CAUSE CLASSIFIED: the failing probe wrote DOM values before the client login component was hydrated; the controlled
  React state did not observe those events.
- SOURCE REPAIR REJECTED: replacing the shared Base UI `Input` would be broader than the proven root cause. The shared
  input contract passes focused unit validation and hydrated browser validation.
- TEST GAP CLOSED: a focused shared `Input` controlled-contract test now guards the assumption used by the acceptance
  rerun.
- RUNBOOK HARDENED: future full-chain browser login must wait for hydrated/interactable readiness, and minimal browser
  login smoke must run before product DB writes.

## Adversarial Checks

| Check                                   | Result | Evidence                                                  |
| --------------------------------------- | ------ | --------------------------------------------------------- |
| Auth validation remains server-owned    | pass   | No session API, cookie, or authorization behavior changed |
| Login submit only enables valid input   | pass   | Focused login/input tests and hydrated browser probe      |
| Shared input callers keep compatibility | pass   | Existing wrapper preserved; added contract test           |
| No permission weakening                 | pass   | No role, route guard, or auth gate changed                |
| No dependency or lockfile change        | pass   | No package or lockfile edited                             |
| No schema/migration/seed change         | pass   | No DB schema, migration, seed, or fixture expansion       |
| No Provider/staging/prod/Cost work      | pass   | Local-only browser validation, provider disabled          |
| Redaction preserved                     | pass   | No private values, screenshots, raw DOM, or session data  |
| Evidence lanes remain separate          | pass   | API session, browser form state, permission boundary      |

## Decision

Approve the repair as an acceptance-readiness/harness timing correction with one focused unit guard and no product source
change. The Scenario 5 rerun must wait for the login surface to be hydrated/interactable before filling credentials, then
continue from the affected browser login node without duplicating the already completed employee import mutation. If a
later run requires product source, auth, authorization, DB/schema/seed, dependency, Provider, staging/prod, or Cost
changes, stop this harness path and split a new bounded task.
