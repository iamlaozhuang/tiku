# Full Audit Prerequisites

**Date:** 2026-05-27

**Phase:** `phase-16-full-requirement-audit-planning`

## Purpose

Identify prerequisites for executing the 64-item full requirement implementation audit. This document does not start servers, inspect secrets, connect providers, provision cloud resources, deploy, or modify runtime code.

## Local Dev Server Preconditions

Required for browser/runtime audit tasks:

- Clean working tree or task-scoped audit branch.
- Dependencies already installed from the existing lockfile.
- Local Next.js dev server on `localhost` or `127.0.0.1`.
- No staging/prod/cloud URL usage.
- No deployment or public tunnel.
- Browser/IAB or Playwright can reach the local URL.

Blocked or restricted:

- Do not read `.env.local` or `.env.example`.
- If the app logs that `.env.local` exists or is loaded, evidence may record existence only.
- Do not change environment variables to make audit pass unless a later approved task explicitly allows it.

## Local Database / Fixture / Seed Preconditions

Required for runtime audit:

- Local dev database available, preferably Docker PostgreSQL with pgvector as defined by the runtime contracts.
- Migrations already applied by existing project-approved workflow.
- Deterministic seed data or fixture setup for:
  - `super_admin`
  - `ops_admin`
  - `content_admin`
  - `student`
  - `organization` hierarchy
  - `employee`
  - `personal_auth`
  - `org_auth`
  - `redeem_code`
  - published `paper`
  - objective and subjective `question`
  - `practice`
  - `mock_exam`
  - `exam_report`
  - `mistake_book`
  - `resource`
  - `knowledge_node`
  - redaction-safe `audit_log`
  - redaction-safe `ai_call_log`

Evidence restrictions:

- Use synthetic data only.
- Do not include generated plaintext `redeem_code` values in committed evidence.
- Do not include passwords, tokens, Authorization headers, raw prompts, raw answers, raw model outputs, raw provider payloads, full papers, full textbooks, OCR full text, or customer/customer-like private data.

## Test Account And Role Preconditions

Needed role coverage:

- Unauthenticated user:
  - `/login`, `/register`, protected route denial/redirect.
- `student`:
  - `/home`, `/redeem-code`, `/practice`, `/mock-exam`, `/exam-report`, `/mistake-book`, `/profile`.
- `content_admin`:
  - `/content/questions`, `/content/materials`, `/content/papers`, `/content/knowledge-nodes`.
- `ops_admin`:
  - `/ops/users`, `/ops/organizations`, `/ops/authorizations`, `/ops/redeem-codes`, `/ops/resources`, `/ops/audit-logs`, `/ops/ai-call-logs`.
- `super_admin`:
  - AI model configuration and backend user/role management surfaces.

Restrictions:

- Do not record passwords.
- Do not weaken auth or role guards during audit.
- Do not create real user/customer data.

## E2E Preconditions

Required for local browser verification:

- Existing e2e runner available through project scripts.
- Local dev server URL is known and local-only.
- Test data reset or fixture isolation does not perform destructive operations outside local dev.
- Screenshots, traces, and reports are stored only under ignored artifact paths unless a task explicitly allows committed redacted screenshots.
- Console and network checks redact sensitive headers and payloads.

Recommended evidence shape:

- route
- role
- expected behavior
- actual behavior summary
- pass/partial/missing/blocked status
- findingId when applicable
- screenshot/trace status, not raw sensitive content

## Browser/IAB Or Playwright Preconditions

Preferred browser path:

- Use Browser/IAB for local `localhost`, `127.0.0.1`, `::1`, or `file://` targets when available.
- Use Playwright fallback only after Browser/IAB discovery is attempted and recorded, unless the follow-up task is explicitly an e2e script run.

Browser evidence must record:

- backend used: `iab`, Playwright, or fallback with reason
- local URL
- roles exercised
- visible state checks
- console/network error summary
- cleanup/finalization status

## `.env.local` / `.env.example` Restriction

