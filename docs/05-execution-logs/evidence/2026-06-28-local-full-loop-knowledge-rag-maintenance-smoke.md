# Local Full Loop Knowledge RAG Maintenance Smoke Evidence

## Scope

- Task id: `local-full-loop-knowledge-rag-maintenance-smoke-2026-06-28`
- Branch: `codex/local-full-loop-rag-20260628`
- Local target: localhost/127.0.0.1 only
- Evidence mode: redacted metadata only

## Redaction Boundary

This evidence intentionally omits credential values, connection strings, secrets, session values, cookies, localStorage,
Authorization headers, raw DB rows, internal ids, user email/phone values, plaintext redeem codes, raw DOM, screenshots,
traces, Provider payloads, prompts, raw AI output, employee subjective answers, full question or paper content, raw
resource content, full chunk text, embeddings, storage paths, and object keys.

## TDD And Repair Evidence

- RED command:
  `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER="1"; npm.cmd run test:e2e -- e2e/local-full-loop-knowledge-rag-maintenance-smoke.spec.ts --reporter=line`
- RED result: failed during local `knowledge_node` creation because the local dev DB did not yet have the required
  profession-scoped knowledge base baseline.
- Repair: added local dev seed coverage for enabled `marketing` and `monopoly` knowledge bases and made the seed
  idempotent against the existing `profession` uniqueness contract.
- GREEN seed unit command: `npm.cmd run test:unit -- src/db/dev-seed.test.ts`
- GREEN seed unit result: passed, 1 file, 3 tests.

## Local DB Seed Evidence

- Seed command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`
- Seed result: passed with redacted aggregate counts only.

Redacted seed summary:

| Surface                       | Count |
| ----------------------------- | ----: |
| auth_user                     |     7 |
| admin                         |     5 |
| admin_organization            |     5 |
| student user                  |     1 |
| employee user                 |     1 |
| organization                  |     1 |
| employee                      |     1 |
| org_auth                      |     1 |
| org_auth_organization         |     1 |
| organization_training_version |     1 |
| organization_training_answer  |     1 |
| personal_auth                 |     1 |
| paper                         |     1 |
| paper_question                |     1 |
| knowledge_base                |     2 |
| model_config                  |     1 |

## Localhost E2E Evidence

- Command:
  `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER="1"; npm.cmd run test:e2e -- e2e/local-full-loop-knowledge-rag-maintenance-smoke.spec.ts --reporter=line`
- Result: passed, 1 test.

Redacted flow summary:

| Actor role    | Step                             | Result                                     |
| ------------- | -------------------------------- | ------------------------------------------ |
| content_admin | session login                    | pass active context                        |
| content_admin | create `knowledge_node`          | pass active status                         |
| content_admin | list `knowledge_node`            | pass visible                               |
| content_admin | upload local Markdown `resource` | pass draft status                          |
| content_admin | publish `resource`               | pass published status                      |
| content_admin | rebuild vector                   | pass `rag_ready` with positive chunk count |
| content_admin | list `resource`                  | pass visible as `rag_ready`                |

## Focused RAG Unit Evidence

- Command:
  `npm.cmd run test:unit -- tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts tests/unit/phase-11-local-rag-mock-embedding-pipeline.test.ts src/server/services/rag-retrieval-service.test.ts tests/unit/rag-knowledge/rag-layering-retrieval-governance.test.ts`
- Result: passed, 4 files, 12 tests.

## Requirement Mapping Result

| Requirement surface                   | Mapping result                                                                                                                                       |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local knowledge base baseline         | pass via idempotent dev seed and redacted `knowledge_base` aggregate count                                                                           |
| Knowledge node maintenance            | pass via localhost `content_admin` API smoke                                                                                                         |
| Resource upload and publish lifecycle | pass via localhost API smoke                                                                                                                         |
| Local RAG vector lifecycle            | pass via `rag_ready` status and positive redacted chunk count                                                                                        |
| Retrieval governance                  | pass via focused local RAG unit suite                                                                                                                |
| API envelope and JSON naming rules    | pass via e2e assertions                                                                                                                              |
| Redaction                             | pass; no credentials, session values, DB rows, raw content, chunks, embeddings, storage paths, Provider payloads, prompts, or raw AI output recorded |

## Boundary Evidence

- Package or lockfile changed: no.
- `.env*` changed: no.
- Schema or migration changed: no.
- Provider call or Provider configuration: no.
- Cost Calibration: blocked and not executed.
- Staging/prod/deploy: blocked and not executed.
- Payment/OCR/export/external-service: blocked and not executed.
- PR or force push: blocked and not executed.
- Release readiness/final Pass: not claimed.
