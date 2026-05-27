# Local Human Verification SOP

## Status

Active for Phase 15 and later local verification work.

## Purpose

Define how agents prepare and accompany local human experience verification without weakening environment, provider, evidence, or dependency boundaries.

This SOP applies when the user asks for local human verification, local product role-play, "真人体验验证", local readiness accompaniment, or manual browser walkthrough support.

## Hard Boundaries

Local human verification is local-only:

- Use only `localhost`, `127.0.0.1`, or another explicitly approved local address.
- Do not connect to `staging`, `prod`, cloud resources, object storage, or a real provider.
- Do not deploy, create PRs, or push unless the user explicitly approves that task.
- Do not read, modify, output, summarize, or copy `.env.local` or `.env.example`.
- Do not add, remove, or upgrade dependencies.
- Do not run migrations, seed resets, destructive data operations, or production-like cleanup.
- Do not record secrets, tokens, Authorization headers, database URLs, provider payloads, raw prompts, raw answers, raw model responses, plaintext `redeem_code` values, generated passwords, full papers, full textbooks, OCR full text, or customer/customer-like private data.

If a local command logs that `.env.local` exists or is loaded by the framework, record only that fact when relevant. Do not open the file or capture values.

## Startup Checklist

Before starting browser accompaniment:

1. Produce the `Session Startup Report` from `automation-loop.md`.
2. Confirm Git is clean or record the exact dirty files and why they are in scope.
3. Confirm `master` alignment when the user asks for readiness or closeout status.
4. Read the latest relevant evidence and task plan.
5. Confirm no blocked gate is being bypassed.
6. Confirm the target URL is local.
7. Confirm whether the task is `read_only`, `docs_only`, or `local_verification`.

If the user asks to "report first" or "wait", stop after the report.

## Role And Route Matrix

Use the smallest matrix that matches the request. For general local product readiness, cover these roles and routes when available:

| Role                        | Routes                                                                                    | Expected checks                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthenticated user        | `/login`, protected student/admin routes                                                  | Login form visible, protected routes redirect or deny access.                                                                               |
| `student`                   | `/home`, `/practice`, `/mock-exam`, `/exam-report`, `/mistake-book`, `/profile`           | Authorized scope, answer flow, report reachability, mistake_book actions, profile authorization summary.                                    |
| `content_admin`             | `/content/questions`, `/content/materials`, `/content/papers`, `/content/knowledge-nodes` | Content management surfaces render, action entries are visible or deliberately guarded.                                                     |
| `ops_admin` / `super_admin` | `/ops/users`, `/ops/organizations`, `/ops/redeem-codes`, `/ops/ai-audit-logs`             | User, organization, `org_auth`, `redeem_code`, audit_log, `ai_call_log`, and `model_config` surfaces render with role-appropriate controls. |

Use project terminology exactly: `practice`, `mock_exam`, `exam_report`, `mistake_book`, `organization`, `authorization`, `org_auth`, `redeem_code`, `audit_log`, `ai_call_log`, and `model_config`.

## Browser Evidence Rules

Evidence should record:

- local URL or route;
- role used, with credentials redacted;
- expected user-visible behavior;
- actual visible state as a bounded summary;
- pass/fail result;
- gap id or follow-up recommendation when behavior is wrong;
- browser backend used, such as `iab` or Playwright fallback;
- whether console errors or framework overlays were observed, if checked.

Evidence must not include full private content, raw AI/provider payloads, credentials, tokens, environment values, internal numeric ids in external URLs, or full generated documents.

## Gap Handling

When a gap appears during local human verification:

1. Reproduce only enough to classify the gap.
2. Record route, role, expected behavior, actual behavior, and severity.
3. Do not fix it inside a docs-only or verification-only task.
4. If a fix is needed, seed or request a separate implementation task with scoped allowed files and validation commands.
5. Keep blocked gates blocked unless the user provides explicit future approval.

## Validation Expectations

For a local verification task, evidence should usually include:

- task-specific browser walkthrough results;
- `npm.cmd run test:e2e` when full e2e health is part of the claim;
- `npm.cmd run lint` and `npm.cmd run typecheck` when source or test code changed;
- readiness and Git completion inventory;
- `git diff --check`.

If the task is explicitly docs-only, do not claim runtime behavior changed. Record any observed runtime issues as gaps.