This audit plan explicitly forbids:

- reading `.env.local`
- reading `.env.example`
- modifying either file
- copying values from either file
- asking the user to paste secrets into chat
- recording secret-like values in evidence

Permitted:

- record that a framework or command reported `.env.local` exists or was loaded, without values.
- record that env/secret validation is blocked pending explicit future approval.

## Long-Lived Blocked Gates

| Gate                              | Status             | Audit implication                                                                                                                                                      |
| --------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `real-provider-staging-redaction` | blocked            | Real AI provider calls, staging/prod connections, cloud changes, secret/env changes, and deploy remain forbidden. Use local mock/deterministic provider evidence only. |
| `dependency-change`               | blocked_by_default | If a requirement cannot be audited because a parser/test/browser dependency is missing, record finding or blocked status. Do not edit package files or lockfiles.      |
| `secret-env-change`               | blocked_by_default | Do not read or modify env files. Secret handling can be audited only through code/static redaction and synthetic inputs.                                               |
| `deploy-and-cloud-change`         | blocked_by_default | No deployment, DNS, object storage, database cloud, staging, or prod action.                                                                                           |
| `destructive-data-operation`      | blocked_by_default | No destructive data reset except approved local fixture process in a later task.                                                                                       |

## Directly Executable Audit Items

The following can start with static code and contract inspection before runtime:

- All 64 audit items: route inventory, service/repository/contract/validator presence, naming compliance, forbidden identifier scan, response envelope scan.
- RA-02 and RA-06 content/admin UI items: component/page presence and route mapping.
- RA-04/RA-05 AI/RAG items: provider boundary, redaction, mock-provider, `evidence_status`, and citation code path inspection.

## Items Requiring Local Runtime Preconditions

These require dev server, local DB, role fixtures, and Browser/IAB or Playwright:

- RA-01-01 through RA-01-14 for auth, sessions, authorization, redeem, org, employee flows.
- RA-02-01 through RA-02-11 for content management and publish/lifecycle workflows.
- RA-03-01 through RA-03-09 for student browsing, practice, mock exam, report, and mistake_book flows.
- RA-04-01 through RA-04-06 for mock AI scoring/explanation/hint/recommendation runtime behavior.
- RA-05-03 through RA-05-09 for resource, Markdown, vector mock, chunk, knowledge tree, and report analysis flows.
- RA-06-01 through RA-06-13 for admin UI and role-protected pages.

## Items Blocked Until Future Approval Or Setup

| Audit area                                                     | Blocker                                                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Real provider scoring/explanation/hint/recommendation          | `real-provider-staging-redaction` remains blocked.                                               |
| Staging/prod acceptance                                        | `deploy-and-cloud-change`, `secret-env-change`, and staging/prod approval not present.           |
| Cloud object storage behavior                                  | Cloud resource and secret/env gates blocked. Local adapter/static contract can still be audited. |
| Dependency-backed conversion not already installed             | `dependency-change` approval required before adding or changing dependencies.                    |
| Destructive reset/seed outside approved local fixture workflow | `destructive-data-operation` approval required.                                                  |
| Reading `.env.local` or `.env.example`                         | `secret-env-change` approval required and not granted for this phase.                            |

## Execution Task Split

Do not create 64 branch tasks. Keep 64 audit items in catalog and matrix, and execute by epic-level tasks:

1. `phase-16-audit-user-auth-authorization`
2. `phase-16-audit-question-paper-content`
3. `phase-16-audit-student-experience`
4. `phase-16-audit-ai-scoring-explanation`
5. `phase-16-audit-rag-knowledge`
6. `phase-16-audit-admin-ops-logs`

Each execution task must:

- update the catalog rows for its epic;
- update traceability matrix status;
- create evidence under `docs/05-execution-logs/evidence/`;
- record findings under an audit report section or separate issue tracking task when allowed;
- avoid code fixes;
- seed Phase 20+ implementation tasks for confirmed gaps.
