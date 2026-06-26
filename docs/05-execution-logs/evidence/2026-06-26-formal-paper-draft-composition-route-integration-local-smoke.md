# Formal paper draft composition route integration local smoke evidence

Task id: `formal-paper-draft-composition-route-integration-local-smoke-2026-06-26`

## Scope

- Branch: `codex/formal-paper-draft-composition-route-smoke-20260626`
- Task kind: `local_route_smoke`
- Approval consumed: `formal-paper-draft-composition-adoption-approval-package-2026-06-26`

## Boundary

- Local DB connection through existing runtime configuration: approved for this task.
- Local runtime DB config read: approved only by existing runtime code; no value may be printed or recorded.
- Content paper setup POST cap: 1.
- Formal adoption POST cap: 1.
- Companion question draft cap: 3.
- Paper section cap: 3.
- Paper question cap: 3.
- Source/test/schema/migration/package/env changes: not approved.
- Provider call or credential read: not approved.
- Formal publish or student-visible content: not approved.
- Staging/prod/deploy/payment/external-service touched: not approved.
- Cost Calibration or final Pass claimed: not approved.

## Validation Results

| Command                                                                                                                                                                 | Result | Notes                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts` | PASS   | 2 files, 12 tests passed before route smoke.                                                                       |
| `node_modules\.bin\tsx.cmd <transient-repo-root-route-smoke-harness>`                                                                                                   | PASS   | 1 content paper setup POST, 1 formal adoption POST, 1 companion question draft, 1 paper_section, 1 paper_question. |
| Scoped `prettier --write`                                                                                                                                               | PASS   | Evidence table formatting was updated; other scoped files were unchanged.                                          |
| Scoped `prettier --check`                                                                                                                                               | PASS   | All matched files use Prettier code style.                                                                         |
| `git diff --check`                                                                                                                                                      | PASS   | No whitespace errors.                                                                                              |
| Module Run v2 precommit hardening                                                                                                                                       | PASS   | Task-scoped scope scan passed; 5 files scanned.                                                                    |
| Module Run v2 prepush readiness                                                                                                                                         | PASS   | First run found state SHA drift; `project-state.yaml` repository SHA was updated to the current checkpoint first.  |

## Local Route Smoke Result

Executed at: `2026-06-26T12:05:56-07:00`

Status: `PASS`.

Redacted summary:

- Actor lookup count: 1.
- Actor state: present.
- Content paper setup POST count: 1.
- Formal adoption POST count: 1.
- Setup route response code: 0.
- Setup workflow: content admin `paper`.
- Setup runtime status: `local_contract_only`.
- Setup Provider call executed: false.
- Setup result public id state: present.
- Formal adoption route response code: 0.
- Formal adoption target write status: `draft_created`.
- Formal paper public id state: present.
- Paper composition status: `composed`.
- Paper section count: 1.
- Paper question count: 1.
- Companion question draft count: 1.
- Transient route smoke harness removed after execution: true.

Boundary flags:

- Source/test changes executed: false.
- Schema migration executed: false.
- Local migration executed: false.
- Seed or fixture creation executed: false.
- Direct DB cleanup delete or data repair executed: false.
- Provider/model call executed: false.
- Provider credential read executed: false.
- Formal publish or student-visible content executed: false.
- Staging/prod/deploy/payment/external-service touched: false.
- Cost Calibration or final Pass claimed: false.

## Redaction Statement

No raw generated result body, raw reviewed draft body, raw DB row, internal numeric id, DB URL, secret, token, cookie,
Authorization header, API key, prompt, raw output, Provider payload, full formal question content, full paper content,
or account credential may be written to this evidence.

## Interim Closeout

Status: `PASS_FORMAL_PAPER_DRAFT_COMPOSITION_ROUTE_SMOKE_NO_PROVIDER_NO_PUBLISH`.

The content admin route-only workflow is now proven locally through a generated paper result adoption into a formal
draft `paper` with a composed `paper_section` and `paper_question`. Provider/Cost, formal publish, student-visible
content, staging/prod, payment, external service, release readiness, and final Pass remain outside this task and were
not performed.
