# Full Chain Acceptance Runbook And Stop Rules

Task id: `full-chain-acceptance-planning-and-materials-prep-2026-07-04`

Status: future runbook only.

## Execution Principle

Later experiential acceptance should be serial, evidence-backed, and stop-on-fail. It must not continue by skipping broken
steps or manually repairing data outside an approved repair/provisioning task.

## Future Runbook

| Step | Name                                        | Required entry condition                     | Output                                         |
| ---- | ------------------------------------------- | -------------------------------------------- | ---------------------------------------------- |
| R0   | Fresh approval for isolated DB and boundary | This preparation package merged and approved | Execution-specific task plan                   |
| R1   | Isolated DB target inventory                | No DB mutation approval needed if read-only  | Target label match or block                    |
| R2   | Provisioning scope plan                     | R1 target clear                              | Exact selectors and idempotent upsert boundary |
| R3   | Fresh approval for provisioning             | R2 accepted                                  | Local-only provisioning execution task         |
| R4   | Bootstrap seed only                         | R3 approval                                  | Redacted bootstrap and static config counts    |
| R5   | Input-material and absence preflight        | R4 complete                                  | Input readiness plus scenario-output absence   |
| R6   | Browser/e2e approval                        | R5 pass                                      | Runtime acceptance boundary                    |
| R7   | Full-chain execution T1-T7                  | R6 approval                                  | Redacted pass/fail/block evidence              |
| R8   | Defect split if needed                      | Any fail/block                               | Repair/provisioning task                       |
| R9   | Rerun from start                            | Repair merged and approved                   | Full-chain rerun evidence                      |
| R10  | Stage C decisions                           | Local full-chain evidence closed             | Provider, Cost, or staging task selection      |

## Browser Login Readiness Gate

All full-chain browser acceptance tasks that use the login page must wait for the login surface to be hydrated and
interactable before filling private credentials. Waiting only for `domcontentloaded` is insufficient and can produce a
false blocker where DOM values exist but React-controlled state has not observed the input events.

Before any browser flow that will create or mutate product DB state, run a minimal browser login smoke against the same
local app and DB target:

1. Navigate to `login_surface`.
2. Wait for the page to be hydrated/interactable.
3. Fill a selector-owned private credential in memory.
4. Verify the submit action enables from React-observed form state.
5. Stop and split repair if the form state does not update.

This smoke must not create session state or product DB writes unless the scenario task explicitly scopes that action. A
successful API session check does not replace this browser form-state check.

## Global Stop Rules

Stop immediately when any of these occurs:

- DB target or app runtime target is ambiguous or mismatched.
- A required bootstrap selector, private input, or step-specific scenario prerequisite is missing when that step is
  reached.
- DB provisioning would pre-create a scenario output that the later experiential flow is supposed to prove.
- Any action requires cleanup/reset/delete/truncate/drop or unapproved schema migration.
- Any role sees data or routes outside its boundary.
- Any standard role can use advanced-only AI or enterprise training.
- Any organization admin can mutate employees, organization tree, or global authorization outside approved ops ownership.
- Browser credential fill would run before the login page is hydrated/interactable, or any flow attempts product DB
  writes before the minimal browser login smoke has passed for the same runtime target.
- Any evidence would contain credentials, connection strings, raw DB rows, phone, email, password, plaintext `redeem_code`,
  token, cookie, session, localStorage, Authorization header, raw Prompt, Provider payload, raw AI output, raw employee
  answer, full question, full paper, full material, DOM, screenshot, or trace.
- Provider, staging, production, deployment, payment, Cost Calibration, or release decision is needed but not freshly
  approved.

## Repair Rule

If a fail/block is found:

1. Stop acceptance.
2. Record redacted fail/block evidence.
3. Split a minimal repair or provisioning task.
4. Fix only the root cause inside that task's boundary.
5. Validate, commit, merge, push, and clean the repair task only if separately approved.
6. Restart full-chain acceptance from the beginning unless the repair task explicitly proves a narrower restart point.

## Evidence Format

Allowed evidence:

- Task id, branch, file paths, role labels, route/surface labels, selector labels, DB target label, provider/model labels,
  counts, status, pass/fail/block, command names, duration, token counts, and redacted expected/observed summaries.

Browser login evidence must keep three evidence lanes separate:

- API session lane: route label, selector label, role label, and redacted pass/fail only.
- Browser login form-state lane: route label, selector label, hydration/interactable readiness, submit-enabled state, and
  redacted pass/fail only.
- Permission/surface boundary lane: role label, route/surface label, allowed/denied summary, aggregate counts if needed,
  and redacted pass/fail only.

API session success must not be used as browser login success. Browser login success must not be used as permission or
surface-boundary success.

Forbidden evidence:

- Credentials, tokens, cookies, sessions, localStorage, Authorization headers, `.env*` values, connection strings, raw DB
  rows, internal numeric ids, phone, email, passwords, plaintext card values, full materials, full question/paper content,
  raw prompts, Provider payloads, raw AI I/O, employee subjective answers, screenshots, raw DOM, traces, or exported
  private files.

## Non-Claims

This runbook is not an execution result. It does not claim runtime acceptance, release readiness, final Pass, production
usability, Cost Calibration, Provider readiness, DB readiness, or staging readiness.
