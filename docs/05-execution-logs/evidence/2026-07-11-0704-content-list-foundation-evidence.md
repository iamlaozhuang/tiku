# 0704 Content List Foundation Evidence

## Metadata

- taskId: `0704-content-list-foundation-2026-07-11`
- branch: `codex/0704-content-list-foundation`
- roleLabels: content administrator, super administrator
- routeLabels: paper management, question bank management, material management
- evidenceMode: redacted role/route/status/problem/fix/command/test counts only

## Readonly Review

- governance, requirements, ADR, current state/queue, related UI/UX evidence, and target source/tests reread: pass
- approved existing private screenshots reviewed: 3
- new screenshot/raw DOM/trace captured: 0
- screenshot copied to repository/evidence: 0

## Test-Proven Gaps And Corrections

| routeLabel               | problemCategory          | correctionSummary                                                                                                                                                      |
| ------------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| paper management         | query correctness        | Replaced first-page client slicing with server filters, sorting, pagination totals, page navigation, reset, and URL-restored list state.                               |
| question bank management | query correctness        | Reused the shared list baseline and preserved deep-link target resolution without exposing business identifiers in default rows.                                       |
| material management      | query correctness        | Added server keyword filtering and shared filters, result total, list frame, initial/filtered empty states, and bottom pagination.                                     |
| all three content lists  | visual consistency       | Standardized control height, filter order, result totals, current-page lifecycle labels, compact summaries, and horizontally bounded list frames.                      |
| all three content lists  | sensitive display        | Removed visible default-row business identifiers, complete material previews, and referenced-object identifiers; retained summary counts and existing guarded actions. |
| shared list interaction  | reset and runtime safety | Explicit reset returns URL-restored lists to page one, page size 20, and newest-first ordering; URL initialization safely handles server prerendering.                 |

## Acceptance Matrix

| dimension           | result           | count or summary                                                                                         |
| ------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| initial RED         | expected failure | server query forwarding and shared-list behavior failed before implementation                            |
| adversarial RED     | expected failure | 2 files / 37 tests / 2 failed for default reset and deep-link server targeting                           |
| final focused GREEN | pass             | 6 files / 70 tests                                                                                       |
| paper list          | pass             | server filters, page size, page navigation, URL restore/reset, total, empty states                       |
| question list       | pass             | server filters, page navigation, deep-link targeting, compact binding summaries                          |
| material list       | pass             | server keyword/filter/page query, totals, compact reference summaries                                    |
| existing writes     | pass             | create, edit, copy, disable, compose, publish, archive, and attachment request contracts unchanged       |
| role boundary       | pass             | existing server authorization remains authoritative; no client hiding replaces role checks               |
| lifecycle boundary  | pass             | locks, snapshots, published-content rules, and confirmations unchanged                                   |
| sensitive display   | pass             | no complete content, internal numeric identifier, raw AI data, or Provider payload added to default rows |

## Quality Gates

- focused tests: pass, 6 files / 70 tests
- lint: pass, 0 errors / 0 warnings
- typecheck: pass, TypeScript no emit
- format check: pass, full repository
- git diff check: pass
- Module Run v2 pre-commit hardening: pass, 21 files scanned
- Module Run v2 pre-push readiness: pass with remote-ahead check skipped before local merge
- package/lockfile changed: no
- schema/migration/seed changed: no
- Provider/env/secret/database/staging/production/deploy action: not executed

## Evidence Redaction

- credentials, cookies, sessions, tokens, authorization headers, env values, database URLs, raw rows, and internal numeric identifiers: not recorded
- full questions, papers, materials, raw Prompt, raw AI output, Provider payloads, and referenced-object identifiers: not recorded

## Non-Claims

- localhost UI source/test optimization only
- no staging, production, preview, Provider, Cost Calibration, deployment, final release, or production readiness claim
