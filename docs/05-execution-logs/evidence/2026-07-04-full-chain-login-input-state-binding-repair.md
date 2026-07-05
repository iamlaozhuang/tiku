# 2026-07-04 Full-chain Login Input State Binding Repair Evidence

## Task

- Task id: `full-chain-login-input-state-binding-repair-2026-07-04`
- Branch: `codex/full-chain-login-input-state-binding-repair-2026-07-04`
- Source blocked task:
  `full-chain-scenario-5-advanced-org-package-rerun-after-employee-import-harness-repair-2026-07-04`
- Result: pass_hydrated_browser_readiness_repair_no_product_source_change

## Initial Findings

| Check label                         | Status | Redacted result                                                                 |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------- |
| `git status --short --branch`       | pass   | Correct repair branch active.                                                   |
| read gate                           | pass   | Required governance, requirements, blocker evidence, source, tests, and Base UI |
| current focused login UI unit test  | pass   | Existing unit surface passed.                                                   |
| local Base UI input contract review | pass   | Base UI input preserves standard controlled input behavior in local callers.    |
| root cause classification           | pass   | Browser fail was hydration-readiness timing, not service startup or DB target.  |

## Repair Validation

| Command label                                    | Status  | Redacted result                                                                                     |
| ------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------- |
| focused input/login unit validation              | pass    | `2` files, `13` tests passed; no private values printed.                                            |
| early-fill adversarial browser probe             | fail-ok | Filling at `domcontentloaded` reproduces disabled submit; classified as hydration readiness timing. |
| hydrated focused browser login submit validation | pass    | Route label `login_surface`; selector label used; submit enabled; no session created.               |
| local runtime cleanup                            | pass    | Task-owned port `3106` stopped.                                                                     |
| browser login readiness runbook update           | pass    | Hydrated/interactable login smoke and three-lane evidence rule added to full-chain runbook.         |
| `npm.cmd run typecheck`                          | pass    | TypeScript check passed.                                                                            |
| `npm.cmd run lint`                               | pass    | ESLint passed.                                                                                      |
| `npm.cmd exec -- prettier --write`               | pass    | Scoped files formatted.                                                                             |
| `npm.cmd exec -- prettier --check`               | pass    | Scoped files matched Prettier style.                                                                |
| `git diff --check`                               | pass    | No whitespace errors.                                                                               |
| blocked path diff check                          | pass    | Only task state, runbook, task docs, and the focused input contract test changed.                   |
| Module Run v2 pre-commit hardening               | pass    | Pre-commit hardening passed after task metadata scope was completed.                                |
| Module Run v2 pre-push readiness                 | pass    | Pre-push readiness passed with remote-ahead check skipped per local closeout flow.                  |

## Repair Outcome

- Product source files changed: `false`
- Shared `Input` implementation replaced: `false`
- New regression test added: `true`
- Acceptance browser readiness rule: wait for hydrated/interactable login surface before filling private credentials.
- Product DB write ordering rule: run minimal browser login smoke before any browser flow that will create or mutate
  product DB state.
- Evidence lanes: API session, browser login form state, and permission/surface boundary remain separate.
- Scenario 5 affected-node rerun entry: restart from browser login/surface node and do not duplicate the already passed
  advanced employee import mutation.

## Redaction Check

- Private credential values output: `false`
- Phone or email values output: `false`
- Env connection values output: `false`
- Token/session/cookie/localStorage/header output: `false`
- Raw DB rows output: `false`
- Internal ids output: `false`
- Screenshot/raw DOM/trace captured: `false`
- Provider payload/raw Prompt/raw AI I/O output: `false`
- Full material/question/paper/employee answer/plaintext card/private fixture content output: `false`

## Non-Claims

This repair evidence does not claim release readiness, final Pass, production usability, Provider readiness, Cost
Calibration, staging/prod readiness, or complete full-chain acceptance.
