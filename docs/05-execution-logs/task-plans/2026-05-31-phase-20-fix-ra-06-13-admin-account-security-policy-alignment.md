# Phase 20 Fix RA-06-13 Admin Account Security Policy Alignment Plan

## Task

- id: `phase-20-fix-ra-06-13-admin-account-security-policy-alignment`
- branch: `codex/phase-20-fix-ra-06-13-admin-account-security-policy-alignment`
- date: `2026-05-31`
- status: validated

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Human Approval

User approved claiming the recommended task, approved the required `auth_permission_model` permission, and authorized commit, merge to `master`, push to `origin/master`, and short-lived branch cleanup in this session.

## Scope

Allowed:

- Local admin account security policy runtime/UI/test/evidence.
- `src/**`, `tests/**`, `e2e/**`.
- Task plan, evidence, audit-review, project-state, and task-queue updates.

Blocked:

- `.env.local`, `.env.example`.
- `package.json`, lockfiles, dependency changes.
- `src/db/schema/**`, `drizzle/**`.
- `scripts/**`.
- Staging/prod/cloud/deploy, real provider, secret/env work, destructive data operations.

## Implementation Approach

1. Write a failing unit test for admin login lockout policy: backend admin login remains unlocked after 4 failures and locks for 15 minutes on the 5th failure.
2. Implement the smallest service/runtime change while preserving student login policy at 3 failures / 5 minutes.
3. Add local UI evidence for the admin account security policy surface without exposing secrets, session tokens, numeric ids, or credentials.
4. Complete a security review section in evidence for `auth_permission_model`.
5. Run task validation commands and local CI gates, then record results in evidence.

## Risk Defense

- Keep `user` and `admin` account boundaries separate.
- Keep API response envelope `{ code, message, data, pagination? }`.
- Do not expose numeric `id`, password hashes, session tokens, raw credentials, or env values.
- Do not modify schema or migrations; if schema becomes required, stop and mark blocked instead of bypassing.
- Use TDD: RED test first, then minimal implementation.
