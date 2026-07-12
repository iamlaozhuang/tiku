# 0704 Content Detail Entry Evidence

## Metadata

- taskId: `0704-content-detail-entry-2026-07-11`
- branch: `codex/0704-content-detail-entry`
- roleLabels: content administrator, super administrator
- routeLabels: paper management, paper detail, question bank management, material management
- evidenceMode: redacted role/route/status/problem/fix/command/test counts only

## Readonly Review

- governance, requirements, ADR, task 1 evidence/audit, target GET contracts/routes, rich-text renderer, list clients, and tests reread: pass
- approved existing private screenshots reviewed: 3
- new screenshot/raw DOM/trace captured: 0
- screenshot copied to repository/evidence: 0

## Test-Proven Gaps And Corrections

| routeLabel                | problemCategory              | correctionSummary                                                                                                                                                                                          |
| ------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| paper management          | missing detail entry         | Added a stable read-only paper detail route from every list row.                                                                                                                                           |
| paper detail              | incomplete inspection        | Added metadata, structure, material/question snapshots, options, answers, analysis, scores, scoring points, group, source, attachment summary, and publish-state explanation using existing GET contracts. |
| paper detail              | state isolation              | Attachment summary failure now produces a local warning while preserving readable paper content.                                                                                                           |
| question bank management  | missing detail entry         | Added an always-available read-only question detail drawer while leaving locked edit disabled.                                                                                                             |
| material management       | missing detail entry         | Added a read-only material detail drawer with complete safe-rendered content and readable available reference summaries.                                                                                   |
| question/material details | navigation and accessibility | Detail target persists in URL without entering the list API query; close preserves filters; Escape, focus loop, initial focus, and focus restoration are supported.                                        |

## Acceptance Matrix

| dimension           | result           | count or summary                                                                                                |
| ------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------- |
| initial RED         | expected failure | 2 existing files / 42 tests / 4 failed plus missing new detail component suite                                  |
| adversarial RED     | expected failure | attachment network failure replaced successful paper content before correction                                  |
| final focused GREEN | pass             | 3 files / 51 tests                                                                                              |
| paper detail route  | pass             | stable deep link and read-only GET rendering for lifecycle metadata and complete available structure            |
| question detail     | pass             | safe rich text, answer, analysis, scoring, bindings, lock/status, and no-write behavior                         |
| material detail     | pass             | complete content, lock/status, question summary, and named paper references                                     |
| URL restoration     | pass             | question/material detail refresh restoration and close preserve list filters                                    |
| detail states       | pass             | loading, unauthorized, forbidden, not found, generic error, empty fields, and attachment-local error            |
| locked content      | pass             | view remains enabled; edit remains disabled and existing copy path unchanged                                    |
| existing writes     | pass             | no POST, PATCH, DELETE, publish, archive, disable, copy, compose, or attachment write contract changed          |
| sensitive display   | pass             | no internal numeric IDs, file hash, raw AI data, Provider payload, session, or credentials rendered or recorded |

## Quality Gates

- focused tests: pass, 3 files / 51 tests
- lint: pass, 0 errors / 0 warnings
- typecheck: pass, TypeScript no emit
- format check: pass, full repository
- git diff check: pass
- Module Run v2 pre-commit hardening: pass, 14 files scanned
- Module Run v2 pre-push readiness: pass with remote-ahead check skipped before local merge
- package/lockfile changed: no
- API/service/repository/validator/schema/migration/seed changed: no
- Provider/env/secret/database/staging/production/deploy action: not executed

## Evidence Redaction

- credentials, cookies, sessions, tokens, authorization headers, env values, database URLs, raw rows, and internal numeric identifiers: not recorded
- full questions, papers, materials, file hashes, raw Prompt, raw AI output, and Provider payloads: not recorded

## Non-Claims

- localhost UI source/test optimization only
- no staging, production, preview, Provider, Cost Calibration, deployment, final release, or production readiness claim
