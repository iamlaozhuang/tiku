# Security API Contract Input Validation Inventory Traceability

- Task id: `security-api-contract-input-validation-inventory-2026-06-29`
- Branch: `codex/security-api-validation-inventory-20260629`
- Status: closed
- Created at: `2026-06-29T08:55:08-07:00`

## Scope

This traceability record covers a source-read-only inventory of REST API contract and input-validation boundaries. It
does not authorize source/test changes. It does not authorize browser/runtime, DB, Provider/AI, dependency,
schema/migration/seed, release readiness, final Pass, Cost Calibration, deployment, PR, or force-push actions.

## Governance Inputs

| Input                                                                         | Status       |
| ----------------------------------------------------------------------------- | ------------ |
| `AGENTS.md`                                                                   | read         |
| `docs/03-standards/code-taste-ten-commandments.md`                            | read         |
| `docs/02-architecture/adr/`                                                   | read         |
| `docs/04-agent-system/state/project-state.yaml`                               | read/updated |
| `docs/04-agent-system/state/task-queue.yaml`                                  | read/updated |
| kickoff traceability/evidence                                                 | read         |
| data redaction/log boundary inventory traceability/evidence/audit/acceptance  | read         |
| permission and role boundary inventory traceability/evidence/audit/acceptance | read         |

## Requirement Mapping

| Requirement                                              | Evidence target                                                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Keep release/deploy gates blocked                        | No staging/prod/cloud/deploy/release readiness/final Pass/Cost Calibration actions are run.      |
| Review API contract/input validation without raw content | Evidence records route paths, counts, risk categories, statuses, and task IDs only.              |
| Preserve API envelope and naming standards               | Inventory checks `/api/v1/`, kebab-case paths, camelCase JSON, and `{ code, message, data }`.    |
| Preserve ID and sensitive-data boundaries                | Inventory checks for public URL identifiers and redacted error/input summaries only.             |
| Avoid source/test implementation changes                 | No `src/**` or `tests/**` files are modified in this task.                                       |
| Split executable follow-up tasks                         | Any confirmed finding becomes a separate future task with fresh materialization requirements.    |
| Preserve DB and Provider boundaries                      | No DB connection/mutation/schema/seed and no Provider/AI call/configuration action are executed. |

## Inventory Matrix

| Finding         | Severity | Status           | Boundary                       | Follow-up                                                |
| --------------- | -------- | ---------------- | ------------------------------ | -------------------------------------------------------- |
| `api-inv-001`   | medium   | follow-up seeded | list query sort-field boundary | `verify-api-list-sort-by-validation-boundary-2026-06-29` |
| `api-inv-002`   | low      | covered          | standard response envelope     | none                                                     |
| `api-inv-003`   | low      | covered          | public URL identifier boundary | none                                                     |
| `api-watch-001` | low      | watch            | route error envelope coverage  | monitor with existing route-envelope regression tasks    |
| `api-watch-002` | low      | watch            | local acceptance session route | no follow-up from this task; not an external API v1 gap  |

## Read-Only Inventory Results

| Surface                                                          | Count / Status                                                                                        |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/app/api/v1/**/route.ts`                                     | 116 route files counted                                                                               |
| `src/server/validators/**`                                       | 139 files counted                                                                                     |
| `src/server/contracts/**`                                        | 104 files counted                                                                                     |
| `src/server/mappers/**`                                          | 40 files counted                                                                                      |
| `src/server/services/**`                                         | 260 files counted                                                                                     |
| `tests/unit/**`                                                  | 98 files counted                                                                                      |
| Dynamic `api/v1` route folder search for `[id]`                  | no `[id]` route segment found                                                                         |
| Route-handler direct JSON construction in `src/app/api/v1/**`    | none found; route files delegate to service route handlers                                            |
| Service response constructors without route error wrapper marker | one local acceptance session service path; not classified as external `api/v1` route gap in this task |

## Finding Details

### `api-inv-001` - List Query Sort-Field Boundary

Read-only review found inconsistent list query sort-field handling:

- Some validators use fixed or allowlisted sort fields.
- Several content/student list validators preserve caller-supplied `sortBy` strings through normalization.
- At least one unit test explicitly expects an arbitrary non-default `sortBy` string to be preserved.

This task did not read repositories or execute DB queries, so it does not claim an injection or data-access finding.
The risk is boundary inconsistency: future scoped work should either prove downstream allowlisting for every affected
list endpoint or centralize/route-scope the allowlist at validation time.

### `api-inv-002` - Standard Response Envelope

The shared API response contract defines the standard `{ code, message, data, pagination? }` shape, and existing unit
coverage verifies success, paginated success, and error responses. Selected route-handler tests also assert standard
response shape. No follow-up task is required from this inventory.

### `api-inv-003` - Public URL Identifier Boundary

Read-only route inventory did not find `[id]` route folder usage under `src/app/api/v1/**`. Selected route tests assert
`publicId` route params for detail/action handlers. No raw internal ID URL exposure finding was confirmed.

### `api-watch-001` - Route Error Envelope Coverage

Route error wrapping is broadly present in service route handlers, and unit coverage verifies unexpected exceptions are
returned as a generic standard 500 envelope without raw error detail. This remains a watch item only because the
inventory sampled route-handler surfaces rather than proving every handler path exhaustively.

### `api-watch-002` - Local Acceptance Session Route

The only response-construction service path found without the route error wrapper marker is scoped to local acceptance
session support. This task did not classify it as an external REST API contract gap and did not inspect credentials,
sessions, cookies, localStorage, Authorization headers, or private account fixtures.

## Follow-up Queue

1. `verify-api-list-sort-by-validation-boundary-2026-06-29`

   Prove or repair per-endpoint `sortBy` allowlisting for list query validators and their service tests. The future
   task must freshly materialize allowed files, blocked files, DB boundary, Provider boundary, credential boundary,
   evidence redaction, and closeout policy before reading additional source or modifying code.

## Non-Actions

- No source or test files were modified.
- No browser, dev server, raw DOM, screenshot, trace, or HTML report was used.
- No DB connection, raw row read, schema, migration, seed, or mutation was used.
- No Provider/AI call, Provider/model configuration, prompt, raw AI input/output, or Cost Calibration was used.
- No env/secrets, credentials, cookies, tokens, sessions, localStorage, Authorization headers, private fixtures, PII,
  email, phone, plaintext redeem_code, complete question/paper/material/resource/chunk content, or raw exception payload
  was recorded.
- No package/lockfile/dependency, PR, force-push, staging/prod/cloud/deploy, release readiness, or final Pass action was
  performed.
