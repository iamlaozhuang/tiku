# Phase 20 Fix RA-02-08 Publish Fill Blank Validation Plan

## Task

- Task id: `phase-20-fix-ra-02-08-publish-fill-blank-validation`
- Branch: `codex/phase-20-fix-ra-02-08-publish-fill-blank-validation`
- Scope: implementation
- Human approval: 2026-05-28 user approved local `database_migration` risk implementation, limited to reusing the landed `fillBlankAnswers` / `fill_blank_answers` model for publish validation.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-02-question-paper-content.md`

## Approval Boundary

Allowed:

- Create and use the short-lived branch named above.
- Reuse the existing `fillBlankAnswers` / `fill_blank_answers` data model for publish validation.
- Modify task-scoped `src/**`, `tests/**`, `e2e/**`, `docs/04-agent-system/state/**`, task plan, and task evidence.
- Commit, merge to `master`, validate on `master`, push `origin/master`, delete the short-lived branch, and update closeout evidence/state.

Blocked:

- `src/db/schema/**` and `drizzle/**`.
- `.env.local`, `.env.example`, package manifests, lockfiles, dependency changes.
- Staging/prod/cloud/deploy/real provider access.
- `drizzle-kit push`.
- Destructive data operations.
- Secret/env or external service configuration changes.

Stop condition:

- If implementation requires new schema/migration, dependency, secret/env, external service, real provider, deployment/cloud, or destructive data work, stop and request separate approval.

## Implementation Approach

1. Write RED tests proving publish validation rejects fill_blank paper questions that lack structured per-blank answers and browser/runtime evidence covers the publish boundary.
2. Reuse existing `fillBlankAnswers` copied into `questionSnapshot` and the existing `fill_blank_score_total_mismatch` check from RA-02-05.
3. Add missing publish validation for fill_blank auto-match questions whose `fillBlankAnswers` array is empty or malformed.
4. Keep validation scoped to paper draft publish service/runtime; do not change schema or migrations.
5. Record security review, local validation, master merge/push/cleanup evidence.

## Risk Controls

- No schema or migration file changes in this task.
- No `.env.local` read or env value recording.
- No real provider call; publish validation is deterministic local logic.
- Preserve API response envelope and camelCase DTO fields.
- Use only public identifiers in tests and evidence.
