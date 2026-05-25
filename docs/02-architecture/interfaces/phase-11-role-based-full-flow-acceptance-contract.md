# Phase 11 Role-Based Full-Flow Acceptance Contract

## Status

Execution contract for the local role-based acceptance rerun.

## Purpose

This contract defines the reusable local acceptance boundary for Phase 11 before any staging execution. It verifies the role sequence required for staging readiness while staying inside `dev`.

## Boundary

This contract allows:

- local `dev` browser and REST verification;
- test-only data created through approved local runtime entrypoints;
- bounded project-owned content references;
- generated screenshots, traces, and reports only under ignored runtime artifact paths.

This contract forbids:

- staging or production connection;
- deployment or cloud resource changes;
- secret, token, Authorization header, provider payload, raw prompt, raw answer, raw model response, full paper, full textbook, OCR full text, or customer-like private content in committed evidence;
- dependency, package, lockfile, schema, migration, script, `.env.local`, or `.env.example` changes.

## Required Execution Order

1. Preflight Data Inventory.
2. System Ops Data Readiness.
3. Content Ops Readiness.
4. Student Positive Flow.
5. Student Negative Flow.
6. Oversight Flow.
7. Staging Template.

## Runtime Acceptance Criteria

| Acceptance criterion                            | Required proof                                                                                                                                             | Allowed status labels                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Data prerequisites are known before role flows  | Preflight inventory with user, organization, `org_auth`, `redeem_code`, `contact_config`, material, question, paper, `audit_log`, and `ai_call_log` status | `runtime_closed`, `partial_runtime`, `read-only`, `blocked_by_approval` |
| System ops can prepare downstream data          | Local admin runtime for user, organization, `org_auth`, `redeem_code`, and `contact_config`                                                                | `runtime_closed`, `partial_runtime`, `read-only`                        |
| Content ops can prepare student-visible content | Local material/question/paper create-or-reuse path and publish proof                                                                                       | `runtime_closed`, `partial_runtime`, `read-only`                        |
| Authorized student can complete learning flow   | Login, authorized paper visibility, practice answer, mock answer, submit, report or feedback proof                                                         | `runtime_closed`                                                        |
| Unauthorized student cannot see content         | No-auth student registration or reuse, no paper leakage, purchase guidance proof                                                                           | `runtime_closed`                                                        |
| Oversight is redaction-safe                     | `audit_log` and `ai_call_log` read proof plus redaction assertions                                                                                         | `runtime_closed`, `partial_runtime`                                     |
| Staging handoff is reusable but not executed    | Template under `docs/05-execution-logs/acceptance/role-based-full-flow/`                                                                                   | `template_only`                                                         |

## Evidence Rules

Committed evidence may record public identifiers, short labels, counts, status names, and redacted summaries. It must not record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper content, full textbook content, OCR full text, generated plaintext `redeem_code`, or private customer-like data.

## Staging Decision

Local acceptance success is not staging approval. Any staging run remains blocked until a later task records explicit human approval for staging resource, secret, deployment, data, and evidence boundaries.
